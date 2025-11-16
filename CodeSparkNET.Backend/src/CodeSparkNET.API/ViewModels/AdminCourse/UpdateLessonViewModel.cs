namespace CodeSparkNET.WEB.ViewModels.AdminCourse
{
    public class UpdateLessonViewModel
    {
        public string Id { get; set; }
        public string ModuleId { get; set; }
        public string Title { get; set; }
        public string? Slug { get; set; }
        public string? Body { get; set; }
        public int Position { get; set; }
        public bool IsPublished { get; set; }
        public bool IsFreePreview { get; set; }
    }
}
