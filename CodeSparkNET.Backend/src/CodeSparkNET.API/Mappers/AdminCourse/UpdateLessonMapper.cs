using CodeSparkNET.Application.Dtos.Course;
using CodeSparkNET.WEB.ViewModels.AdminCourse;

namespace CodeSparkNET.WEB.Mappers.AdminCourse
{
    public static class UpdateLessonMapper
    {
        public static UpdateLessonDto ToDto(this UpdateLessonViewModel viewModel)
        {
            if (viewModel == null) return null;
            return new UpdateLessonDto
            {
                Id = viewModel.Id,
                ModuleId = viewModel.ModuleId,
                Title = viewModel.Title.Trim(),
                Slug = viewModel.Slug.Trim().ToLower(),
                Body = viewModel.Body.Trim(),
                Position = viewModel.Position,
                IsPublished = viewModel.IsPublished,
                IsFreePreview = viewModel.IsFreePreview
            };
        }
    }
}
