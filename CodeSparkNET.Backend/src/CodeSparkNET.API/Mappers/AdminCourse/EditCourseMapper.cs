using CodeSparkNET.Application.Dtos.Course;
using CodeSparkNET.WEB.ViewModels.AdminCourse;

namespace CodeSparkNET.WEB.Mappers.AdminCourse
{
    public static class EditCourseMapper
    {
        public static UpdateCourseDto ToDto(this EditCourseViewModel viewModel)
        {
            if (viewModel == null) return null;
            return new UpdateCourseDto
            {
                Id = viewModel.Id,
                Slug = viewModel.Slug.Trim().ToLower(),
                Name = viewModel.Name.Trim(),
                ShortDescription = viewModel.ShortDescription.Trim(),
                FullDescription = viewModel.FullDescription.Trim(),
                MainImageUrl = viewModel.MainImageUrl.Trim()
            };
        }

        public static EditCourseViewModel ToViewModel(this UpdateCourseDto model)
        {
            if (model == null) return null;
            return new EditCourseViewModel
            {
                Id = model.Id,
                Slug = model.Slug,
                Name = model.Name,
                ShortDescription = model.ShortDescription,
                FullDescription = model.FullDescription,
                MainImageUrl = model.MainImageUrl.Trim()
            };
        }
    }
}
