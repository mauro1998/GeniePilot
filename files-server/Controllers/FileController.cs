using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.IO;
using System.Threading.Tasks;
using FileServer.Models;
using Microsoft.AspNetCore.Cors;

namespace FileServer.Controllers
{
    /// <summary>
    /// Controller for handling file upload and download operations
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class FileController : ControllerBase
    {
        private readonly FileStorageOptions _fileStorageOptions;

        public FileController(IOptions<FileStorageOptions> fileStorageOptions)
        {
            _fileStorageOptions = fileStorageOptions.Value;
        }

        /// <summary>
        /// Uploads a file to the server
        /// </summary>
        /// <param name="file">The file to upload</param>
        /// <param name="customName">Optional custom name for the file (without extension)</param>
        /// <returns>File information including download URL</returns>
        /// <response code="200">Returns the file information with download URL</response>
        /// <response code="400">If the file is null or empty</response>
        /// <response code="500">If there was an internal server error</response>
        [HttpPost("upload")]
        [ProducesResponseType(typeof(FileUploadResponse), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> Upload(IFormFile file, [FromQuery] string? customName = null)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            try
            {
                string fileId = Guid.NewGuid().ToString();
                string fileExtension = Path.GetExtension(file.FileName);

                // Use custom filename if provided, otherwise use a generated unique name
                string fileName = !string.IsNullOrEmpty(customName)
                    ? $"{customName}{fileExtension}"
                    : $"{fileId}{fileExtension}";

                string filePath = Path.Combine(_fileStorageOptions.StoragePath, fileName);

                // Create directory if it doesn't exist
                Directory.CreateDirectory(_fileStorageOptions.StoragePath);

                // Save the file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Generate download URL
                string downloadUrl = $"{_fileStorageOptions.PublicUrl}/api/file/download/{fileName}";

                return Ok(new FileUploadResponse
                {
                    FileId = fileId,
                    FileName = file.FileName,
                    DownloadUrl = downloadUrl
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Downloads a file from the server
        /// </summary>
        /// <param name="fileName">The name of the file to download</param>
        /// <returns>File content</returns>
        /// <response code="200">Returns the file content</response>
        /// <response code="400">If the file name is not provided</response>
                /// <response code="404">If the file is not found</response>
        /// <response code="500">If there was an internal server error</response>
        [HttpGet("download/{fileName}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public IActionResult Download(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
                return BadRequest("File name is required");

            try
            {
                string filePath = Path.Combine(_fileStorageOptions.StoragePath, fileName);

                if (!System.IO.File.Exists(filePath))
                    return NotFound("File not found");

                var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
                return File(fileStream, "application/octet-stream", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
