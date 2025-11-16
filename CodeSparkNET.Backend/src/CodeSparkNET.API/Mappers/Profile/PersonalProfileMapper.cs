using CodeSparkNET.Application.Dtos.Account.Profile;
using CodeSparkNET.Application.Dtos.Profile;
using CodeSparkNET.WEB.ViewModels.Profile;

namespace CodeSparkNET.WEB.Mappers.Profile
{
    public static class PersonalProfileMapper
    {
        public static PersonalProfileDto ToDto(this PersonalProfileViewModel viewModel)
        {
            if (viewModel == null) return null;
            return new PersonalProfileDto
            {
                UserName = viewModel.UserName.Trim(),
                Email = viewModel.Email.Trim().ToLowerInvariant(),
                Roles = viewModel.Roles.Trim(),
                EmailAddAt = viewModel.EmailAddAt,
                EmailConfirmedAt = viewModel.EmailConfirmedAt,
                EmailChangedAt = viewModel.EmailChangedAt,
                AllUserCourses = viewModel.AllUserCourses.Select(c => new AllUserCoursesDto
                {
                    Name = c.Name.Trim(),
                    Slug = c.Slug.Trim().ToLower(),
                    IsCompleted = c.IsCompleted
                })
                .ToList()
            };
        }
    
        public static AllUserCoursesDto ToDto(this AllUserCoursesViewModel viewModel)
        {
            if (viewModel == null) return null;
            return new AllUserCoursesDto
            {
                Name = viewModel.Name.Trim(),
                Slug = viewModel.Slug.Trim().ToLower(),
                IsCompleted = viewModel.IsCompleted
            };
        }

        public static UpdatePersonalProfileDto ToDto(this UpdatePersonalProfileViewModel viewModel)
        {
            if (viewModel == null) return null;
            return new UpdatePersonalProfileDto
            {
                UserName = viewModel.UserName.Trim(),
                Email = viewModel.Email.Trim().ToLowerInvariant()
            };
        }

        public static ChangePasswordDto ToDto(this ChangePasswordViewModel viewModel)
        {
            if (viewModel == null) return null;
            return new ChangePasswordDto
            {
                CurrentPassword = viewModel.CurrentPassword.Trim(),
                NewPassword = viewModel.NewPassword.Trim()
            };
        }

        public static AllUserCoursesViewModel ToViewModel(this AllUserCoursesDto model)
        {
            if (model == null) return null;
            return new AllUserCoursesViewModel
            {
                Name = model.Name,
                Slug = model.Slug,
                IsCompleted = model.IsCompleted
            };
        }

        public static List<AllUserCoursesViewModel> ToViewModel(this List<AllUserCoursesDto> model)
        {
            if (model == null) return new List<AllUserCoursesViewModel>();

            return model.Select(c => new AllUserCoursesViewModel
            {
                Name = c.Name,
                Slug = c.Slug,
                IsCompleted = c.IsCompleted
            }).ToList();
        }
    }
}
