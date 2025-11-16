using CodeSparkNET.Application.Dtos.Course;
using CodeSparkNET.WEB.ViewModels.AdminCourse;

namespace CodeSparkNET.WEB.Mappers.AdminCourse
{
    public static class CreateCourseMapper
    {
        public static CreateCourseDto ToDto(this CreateCourseViewModel model)
        {
            if (model == null) return null;
            return new CreateCourseDto
            {
                Name = model.Name.Trim(),
                Slug = model.Slug.Trim().ToLowerInvariant(),
                Price = model.Price,
                Level = model.Level.Trim(),
                Currency = model.Currency.Trim().ToUpperInvariant(),
                InStock = model.InStock,
                IsPublished = model.IsPublished,
                CatalogId = model.CatalogId.Trim(),
                ShortDescription = model.ShortDescription.Trim(),
                FullDescription = model.FullDescription.Trim(),
                MainImageUrl = model.MainImageUrl.Trim()
            };
        }
    }
}
