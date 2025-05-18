

namespace FilesServer.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Threading.Tasks;
using System.Net.Http;
using System.Net.Http.Json;
using FilesServer.Models;

[ApiController]
[Route("api/[controller]")]
public class OrchestratorController : ControllerBase {
  private readonly IHttpClientFactory _httpClientFactory;
  private readonly IConfiguration _configuration;

  public OrchestratorController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
  {
    _httpClientFactory = httpClientFactory;
    _configuration = configuration;
  }

  [HttpPost("generate-gherkin")]
  public async Task<IActionResult> GenerateGherkin([FromBody] Project project)
  {
    var apiUrl = _configuration["ExternalServices:GherkinApiUrl"];
    if (string.IsNullOrEmpty(apiUrl))
    {
      return BadRequest("API URL not configured");
    }

    var httpClient = _httpClientFactory.CreateClient();
    httpClient.BaseAddress = new Uri(apiUrl);
    httpClient.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
    var json = System.Text.Json.JsonSerializer.Serialize(project);
    var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
    Console.WriteLine($"Sending request to {apiUrl}/project with content: {json}");
    var response = await httpClient.PostAsync("/project", content);
    if (!response.IsSuccessStatusCode)
    {
      return StatusCode((int)response.StatusCode, "Error generating Gherkin");
    }
    var responseContent = await response.Content.ReadAsStringAsync();
    Console.WriteLine($"Received response: {responseContent}");
    return Content(responseContent, "text/plain");
  }

}

