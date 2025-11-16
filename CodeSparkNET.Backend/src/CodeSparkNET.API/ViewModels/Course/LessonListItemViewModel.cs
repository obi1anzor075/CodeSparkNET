namespace CodeSparkNET.WEB.ViewModels.Course
{
    public class LessonListItemViewModel
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public int Position { get; set; }
        public string Slug { get; set; }
        public bool IsFreePreview { get; set; }
    }
}
