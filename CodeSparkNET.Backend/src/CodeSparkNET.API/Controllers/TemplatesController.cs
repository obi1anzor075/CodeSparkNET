using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CodeSparkNET.Application.Services.Templates;
using CodeSparkNET.Application.Dtos.Templates;

namespace CodeSparkNET.Web.Controllers
{
    public class TemplatesController : Controller
    {
        private readonly ITemplateService _templateService;

        public TemplatesController(ITemplateService templateService)
        {
            _templateService = templateService;
        }

        // Страница списка + форма — пока одна view (Index) переиспользуется для create/edit
        [HttpGet("templates/index")]
        public IActionResult Index()
        {
            return View();
        }

        // Страница создания (может переиспользовать Index view)
        [HttpGet("templates/create")]
        public IActionResult Create()
        {
            return View("Index");
        }

        // Страница редактирования (передаём id в URL, view сам загрузит данные через JS)
        [HttpGet("templates/edit/{id}")]
        public IActionResult Edit(string id)
        {
            return View("Index");
        }

        // JSON API: получить все шаблоны
        // GET /templates
        [HttpGet("templates")]
        public async Task<IActionResult> GetAllTemplates()
        {
            var list = await _templateService.GetAllTemplatesAsync();
            return Ok(list);
        }

        // JSON API: получить по id или slug
        // GET /templates/{query}
        [HttpGet("templates/{query}")]
        public async Task<IActionResult> GetTemplateByIdOrSlug(string query)
        {
            var tpl = await _templateService.GetTemplateByIdOrSlugAsync(query);
            if (tpl == null) return NotFound();
            return Ok(tpl);
        }

        // JSON API: создать шаблон
        // POST /templates
        [HttpPost("templates")]
        public async Task<IActionResult> CreateTemplate([FromBody] AddTemplateDto model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var created = await _templateService.CreateTemplateAsync(model);
            if (created == null) return StatusCode(500, "Failed to create template.");

            // Возвращаем 201 и Location на получение по slug (GetTemplateByIdOrSlug)
            return CreatedAtAction(nameof(GetTemplateByIdOrSlug), new { query = created.Slug }, created);
        }

        // JSON API: обновить шаблон по id
        // PUT /templates/{id}
        [HttpPut("templates")]
        public async Task<IActionResult> UpdateTemplate([FromBody] UpdateTemplateDto model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Попробуем получить существующий шаблон по id
            var existing = await _templateService.GetTemplateBySlugAsync(model.Slug);
            if (existing == null) return NotFound();

            // Если в модели не передан slug — используем существующий (важно для поиска в сервисе)
            if (string.IsNullOrWhiteSpace(model.Slug))
            {
                model.Slug = existing.Slug;
            }

            // При желании можно также синхронизировать model.Id = id; но UpdateTemplateAsync использует slug
            try
            {
                var updated = await _templateService.UpdateTemplateAsync(model);
                if (updated == null) return NotFound();
                return Ok(updated);
            }
            catch (Exception ex)
            {
                // Возвращаем 400/500 по типу ошибки — здесь простой ответ
                return StatusCode(500, ex.Message);
            }
        }

        // JSON API: удалить по id (GUID)
        // DELETE /templates/{id}
        [HttpDelete("templates/{id}")]
        public async Task<IActionResult> DeleteTemplateById(string id)
        {
            try
            {
                var ok = await _templateService.DeleteTemplateByIdAsync(id);
                if (!ok) return NotFound();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // JSON API: удалить по slug
        // DELETE /templates/slug/{slug}
        [HttpDelete("templates/slug/{slug}")]
        public async Task<IActionResult> DeleteTemplateBySlug(string slug)
        {
            try
            {
                var ok = await _templateService.DeleteTemplateBySlugAsync(slug);
                if (!ok) return NotFound();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
