namespace CodeSparkNET.WEB.ViewModels.AdminCourse
{
    public class CreateCourseViewModel
    {
        public string Name { get; set; } = null!;
        public string? Slug { get; set; }
        public decimal Price { get; set; } = 0m;
        public string Level { get; set; } = "Beginner";
        public string Currency { get; set; } = "RUB";
        public int InStock { get; set; } = 0;
        public bool IsPublished { get; set; } = false;
        public string? CatalogId { get; set; }
        public string? ShortDescription { get; set; }
        public string? FullDescription { get; set; }
        public string? MainImageUrl { get; set; }
    }
}
