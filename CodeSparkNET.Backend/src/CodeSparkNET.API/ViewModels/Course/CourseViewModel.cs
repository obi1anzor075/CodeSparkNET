namespace CodeSparkNET.WEB.ViewModels.Course
{
    public class CourseViewModel
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Slug { get; set; }
        public string? ShortDescription { get; set; }
        public string? FullDescription { get; set; }
        public List<ModuleViewModel> Modules { get; set; }
        public List<ProductImageViewModel> Images { get; set; }
    }
}
