using BiogenRepository.Models;
using BiogenRepository.Services;
using BiogenRepository.ViewModels;
using Orchard;
using Orchard.Localization;
using Orchard.Mvc.Extensions;
using System.Collections.Generic;
using System.Web.Mvc;
using System.Web.WebPages;
using System.Linq;
using Orchard.Core.Contents.Controllers;
using System.Web;
using System.IO;
using System;
using System.Configuration;
using Orchard.Security;
using Orchard.Users.Services;
using Orchard.Users.Events;
using System.Text;
using Orchard.Mvc;
using ClosedXML.Excel;
using System.Reflection;
using System.Runtime.Serialization.Json;

namespace BiogenRepository.Controllers
{
    [ValidateInput(false)]
    public class AdminController : Controller
    {
        #region Constructor

        public AdminController(
            IOrchardServices orchardServices, 
            IStrategyService strategyService, 
            ISubStrategyService substrategyervice, 
            ICategoryService categoryService, 
            ISubCategoryService subcategoryService,
            IStrategyTemplateService strategytemplateService,
            ICategoryTemplateService categorytemplateService,
            ISpotlightService spotlightService,
            ICompetitiveService competityService,
            ITalkingPointService talkingPointService,
            IReferenceService referenceService,
            IDocumentService documentService,
            IRecentlyPublishedService recentlyPublishedService,
            IDocumentStrategyTemplateLinksService documentstrategytemplatelinksRepository,
            IDocumentCategoryTemplateLinksService documentcategorytemplatelinksRepository,
            IDocumentTalkingPointTemplateLinksService documenttalkingpointtemplatelinksRepository)
        {
            Services = orchardServices;
            _strategyService = strategyService;
            _substrategyService = substrategyervice;
            _competityService = competityService;
            _categoryService = categoryService;
            _subcategoryService = subcategoryService;
            _strategytemplateService = strategytemplateService;
            _categorytemplateService = categorytemplateService;
            _spotlightService = spotlightService;
            _talkingPointService = talkingPointService;
            _referenceService = referenceService;
            _documentService = documentService;
            _recentlyPublishedService = recentlyPublishedService;
            _documentstrategytemplatelinksRepository = documentstrategytemplatelinksRepository;
            _documentcategorytemplatelinksRepository = documentcategorytemplatelinksRepository;
            _documenttalkingpointtemplatelinksRepository = documenttalkingpointtemplatelinksRepository;
            T = NullLocalizer.Instance;
        }

        #endregion

        #region Vars

        private readonly IStrategyService _strategyService;
        private readonly ISubStrategyService _substrategyService;
        private readonly ICompetitiveService _competityService;
        private readonly ICategoryService _categoryService;
        private readonly ISubCategoryService _subcategoryService;
        private readonly IStrategyTemplateService _strategytemplateService;
        private readonly ICategoryTemplateService _categorytemplateService;
        private readonly ISpotlightService _spotlightService;
        private readonly ITalkingPointService _talkingPointService;
        private readonly IReferenceService _referenceService;
        private readonly IDocumentService _documentService;
        private readonly IRecentlyPublishedService _recentlyPublishedService;
        private readonly IDocumentStrategyTemplateLinksService _documentstrategytemplatelinksRepository;
        private readonly IDocumentCategoryTemplateLinksService _documentcategorytemplatelinksRepository;
        private readonly IDocumentTalkingPointTemplateLinksService _documenttalkingpointtemplatelinksRepository;        

        #endregion

        #region Properties

        public IOrchardServices Services { get; set; }

        public Localizer T { get; set; }

        #endregion

        #region Biogen Repository Manager Actions

        #region Strategies Admin Actions

        #region Strategies
        public ActionResult Strategies()
        {
            IEnumerable<StrategyRecord> strategies = _strategyService.GetStrategies();
            var entries = strategies.Select(CreateStrategyEntry).ToList();
            foreach (var entry in entries)
                entry.AllowDelete = !_strategytemplateService.StrategyInTemplate(entry.Strategy.Id);
            var model = new StrategyAdminListViewModel { Strategies = entries, DropdownOrderSelections = PopulateOrderNumbers(_strategyService.GetStrategies().Count(), true) };
            return View(model);
        }
        #endregion

    
       

        #region StrategiesCreatePOST
        [HttpPost, ActionName("Strategies")]
        [FormValueRequired("submit.Create")]
        public ActionResult StrategiesCreatePOST()
        {
            var viewModel = new StrategyAdminCreateViewModel(PopulateOrderNumbers(_strategyService.GetStrategies().Count(), true));

            if (!TryUpdateModel(viewModel))
            {
                ViewData["CreateStrategy"] = viewModel;
                return Strategies();
            }

            _strategyService.CreateStrategy(viewModel.StrategyTitle, viewModel.StrategyOrder);

            return RedirectToAction("Strategies");
        }
        #endregion

        #region StrategyEdit (GET)
        public ActionResult StrategyEdit(int id)
        {
            StrategyRecord strategyRecord = _strategyService.GetStrategy(id);

            if (strategyRecord == null)
            {
                return RedirectToAction("Strategies");
            }

            var viewModel = new StrategyAdminEditViewModel
            {
                Id = strategyRecord.Id,
                StrategyTitle = strategyRecord.StrategyTitle,
                StrategyOrder = strategyRecord.StrategyOrder,
                DropdownOrderSelections = PopulateOrderNumbers(_strategyService.GetStrategies().Count(), false)
            };

            return View(viewModel);
        }
        #endregion

        #region StrategyEdit (POST)
        [HttpPost]
        public ActionResult StrategyEdit(FormCollection input)
        {
            var viewModel = new StrategyAdminEditViewModel();
            viewModel.DropdownOrderSelections = PopulateOrderNumbers(_strategyService.GetStrategies().Count(), false);

            if (!TryUpdateModel(viewModel))
            {
                return View(viewModel);
            }

            _strategyService.UpdateStrategy(viewModel.Id, viewModel.StrategyTitle, viewModel.StrategyOrder);

            // recache documents
            //RecacheDocuments();

            return RedirectToAction("Strategies");
        }
        #endregion

        #region StrategyRemove
        [HttpPost]
        public ActionResult StrategyRemove(int id, string returnUrl)
        {
            StrategyRecord strategyRecord = _strategyService.GetStrategy(id);

            if (strategyRecord == null)
                return new HttpNotFoundResult();

            _strategyService.DeleteStrategy(id);

            // recache documents
            //RecacheDocuments();

            return this.RedirectLocal(returnUrl, () => RedirectToAction("Strategies"));
        }
        #endregion

        #endregion

        #region SubStrategies Admin Actions

        #region SubStrategies
        public ActionResult SubStrategies()
        {
            IEnumerable<SubStrategyRecord> substrategies = _substrategyService.GetSubStrategies();
            var entries = substrategies.Select(CreateSubStrategyEntry).ToList();
            foreach (var entry in entries)
                entry.AllowDelete = !_strategytemplateService.SubStrategyInTemplate(entry.SubStrategy.Id);
            var model = new SubStrategyAdminListViewModel { SubStrategies = entries, DropdownOrderSelections = PopulateOrderNumbers(_substrategyService.GetSubStrategies().Count(), true) };
            return View(model);
        }
        #endregion

        #region SubStrategiesCreatePOST
        [HttpPost, ActionName("SubStrategies")]
        [FormValueRequired("submit.Create")]
        public ActionResult SubStrategiesCreatePOST()
        {
            var viewModel = new SubStrategyAdminCreateViewModel(PopulateOrderNumbers(_substrategyService.GetSubStrategies().Count(), true));

            if (!TryUpdateModel(viewModel))
            {
                ViewData["CreateSubStrategy"] = viewModel;
                return SubStrategies();
            }

            _substrategyService.CreateSubStrategy(viewModel.SubStrategyTitle, viewModel.SubStrategyOrder);

            return RedirectToAction("SubStrategies");
        }
        #endregion

        #region SubStrategyEdit (GET)
        public ActionResult SubStrategyEdit(int id)
        {
            SubStrategyRecord substrategyRecord = _substrategyService.GetSubStrategy(id);

            if (substrategyRecord == null)
            {
                return RedirectToAction("SubStrategies");
            }

            var viewModel = new SubStrategyAdminEditViewModel
            {
                Id = substrategyRecord.Id,
                SubStrategyTitle = substrategyRecord.SubStrategyTitle,
                SubStrategyOrder = substrategyRecord.SubStrategyOrder,
                DropdownOrderSelections = PopulateOrderNumbers(_substrategyService.GetSubStrategies().Count(), false)
            };

            return View(viewModel);
        }
        #endregion

        #region SubStrategyEdit (POST)
        [HttpPost]
        public ActionResult SubStrategyEdit(FormCollection input)
        {
            var viewModel = new SubStrategyAdminEditViewModel();
            viewModel.DropdownOrderSelections = PopulateOrderNumbers(_substrategyService.GetSubStrategies().Count(), false);

            if (!TryUpdateModel(viewModel))
            {
                return View(viewModel);
            }

            _substrategyService.UpdateSubStrategy(viewModel.Id, viewModel.SubStrategyTitle, viewModel.SubStrategyOrder);

            // recache documents
            //RecacheDocuments();

            return RedirectToAction("SubStrategies");
        }
        #endregion

