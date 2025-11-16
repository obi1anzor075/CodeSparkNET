using CodeSparkNET.WEB.Mappers.AdminCourse;
using Microsoft.AspNetCore.Mvc;
using SharpGrip.FluentValidation.AutoValidation.Mvc.Attributes;
using CodeSparkNET.Application.Services.Courses;
using CodeSparkNET.WEB.ViewModels.AdminCourse;
using Microsoft.AspNetCore.Authorization;

namespace CodeSparkNET.WEB.Controllers
{
    [Authorize(Roles = "Admin")]
    [AutoValidation]
    public class AdminCourseController : Controller
    {
        private readonly ICourseService _courseService;

        public AdminCourseController(ICourseService courseService)
        {
            _courseService = courseService;
        }

        [HttpGet]
        public IActionResult CreateCourse()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreateCourse([FromForm] CreateCourseViewModel viewModel)
        {
            if (!ModelState.IsValid)
                return View(viewModel);

            var model = viewModel.ToDto();

            try
            {
                var created = await _courseService.CreateCourseAsync(model);
                return RedirectToAction("EditCourse", new { slug = created.Slug });
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("", ex.Message);
                return View(model);
            }
        }

        [HttpGet]
        public async Task<IActionResult> EditCourse(string slug)
        {
            if (string.IsNullOrWhiteSpace(slug)) return BadRequest();

            var course = await _courseService.GetCourseBySlugAsync(slug);
            if (course == null) return NotFound();

            var model = new EditCourseViewModel
            {
                Id = course.Id,
                Name = course.Name,
                Slug = course.Slug,
                ShortDescription = course.ShortDescription,
                FullDescription = course.FullDescription,
                MainImageUrl = course.Images?.FirstOrDefault(i => i.IsMain)?.Url
            };

            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateCourse([FromForm] EditCourseViewModel viewModel)
        {
            if (!ModelState.IsValid)
            {
                return Json(new { success = false, message = "Ошибка обновления курса" });
            }

            var model = viewModel.ToDto();

            var ok = await _courseService.UpdateCourseAsync(model);
            if (!ok)
                return Json(new { success = false, message = "Ошибка обновления курса" });

            return Json(new { success = true, message = "Успешное обновление курса" });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AddModule([FromForm] AddModuleViewModel viewModel)
        {
            var model = viewModel.ToDto();

            if (string.IsNullOrWhiteSpace(model.Slug) || string.IsNullOrWhiteSpace(model.Title) || string.IsNullOrWhiteSpace(model.CourseSlug))
                return Json(new { success = false, message = "Course slug and title are required." });

            var created = await _courseService.AddModuleAsync(model);
            if (created == null)
                return Json(new { success = false, message = "Unable to create module." });

            return Json(new { success = true, data = created });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateModule([FromForm] UpdateModuleViewModel viewModel)
        {
            var model = viewModel.ToDto();

            if (model == null || string.IsNullOrWhiteSpace(model.Slug))
                return Json(new { success = false, message = "Module slug required." });

            var ok = await _courseService.UpdateModuleAsync(model);
            return Json(new { success = ok });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteModule(string moduleSlug)
        {
            if (!ModelState.IsValid && !string.IsNullOrEmpty(moduleSlug))
            {
                return Json(new { success = false, message = "Ошибка удаления модуля" });
            }

            var ok = await _courseService.DeleteModuleAsync(moduleSlug);

            if (!ok)
                return Json(new { success = false, message = "Ошибка удаления модуля" });
            return Json(new { success = true, message = "Успешное удаление модуля" });
        }

        [HttpGet]
        public async Task<IActionResult> GetCourseModules(string slug)
        {
            if (string.IsNullOrWhiteSpace(slug))
                return Json(new { success = false, message = "slug required" });

            var course = await _courseService.GetCourseBySlugAsync(slug);
            if (course == null)
                return Json(new { success = false, message = "course not found" });

            // Return modules list (DTOs already include lessons if available)
            return Json(new { success = true, data = course.Modules });
        }

        // Add lesson
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AddLesson([FromForm] AddLessonViewModel viewModel)
        {
            var model = viewModel.ToDto();
            var body = "";

            if (model == null || string.IsNullOrWhiteSpace(model.Slug) || string.IsNullOrWhiteSpace(model.Title))
                return Json(new { success = false, message = "ModuleId and Title are required." });

            try
            {
                var created = await _courseService.AddLessonAsync(model);
                if (created == null)
                    return Json(new { success = false, message = "Unable to create lesson." });

                return Json(new { success = true, data = created });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetLesson(string lessonId)
        {
            if (string.IsNullOrWhiteSpace(lessonId))
                return Json(new { success = false, message = "lessonId required" });

            var lesson = await _courseService.GetLessonByIdAsync(lessonId);
            if (lesson == null)
                return Json(new { success = false, message = "lesson not found" });

            return Json(new { success = true, data = lesson });
        }

        [HttpPost]
        //[ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateLesson(UpdateLessonViewModel viewModel)
        {
            var model = viewModel.ToDto();

            if (model == null || string.IsNullOrWhiteSpace(model.Id) || string.IsNullOrWhiteSpace(model.Slug))
                return Json(new { success = false, message = "Invalid lesson data" });

            try
            {
                var ok = await _courseService.UpdateLessonAsync(model);
                return Json(new { success = ok });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteLesson(string lessonId)
        {
            if (string.IsNullOrWhiteSpace(lessonId))
                return Json(new { success = false, message = "lessonId required" });

            try
            {
                var ok = await _courseService.DeleteLessonAsync(lessonId);
                if (!ok) return Json(new { success = false, message = "Unable to delete lesson" });
                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }
    }
}
