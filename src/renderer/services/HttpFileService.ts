
function getFileExtensionFromBlob(blob: Blob) {
  const mimeType = blob.type; // e.g., "image/png"
  const extension = mimeType.split('/')[1]; // Extracts "png"
  return extension;
}

/**
 * Service for uploading files using HTTP API
 */
export class HttpFileService {
  private readonly baseUrl: string;

  /**
   * Creates an HttpFileService
   * @param baseUrl The base URL of the HTTP API
   */
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  }

  /**
   * Uploads a file to the server and returns the public URL
   * @param file The file to upload
   * @param customKey Optional custom key (filename) to use instead of generating one
   * @returns The public URL to the uploaded file
   */
  async uploadFile(file: Blob, customKey?: string): Promise<string> {
    try {
      // Create a FormData instance
      const formData = new FormData();

      const fileName = customKey ? `${customKey}.${getFileExtensionFromBlob(file)}` : `file-${Date.now()}`;
      // If customKey is provided, use it as the filename
      formData.append('file', file, fileName);

      // Construct the URL with proper query parameters if needed
      let uploadUrl = `${this.baseUrl}api/file/upload`;
      if (customKey) {
        uploadUrl += `?customName=${encodeURIComponent(customKey)}`;
      }

      // Send the request to the server
      console.log(`Sending request to: ${uploadUrl}`);
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        // Include credentials if needed
        credentials: 'include',
        // Adding headers for debugging
        headers: {
          // Empty header to make fetch send CORS preflight
          'X-Requested-With': 'XMLHttpRequest',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response: ${response.status} - ${errorText}`);
        throw new Error(`HTTP error! Status: ${response.status}, ${errorText}`);
      }

      // Parse the response to get the file URL
      const data = await response.json();
      return data.fileUrl ?? data.downloadUrl ?? data.url;
    } catch (error) {
      console.error('Error uploading file to server:', error);
      throw error;
    }
  }

  /**
   * Uploads multiple files to the server and returns their public URLs
   * @param files Array of files to upload
   * @returns Array of public URLs to the uploaded files
   */
  async uploadMultipleFiles(files: Blob[]): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  /**
   * Tests the connection to the server
   * @returns A promise that resolves when the connection is successful
   */
  async testConnection(): Promise<string> {
    try {
      // Create a simple text file for testing
      const testBlob = new Blob(['Test connection'], { type: 'text/plain' });

      // Upload the test file
      const url = await this.uploadFile(testBlob, 'test-connection');
      console.log('Test connection successful! File URL:', url);
      return url;
    } catch (error) {
      console.error('Test connection failed:', error);
      throw error;
    }
  }
}

// Example usage:
// const fileService = new HttpFileService('https://cf67-134-238-186-21.ngrok-free.app');
//
// // For single file upload
// const fileInput = document.getElementById('fileInput') as HTMLInputElement;
// const file = fileInput.files?.[0];
// if (file) {
//   const url = await fileService.uploadFile(file);
//   console.log('File uploaded, public URL:', url);
// }
//
// // For multiple file upload
// const multiFileInput = document.getElementById('multiFileInput') as HTMLInputElement;
// const files = multiFileInput.files;
// if (files && files.length > 0) {
//   const urls = await fileService.uploadMultipleFiles(Array.from(files));
//   console.log('Files uploaded, public URLs:', urls);
// }
