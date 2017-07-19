using CMSCloudbuilderPresentation.Attributes;
using CMSCloudbuilderPresentation.Models;
using CMSCloudbuilderPresentation.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web.Http;

namespace CMSCloudbuilderPresentation.Controllers
{
	public class ProdController : ApiController
	{
		private CMSCloudBuilderEntities db = new CMSCloudBuilderEntities();

		[XmlNamespacesAreScary(ModelType = typeof(ProductCollectionViewModel), OmitXmlDeclaration = true)]
		[TokenAuthorization]
		public ProductCollectionViewModel GetProduct(int id)
		{
			var model = new ProductCollectionViewModel();

			var products = from p in db.Products
						   from pr in db.Presentations
						   where pr.PresentationShowID == id
						   && p.ProductId == pr.PresentationProductID
						   && (p.ArchiveLevel == null || p.ArchiveLevel == 0)
						   select p;
			var categories = from c in db.Categories
							 where c.CategoryShowID == id
							 select c;
			var show = db.Shows.Find(id);
			var server = "http://" + Request.RequestUri.Host.ToString() + ":" + Request.RequestUri.Port.ToString();

			foreach (var prod in products) {
				if (model.Any(pr => pr.ProductId == prod.ProductId)) {
					continue;
				}
				var p = new ProductViewModel(prod);
				p.Category = (from c in db.Categories
							  from pr in db.Presentations
							  where c.CategoryID == pr.PresentationCategoryID
							  && pr.PresentationShowID == id
							  && pr.PresentationProductID == p.ProductId
							  select c.Category1).ToList();
				p.ProductBoothTheme = show.ShowBoothTheme;
				p.ProductBoothSubTheme = show.ShowBoothSubTheme;
				if (!String.IsNullOrEmpty(p.ProductImageFile)) {
					p.ProductImageFile = server + "/Upload/Images/" + p.ProductImageFile;
				}
				if (!String.IsNullOrEmpty(p.ProductVideoFile)) {
					p.ProductVideoFile = server + "/Upload/Videos/" + p.ProductVideoFile;
				}
				if (p.ProductDatasheetFile != null && p.ProductDatasheetFile.Any()) {
					p.ProductDatasheetFile = p.ProductDatasheetFile.Select(s => server + "/Upload/DataSheets/" + s).ToList();
				}
				if (p.ProductBusinessUnitId != null) {
					var bu = db.BusinessUnits.Find(p.ProductBusinessUnitId);
					if (bu != null) {
						p.ProductCategory2 = bu.BusinessUnitName;
					}
				}
				p.ProductMainButton = categories.Select(c => c.Category1).ToList();
				p.ProductMainButtonFile = categories.ToList()
					.Select(c => !String.IsNullOrEmpty(c.CategoryImage) ? server + "/Upload/Images/" + c.CategoryImage : null).ToList();
				model.Add(p);
			}

			return model;
		}
	}
}