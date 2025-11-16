namespace CodeSparkNET.Application.Dtos.Course
{
    public class CourseDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Slug { get; set; }
        public string? ShortDescription { get; set; } 
        public string? FullDescription { get; set; }
        public string Group { get; set; }
        public List<ModuleDto> Modules { get; set; }
        public List<ProductImageDto> Images { get; set; }

    }
}
