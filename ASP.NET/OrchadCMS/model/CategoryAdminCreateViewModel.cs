using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Web.Mvc;

namespace BiogenRepository.ViewModels
{
    public class CategoryAdminCreateViewModel
    {
        #region Constructor

        public CategoryAdminCreateViewModel(SelectList orderitems)
        {
            DropdownOrderSelections = orderitems;
        }

        #endregion

        #region Properties

        [Required, DisplayName("Title")]
        public string CategoryTitle { get; set; }

        public string CategoryIcon { get; set; }
        
        [Required, DisplayName("Order")]
        public int CategoryOrder { get; set; }

        public SelectList DropdownOrderSelections { get; set; }

        #endregion
    }
}