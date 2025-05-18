# File Server

A simple ASP.NET Core service for file upload and download operations.

## Features

- File upload endpoint
- File download endpoint
- Configurable storage location
- Configurable public URL

## Setup

1. Make sure you have .NET 6.0 SDK installed
2. Navigate to the `files-server` directory
3. Run `dotnet restore` to restore dependencies
4. Run `dotnet build` to build the project
5. Run `dotnet run` to start the server

## Configuration

Edit `appsettings.json` to configure:

- `StoragePath`: Where files will be stored (default: "uploads")
- `PublicUrl`: Base URL for download links (default: "http://localhost:5000")

## API Endpoints

### Upload a file
```
POST /api/file/upload
```

Send a file using form-data with a file field.

### Download a file
```
GET /api/file/download/{fileName}
```

Where `fileName` is the name returned by the upload endpoint.

## Example Usage

Upload a file and receive a download URL in the response:

```json
{
  "fileId": "2c3e50ed-5130-4e1b-adc3-bcc6a8c8c89c",
  "fileName": "example.jpg",
  "downloadUrl": "http://localhost:5000/api/file/download/2c3e50ed-5130-4e1b-adc3-bcc6a8c8c89c.jpg"
}
```
