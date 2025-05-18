# FileServer Solution

This solution contains a simple ASP.NET Core-based file server for handling file uploads and downloads.

## Projects

- **FileServer**: A .NET 8 web API for file management operations

## Getting Started

### Prerequisites

- .NET 8 SDK
- Visual Studio 2022, VS Code, or Rider

### Building the Solution

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the solution directory
cd electron_react_boilerplate

# Restore dependencies
dotnet restore

# Build the solution
dotnet build

# Run the FileServer project
dotnet run --project files-server/FileServer.csproj
```

## Features

- File upload with custom naming support
- File download
- Swagger UI for API documentation and testing
- XML documentation

## Architecture

The solution follows a simple architecture:

- **Controller Layer**: Handles HTTP requests and responses
- **Models**: Defines the data structures
- **Configuration**: Centralized configuration management

## Configuration

You can configure the file server through `appsettings.json`:

```json
{
  "FileStorage": {
    "StoragePath": "uploads",
    "PublicUrl": "http://localhost:5000"
  }
}
```
