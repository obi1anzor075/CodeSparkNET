using CodeSparkNET.Application.Dtos.Catalog;
using CodeSparkNET.WEB.ViewModels.Catalogs;

namespace CodeSparkNET.WEB.Mappers.Catalogs
{
    public static class CatalogProductDetailsMapper
    {
        #region To CatalogProductDetailsDto
        public static CatalogProductDetailsDto ToDto(this CatalogProductDetailsViewModel viewModel)
        {
            if (viewModel == null) return null;
            return new CatalogProductDetailsDto
            {
                Name = viewModel.Name.Trim(),
                Slug = viewModel.Slug.Trim().ToLower(),
                FullDescription = viewModel.FullDescription.Trim(),
                Price = viewModel.Price,
                Currency = viewModel.Currency.Trim().ToUpper(),
                InStock = viewModel.InStock,
                ProductType = viewModel.ProductType.Trim(),
                IsAlreadyEnrolled = viewModel.IsAlreadyEnrolled,
                HasPrice = viewModel.HasPrice,
                Images = (viewModel.Images ?? Enumerable.Empty<CatalogProductImageViewModel>())
                    .Select(MapImage)
                    .Where(i => i != null)
                    .ToList()
            };
        }

        private static CatalogProductImageDto MapImage(CatalogProductImageViewModel vm)
        {
            if (vm == null) return null;

            return new CatalogProductImageDto
            {
                Name = vm.Name?.Trim(),
                Url = vm.Url?.Trim(),
                IsMain = vm.IsMain
            };
        }
        #endregion
        #region To CatalogProductDetailsViewModel
        public static CatalogProductDetailsViewModel ToViewModel(this CatalogProductDetailsDto model)
        {
            if (model == null) return null;
            return new CatalogProductDetailsViewModel
            {
                Name = model.Name,
                Slug = model.Slug,
                FullDescription = model.FullDescription,
                Price = model.Price,
                Currency = model.Currency,
                InStock = model.InStock,
                ProductType = model.ProductType,
                IsAlreadyEnrolled = model.IsAlreadyEnrolled,
                HasPrice = model.HasPrice,
                Images = (model.Images ?? Enumerable.Empty<CatalogProductImageDto>())
                    .Select(MapImageToViewModel)
                    .Where(i => i != null)
                    .ToList()
            };
        }

        private static CatalogProductImageViewModel MapImageToViewModel(CatalogProductImageDto dto)
        {
            if (dto == null) return null;

            return new CatalogProductImageViewModel
            {
                Name = dto.Name,
                Url = dto.Url,
                IsMain = dto.IsMain
            };
        }
        #endregion
    }
}
