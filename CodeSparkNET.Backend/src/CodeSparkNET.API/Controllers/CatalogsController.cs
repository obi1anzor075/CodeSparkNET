using CodeSparkNET.Application.Services.Catalogs;
using CodeSparkNET.Application.Services.User;
using CodeSparkNET.WEB.Mappers.Catalogs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CodeSparkNET.WEB.Controllers
{
    public class CatalogsController : Controller
  {
        private readonly ILogger<CatalogsController> _logger;
        private readonly ICatalogService _catalogService;
        private readonly IAccountService _accountService;
        public CatalogsController(
            ILogger<CatalogsController> logger,
            ICatalogService catalogService,
            IAccountService accountService
            )
        {
            _logger = logger;
            _catalogService = catalogService;
            _accountService = accountService;
        }

        public IActionResult MiniApp()
        {
            return View();
        }

        [HttpGet("/media/{fileName}")]
        public IActionResult GetVideo(string fileName)
        {
            var path = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot/assets/video",
                fileName
            );

            if (!System.IO.File.Exists(path))
                return NotFound();

            return PhysicalFile(path, "video/mp4", enableRangeProcessing: true);
        }

        public async Task<IActionResult> Catalogs()
        {
            try
            {
                var catalogs = await _catalogService.GetCatalogNamesAsync();
                var catalogsViewModel = catalogs.ToViewModel();
                return View(catalogsViewModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while requestiong catalogs");
                return View();
            }
        }

        [HttpGet("/Catalogs/Catalog/{catalogSlug}")]
        public async Task<IActionResult> Catalog(string catalogSlug)
        {
            try
            {
                var catalog = await _catalogService.GetCatalogBySlugAsync(catalogSlug);

                var catalogViewModel = catalog.ToViewModel();

                return View(catalogViewModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while requestiong catalog {Slug} by slug", catalogSlug);
                return View();
            }
        }

        [Authorize]
        [HttpGet("/Catalog/ProductDetails/{catalogSlug}/{productSlug}")]
        public async Task<IActionResult> ProductDetails(string catalogSlug, string productSlug)
        {
            try
            {
                var product = await _catalogService.GetCatalogProductDetailsAsync(catalogSlug, productSlug);

                var user = await _accountService.GetUserAsync(User);

                product.IsAlreadyEnrolled = await _accountService.IsCourseAlreadyEnrolled(user.Id, productSlug);

                var productViewModel = product.ToViewModel();

                return View(productViewModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while gettin product details {CatalogSlug}-{ProductSlug}", catalogSlug, productSlug);
                return View();
            }
        }

        [HttpGet("/Catalogs/AddCourseToUser/{productSlug}")]
        public async Task<IActionResult> AddCourseToUser(string productSlug)
        {
            try
            {
                var user = await _accountService.GetUserAsync(User);

                var result = await _accountService.AddCourseToUserAsync(user.Id, productSlug);
                if (result)
                {
                    return Json(new {success = true, message = "���� ������� ��������."});
                }
                else
                {
                    return Json(new {success = false, message = "���� ��� ��������."});
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while adding course {ProductSlug} to user", productSlug);
                return View("Error!");
            }
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View("Error!");
        }
    }
}