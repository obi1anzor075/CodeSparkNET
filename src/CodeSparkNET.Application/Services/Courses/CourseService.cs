using CodeSparkNET.Application.Dtos.Course;
using CodeSparkNET.Domain.Models;

namespace CodeSparkNET.Application.Services.Courses
{
    public class CourseService : ICourseService
    {
        private readonly IProductRepository _productRepository;

        public CourseService(IProductRepository productRepository)
        {
            _productRepository = productRepository;
        }
        public async Task<CourseDto> GetCourseBySlugAsync(string slug)
        {
            var course = await _productRepository.GetCourseBySlugAsync(slug);
            if (course == null) 
                return null;

            return new CourseDto
            {
                Id = course.Id,
                Name = course.Name,
                Slug = course.Slug,
                ShortDescription = course.ShortDescription,
                FullDescription = course.FullDescription,
                Group = course.Group,
                Images = course.ProductImages
                    .OrderBy(pi => pi.Position)
                    .Select(pi => new ProductImageDto
                    {
                        Url = pi.Url ?? pi.Name ?? "",
                        AltText = pi.AltText,
                        IsMain = pi.IsMain,
                        Name = pi.Name ?? ""
                    })
                    .ToList(),
                Modules = course.Modules
                    .OrderBy(m => m.Position)
                    .Select(m => new ModuleDto
                    {
                        Id = m.Id,
                        Slug = m.Slug,
                        Title = m.Title,
                        Position = m.Position,
                        Lessons = m.Lessons
                            .OrderBy(l => l.Position)
                            .Select(l => new LessonListItemDto
                            {
                                Id = l.Id,
                                Title = l.Title,
                                Position = l.Position,
                                Slug = l.Slug,
                                IsFreePreview = l.IsFreePreview,
                            })
                            .ToList()
                    }).ToList()
            };
        }

        public async Task<ModuleDto> GetModuleBySlugAsync(string slug)
        {
            var module = await _productRepository.GetModuleBySlugAsync(slug);
            if (module == null)
                return null;

            return new ModuleDto
            {
                Id = module.Id,
                Title = module.Title,
                Position = module.Position,
                Lessons = module.Lessons
                    .OrderBy(l => l.Position)
                    .Select(l => new LessonListItemDto
                    {
                        Id = l.Id,
                        Title = l.Title,
                        Position = l.Position,
                        Slug = l.Slug,
                        IsFreePreview= l.IsFreePreview,
                    })
                    .ToList()
            };
        }

        public async Task<LessonContentDto> GetLessonBySlugAsync(string courseSlug, string lessonSlug)
        {
            var lesson = await _productRepository.GetLessonBySlugAsync(courseSlug, lessonSlug);
            if (lesson == null)
                return null;

            return new LessonContentDto
            {
                Id = lesson.Id,
                Title = lesson.Title,
                Body = lesson.Body,
                Resources = lesson.Resources.OrderBy(r => r.Position)
                              .Select(r => new LessonResourceDto
                              {
                                  Id = r.Id,
                                  Url = r.Url,
                                  ResourceType = r.ResourceType,
                                  Title = r.Title
                              }).ToList()
            };
        }

        public async Task<CourseDto> CreateCourseAsync(CreateCourseDto dto)
        {
            var course = await _productRepository.AddCourseAsync(dto);
            if (course == null) return null;

            var result = new CourseDto
            {
                Id = course.Id,
                Name = course.Name,
                Slug = course.Slug,
                ShortDescription = course.ShortDescription,
                FullDescription = course.FullDescription,
                Group = course.Group,
                Images = course.ProductImages?.OrderBy(pi => pi.Position).Select(pi => new ProductImageDto
                {
                    Url = pi.Url ?? pi.Name ?? "",
                    AltText = pi.AltText,
                    IsMain = pi.IsMain,
                    Name = pi.Name ?? ""
                }).ToList() ?? new List<ProductImageDto>(),
                Modules = new List<ModuleDto>()
            };

            return result;
        }

        public async Task<bool> UpdateCourseAsync(UpdateCourseDto model)
        {
            if (model == null) return false;

            var result = await _productRepository.UpdateCourseBasicsAsync(model);

            if (!result)
                return false;
            return true;
        }