        #region SubStrategyRemove
        [HttpPost]
        public ActionResult SubStrategyRemove(int id, string returnUrl)
        {
            SubStrategyRecord substrategyRecord = _substrategyService.GetSubStrategy(id);

            if (substrategyRecord == null)
                return new HttpNotFoundResult();

            _substrategyService.DeleteSubStrategy(id);

            // recache documents
            //RecacheDocuments();

            return this.RedirectLocal(returnUrl, () => RedirectToAction("SubStrategies"));
        }
        #endregion

        #endregion

        #region Categories Admin Actions

        #region Categories
        public ActionResult Categories()
        {
            IEnumerable<CategoryRecord> categories = _categoryService.GetCategories();
            var entries = categories.Select(CreateCategoryEntry).ToList();
            foreach (var entry in entries)
                entry.AllowDelete = !_categorytemplateService.CategoryInTemplate(entry.Category.Id);
            var model = new CategoryAdminListViewModel { Categories = entries, DropdownOrderSelections = PopulateOrderNumbers(_categoryService.GetCategories().Count(), true) };
            return View(model);
        }
        #endregion

        #region CategoriesCreatePOST
        [HttpPost, ActionName("Categories")]
        [FormValueRequired("submit.Create")]
        public ActionResult CategoriesCreatePOST(HttpPostedFileBase fileattachment)
        {
            var viewModel = new CategoryAdminCreateViewModel(PopulateOrderNumbers(_categoryService.GetCategories().Count(), true));

            if (!TryUpdateModel(viewModel))
            {
                ViewData["CreateCategory"] = viewModel;
                return Categories();
            }

            if (fileattachment == null)
            {
                ModelState.AddModelError("categoryicon", T("Icon not chosen."));
                return Categories();
            }

            viewModel.CategoryIcon = CategoryRecord.UploadFile(fileattachment);
            if (viewModel.CategoryIcon == "")
            {
                ModelState.AddModelError("categoryicon", T("Invalid icon."));
                return Categories();
            }

            _categoryService.CreateCategory(viewModel.CategoryTitle, viewModel.CategoryIcon, viewModel.CategoryOrder);

            return RedirectToAction("Categories");
        }
        #endregion

        #region CategoryEdit (GET)
        public ActionResult CategoryEdit(int id)
        {
            CategoryRecord categoryRecord = _categoryService.GetCategory(id);

            if (categoryRecord == null)
            {
                return RedirectToAction("Categories");
            }

            var viewModel = new CategoryAdminEditViewModel
            {
                Id = categoryRecord.Id,
                CategoryTitle = categoryRecord.CategoryTitle,
                CategoryIcon = categoryRecord.CategoryIcon,
                CategoryOrder = categoryRecord.CategoryOrder,
                DropdownOrderSelections = PopulateOrderNumbers(_categoryService.GetCategories().Count(), false)
            };

            return View(viewModel);
        }
        #endregion

        #region CategoryEdit (POST)
        [HttpPost]
        public ActionResult CategoryEdit(FormCollection input, HttpPostedFileBase fileattachment)
        {
            var viewModel = new CategoryAdminEditViewModel();
            viewModel.DropdownOrderSelections = PopulateOrderNumbers(_categoryService.GetCategories().Count(), false);

            if (!TryUpdateModel(viewModel))
            {                
                return View(viewModel);
            }

            // save icon (or resave if empty)
            viewModel.CategoryIcon = CategoryRecord.EditIconFile(viewModel.CategoryIcon, fileattachment);
            if (viewModel.CategoryIcon == "")
            {
                ModelState.AddModelError("categoryicon", T("Invalid icon."));
                return View(viewModel);
            }

            _categoryService.UpdateCategory(viewModel.Id, viewModel.CategoryTitle, viewModel.CategoryIcon, viewModel.CategoryOrder);

            // recache documents
            //RecacheDocuments();

            return RedirectToAction("Categories");
        }
        #endregion

        #region CategoryRemove
        [HttpPost]
        public ActionResult CategoryRemove(int id, string returnUrl)
        {
            CategoryRecord categoryRecord = _categoryService.GetCategory(id);

            if (categoryRecord == null)
                return new HttpNotFoundResult();

            // try to delete the category first
            try
            {
                System.IO.File.Delete(Path.Combine(this.Server.MapPath(ConfigurationManager.AppSettings["CategoryIconLocation"].ToString()), Path.GetFileName(categoryRecord.CategoryIcon)).Replace("\\", "/"));
            }
            catch { }

            _categoryService.DeleteCategory(id);

            // recache documents
            //RecacheDocuments();

            return this.RedirectLocal(returnUrl, () => RedirectToAction("Categories"));
        }
        #endregion

        #endregion

        #region SubCategories Admin Actions

        #region SubCategories
        public ActionResult SubCategories()
        {
            IEnumerable<SubCategoryRecord> subcategories = _subcategoryService.GetSubCategories();
            var entries = subcategories.Select(CreateSubCategoryEntry).ToList();
            foreach (var entry in entries)
                entry.AllowDelete = !_categorytemplateService.SubCategoryInTemplate(entry.SubCategory.Id);
            var model = new SubCategoryAdminListViewModel { SubCategories = entries, DropdownOrderSelections = PopulateOrderNumbers(_subcategoryService.GetSubCategories().Count(), true) };
            return View(model);
        }
        #endregion

        #region SubCategoriesCreatePOST
        [HttpPost, ActionName("SubCategories")]
        [FormValueRequired("submit.Create")]
        public ActionResult SubCategoriesCreatePOST()
        {
            var viewModel = new SubCategoryAdminCreateViewModel(PopulateOrderNumbers(_subcategoryService.GetSubCategories().Count(), true));

            if (!TryUpdateModel(viewModel))
            {
                ViewData["CreateSubCategory"] = viewModel;
                return SubCategories();
            }

            _subcategoryService.CreateSubCategory(viewModel.SubCategoryTitle, viewModel.SubCategoryOrder);

            return RedirectToAction("SubCategories");
        }
        #endregion

        #region SubCategoryEdit (GET)
        public ActionResult SubCategoryEdit(int id)
        {
            SubCategoryRecord subcategoryRecord = _subcategoryService.GetSubCategory(id);

            if (subcategoryRecord == null)
            {
                return RedirectToAction("SubCategories");
            }

            var viewModel = new SubCategoryAdminEditViewModel
            {
                Id = subcategoryRecord.Id,
                SubCategoryTitle = subcategoryRecord.SubCategoryTitle,
                SubCategoryOrder = subcategoryRecord.SubCategoryOrder,
                DropdownOrderSelections = PopulateOrderNumbers(_subcategoryService.GetSubCategories().Count(), false)
            };

            return View(viewModel);
        }
        #endregion

        #region SubCategoryEdit (POST)
        [HttpPost]
        public ActionResult SubCategoryEdit(FormCollection input)
        {
            var viewModel = new SubCategoryAdminEditViewModel();
            viewModel.DropdownOrderSelections = PopulateOrderNumbers(_subcategoryService.GetSubCategories().Count(), false);

            if (!TryUpdateModel(viewModel))
            {
                return View(viewModel);
            }

            _subcategoryService.UpdateSubCategory(viewModel.Id, viewModel.SubCategoryTitle, viewModel.SubCategoryOrder);

            // recache documents
            //RecacheDocuments();

            return RedirectToAction("SubCategories");
        }
        #endregion

        #region SubCategoryRemove
        [HttpPost]
        public ActionResult SubCategoryRemove(int id, string returnUrl)
        {
            SubCategoryRecord subcategoryRecord = _subcategoryService.GetSubCategory(id);

            if (subcategoryRecord == null)
                return new HttpNotFoundResult();

            _subcategoryService.DeleteSubCategory(id);

            // recache documents
            //RecacheDocuments();

            return this.RedirectLocal(returnUrl, () => RedirectToAction("SubCategories"));
        }
        #endregion

        #endregion

        #region StrategyTemplate Admin Actions

        #region StrategyTemplates
        public ActionResult StrategyTemplates()
        {
            IEnumerable<StrategyTemplateRecord> templates = _strategytemplateService.GetStrategyTemplates();
            var entries = templates.OrderBy(d => d.Title).Select(t => CreateStrategyTemplateEntry(t, _strategyService.GetStrategy(t.StrategyId).StrategyTitle,
                                                                                            (t.SubStrategyId == 0) ? "" : _substrategyService.GetSubStrategy(t.SubStrategyId).SubStrategyTitle)).ToList();
            var model = new StrategyTemplateAdminListViewModel
            {
                StrategyTemplates = entries,
                DropdownStrategies = _strategyService.DropdownStrategies(),
                DropdownSubStrategies = _substrategyService.DropdownSubStrategies()
            };
            model.DropdownSubStrategies = InsertSelectItem(model.DropdownSubStrategies, 0, "(none)", "0");

            return View(model);
        }
        #endregion

        #region StrategyTemplatesCreatePOST
        [HttpPost, ActionName("StrategyTemplates")]
        [FormValueRequired("submit.Create")]
        public ActionResult StrategyTemplatesCreatePOST()
        {
            var viewModel = new StrategyTemplateAdminCreateViewModel(_strategyService.DropdownStrategies(), _substrategyService.DropdownSubStrategies());
            viewModel.DropdownSubStrategies = InsertSelectItem(viewModel.DropdownSubStrategies, 0, "(none)", "0");

            if (!TryUpdateModel(viewModel))
            {
                ViewData["CreateStrategyTemplate"] = viewModel;
                return StrategyTemplates();
            }

            _strategytemplateService.CreateStrategyTemplate(viewModel.StrategyTemplate);

            return RedirectToAction("StrategyTemplates");
        }
        #endregion

