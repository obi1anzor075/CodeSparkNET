using CodeSparkNET.Application.Dtos.Catalog;
using CodeSparkNET.WEB.ViewModels.Catalogs;

namespace CodeSparkNET.WEB.Mappers.Catalogs
{
    public static class CatalogNamesMapper
    {
        public static CatalogNamesDto ToDto(this CatalogNamesViewModel model)
        {
            if (model == null) return null;
            return new CatalogNamesDto
            {
                Name = model.Name?.Trim(),
                Slug = model.Slug?.Trim().ToLower(),
                IsLinkOnly = model.IsLinkOnly,
                PageName = model.PageName?.Trim(),
                PageController = model.PageController?.Trim()
            };
        }

        public static CatalogNamesViewModel ToViewModel(this CatalogNamesDto model)
        {
            if (model == null) return null;
            return new CatalogNamesViewModel
            {
                Name = model.Name,
                Slug = model.Slug,
                IsLinkOnly = model.IsLinkOnly,
                PageName = model.PageName,
                PageController = model.PageController
            };
        }

        public static List<CatalogNamesViewModel> ToViewModel(this IEnumerable<CatalogNamesDto> models)
        {
            if (models == null) return new List<CatalogNamesViewModel>();
            return models
                .Select(m => m.ToViewModel())
                .Where(vm => vm != null)
                .ToList();
        }

        public static List<CatalogNamesDto> ToDto(this IEnumerable<CatalogNamesViewModel> models)
        {
            if (models == null) return new List<CatalogNamesDto>();
            return models
                .Select(m => m.ToDto())
                .Where(dto => dto != null)
                .ToList();
        }
    }
}
