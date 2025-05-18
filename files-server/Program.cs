using FileServer;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.OpenApi.Models;
using System.IO;
using System;
using Microsoft.AspNetCore.Cors;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHttpClient();

// Configure Swagger with .NET 8 enhancements
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo {
        Title = "File Server API (.NET 8)",
        Version = "v1",
        Description = "A simple API for uploading and downloading files built with .NET 8"
    });

    // Set the comments path for the Swagger JSON and UI
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    c.IncludeXmlComments(xmlPath);
});

// Configure FileStorageOptions from appsettings.json
builder.Services.Configure<FileStorageOptions>(
    builder.Configuration.GetSection("FileStorage"));

// Add CORS services and configure policy to allow the ngrok URL
builder.Services.AddCors(options =>
{
  options.AddPolicy("NgrokPolicy", policy =>
  {
    policy.WithOrigins("https://672c-134-238-186-21.ngrok-free.app")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();

    // Also allow localhost for development
    policy.WithOrigins("http://localhost:1212", "http://localhost:8080", "file://")
            .AllowAnyHeader()
            .AllowAnyMethod();

    // For development with Electron, we need to allow all origins
    policy.SetIsOriginAllowed(origin => true)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
  });
});



var app = builder.Build();

// Configure the HTTP request pipeline
// Enable Swagger in all environments
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "File Server API v1");
    options.RoutePrefix = "swagger";
    options.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.List);
    options.DefaultModelsExpandDepth(1);
    options.DisplayRequestDuration();
});

// Redirect root to Swagger UI
app.MapGet("/", () => Results.Redirect("/swagger"));

app.UseHttpsRedirection();
app.UseStaticFiles();

 app.UseCors(x => x
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .SetIsOriginAllowed(origin => true) // allow any origin
                    //.WithOrigins("https://localhost:44351")); // Allow only this origin can also have multiple origins separated with comma
                    .AllowCredentials()); // allow credentials

app.UseAuthorization();
app.MapControllers();

await app.RunAsync();