        #region StrategyTemplateEdit (GET)
        public ActionResult StrategyTemplateEdit(int id)
        {
            StrategyTemplateRecord templateRecord = _strategytemplateService.GetStrategyTemplate(id);

            if (templateRecord == null)
            {
                return RedirectToAction("StrategyTemplates");
            }

            var viewModel = new StrategyTemplateAdminEditViewModel
            {
                Id = templateRecord.Id,
                StrategyTemplate = templateRecord,
                DropdownStrategies = _strategyService.DropdownStrategies(),
                DropdownSubStrategies = _substrategyService.DropdownSubStrategies()
            };
            viewModel.DropdownSubStrategies = InsertSelectItem(viewModel.DropdownSubStrategies, 0, "(none)", "0");

            return View(viewModel);
        }
        #endregion

        #region StrategyTemplateEdit (POST)
        [HttpPost]
        public ActionResult StrategyTemplateEdit(StrategyTemplateRecord strategytemplate, FormCollection input)
        {
            var viewModel = new StrategyTemplateAdminEditViewModel
            {
                StrategyTemplate = strategytemplate,
                DropdownStrategies = _strategyService.DropdownStrategies(),
                DropdownSubStrategies = _substrategyService.DropdownSubStrategies()
            };
            viewModel.DropdownSubStrategies = InsertSelectItem(viewModel.DropdownSubStrategies, 0, "(none)", "0");

            if (!TryUpdateModel(viewModel))
            {
                return View(viewModel);
            }

            _strategytemplateService.UpdateStrategyTemplate(strategytemplate);
            return RedirectToAction("StrategyTemplates");
        }
        #endregion

        #region StrategyTemplateRemove
        [HttpPost]
        public ActionResult StrategyTemplateRemove(int id, string returnUrl)
        {
            StrategyTemplateRecord templateRecord = _strategytemplateService.GetStrategyTemplate(id);

            if (templateRecord == null)
                return new HttpNotFoundResult();

            // delete the template
            _strategytemplateService.DeleteStrategyTemplate(id);

            // remove any document / strategy template links
            var statlinks = _documentstrategytemplatelinksRepository.GetDocumentTemplateLinksByTemplate(id);
            foreach (var link in statlinks)
            {
                // delete the document strategy template link
                _documentstrategytemplatelinksRepository.DeleteDocumentTemplateLink(link.Id);

                // check to see if this document no longer any template links
                if (!_documentstrategytemplatelinksRepository.GetDocumentTemplateLinks(link.DocumentID).Any())
                {
                    var document = _documentService.GetDocument(link.DocumentID);
                    document.Published = false;
                    _documentService.UpdateDocument(document);
                }
            }

            return this.RedirectLocal(returnUrl, () => RedirectToAction("StrategyTemplates"));
        }
        #endregion

        #endregion

        #region CategoryTemplate Admin Actions

        #region CategoryTemplates
        public ActionResult CategoryTemplates()
        {
            IEnumerable<CategoryTemplateRecord> templates = _categorytemplateService.GetCategoryTemplates();
            var entries = templates.OrderBy(d => d.Title).Select(t => CreateCategoryTemplateEntry(t, _categoryService.GetCategory(t.CategoryId).CategoryTitle,
                                                                                            (t.SubCategoryId == 0) ? "" : _subcategoryService.GetSubCategory(t.SubCategoryId).SubCategoryTitle)).ToList();
            var model = new CategoryTemplateAdminListViewModel
            {
                CategoryTemplates = entries,
                DropdownCategories = _categoryService.DropdownCategories(),
                DropdownSubCategories = _subcategoryService.DropdownSubCategories()
            };
            model.DropdownSubCategories = InsertSelectItem(model.DropdownSubCategories, 0, "(none)", "0");

            return View(model);
        }
        #endregion

        #region CategoryTemplatesCreatePOST
        [HttpPost, ActionName("CategoryTemplates")]
        [FormValueRequired("submit.Create")]
        public ActionResult CategoryTemplatesCreatePOST()
        {
            var viewModel = new CategoryTemplateAdminCreateViewModel(_categoryService.DropdownCategories(), _subcategoryService.DropdownSubCategories());
            viewModel.DropdownSubCategories = InsertSelectItem(viewModel.DropdownSubCategories, 0, "(none)", "0");

            if (!TryUpdateModel(viewModel))
            {
                ViewData["CreateCategoryTemplate"] = viewModel;
                return CategoryTemplates();
            }

            _categorytemplateService.CreateCategoryTemplate(viewModel.CategoryTemplate);

            return RedirectToAction("CategoryTemplates");
        }
        #endregion

        #region CategoryTemplateEdit (GET)
        public ActionResult CategoryTemplateEdit(int id)
        {
            CategoryTemplateRecord templateRecord = _categorytemplateService.GetCategoryTemplate(id);

            if (templateRecord == null)
            {
                return RedirectToAction("CategoryTemplates");
            }

            var viewModel = new CategoryTemplateAdminEditViewModel
            {
                Id = templateRecord.Id,
                CategoryTemplate = templateRecord,
                DropdownCategories = _categoryService.DropdownCategories(),
                DropdownSubCategories = _subcategoryService.DropdownSubCategories()
            };
            viewModel.DropdownSubCategories = InsertSelectItem(viewModel.DropdownSubCategories, 0, "(none)", "0");

            return View(viewModel);
        }
        #endregion

        #region CategoryTemplateEdit (POST)
        [HttpPost]
        public ActionResult CategoryTemplateEdit(CategoryTemplateRecord categorytemplate, FormCollection input)
        {
            var viewModel = new CategoryTemplateAdminEditViewModel
            {
                CategoryTemplate = categorytemplate,
                DropdownCategories = _categoryService.DropdownCategories(),
                DropdownSubCategories = _subcategoryService.DropdownSubCategories()
            };
            viewModel.DropdownSubCategories = InsertSelectItem(viewModel.DropdownSubCategories, 0, "(none)", "0");

            if (!TryUpdateModel(viewModel))
            {
                return View(viewModel);
            }

            _categorytemplateService.UpdateCategoryTemplate(categorytemplate);
            return RedirectToAction("CategoryTemplates");
        }
        #endregion

        #region CategoryTemplateRemove
        [HttpPost]
        public ActionResult CategoryTemplateRemove(int id, string returnUrl)
        {
            CategoryTemplateRecord templateRecord = _categorytemplateService.GetCategoryTemplate(id);

            if (templateRecord == null)
                return new HttpNotFoundResult();

            // delete the template
            _categorytemplateService.DeleteCategoryTemplate(id);

            // remove any document / category template links
            var catlinks = _documentcategorytemplatelinksRepository.GetDocumentTemplateLinksByTemplate(id);
            foreach (var link in catlinks)
            {
                // delete the document category template link
                _documentcategorytemplatelinksRepository.DeleteDocumentTemplateLink(link.Id);

                // check to see if this document no longer any template links
                if (!_documentcategorytemplatelinksRepository.GetDocumentTemplateLinks(link.DocumentID).Any())
                {
                    var document = _documentService.GetDocument(link.DocumentID);
                    document.Published = false;
                    _documentService.UpdateDocument(document);
                }
            }

            return this.RedirectLocal(returnUrl, () => RedirectToAction("CategoryTemplates"));
        }
        #endregion

        #endregion

        #region Document Queue Admin Actions

        #region DocumentsQueued
        public ActionResult DocumentsQueued()
        {
            IEnumerable<DocumentRecord> documents = _documentService.GetQueuedDocuments();
            var entries = documents.OrderBy(d => d.QueuedDateTime).Select(CreateDocumentQueueEntry).ToList();
            var model = new DocumentsQueuedAdminListViewModel { Documents = entries };
            return View(model);
        }
        #endregion

        #region DocumentsQueuedPublishNow Action
        [HttpPost]
        public void DocumentsQueuedPublishNow(IList<String> checkeditems, bool clearrecent)
        {
            // clear the recent list
            if (clearrecent)
                _recentlyPublishedService.ClearRecentlyPublished();

            // for each selected document to publish ...
            if (checkeditems != null)
            {
                foreach (string chk in checkeditems)
                {
                    // update the document
                    int docID = Convert.ToInt32(chk.Replace("chk", ""));
                    var document = _documentService.GetDocument(docID);
                    document.Queued = false;
                    document.Published = true;
                    _documentService.UpdateDocument(document);

                    // add to recently published list
                    _recentlyPublishedService.CreateRecentlyPublished(docID);
                }
            }
        }
        #endregion

        #region DocumentsQueuedAdd (GET)
        public ActionResult DocumentsQueuedAdd()
        {
            var viewModel = new DocumentsQueuedAdminItemViewModel()
            {
                Document = new DocumentRecord(),
                DropdownStrategyTemplates = _strategytemplateService.DropdownTemplates(),
                DropdownCategoryTemplates = _categorytemplateService.DropdownTemplates()
            };

            return View(viewModel);
        }
        #endregion

        #region DocumentsQueuedEdit (GET)
        public ActionResult DocumentsQueuedEdit(int id)
        {
            var viewModel = DocumentEditGetCommon(id);
            if (viewModel == null) return RedirectToAction("DocumentsQueued");
            else return View(viewModel);
        }
        #endregion

        #region DocumentsQueuedEdit (POST)
        [HttpPost]
        public ActionResult DocumentsQueuedEdit(DocumentRecord document, List<int> strategytemplateid, List<int> categorytemplateid, List<int> talkingpointtemplateid, FormCollection input)
        {
            var viewModel = DocumentEditPostCommon(document, strategytemplateid, categorytemplateid, talkingpointtemplateid, input, true);
            if (viewModel == null) return RedirectToAction("DocumentsQueued");
            else return View(viewModel);
        }
        #endregion

