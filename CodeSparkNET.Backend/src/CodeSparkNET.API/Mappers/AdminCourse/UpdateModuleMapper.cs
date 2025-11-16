using CodeSparkNET.Application.Dtos.Course;
using CodeSparkNET.WEB.ViewModels.AdminCourse;

namespace CodeSparkNET.WEB.Mappers.AdminCourse
{
    public static class UpdateModuleMapper
    {
        public static UpdateModuleDto ToDto(this UpdateModuleViewModel viewModel)
        {
            if (viewModel == null) return null;
            return new UpdateModuleDto
            {
                Slug = viewModel.Slug.Trim().ToLower(),
                Title = viewModel.Title.Trim(),
                Position = viewModel.Position
            };
        }
    }
}
