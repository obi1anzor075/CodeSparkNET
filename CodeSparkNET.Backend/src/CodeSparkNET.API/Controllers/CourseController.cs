using CodeSparkNET.Application.Dtos.Course;
using CodeSparkNET.Application.Services.Courses;
using CodeSparkNET.WEB.Mappers.Course;
using CodeSparkNET.WEB.ViewModels.Course;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CodeSparkNET.WEB.Controllers
{
    [AllowAnonymous]
    public class CoursesController : Controller
    {
        private readonly ICourseService _courseService;

        public CoursesController(
            ICourseService courseService)
        {
            _courseService = courseService;
        }

        [HttpGet("Course/{slug}")]
        public IActionResult Course(string slug)
        {
            return View(model: slug);
        }

        [HttpGet("Courses/GetCourseBySlug/{slug}")]
        [AllowAnonymous] 
        public async Task<ActionResult<CourseViewModel>> GetCourseBySlug(string slug)
        {
            var courseDto = await _courseService.GetCourseBySlugAsync(slug);

            if (courseDto == null) return NotFound();

            var courseViewModel = courseDto.ToViewModel();
            return Ok(courseViewModel);
        }

        [HttpGet("Courses/GetLessonContent/{courseSlug}/lessons/{lessonSlug}")]
        [AllowAnonymous]
        public async Task<ActionResult<LessonContentDto>> GetLessonBySlug(string courseSlug, string lessonSlug)
        {
            var lesson = await _courseService.GetLessonBySlugAsync(courseSlug, lessonSlug);

            if (lesson == null) return NotFound();

            var lessonViewModel = lesson.ToLessonViewModel();
            return Ok(lessonViewModel);
        }
    }
}