        #region DocumentsQueuedRemove
        [HttpPost]
        public ActionResult DocumentsQueuedRemove(int id, string returnUrl)
        {
            DocumentRecord documentRecord = _documentService.GetDocument(id);

            if (documentRecord == null)
                return new HttpNotFoundResult();

            // try to delete the document first
            try
            {
                System.IO.File.Delete(Path.Combine(Server.MapPath(documentRecord.FileLocation), documentRecord.FileName));
            }
            catch { }

            // remove document from db
            _documentService.DeleteDocument(id);

            // remove any template links to this document
            _documentstrategytemplatelinksRepository.DeleteAllLinksForDocument(id);
            _documentcategorytemplatelinksRepository.DeleteAllLinksForDocument(id);

            return this.RedirectLocal(returnUrl, () => RedirectToAction("DocumentsQueued"));
        }
        #endregion

        #region UploadFile Action
        [HttpPost]
        public ActionResult UploadFile(int chunk = 0, int chunks = 0, string name = "", string strattemplateids = "", string catemplateids = "")
        {
            // set file to be saved to document directory
            var fileUpload = Request.Files[0];
            var uploadPath = Server.MapPath(ConfigurationManager.AppSettings["ContentLocation"].ToString());

            // if this is the start of the upload, save this reference to database            
            if (chunk == 0)
            {
                // create document model and initialize
                var document = new DocumentRecord()
                {
                    Country = "USA",
                    IsSharableWithHCP = false,
                    FileLocation = ConfigurationManager.AppSettings["ContentLocation"].ToString(),
                    TempFileName = name,
                    FileName = (fileUpload.FileName == "blob") ? name : fileUpload.FileName,
                    Queued = true,
                    QueuedDateTime = DateTime.Now,
                    FileUploadComplete = false,
                    Published = false
                };

                // set the file properties for this document
                document = DocumentRecord.UploadFileProperties(document);

                // save this document record
                _documentService.QueueDocumentStart(document);

                // delete any template links associated with this document
                _documentstrategytemplatelinksRepository.DeleteAllLinksForDocument(document.Id);
                _documentcategorytemplatelinksRepository.DeleteAllLinksForDocument(document.Id);

                // link this document with all the strategy templates
                if (strattemplateids != "")
                {
                    string[] stStrategyTemplates = strattemplateids.Split(',');
                    foreach (string strat in stStrategyTemplates)
                        _documentstrategytemplatelinksRepository.CreateDocumentTemplateLink(new DocumentStrategyTemplateLinksRecord() { DocumentID = document.Id, StrategyTemplateID = Convert.ToInt32(strat.Trim()) });
                }

                // link this document with all the strategy templates
                if (catemplateids != "")
                {
                    string[] stCategoryTemplates = catemplateids.Split(',');
                    foreach (string cat in stCategoryTemplates)
                        _documentcategorytemplatelinksRepository.CreateDocumentTemplateLink(new DocumentCategoryTemplateLinksRecord() { DocumentID = document.Id, CategoryTemplateID = Convert.ToInt32(cat.Trim()) });
                }
            }

            //write chunk to disk.   
            string uploadedFilePath = Path.Combine(uploadPath, name);
            using (var fs = new FileStream(uploadedFilePath, chunk == 0 ? FileMode.Create : FileMode.Append))
            {
                var buffer = new byte[fileUpload.InputStream.Length];
                fileUpload.InputStream.Read(buffer, 0, buffer.Length);
                fs.Write(buffer, 0, buffer.Length);
            }

            return Content("Success", "text/plain");
        }
        #endregion

        #region FileCompleted Action
        [HttpPost]
        public void FileCompleted(string filename)
        {


        }
        #endregion

        #region UploadComplete Action
        [HttpPost]
        public JsonResult UploadComplete(List<String> batch)
        {
            var uploadfilelist = new List<String>();
            foreach (var file in batch)
            {
                // update file is completed. get record.
                var document = _documentService.GetDocumentByFilename(file);

                // rename uploaded file to intended filename
                var uploadPath = Server.MapPath(document.FileLocation);
                System.IO.File.Move(Path.Combine(uploadPath, document.TempFileName), Path.Combine(uploadPath, document.FileName));

                // add to list of files to parse with keyword tool
                uploadfilelist.Add(Path.Combine(uploadPath, document.FileName));

                // update record that document upload is complete
                _documentService.QueueDocumentComplete(document);
            }

            #region Keyword Tool Code

            //Nparse START
            string error = "";
            string output = "";
            try
            {
                // set up the command line call
                System.Diagnostics.Process cmd = new System.Diagnostics.Process();
                cmd.StartInfo.FileName = Path.Combine(Server.MapPath("/Content/Tools/NParse"), "nparse.exe");

                /////////////////////////////////////
                //Example: pass you a list of files 
                //string docFile = @"C:/Websites2/BiogenStaging/Content/Documents/TestPowerPoint.pptx,C:/Websites2/BiogenStaging/Content/Documents/" + FileUpload1.FileName + " " + "-e C:/NParse/app/keywords.txt";
                ///////////////////////////////////

                // create the parameters
                string docFiles = "\"" + string.Join(",", uploadfilelist.ToArray()) + "\" " + "-p " + "\"" + Path.Combine(Server.MapPath("/Content/Tools/NParse"), "phrases.txt") + "\" " + "-e " + "\"" + Path.Combine(Server.MapPath("/Content/Tools/NParse"), "excludes.txt") + "\"";
                cmd.StartInfo.Arguments = docFiles;

                // additional settings on the command line call
                cmd.StartInfo.RedirectStandardOutput = true;
                cmd.StartInfo.UseShellExecute = false;
                cmd.StartInfo.RedirectStandardError = true;

                // make the call
                cmd.Start();

                // contain the results
                output = cmd.StandardOutput.ReadToEnd();
                error = cmd.StandardError.ReadToEnd();
                cmd.WaitForExit();
            }
            catch(Exception err)
            {
                error = "Keyword ingestion error: " + err.Message;
            }
            //Nparse END
            #endregion

            // if there was an error with the tool, indicate that the files have been saved and give this error
            if (error != "")
                return Json(new { success = false, files = batch, errormsg = "There was an error retrieving the keywords: \"" + error + "\". However, the file uploads have been completed successfully." });
            else
            {
                // TEMP: Until the keyword command line tool returns the proper JSON format, I can format the return JSON appropriately
                #region JSON formatting
                string json = "[ ";
                string[] keywordlist = output.Split('|');
                var keywordtoolmodel = new List<KeywordToolModel>();
                error = "Keyword errors: ";
                foreach (string keyword in keywordlist)
                {
                    try
                    {
                        // parse keyword from frequency and put into lists
                        if (keyword.IndexOf(':') != -1)
                        {
                            string[] jsonitem = keyword.Split(':');

                            // because returned keyword/frequency pairs can contain the delimiter characters, we have to make some assumptions here.
                            // the last element in the split array should contain the frequency value. all previous elements should be concatenated together to form the keyword result.
                            string completekeyword = "";
                            for (int k = 0; k < (jsonitem.Length - 1); k++)
                                completekeyword += ((completekeyword == "") ? "" : ":") + jsonitem[k];

                            keywordtoolmodel.Add(new KeywordToolModel() { Keyword = completekeyword, Frequency = Convert.ToInt32(jsonitem[jsonitem.Length-1]) });
                        }
                    }
                    catch
                    {
                        error += keyword + " ";
                    }
                }
                keywordtoolmodel = keywordtoolmodel.OrderByDescending(k => k.Frequency).ToList();

                var jsonlist = new List<String>();
                int frequencymax = 0;
                foreach (var toolitem in keywordtoolmodel)
                {
                    // convert / format for json and add
                    jsonlist.Add("{ \"Term\": \"" + toolitem.Keyword.ToString() + "\", \"Frequency\": " + toolitem.Frequency.ToString() + " }");

                    // determine if this frequency is the max
                    if (toolitem.Frequency > frequencymax)
                        frequencymax = toolitem.Frequency;
                }
                json += string.Join(",", jsonlist.ToArray()) + " ]";
                #endregion

                // TESTING: Example JSON string returned            
                //string json = "[ { \"Term\": \"biogen\", \"Frequency\": 5 }, { \"Term\": \"idec\", \"Frequency\": 1 }, { \"Term\": \"gsp\", \"Frequency\": 22 }, { \"Term\": \"phase\", \"Frequency\": 3 }, { \"Term\": \"awaken\", \"Frequency\": 9 } ]";
                //string json = "[ {biogen:5,idec:1,gsp:22,phase:3,awaken:9,modify:1,the:82,existing:5,tecfidera:2,platform:2,implementing:1,new:10,modules:2,preparation:1,a:33,lager:1,integration:3,requiring:1,larger:1,system:1,architecture:1,multiple:2,brands:1,are:7,spotlights:3,global:5,strategies:3,section:7,categorized:3,resource:4,material:3,groups:3,talking:16,points:12,simplification:2,content:16,type:3,rich:3,text:5,image:2,embedding:2,single:4,sign:4,on:8,authentication:1,advanced:3,search:7,browser:3,detection:2,keyword:10,automation:4,formerly:2,meta:3,tag:2,functionality:12,simplified:1,assignment:2,spotlight:9,is:12,categorization:2,paradigm:2,specified:3,deemed:1,extremely:1,relevant:1,admin:3,user:11,bau:1,at:2,point:6,creation:1,or:7,modification:1,uniquely:1,identified:1,presented:2,horizontal:1,thumbnail:3,category:9,viewer:2,based:3,categories:9,materials:1,show:2,populated:1,and:32,associated:7,upon:2,selecting:1,provided:2,list:4,view:2,current:2,grouped:1,an:8,actual:1,name:3,tbd:1,subcategory:5,within:11,subsection:2,selected:1,applicable:3,subcategories:1,addition:4,particular:1,regardless:1,number:1,assigned:3,statement:1,numbers:1,sub:1,assets:3,displayed:3,sorted:1,order:1,publication:1,year:1,alphabetical:2,congress:1,title:1,remain:1,exception:1,it:1,exist:1,above:1,mentioned:1,program:1,interface:2,designed:2,inhance:1,digital:1,categorize:1,abstract:1,poster:1,manuscript:1,slide:1,library:1,scientific:1,clinical:2,response:1,guide:1,backgrounder:1,package:1,inserts:1,briefing:1,documents:6,headers:1,seen:1,example:1,currently:4,contains:1,abstracts:1,manuscripts:1,posters:1,ui:1,display:1,three:2,sectional:1,unless:1,asset:3,added:4,empty:1,interactive:3,inc:3,phone:3,quail:3,hill:3,parkway:3,irvine:3,ca:3,www:3,awakeninteractive:6,com:6,hello:3,utilizes:2,relationship:1,piece:1,pdf:2,making:1,managing:1,unique:1,shared:1,document:5,difficult:1,manage:1,update:2,breaks:1,makes:1,managed:2,specifically:1,pdfs:1,develop:2,allow:3,entered:2,cms:3,using:3,wysiwyg:1,html:1,editor:1,allows:3,following:2,bold:1,fonts:3,italic:1,underlined:1,font:2,size:1,color:1,superscripts:1,subscripts:1,web:2,links:1,ability:4,embed:1,images:5,embedded:3,expand:1,full:1,screen:1,note:1,link:1,page:1,separately:1,separate:1,graphic:1,enter:2,given:1,entry:2,form:2,uploaded:1,relation:1,primary:1,research:2,fix:1,possible:1,vertical:1,scroll:2,location:2,cleared:1,opened:1,set:1,top:1,window:1,avoid:1,having:1,website:1,background:1,scrolling:2,via:1,simplefy:3,integrated:1,login:1,provide:2,access:3,account:1,information:1,including:1,but:2,limited:1,license:1,security:1,permissions:1,fees:1,passwords:2,used:2,authorized:1,users:3,continue:1,names:1,eliminating:1,lost:1,password:1,works:1,online:1,functional:1,available:1,offline:1,require:1,additional:2,impact:1,orchard:1,management:1,roles:1,augment:1,capabilities:1,multi:1,word:3,strings:1,known:2,operator:2,spaces:1,words:5,acting:1,e:4,g:4,aan:1,therapy:1,exact:2,phrase:2,matching:1,placing:1,string:1,quotes:1,bg:1,none:1,filtering:1,adding:1,minus:1,combination:1,ectrims:1,ens:1,restricted:1,tags:1,google:3,chrome:3,visitors:1,site:2,different:1,visual:1,explains:1,instructions:1,download:1,install:1,reduce:1,workload:1,determining:1,associating:1,keywords:8,upload:1,analyzed:2,frequent:1,usage:1,suggested:2,supplied:1,frequency:3,map:2,provides:1,numeric:1,representation:1,terms:1,located:1,dictionary:3,common:2,exclusion:3,developed:1,editable:1,ensure:1,non:1,related:1,has:3,etc:1,excluded:1,undesired:1,future:1,thus:1,further:1,refining:1,option:1,accepting:1,modifying:1,inserted:1,feature:2,work:2,microsoft:2,power:1,files:1,rasterized:1,video:1,simpli:1,ed:2,modi:2,inherited:2,automatically:1,s:1,speci:1,c:1,been:1,processed:1,tool:1,default:1,maintained:1,cation:1,anytime:1} ]";

                return Json(new { success = true, files = batch, keywords = json, barmax = frequencymax, errormsg = error });
            }
        }
        #endregion

