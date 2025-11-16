namespace CodeSparkNET.WEB.ViewModels.Catalogs
{
    public class CatalogViewModel
    {
        public string? Name { get; set; }
        public string? Slug { get; set; }
        public bool? IsVisible { get; set; }
        public bool IsLinkOnly { get; set; }

        public List<CatalogProductsViewModel>? Products { get; set; }
    }
}
