namespace CodeSparkNET.Application.Dtos.Course
{
    public class UpdateCourseDto
    {
        public string Id { get; set; }
        public string Slug { get; set; }
        public string Name { get; set; }
        public string ShortDescription { get; set; }
        public string FullDescription { get; set; }
        public string MainImageUrl { get; set; }
        public string Group { get; set; }
    }
}