        #region KeywordsComplete Action
        [HttpPost]
        public void KeywordsComplete(List<String> batch, IList<String> checkeditems)
        {
            foreach (var file in batch)
            {
                // update the keywords for this document
                var document = _documentService.GetDocumentByFilename(file);
                document.ContentKeywords = (checkeditems == null) ? "" : string.Join(",", checkeditems.ToArray());
                _documentService.UpdateDocument(document);
            }
        }
        #endregion
        
        #region GoToDocumentsQueued
        public ActionResult GoToDocumentsQueued()
        {
            return RedirectToAction("DocumentsQueued");
        }
        #endregion

        #endregion

        #region Documents Admin Actions

        #region Documents
        public ActionResult Documents()
        {
            IEnumerable<DocumentRecord> documents = _documentService.GetCachedDocuments(false);
            var entries = documents.OrderBy(d => d.Title).Select(CreateDocumentEntry).ToList();
            var model = new DocumentAdminListViewModel { Documents = entries };
            return View(model);
        }
        #endregion

        #region DocumentsEdit (GET)
        public ActionResult DocumentsEdit(int id)
        {
            var viewModel = DocumentEditGetCommon(id);
            if (viewModel == null) return RedirectToAction("Documents");
            else return View(viewModel);
        }
        #endregion

        #region DocumentsEdit (POST)
        [HttpPost]
        public ActionResult DocumentsEdit(DocumentRecord document, List<int> strategytemplateid, List<int> categorytemplateid, List<int> talkingpointtemplateid, HttpPostedFileBase fileattachment, FormCollection input)
        {
            // reupload new doc if they've added on to the eit
            if (fileattachment != null)
            {
                // first try to delete the current document
                try
                {
                    // delete current file for this document
                    System.IO.File.Delete(Path.Combine(Server.MapPath(document.FileLocation), document.FileName));

                    // update the filename property for this document model
                    document.FileName = Path.GetFileName(fileattachment.FileName);

                    // set the file properties for this document
                    document = DocumentRecord.UploadFileProperties(document);

                    // merge together the document location and filename
                    string docfile = Path.Combine(Server.MapPath(document.FileLocation), document.FileName);

                    // re-upload the new file
                    fileattachment.SaveAs(docfile);
                }
                catch (Exception err)
                {
                    string error = err.Message;
                }
            }

            // save document
            var viewModel = DocumentEditPostCommon(document, strategytemplateid, categorytemplateid, talkingpointtemplateid, input, false);

            if (viewModel == null) return RedirectToAction("Documents");
            else return View(viewModel);
        }
        #endregion

        #region DocumentsRemove
        [HttpPost]
        public ActionResult DocumentsRemove(int id, string returnUrl)
        {
            DocumentRecord docRecord = _documentService.GetDocument(id);
            bool waspublished = docRecord.Published;

            if (docRecord == null)
                return new HttpNotFoundResult();

            // try to delete the document first
            try
            {
                System.IO.File.Delete(Path.Combine(Server.MapPath(docRecord.FileLocation), docRecord.FileName));
            }
            catch { }

            // remove document from db
            _documentService.DeleteDocument(id);

            // remove any template links to this document
            _documentstrategytemplatelinksRepository.DeleteAllLinksForDocument(id);
            _documentcategorytemplatelinksRepository.DeleteAllLinksForDocument(id);

            // recache documents
            //RecacheDocuments();

            return this.RedirectLocal(returnUrl, () => RedirectToAction("Documents"));
        }
        #endregion

