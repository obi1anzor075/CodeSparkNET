using CodeSparkNET.Application.Dtos.Course;
using CodeSparkNET.Application.Services;
using CodeSparkNET.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace CodeSparkNET.Infrastructure.Repositories.Product
{
    public class ProductRepository : IProductRepository
    {
        private readonly AppDbContext _context;

        public ProductRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Course>> GetAllUserCoursesAsync(string userId)
        {
            return await _context.UserCourses
                .Where(uc => uc.UserId == userId)
                .Select(uc => uc.Course)
                .ToListAsync();
        }

        public async Task<Course> GetUserCourseBySlugAsync(string userId, string courseSlug)
        {
            return await _context.UserCourses
                .Where(uc => uc.UserId == userId && uc.CourseSlug == courseSlug)
                .Select(uc => uc.Course)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> AddCourseToUserAsync(string userId, string courseSlug)
        {
            // Find the course by slug
            var course = await _context.Products
                .OfType<Course>()
                .FirstOrDefaultAsync(c => c.Slug == courseSlug);
            if (course == null)
                return false;

            // Check if the user is already enrolled in the course
            var alreadyEnrolled = await _context.UserCourses
                .AnyAsync(uc => uc.UserId == userId && uc.CourseSlug == courseSlug);
            if (alreadyEnrolled)
                return false;

            // Create new enrollment
            var userCourse = new UserCourse
            {
                UserId = userId,
                CourseSlug = courseSlug,
                Course = course,
                IsCompleted = false,
                EnrolledAt = DateTime.UtcNow
            };
            _context.UserCourses.Add(userCourse);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsCourseAlreadyEnrolledAsync(string userId, string courseSlug)
        {
            // Find the course by slug
            var course = await _context.Products
                .OfType<Course>()
                .FirstOrDefaultAsync(c => c.Slug == courseSlug);
            if (course == null)
                return false;

            // Check if the user is already enrolled in the course
            return await _context.UserCourses
                .AnyAsync(uc => uc.UserId == userId && uc.CourseSlug == courseSlug);
        }

        public async Task<Course> GetCourseBySlugAsync(string slug)
        {
            return await _context.Courses
                .AsNoTracking()
                .Where(c => c.Slug == slug && c.IsPublished)
                .Include(c => c.Modules)
                    .ThenInclude(c => c.Lessons)
                .Include(c => c.ProductImages)
                .FirstOrDefaultAsync();
        }

        public async Task<Course> GetCourseByIdWithModulesAsync(string courseId)
        {
            if (string.IsNullOrWhiteSpace(courseId))
                return null;

            var course = await _context.Courses
                .Where(c => c.Id == courseId)
                .Include(c => c.ProductImages)
                .Include(c => c.Modules.OrderBy(m => m.Position))
                    .ThenInclude(m => m.Lessons.OrderBy(l => l.Position))
                .FirstOrDefaultAsync();

            return course;
        }


        public async Task<Lesson> GetLessonBySlugAsync(string courseSlug, string lessonSlug)
        {
            return await _context.Lessons
                .AsNoTracking()
                .Where(l => l.Slug == lessonSlug && l.Module.Course.Slug == courseSlug && l.Module.Course.IsPublished)
                .FirstOrDefaultAsync();
        }

        public async Task<CourseModule> GetModuleBySlugAsync(string moduleSlug)
        {
            if (string.IsNullOrWhiteSpace(moduleSlug)) return null;

            var module = await _context.CourseModules
                .Where(m => m.Slug == moduleSlug)
                .Include(m => m.Lessons.OrderBy(l => l.Position))
                .FirstOrDefaultAsync();

            return module;
        }

        public async Task<Lesson> GetLessonByIdAsync(string lessonId)
        {
            if (string.IsNullOrWhiteSpace(lessonId)) return null;

            var lesson = await _context.Lessons
                .Where(l => l.Id == lessonId)
                .Include(l => l.Module)
                    .ThenInclude(m => m.Course)
                .FirstOrDefaultAsync();

            return lesson;
        }

        public async Task<Course> AddCourseAsync(CreateCourseDto dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));
            if (string.IsNullOrWhiteSpace(dto.Name)) throw new ArgumentException("Name required", nameof(dto.Name));
            if (string.IsNullOrWhiteSpace(dto.CatalogId)) throw new ArgumentException("CatalogId required", nameof(dto.CatalogId));

            // ensure uniqueness
            var exists = await _context.Products.AnyAsync(p => p.Slug == dto.Slug);
            if (exists)
                throw new InvalidOperationException($"Slug '{dto.Slug}' already exists.");

            // make sure catalog exists 
            var catalogExists = await _context.Catalogs.AnyAsync(c => c.Id == dto.CatalogId);
            if (!catalogExists)
                throw new InvalidOperationException($"Catalog '{dto.CatalogId}' not found.");

            var catalog = await _context.Catalogs.FirstOrDefaultAsync(c => c.Id == dto.CatalogId);

            var course = new Course
            {
                Id = Guid.NewGuid().ToString(),
                Catalog = catalog,
                CatalogId = dto.CatalogId,
                Name = dto.Name,
                Slug = dto.Slug,
                Price = dto.Price,
                Level = dto.Level,
                Currency = dto.Currency,
                InStock = dto.InStock,
                IsPublished = dto.IsPublished,
                ShortDescription = dto.ShortDescription,
                FullDescription = dto.FullDescription,
                ProductType = "Course",
                Group = dto.Group
            };

            using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Courses.Add(course);
                await _context.SaveChangesAsync();

                if (!string.IsNullOrWhiteSpace(dto.MainImageUrl))
                {
                    // basic URL validation
                    if (!Uri.IsWellFormedUriString(dto.MainImageUrl, UriKind.Absolute))
                        throw new ArgumentException("MainImageUrl is not a valid absolute URL", nameof(dto.MainImageUrl));

                    var image = new ProductImage
                    {
                        Id = Guid.NewGuid().ToString(),
                        ProductId = course.Id,
                        Name = Path.GetFileName(new Uri(dto.MainImageUrl).LocalPath),
                        Url = dto.MainImageUrl,
                        IsMain = true,
                        Position = 0
                    };
                    _context.ProductImages.Add(image);
                    await _context.SaveChangesAsync();
                }

                await tx.CommitAsync();
                return course;
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> UpdateCourseBasicsAsync(UpdateCourseDto model)
        {
            var course = await _context.Courses
                .Include(c => c.ProductImages)
                .FirstOrDefaultAsync(c => c.Id == model.Id);

            if (course == null) return false;

            var slugExists = await _context.Products.AnyAsync(p => p.Slug == model.Slug && p.Id != model.Id);
            if (slugExists)
                return false;

            course.Name = model.Name;
            course.Slug = model.Slug;
            course.ShortDescription = model.ShortDescription;
            course.FullDescription = model.FullDescription;
            course.Group = model.Group;

            var existingMain = course.ProductImages?.FirstOrDefault(pi => pi.IsMain);

            // handle main image url (store as ProductImage.Url)
            if (string.IsNullOrWhiteSpace(model.MainImageUrl))
            {
                if (existingMain != null)
                {
                    _context.ProductImages.Remove(existingMain);
                }
            }
            else
            {
                if (!Uri.IsWellFormedUriString(model.MainImageUrl, UriKind.Absolute))
                    return false;

                if (existingMain == null)
                {
                    var image = new ProductImage
                    {
                        ProductId = course.Id,
                        Name = Path.GetFileName(new Uri(model.MainImageUrl).LocalPath),
                        Url = model.MainImageUrl,
                        IsMain = true,
                        Position = 0
                    };
                    _context.ProductImages.Add(image);
                }
                else
                {
                    existingMain.Url = model.MainImageUrl;
                }
            }

            try
            {
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateException)
            {
                return false;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<CourseModule> AddModuleAsync(AddModuleDto model)
        {
            var course = await _context.Courses
                .Include(c => c.Modules)
                .FirstOrDefaultAsync(c => c.Slug == model.CourseSlug);

            if (course == null) throw new InvalidOperationException("Course not found");

            var newPos = course.Modules.Any() ? course.Modules.Max(m => m.Position) + 1 : 0;
            var module = new CourseModule
            {
                Id = model.Id,
                Slug = model.Slug,
                CourseId = course.Id,
                Course = course,
                Title = model.Title,
                Position = newPos,
                Lessons = new List<Lesson>()
            };

            _context.CourseModules.Add(module);
            await _context.SaveChangesAsync();
            return module;
            return module;
        }

        public async Task<bool> UpdateModuleAsync(UpdateModuleDto model)
        {
            var module = await _context.CourseModules.FirstOrDefaultAsync(m => m.Slug == model.Slug);

            if (module == null)
                return false;

            module.Title = model.Title;
            module.Position = model.Position;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteModuleAsync(string moduleSlug)
        {
            var module = await _context.CourseModules.Include(m => m.Lessons).FirstOrDefaultAsync(m => m.Slug == moduleSlug);
            if (module == null) return false;

            // remove lessons first
            if (module.Lessons.Any())
            {
                _context.Lessons.RemoveRange(module.Lessons);
            }
            _context.CourseModules.Remove(module);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Lesson> AddLessonAsync(AddLessonDto model)
        {
            var module = await _context.CourseModules.Include(m => m.Lessons).FirstOrDefaultAsync(m => m.Slug == model.ModuleSlug);
            if (module == null) throw new InvalidOperationException("Module not found");

            var newPos = module.Lessons.Any() ? module.Lessons.Max(l => l.Position) + 1 : 0;

            // ensure unique slug within the course
            bool slugExists = await _context.Lessons.AnyAsync(l => l.Slug == model.Slug && l.Module.CourseId == module.CourseId);
            if (slugExists) throw new InvalidOperationException("Slug is existed");

            var lesson = new Lesson
            {
                Id = model.Id,
                Slug = model.Slug,
                ModuleId = module.Id,
                Module = module,
                Title = model.Title,
                Position = newPos,
                IsFreePreview = model.IsFreePreview,
                IsPublished = model.IsPublished,
                Body = model.Body,
            };

            _context.Lessons.Add(lesson);
            await _context.SaveChangesAsync();
            return lesson;
        }

        public async Task<bool> UpdateLessonAsync(UpdateLessonDto model)
        {
            if (string.IsNullOrWhiteSpace(model.ModuleId) || string.IsNullOrWhiteSpace(model.Id))
                return false;

            var lesson = await _context.Lessons
                .Include(l => l.Module)
                .FirstOrDefaultAsync(l => l.Id == model.Id && l.ModuleId == model.ModuleId);

            if (lesson == null) return false;

            var courseId = lesson.Module?.CourseId;
            if (!string.IsNullOrWhiteSpace(courseId))
            {
                var slugExists = await _context.Lessons
                    .AnyAsync(l => l.Slug == model.Slug && l.Id != model.Id && l.Module.CourseId == courseId);

                if (slugExists)
                {
                    return false;
                }
            }

            lesson.Title = model.Title;
            lesson.Slug = model.Slug;
            lesson.Body = model.Body ?? string.Empty;
            lesson.Position = model.Position;
            lesson.IsPublished = model.IsPublished;
            lesson.IsFreePreview = model.IsFreePreview;

            try
            {
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateException)
            {
                return false;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> DeleteLessonAsync(string lessonId)
        {
            var lesson = await _context.Lessons.FirstOrDefaultAsync(l => l.Id == lessonId);
            if (lesson == null) return false;

            try
            {
                _context.Lessons.Remove(lesson);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }


        public async Task<Template> CreateTemplateAsync(Template model)
        {
            _context.Products.Add(model);
            await _context.SaveChangesAsync();
            return model;
        }
        public async Task<Template> GetTemplateByIdAsync(string id)
        {
            return await _context.Products
                .OfType<Template>()
                .Include(t => t.ProductImages)
                .FirstOrDefaultAsync(t => t.Id == id);
        }
        public async Task<Template> GetTemplateBySlugAsync(string slug)
        {
            return await _context.Products
                .OfType<Template>()
                .Include(t => t.ProductImages)
                .FirstOrDefaultAsync(t => t.Slug == slug);
        }
        public async Task<Template> GetTemplateByIdOrSlugAsync(string query)
        {
            var template = GetTemplateByIdAsync(query);
            if (template != null)
                return await template;
            return await GetTemplateBySlugAsync(query);
        }
        public async Task<IEnumerable<Template>> GetAllTemplatesAsync()
        {
            return await _context.Products
                .OfType<Template>()
                .Include(t => t.ProductImages)
                .ToListAsync();
        }
        public async Task<bool> UpdateTemplateAsync(Template model)
        {
            var existingTemplate = await _context.Products
                .OfType<Template>()
                .Include(t => t.ProductImages)
                .FirstOrDefaultAsync(t => t.Id == model.Id);

            if (existingTemplate == null)
                return false;

            existingTemplate.Name = model.Name;
            existingTemplate.Slug = model.Slug;
            existingTemplate.ShortDescription = model.ShortDescription;
            existingTemplate.FullDescription = model.FullDescription;
            existingTemplate.Price = model.Price;
            existingTemplate.Currency = model.Currency;
            existingTemplate.IsPublished = model.IsPublished;
            existingTemplate.InStock = model.InStock;
            existingTemplate.CatalogId = model.CatalogId;

            var catalog = await _context.Catalogs.FirstOrDefaultAsync(c => c.Id == model.CatalogId);
            if (catalog != null)
                existingTemplate.Catalog = catalog;

            if (model.ProductImages != null && model.ProductImages.Any())
            {
                // 1. Удаляем изображения, которых нет в DTO
                var dtoIds = model.ProductImages.Where(pi => !string.IsNullOrWhiteSpace(pi.Id))
                                                .Select(pi => pi.Id)
                                                .ToHashSet();
                var imagesToRemove = existingTemplate.ProductImages
                    .Where(pi => !dtoIds.Contains(pi.Id))
                    .ToList();

                if (imagesToRemove.Any())
                {
                    _context.ProductImages.RemoveRange(imagesToRemove);
                }

                // 2. Обновляем существующие и добавляем новые
                var maxPos = existingTemplate.ProductImages.Any()
                    ? existingTemplate.ProductImages.Max(pi => pi.Position)
                    : -1;

                foreach (var img in model.ProductImages)
                {
                    ProductImage existingImg = null;
                    if (!string.IsNullOrWhiteSpace(img.Id))
                    {
                        existingImg = existingTemplate.ProductImages.FirstOrDefault(pi => pi.Id == img.Id);
                    }

                    if (existingImg != null)
                    {
                        // Обновляем существующее
                        existingImg.Url = img.Url;
                        existingImg.AltText = img.AltText;
                        existingImg.IsMain = img.IsMain;
                        existingImg.Name = img.Name;
                        if (img.Position >= 0)
                            existingImg.Position = img.Position;
                    }
                    else
                    {
                        // Добавляем новое
                        maxPos++;
                        var newImg = new ProductImage
                        {
                            Id = string.IsNullOrWhiteSpace(img.Id) ? Guid.NewGuid().ToString() : img.Id,
                            Url = img.Url,
                            AltText = img.AltText,
                            IsMain = img.IsMain,
                            Name = img.Name,
                            Position = img.Position >= 0 ? img.Position : maxPos,
                            Product = existingTemplate,
                            ProductId = existingTemplate.Id
                        };
                        existingTemplate.ProductImages.Add(newImg);
                    }
                }
            }
            else
            {
                // Если DTO не содержит изображений — удаляем все
                if (existingTemplate.ProductImages.Any())
                {
                    _context.ProductImages.RemoveRange(existingTemplate.ProductImages);
                }
            }

            try
            {
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateConcurrencyException)
            {
                return false;
            }
            catch (Exception)
            {
                return false;
            }
        }
        public async Task<bool> DeleteTemplateByIdAsync(string id)
        {
            var template = await _context.Products
                .OfType<Template>()
                .FirstOrDefaultAsync(t => t.Id == id);
            if (template == null)
                return false;
            _context.Products.Remove(template);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> DeleteTemplateBySlugAsync(string slug)
        {
            var template = await _context.Products
                .OfType<Template>()
                .FirstOrDefaultAsync(t => t.Slug == slug);
            if (template == null)
                return false;
            _context.Products.Remove(template);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
