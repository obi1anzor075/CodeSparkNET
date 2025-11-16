namespace CodeSparkNET.WEB.ViewModels.Course
{
    public class ModuleViewModel
    {
        public string Id { get; set; }
        public string Slug { get; set; }
        public string Title { get; set; }
        public int Position { get; set; }
        public List<LessonListItemViewModel> Lessons { get; set; } = new();
    }
}
