namespace CodeSparkNET.WEB.ViewModels.Profile
{
    public class AllUserCoursesViewModel
    {
        /// <summary>
        /// Display name of the course.
        /// </summary>
        public string? Name { get; set; }

        /// <summary>
        /// URL-friendly identifier (slug) for the course.
        /// </summary>
        public string? Slug { get; set; }

        /// <summary>
        /// Indicates whether the user has completed the course.
        /// </summary>
        public bool IsCompleted { get; set; }
    }
}
