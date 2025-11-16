using CodeSparkNET.Application.Dtos.Catalog;
using CodeSparkNET.WEB.ViewModels.Catalogs;

namespace CodeSparkNET.WEB.Mappers.Catalogs
{
    public static class CatalogMapper
    {
        #region ToDto
        public static CatalogDto ToDto(this CatalogViewModel viewModel)
        {
            if (viewModel == null) return null;

            return new CatalogDto
            {
                Name = viewModel.Name?.Trim(),
                Slug = viewModel.Slug?.Trim().ToLower(),
                IsVisible = viewModel.IsVisible,
                IsLinkOnly = viewModel.IsLinkOnly,
                Products = (viewModel.Products ?? Enumerable.Empty<CatalogProductsViewModel>())
                    .Select(MapProduct)
                    .Where(p => p != null)
                    .ToList()
            };
        }

        private static CatalogProductsDto MapProduct(CatalogProductsViewModel vm)
        {
            if (vm == null) return null;

            return new CatalogProductsDto
            {
                Name = vm.Name?.Trim(),
                Slug = vm.Slug?.Trim().ToLower(),
                ShortDescription = vm.ShortDescription?.Trim(),
                FullDescription = vm.FullDescription?.Trim(),
                Price = vm.Price,
                Currency = vm.Currency?.Trim().ToUpper(),
                InStock = vm.InStock,
                ProductType = vm.ProductType?.Trim(),
                HasPrice = vm.HasPrice,
                ProductImages = (vm.ProductImages ?? Enumerable.Empty<CatalogProductImageViewModel>())
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

        #region ToViewModel
        public static CatalogViewModel ToViewModel(this CatalogDto dto)
        {
            if (dto == null) return null;

            return new CatalogViewModel
            {
                Name = dto.Name,
                Slug = dto.Slug,
                IsVisible = dto.IsVisible,
                IsLinkOnly = dto.IsLinkOnly,
                Products = (dto.Products ?? Enumerable.Empty<CatalogProductsDto>())
                    .Select(MapProductToViewModel)
                    .Where(p => p != null)
                    .ToList()
            };
        }

        private static CatalogProductsViewModel MapProductToViewModel(CatalogProductsDto dto)
        {
            if (dto == null) return null;

            return new CatalogProductsViewModel
            {
                Name = dto.Name,
                Slug = dto.Slug,
                ShortDescription = dto.ShortDescription,
                FullDescription = dto.FullDescription,
                Price = dto.Price,
                Currency = dto.Currency,
                InStock = dto.InStock,
                ProductType = dto.ProductType,
                HasPrice = dto.HasPrice,
                ProductImages = (dto.ProductImages ?? Enumerable.Empty<CatalogProductImageDto>())
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
