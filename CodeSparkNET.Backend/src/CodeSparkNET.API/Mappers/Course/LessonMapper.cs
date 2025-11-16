using CodeSparkNET.Application.Dtos.Course;
using CodeSparkNET.WEB.ViewModels.Course;

namespace CodeSparkNET.WEB.Mappers.Course
{
    public static class LessonMapper
    {
        #region ToLessonDto

        public static LessonContentDto ToDto(this LessonContentViewModel model)
        {
            if (model == null)
                return null!;

            return new LessonContentDto
            {
                Id = model.Id,
                Slug = model.Slug,
                Title = model.Title,
                Body = model.Body,
                Position = model.Position,
                IsPublished = model.IsPublished,
                IsFreePreview = model.IsFreePreview,
                Resources = model.Resources?.Select(r => new LessonResourceDto
                {
                    Id = r.Id,
                    Url = r.Url,
                    ResourceType = r.ResourceType,
                    Title = r.Title
                }).ToList()
            };
        }

        #endregion

        #region ToLessonViewModel

        public static LessonContentViewModel ToLessonViewModel(this LessonContentDto dto)
        {
            if (dto == null)
                return null!;

            return new LessonContentViewModel
            {
                Id = dto.Id,
                Slug = dto.Slug,
                Title = dto.Title,
                Body = dto.Body,
                Position = dto.Position,
                IsPublished = dto.IsPublished,
                IsFreePreview = dto.IsFreePreview,
                Resources = dto.Resources?.Select(r => new LessonResourceViewModel
                {
                    Id = r.Id,
                    Url = r.Url,
                    ResourceType = r.ResourceType,
                    Title = r.Title
                }).ToList() ?? new List<LessonResourceViewModel>()
            };
        }

        #endregion
    }
}