        #region DocumentExport
        public ActionResult DocumentExport()
        {
            List<DocumentModel> documents = _documentService.GetDocumentsForExport();
            //var entries = documents.Select(CreateDocumentEntry).ToList();
            int col = 0, row = 0;

            // Create the workbook
            XLWorkbook workbook = new XLWorkbook();

            // add a worksheet
            workbook.Worksheets.Add("Sheet1");

            if (documents.Count > 0)
            {
                // add column header
                col = 0;

                // loop through each column (use a switch statement to remove specific columns not needing to be reported on)
                Type type = documents.First().GetType();
                PropertyInfo[] properties = type.GetProperties();
                foreach (PropertyInfo property in properties)
                {
                    // add column header
                    switch(property.Name)
                    {
                        case "SpotlightID":
                            break;
                        case "CompetitiveID":
                            break;
                        default:
                            col++;
                            workbook.Worksheet("Sheet1").Cell(1, col).SetValue(property.Name);                            
                            break;
                    }                                       
                }

                // loop through each doc row
                row = 2;
                foreach (DocumentModel doc in documents)
                {
                    workbook.Worksheet("Sheet1").Cell(row, 1).SetValue(doc.Id);
                    workbook.Worksheet("Sheet1").Cell(row, 2).SetValue(doc.PublicationYear);
                    workbook.Worksheet("Sheet1").Cell(row, 3).SetValue(doc.Authors == null ? "" : doc.Authors);
                    workbook.Worksheet("Sheet1").Cell(row, 4).SetValue(doc.TalkingPoints == null ? "" : doc.TalkingPoints);
                    workbook.Worksheet("Sheet1").Cell(row, 5).SetValue(doc.Congress == null ? "" : doc.Congress);
                    workbook.Worksheet("Sheet1").Cell(row, 6).SetValue(doc.ContentKeywords == null ? "" : doc.ContentKeywords);
                    workbook.Worksheet("Sheet1").Cell(row, 7).SetValue(doc.Country == null ? "" : doc.Country);
                    workbook.Worksheet("Sheet1").Cell(row, 8).SetValue(doc.DocumentType == null ? "" : doc.DocumentType);
                    workbook.Worksheet("Sheet1").Cell(row, 9).SetValue(doc.Title == null ? "" : doc.Title);
                    workbook.Worksheet("Sheet1").Cell(row, 10).SetValue(doc.BrainsharkLink == null ? "" : doc.BrainsharkLink);
                    workbook.Worksheet("Sheet1").Cell(row, 11).SetValue(doc.IsSharableWithHCP ? "True" : "False");
                    workbook.Worksheet("Sheet1").Cell(row, 12).SetValue(doc.FileLocation == null ? "" : doc.FileLocation);
                    workbook.Worksheet("Sheet1").Cell(row, 13).SetValue(doc.FileName == null ? "" : doc.FileName);
                    workbook.Worksheet("Sheet1").Cell(row, 14).SetValue(doc.FileUploadComplete ? "True" : "False");
                    workbook.Worksheet("Sheet1").Cell(row, 15).SetValue(doc.Published ? "True" : "False");
                    workbook.Worksheet("Sheet1").Cell(row, 16).SetValue(doc.SpotlightName == null ? "" : doc.SpotlightName);
                    workbook.Worksheet("Sheet1").Cell(row, 17).SetValue(doc.SpotlightOther ? "Yes" : "");
                    workbook.Worksheet("Sheet1").Cell(row, 18).SetValue(doc.Strategies == null ? "" : doc.Strategies);
                    workbook.Worksheet("Sheet1").Cell(row, 19).SetValue(doc.CompetitiveName == null ? "" : doc.CompetitiveName);
                    workbook.Worksheet("Sheet1").Cell(row, 20).SetValue(doc.CompetitiveOther ? "Yes" : "");
                    row++;
                }
            }
            else
            {
                workbook.Worksheet("Sheet1").Cell(1, 1).SetValue("None");
            }
            workbook.SaveAs(Server.MapPath("/Data/GSPDocExport.xlsx"));
            byte[] fileBytes = System.IO.File.ReadAllBytes(Server.MapPath("/Data/GSPDocExport.xlsx"));
            return File(fileBytes, System.Net.Mime.MediaTypeNames.Application.Octet, "GSPDocExport.xlsx");

            //return RedirectToAction("Documents");
        }
        #endregion

        #endregion

        #region Spotlight Admin Actions

        #region Spotlights List
        public ActionResult Spotlights()
        {
            IEnumerable<SpotlightModel> spotlights = _spotlightService.GetSpotlightModels();
            var entries = spotlights.Select(CreateSpotlightEntry).ToList();
            //foreach (var entry in entries)
            //    entry.AllowDelete = true;
            var model = new SpotlightAdminListViewModel { Spotlights = entries, DropdownOrderSelections = PopulateOrderNumbers(_spotlightService.GetSpotlights().Count(), true) };
            return View(model);
        }
        #endregion

        #region Competitives List
        public ActionResult Competitives()
        {
            IEnumerable<CompetitiveModel> competitives = _competityService.GetCompetitiveModels();
            var entries = competitives.Select(CreateCompetitiveEntry).ToList();
            //foreach (var entry in entries)
            //    entry.AllowDelete = true;
            var model = new CompetitiveAdminListViewModel { Competitives = entries, DropdownOrderSelections = PopulateOrderNumbers(_competityService.GetCompetitives().Count(), true) };
            return View(model);
        }
        #endregion

        #region SpotlightCreatePOST Submit
        [HttpPost, ActionName("Spotlights")]
        [FormValueRequired("submit.Create")]
        public ActionResult SpotlightCreatePOST()
        {
            var viewModel = new SpotlightAdminCreateViewModel(PopulateOrderNumbers(_spotlightService.GetSpotlights().Count(), true));

            if (!TryUpdateModel(viewModel))
            {
                ViewData["CreateSpotlight"] = viewModel;
                return Spotlights();
            }

            // save the new spotlight
            _spotlightService.CreateSpotlight(viewModel.SpotlightName, viewModel.SpotlightOrder);

            // recache documents
            //RecacheDocuments();

            return RedirectToAction("Spotlights");
        }
        #endregion

        #region CompetitiveCreatePOST Submit
        [HttpPost, ActionName("Competitives")]
        [FormValueRequired("submit.Create")]
        public ActionResult CompetitiveCreatePOST()
        {
            var viewModel = new CompetitiveAdminCreateViewModel(PopulateOrderNumbers(_competityService.GetCompetitives().Count(), true));

            if (!TryUpdateModel(viewModel))
            {
                ViewData["CreateCompetitive"] = viewModel;
                return Competitives();
            }

            // save the new spotlight
            _competityService.CreateCompetitive(viewModel.CompetitiveName, viewModel.CompetitiveOrder);

            // recache documents
            //RecacheDocuments();

            return RedirectToAction("Competitives");
        }
        #endregion


        #region SpotlightEdit (GET)
        public ActionResult SpotlightEdit(int id)
        {
            SpotlightRecord spotlightRecord = _spotlightService.GetSpotlight(id);

            if (spotlightRecord == null)
            {
                return RedirectToAction("Spotlights");
            }

            var viewModel = new SpotlightAdminEditViewModel
            {
                Id = spotlightRecord.Id,
                SpotlightName = spotlightRecord.SpotlightName,
                SpotlightOrder = spotlightRecord.SpotlightOrder,
                DropdownOrderSelections = PopulateOrderNumbers(_spotlightService.GetSpotlights().Count(), false)
            };

            return View(viewModel);
        }
        #endregion  //SpotlightEdit (GET)


        #region CompetitiveEdit (GET)
        public ActionResult CompetitiveEdit(int id)
        {
            CompetitiveRecord competitiveRecord = _competityService.GetCompetity(id);

            if (competitiveRecord == null)
            {
                return RedirectToAction("Competitives");
            }

            var viewModel = new CompetitiveAdminEditViewModel
            {
                Id = competitiveRecord.Id,
                CompetitiveName = competitiveRecord.CompetitiveName,
                CompetitiveOrder = competitiveRecord.CompetitiveOrder,
                DropdownOrderSelections = PopulateOrderNumbers(_competityService.GetCompetitives().Count(), false)
            };

            return View(viewModel);
        }
        #endregion  //CompetitiveEdit (GET)



        #region SpotlightEdit (POST)
        [HttpPost]
        public ActionResult SpotlightEdit(FormCollection input)
        {
            var viewModel = new SpotlightAdminEditViewModel();
            viewModel.DropdownOrderSelections = PopulateOrderNumbers(_spotlightService.GetSpotlights().Count(), false);

            if (!TryUpdateModel(viewModel))
            {
                return View(viewModel);
            }

            _spotlightService.UpdateSpotlight(viewModel.Id, viewModel.SpotlightName, viewModel.SpotlightOrder);

            // recache documents
            //RecacheDocuments();

            return RedirectToAction("Spotlights");
        }
        #endregion  // SpotlightEdit (POST)


        #region CompetitiveEdit (POST)
        [HttpPost]
        public ActionResult CompetitiveEdit(FormCollection inputComp)
        {
            var viewModel = new CompetitiveAdminEditViewModel();
            viewModel.DropdownOrderSelections = PopulateOrderNumbers(_competityService.GetCompetitives().Count(), false);

            if (!TryUpdateModel(viewModel))
            {
                return View(viewModel);
            }

            _competityService.UpdateCompetitive(viewModel.Id, viewModel.CompetitiveName, viewModel.CompetitiveOrder);

            // recache documents
            //RecacheDocuments();

            return RedirectToAction("Competitives");
        }
        #endregion  // CompetitiveEdit (POST)

        #region SpotlightRemove
        [HttpPost]
        public ActionResult SpotlightRemove(int id, string returnUrl)
        {
            SpotlightRecord materialtypeModel = _spotlightService.GetSpotlight(id);

            if (materialtypeModel == null)
                return new HttpNotFoundResult();

            // delete the congress
            _spotlightService.DeleteSpotlight(id);

            // recache documents
            //RecacheDocuments();

            return this.RedirectLocal(returnUrl, () => RedirectToAction("Spotlights"));
        }
        #endregion

        #endregion  // Spotlight Admin Actions


         #region CompetitiveRemove
        [HttpPost]
        public ActionResult CompetitiveRemove(int id, string returnUrl)
        {
            CompetitiveRecord materialtypeModel = _competityService.GetCompetity(id);

            if (materialtypeModel == null)
                return new HttpNotFoundResult();

            // delete the congress
            _competityService.DeleteCompetitive(id);

            // recache documents
            //RecacheDocuments();

            return this.RedirectLocal(returnUrl, () => RedirectToAction("Competitives"));
        }
        #endregion

        #region Reference Admin Actions

        #region References List
        public ActionResult References()
        {
            IEnumerable<ReferenceRecord> reference = _referenceService.GetReferences();
            var entries = reference.Select(CreateReferenceEntry).ToList();
            foreach (var entry in entries)
            {
                entry.TalkingPointTitle = _talkingPointService.GetTalkingPoint(entry.Reference.TalkingPointId).TalkingPointTitle;
                entry.AllowDelete = true;
            }
            // do we have talking points with no references? (see ReferenceCreate())
            var cancreateReference = false;
            var talkparents = _talkingPointService.GetParentTalkingPoints();
            var refs = _referenceService.GetReferences();
            var finalselection = new SelectList(talkparents.Where(p => !refs.Any(p2 => p2.TalkingPointId == p.Id)).ToList(), "Id", "TalkingPointTitle");
            if (finalselection.Count() > 0)
            {
                cancreateReference = true;
            }
            var model = new ReferenceAdminListViewModel { References = entries, CanCreateReference = cancreateReference };
            return View(model);
        }
        #endregion

