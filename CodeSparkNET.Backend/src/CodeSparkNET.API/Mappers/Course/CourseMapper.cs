using CodeSparkNET.Application.Dtos.Course;
using CodeSparkNET.WEB.ViewModels.Course;

namespace CodeSparkNET.WEB.Mappers.Course
{
    public static class CourseMapper
    {
        #region ToCourseDto

        public static CourseDto ToDto(this CourseViewModel model)
        {
            if (model == null)
                return null!;

            return new CourseDto
            {
                Id = model.Id,
                Name = model.Name,
                Slug = model.Slug,
                ShortDescription = model.ShortDescription,
                FullDescription = model.FullDescription,
                Modules = model.Modules?.Select(m => new ModuleDto
                {
                    Id = m.Id,
                    Slug = m.Slug,
                    Title = m.Title,
                    Position = m.Position,
                    Lessons = m.Lessons?.Select(l => new LessonListItemDto
                    {
                        Id = l.Id,
                        Title = l.Title,
                        Position = l.Position,
                        Slug = l.Slug,
                        IsFreePreview = l.IsFreePreview
                    }).ToList()
                }).ToList(),
                Images = model.Images?.Select(i => new ProductImageDto
                {
                    Url = i.Url,
                    AltText = i.AltText,
                    IsMain = i.IsMain
                }).ToList()
            };
        }

        #endregion

        #region ToCourseViewModel

        public static CourseViewModel ToViewModel(this CourseDto dto)
        {
            if (dto == null)
                return null!;

            return new CourseViewModel
            {
                Id = dto.Id,
                Name = dto.Name,
                Slug = dto.Slug,
                ShortDescription = dto.ShortDescription,
                FullDescription = dto.FullDescription,
                Modules = dto.Modules?.Select(m => new ModuleViewModel
                {
                    Id = m.Id,
                    Slug = m.Slug,
                    Title = m.Title,
                    Position = m.Position,
                    Lessons = m.Lessons?.Select(l => new LessonListItemViewModel
                    {
                        Id = l.Id,
                        Title = l.Title,
                        Position = l.Position,
                        Slug = l.Slug,
                        IsFreePreview = l.IsFreePreview
                    }).ToList() ?? new List<LessonListItemViewModel>()
                }).ToList() ?? new List<ModuleViewModel>(),
                Images = dto.Images?.Select(i => new ProductImageViewModel
                {
                    Url = i.Url,
                    AltText = i.AltText,
                    IsMain = i.IsMain
                }).ToList() ?? new List<ProductImageViewModel>()
            };
        }

        #endregion
    }
}