        public async Task<ModuleDto> AddModuleAsync(AddModuleDto model)
        {
            if (model == null)
                return new ModuleDto();

            var module = await _productRepository.AddModuleAsync(model);

            if (module == null)
                return new ModuleDto();

            var result = new ModuleDto
            {
                Id = module.Id,
                Title = module.Title,
                Position = module.Position,
                Lessons = new List<LessonListItemDto>()
            };

            return result;
        }
         
        public async Task<bool> UpdateModuleAsync(UpdateModuleDto model)
        {
            if (model == null)
                return false;

            var result = await _productRepository.UpdateModuleAsync(model);

            if (!result)
                return false;
            return true;
        }

        public async Task<bool> DeleteModuleAsync(string moduleSlug)
        {
            if (string.IsNullOrEmpty(moduleSlug))
                return false;
            var resut = await _productRepository.DeleteModuleAsync(moduleSlug);

            if (!resut)
                return false;
            return true;
        }

        public async Task<LessonContentDto> GetLessonByIdAsync(string lessonId)
        {
            if (string.IsNullOrWhiteSpace(lessonId))
                return null;

            var lesson = await _productRepository.GetLessonByIdAsync(lessonId);
            if (lesson == null)
                return null;

            return new LessonContentDto
            {
                Id = lesson.Id,
                Slug = lesson.Slug,
                Title = lesson.Title,
                Body = lesson.Body,
                Position = lesson.Position,
                IsPublished = lesson.IsPublished,
                IsFreePreview = lesson.IsFreePreview,
                Resources = lesson.Resources?
                             .OrderBy(r => r.Position)
                             .Select(r => new LessonResourceDto
                             {
                                 Id = r.Id,
                                 Url = r.Url,
                                 ResourceType = r.ResourceType,
                                 Title = r.Title
                             }).ToList() ?? new List<LessonResourceDto>()
            };
        }


        public async Task<LessonContentDto> AddLessonAsync(AddLessonDto model)
        {
            if (model == null)
                return new LessonContentDto();

            var lesson = await _productRepository.AddLessonAsync(model);

            if (lesson == null)
                return new LessonContentDto();

            var result = new LessonContentDto
            {
                Id = lesson.Id,
                Title = lesson.Title,
                Body = lesson.Body,
            };

            return result;
        }

        public async Task<bool> UpdateLessonAsync(UpdateLessonDto model)
        {
            if (model == null)
                return false;
            var result = await _productRepository.UpdateLessonAsync(model);
            if (!result)
                return false;
            return true;
        }

        public async Task<bool> DeleteLessonAsync(string lessonSlug)
        {
            if (string.IsNullOrEmpty(lessonSlug))
                return false;
            var resut = await _productRepository.DeleteLessonAsync(lessonSlug);
            if (!resut)
                return false;
            return true;
        }

        // -------------------------
        // Helpers
        // -------------------------
        private CourseDto MapCourseToDto(Course course)
        {
            return new CourseDto
            {
                Id = course.Id,
                Name = course.Name,
                Slug = course.Slug,
                ShortDescription = course.ShortDescription,
                FullDescription = course.FullDescription,
                Group = course.Group,
                Images = course.ProductImages?.OrderBy(pi => pi.Position).Select(pi => new ProductImageDto
                {
                    Url = pi.Url ?? pi.Name ?? "",
                    AltText = pi.AltText,
                    IsMain = pi.IsMain,
                    Name = pi.Name ?? ""
                }).ToList() ?? new List<ProductImageDto>(),
                Modules = course.Modules?.OrderBy(m => m.Position).Select(m => new ModuleDto
                {
                    Id = m.Id,
                    Title = m.Title,
                    Position = m.Position,
                    Lessons = m.Lessons?.OrderBy(l => l.Position).Select(l => new LessonListItemDto
                    {
                        Id = l.Id,
                        Title = l.Title,
                        Position = l.Position,
                        Slug = l.Slug,
                        IsFreePreview = l.IsFreePreview
                    }).ToList() ?? new List<LessonListItemDto>()
                }).ToList() ?? new List<ModuleDto>()
            };
        }
    }
}