        #region ReferenceCreate
        public ActionResult ReferenceCreate()
        {
            var viewModel = new ReferenceAdminCreateViewModel();
            // get list of top level talking points where no reference has been created for
            var talkparents = _talkingPointService.GetParentTalkingPoints();
            var refs = _referenceService.GetReferences();
            var finalselection = new SelectList(talkparents.Where(p => !refs.Any(p2 => p2.TalkingPointId == p.Id)).ToList(), "Id", "TalkingPointTitle");
            viewModel.DropdownParentTalkingPointSelection = finalselection;
            return View(viewModel);
        }
        #endregion

        #region ReferenceCreatePOST Submit
        [HttpPost, ActionName("References")]
        [FormValueRequired("submit.Create")]
        public ActionResult ReferenceCreatePOST()
        {
            var viewModel = new ReferenceAdminCreateViewModel();

            if (!TryUpdateModel(viewModel))
            {
                ViewData["CreateReference"] = viewModel;
                return References();
            }

            // save the new reference
            _referenceService.CreateReference(viewModel.TalkingPointId, Request.Form["Text"]);

            // recache documents
            //RecacheDocuments();

            return RedirectToAction("References");
        }
        #endregion

        #region ReferenceEdit (GET)
        public ActionResult ReferenceEdit(int id)
        {
            ReferenceRecord referenceRecord = _referenceService.GetReference(id);

            if (referenceRecord == null)
            {
                return RedirectToAction("References");
            }

            var viewModel = new ReferenceAdminEditViewModel
            {
                Id = referenceRecord.Id,
                TalkingPointTitle = _talkingPointService.GetTalkingPoint(referenceRecord.TalkingPointId).TalkingPointTitle,
                ReferenceText = referenceRecord.ReferenceText
            };

            return View(viewModel);
        }
        #endregion  //ReferenceEdit (GET)

        #region ReferenceEdit (POST)
        [HttpPost]
        public ActionResult ReferenceEdit(FormCollection input)
        {
            var viewModel = new ReferenceAdminEditViewModel();

            if (!TryUpdateModel(viewModel))
            {
                return View(viewModel);
            }

            _referenceService.UpdateReference(viewModel.Id, Request.Form["Text"]);

            // recache documents
            //RecacheDocuments();

            return RedirectToAction("References");
        }
        #endregion  // ReferenceEdit (POST)

        #region ReferenceRemove
        [HttpPost]
        public ActionResult ReferenceRemove(int id, string returnUrl)
        {
            ReferenceRecord referenceModel = _referenceService.GetReference(id);

            if (referenceModel == null)
                return new HttpNotFoundResult();

            // delete the congress
            _referenceService.DeleteReference(id);

            // recache documents
            //RecacheDocuments();

            return this.RedirectLocal(returnUrl, () => RedirectToAction("References"));
        }
        #endregion

        #endregion  // Reference Admin Actions

        #region TalkingPoint Admin Actions

        #region TalkingPoints List
        public ActionResult TalkingPoints()
        {
            IEnumerable<TalkingPointModel> talkingPoints = _talkingPointService.GetTalkingPointModels();
            var entries = talkingPoints.Select(CreateTalkingPointEntry).ToList();
            foreach (var entry in entries){
                if (entry.TalkingPoint.ParentId==0)
                {
                    entry.ParentTitle = "";
                }
                else
                {
                    entry.ParentTitle = _talkingPointService.GetTalkingPoint(entry.TalkingPoint.ParentId).TalkingPointTitle;
                }
                //entry.AllowDelete = true;
            }
            var model = new TalkingPointAdminListViewModel { TalkingPoints = entries};
            return View(model);
        }
        #endregion

        #region TalkingPointCreate
        public ActionResult TalkingPointCreate()
        {
            var viewModel = new TalkingPointAdminCreateViewModel();
            viewModel.DropdownTalkingPoints = _talkingPointService.DropdownTalkingPoints(true);
            return View(viewModel);
        }
        #endregion

        #region TalkingPointCreatePOST Submit
        [HttpPost, ActionName("TalkingPoints")]
        [FormValueRequired("submit.Create")]
        public ActionResult TalkingPointCreatePOST()
        {
            var viewModel = new TalkingPointAdminCreateViewModel();

            if (!TryUpdateModel(viewModel))
            {
                ViewData["CreateTalkingPoint"] = viewModel;
                return TalkingPoints();
            }

            // save the new talkingPoint
            _talkingPointService.CreateTalkingPoint(viewModel.ParentId, viewModel.TalkingPointTitle, Request.Form["Text"]);

            // recache documents
            //RecacheDocuments();

            return RedirectToAction("TalkingPoints");
        }
        #endregion

        #region TalkingPointEdit (GET)
        public ActionResult TalkingPointEdit(int id)
        {
            TalkingPointRecord talkingPointRecord = _talkingPointService.GetTalkingPoint(id);

            if (talkingPointRecord == null)
            {
                return RedirectToAction("TalkingPoints");
            }

            var viewModel = new TalkingPointAdminEditViewModel
            {
                Id = talkingPointRecord.Id,
                ParentId = talkingPointRecord.ParentId,
                TalkingPointTitle = talkingPointRecord.TalkingPointTitle,
                TalkingPointText = talkingPointRecord.TalkingPointText,
                DropdownTalkingPoints = _talkingPointService.DropdownTalkingPoints(true)
            };

            return View(viewModel);
        }
        #endregion  //TalkingPointEdit (GET)

        #region TalkingPointEdit (POST)
        [HttpPost]
        public ActionResult TalkingPointEdit(FormCollection input)
        {
            var viewModel = new TalkingPointAdminEditViewModel();
            viewModel.DropdownTalkingPoints = _talkingPointService.DropdownTalkingPoints(true);

            if (!TryUpdateModel(viewModel))
            {
                return View(viewModel);
            }

            _talkingPointService.UpdateTalkingPoint(viewModel.Id, viewModel.ParentId, viewModel.TalkingPointTitle, Request.Form["Text"]);

            // recache documents
            //RecacheDocuments();

            return RedirectToAction("TalkingPoints");
        }
        #endregion  // TalkingPointEdit (POST)

        #region TalkingPointRemove
        [HttpPost]
        public ActionResult TalkingPointRemove(int id, string returnUrl)
        {
            TalkingPointRecord talkingpointModel = _talkingPointService.GetTalkingPoint(id);

            if (talkingpointModel == null)
                return new HttpNotFoundResult();

            // delete the congress
            _talkingPointService.DeleteTalkingPoint(id);

            // recache documents
            //RecacheDocuments();

            return this.RedirectLocal(returnUrl, () => RedirectToAction("TalkingPoints"));
        }
        #endregion

        #endregion  // TalkingPoint Admin Actions

        #region Sync Admin Actions

        #region Sync Action
        public ActionResult Sync()
        {
            return View();
        }
        #endregion

        #region SyncChanges Action
        public void SyncChanges()
        {
            RecacheDocuments();
            Response.Redirect("/Admin/BiogenRepository/DocumentsQueued");
        }
        #endregion

        #endregion

         #endregion

        #region Common Methods

        #region DocumentEditGetCommon Method
        private DocumentAdminItemViewModel DocumentEditGetCommon(int id)
        {
            DocumentRecord documentRecord = _documentService.GetDocument(id);

            if (documentRecord == null)
            {
                return null;
            }
            else
            {
                // NOTE: For document edit (Document Visible tab), need to find out if this document is part of the recent list. Since Orchard doesn't support partial properties for a 
                // model outside of what fields exist in the table, I would have to add a field to the table just to be able to set a property on whether this document exists in the 
                // recent list or not. Instead of tainting the table, I'm going to use an already existing field (ReadyToPublish) to contain the state of this document existing in the 
                // recent list or not. This field isn't used for anything permanent so a temporary storage value is acceptable.
                var docinrecentlist = _recentlyPublishedService.GetRecentlyPublishedByDocID(documentRecord.Id);
                documentRecord.ReadyToPublish = (docinrecentlist != null);
            }

            var viewModel = new DocumentAdminItemViewModel
            {
                Document = documentRecord,
                DropdownStrategyTemplates = _strategytemplateService.DropdownTemplates(),
                DropdownCategoryTemplates = _categorytemplateService.DropdownTemplates(),
                DropdownTalkingPointTemplates = _talkingPointService.DropdownTemplates(),
                DropdownPublicationYears = PopulateRecentYearDropdown(),
                DropdownCompetitives = _competityService.DropdownCompetitives(true),
                DropdownSpotlights = _spotlightService.DropdownSpotlights(true)
            };
            viewModel.StrategyTemplateID = _documentstrategytemplatelinksRepository.GetDocumentTemplateLinks(viewModel.Document.Id).Select(l => l.StrategyTemplateID).ToList();
            viewModel.CategoryTemplateID = _documentcategorytemplatelinksRepository.GetDocumentTemplateLinks(viewModel.Document.Id).Select(l => l.CategoryTemplateID).ToList();
            viewModel.TalkingPointTemplateID = _documenttalkingpointtemplatelinksRepository.GetDocumentTemplateLinks(viewModel.Document.Id).Select(l => l.TalkingPointID).ToList();

            return viewModel;
        }
        #endregion
        
        #region DocumentEditPostCommon Method
        private DocumentAdminItemViewModel DocumentEditPostCommon(DocumentRecord document, List<int> strategytemplateid, List<int> categorytemplateid, List<int> talkingpointtemplateid, FormCollection input, bool keepqueued)
        {
            // if coming from the Documents Queued tab, we may need to keep the doc queued once it is finished being edited
            document.Queued = keepqueued;

            // re-establish the viewModel in case we need to re-render the edit page due to an error of some sort
            string filename = document.FileName;
            var viewModel = new DocumentAdminItemViewModel()
            {
                Document = document,
                DropdownStrategyTemplates = _strategytemplateService.DropdownTemplates(),
                DropdownCategoryTemplates = _categorytemplateService.DropdownTemplates(),
                DropdownTalkingPointTemplates = _talkingPointService.DropdownTemplates(),
                DropdownPublicationYears = PopulateRecentYearDropdown(),
                DropdownCompetitives = _competityService.DropdownCompetitives(true),
                DropdownSpotlights = _spotlightService.DropdownSpotlights(true)
            };
            viewModel.StrategyTemplateID = strategytemplateid;
            viewModel.CategoryTemplateID = categorytemplateid;
            viewModel.TalkingPointTemplateID = talkingpointtemplateid;

            if (!TryUpdateModel(viewModel))
            {
                return viewModel;
            }

            // for some reason when running the TryUpdateModel method, it overwrites the filename passed in the original document parameter above. 
            // we retain it before that is called and will replace it here.
            document.FileName = filename;

            // if we get this far, we continue to save changes

            // save document record, prepopulate additional fields
            if (document.BrainsharkLink == "http://") document.BrainsharkLink = "";

            // update document record
            _documentService.UpdateDocument(document);

            // delete any template links associated with this document
            _documentstrategytemplatelinksRepository.DeleteAllLinksForDocument(document.Id);
            _documentcategorytemplatelinksRepository.DeleteAllLinksForDocument(document.Id);
            _documenttalkingpointtemplatelinksRepository.DeleteAllLinksForDocument(document.Id);

            // link this document with all the strategy templates
            if (strategytemplateid != null)
            {
                foreach (int strat in strategytemplateid)
                    _documentstrategytemplatelinksRepository.CreateDocumentTemplateLink(new DocumentStrategyTemplateLinksRecord() { DocumentID = document.Id, StrategyTemplateID = strat });
            }

            // link this document with all the category templates
            if (categorytemplateid != null)
            {
                foreach (int cat in categorytemplateid)
                    _documentcategorytemplatelinksRepository.CreateDocumentTemplateLink(new DocumentCategoryTemplateLinksRecord() { DocumentID = document.Id, CategoryTemplateID = cat });
            }

            // link this document with all the talking point templates
            if (talkingpointtemplateid != null)
            {
                foreach (int talkid in talkingpointtemplateid)
                    _documenttalkingpointtemplatelinksRepository.CreateDocumentTemplateLink(new DocumentTalkingPointTemplateLinksRecord() { DocumentID = document.Id, TalkingPointID = talkid });
            }

            // now determine if we keep this document on the recent list or not
            if (document.ReadyToPublish)
                _recentlyPublishedService.CreateRecentlyPublished(document.Id);
            else
            {
                var recentDoc = _recentlyPublishedService.GetRecentlyPublishedByDocID(document.Id);
                if (recentDoc != null) _recentlyPublishedService.DeleteRecentlyPublished(recentDoc.Id);
            }

            // rebuild the content xml file and flag to update cache if this document should be published
            //RecacheDocuments();

            return null; 
        }
        #endregion

        #region RecacheDocuments Method
        private void RecacheDocuments()
        {
            // recache documents
            DocumentRecord.RecacheDocuments(_strategyService, _substrategyService, _categoryService, _subcategoryService, _strategytemplateService, _categorytemplateService, _documentstrategytemplatelinksRepository, _documentcategorytemplatelinksRepository, _documentService, _recentlyPublishedService, _spotlightService, _competityService,_talkingPointService, _referenceService, _documenttalkingpointtemplatelinksRepository);
        }
        #endregion

        #endregion

        #region Static Methods

        #region InsertSelectItem Helper
        public static SelectList InsertSelectItem(SelectList obj, int index, string text, string value)
        {
            var selectlist = obj.ToList();
            selectlist.Insert(index, new SelectListItem { Text = text, Value = value });
            return new SelectList(selectlist, "Value", "Text");
        }
        #endregion

        #region CreateStrategyEntry Method
        private static StrategyEntry CreateStrategyEntry(StrategyRecord strategyRecord)
        {
            return new StrategyEntry
            {
                Strategy = strategyRecord                
            };
        }
        #endregion

        #region CreateSubStrategyEntry Method
        private static SubStrategyEntry CreateSubStrategyEntry(SubStrategyRecord substrategyRecord)
        {
            return new SubStrategyEntry
            {
                SubStrategy = substrategyRecord,
            };
        }
        #endregion

        #region CreateCategoryEntry Method
        private static CategoryEntry CreateCategoryEntry(CategoryRecord categoryRecord)
        {
            return new CategoryEntry
            {
                Category = categoryRecord,
            };
        }
        #endregion

        #region CreateSubCategoryEntry Method
        private static SubCategoryEntry CreateSubCategoryEntry(SubCategoryRecord subcategoryRecord)
        {
            return new SubCategoryEntry
            {
                SubCategory = subcategoryRecord,
            };
        }
        #endregion

        #region CreateStrategyTemplateEntry Method
        private static StrategyTemplateEntry CreateStrategyTemplateEntry(StrategyTemplateRecord strategytemplateRecord, string strategyTitle, string substrategyTitle)
        {
            return new StrategyTemplateEntry
            {
                StrategyTemplate = strategytemplateRecord,
                StrategyTitle = strategyTitle,
                SubStrategyTitle = substrategyTitle
            };
        }
        #endregion

        #region CreateCategoryTemplateEntry Method
        private static CategoryTemplateEntry CreateCategoryTemplateEntry(CategoryTemplateRecord categorytemplateRecord, string categoryTitle, string subcategoryTitle)
        {
            return new CategoryTemplateEntry
            {
                CategoryTemplate = categorytemplateRecord,
                CategoryTitle = categoryTitle,
                SubCategoryTitle = subcategoryTitle
            };
        }
        #endregion

        #region CreateDocumentQueueEntry Method
        private static DocumentQueueEntry CreateDocumentQueueEntry(DocumentRecord documentRecord)
        {
            return new DocumentQueueEntry
            {
                Document = documentRecord,
            };
        }
        #endregion

        #region CreateDocumentEntry Method
        private static DocumentEntry CreateDocumentEntry(DocumentRecord documentRecord)
        {
            return new DocumentEntry
            {
                Document = documentRecord,
            };
        }
        #endregion

        #region CreateSpotlightEntry Method
        private static SpotlightEntry CreateSpotlightEntry(SpotlightModel spotlightRecord)
        {
            return new SpotlightEntry
            {
                Spotlight = spotlightRecord
            };
        }
        #endregion

        #region CreateCompetitiveEntry Method
        private static CompetitiveEntry CreateCompetitiveEntry(CompetitiveModel competitiveRecord)
        {
            return new CompetitiveEntry
            {
                Competitive = competitiveRecord
            };
        }
        #endregion

        #region CreateTalkingPointEntry Method
        private static TalkingPointEntry CreateTalkingPointEntry(TalkingPointModel talkingPointRecord)
        {
            return new TalkingPointEntry
            {
                TalkingPoint = talkingPointRecord
            };
        }
        #endregion

        #region CreateReferenceEntry Method
        private static ReferenceEntry CreateReferenceEntry(ReferenceRecord referenceRecord)
        {
            return new ReferenceEntry
            {
                Reference = referenceRecord
            };
        }
        #endregion

        #region PopulateRecentYearDropdown
        /// <summary>
        /// This method pre-populates range-driven dropdown lists with a user-defined range of integers
        /// </summary>
        public static SelectList PopulateRecentYearDropdown()
        {
            var startYear = 1980;
            var currentYear = DateTime.Now.Year;

            //Add all years from starting year to the year before the current
            var numbers = (from p in Enumerable.Range(startYear, currentYear - startYear + 1)
                           select new SelectListItem { Text = p.ToString(), Value = p.ToString() }).OrderByDescending(p => p.Value);
            var selectlist = numbers.ToList();

            //Add intro value
            //var initItem = new SelectListItem { Text = "Year", Value = "" };
            //selectlist.Insert(0, initItem);

            return new SelectList(selectlist, "Value", "Text");
        }
        #endregion

        #region PopulateOrderNumbers
        /// <summary>
        /// This method pre-populates range-driven dropdown lists with a user-defined range of integers
        /// </summary>
        public static SelectList PopulateOrderNumbers(int currentitemcount, bool doinsert)
        {
            var startNo = 1;
            var endNo = currentitemcount + 1;

            //Add all years from starting year to the year before the current
            var numbers = (from p in Enumerable.Range(startNo, endNo - startNo)
                           select new SelectListItem { Text = p.ToString(), Value = p.ToString() });
            var selectlist = numbers.ToList();

            var newlist = new SelectList(selectlist, "Value", "Text");
            if (doinsert) newlist = InsertSelectItem(newlist, 0, endNo.ToString(), endNo.ToString());
            return newlist;
        }
        #endregion

        #endregion
    }
}