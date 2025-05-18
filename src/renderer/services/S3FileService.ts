// DEPRECATED: Use HttpFileService instead for new code.
// This file is kept for backward compatibility.

// You need to install these packages:
// npm install @aws-sdk/client-s3 uuid
import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

/**
 * @deprecated Use HttpFileService instead.
 */
export class S3FileService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  /**
 * @deprecated Use HttpFileService instead.
 * Creates an S3FileService with authentication
   * @param accessKeyId AWS access key ID
   * @param secretAccessKey AWS secret access key
   * @param region AWS region
   * @param bucketName S3 bucket name
   */
  constructor(
    accessKeyId: string,
    secretAccessKey: string,
    region: string,
    bucketName: string
  );

  /**
   * @deprecated Use HttpFileService instead.
   * Creates an S3FileService for public buckets without authentication
   * @param region AWS region
   * @param bucketName S3 bucket name
   */
  constructor(
    region: string,
    bucketName: string
  );

  constructor(...args: any[]) {
    if (args.length === 4) {
      // Authenticated constructor
      const [accessKeyId, secretAccessKey, region, bucketName] = args;
      this.region = region;
      this.bucketName = bucketName;

      this.s3Client = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        }
      });
    } else {
      // Unauthenticated constructor for public buckets
      const [region, bucketName] = args;
      this.region = region;
      this.bucketName = bucketName;

      this.s3Client = new S3Client({
        region
      });
    }
  }

  /**
   * @deprecated Use HttpFileService.uploadFile instead.
   * Uploads a file to S3 and returns the public URL
   * @param file The file to upload
   * @param customKey Optional custom key (filename) to use instead of generating one
   * @returns The public URL to the uploaded file
   */
  async uploadFile(file: Blob, customKey?: string): Promise<string> {
    try {
      // Generate a unique key if not provided
      const key = customKey ?? `uploads/${uuidv4()}-file`;

      // Convert file to ArrayBuffer
      const fileBuffer = await file.arrayBuffer();
      // In Electron renderer context, we need to use Uint8Array instead of Buffer
      const uint8Array = new Uint8Array(fileBuffer);
      // Set up the upload parameters
      const params: PutObjectCommandInput = {
        Bucket: this.bucketName,
        Key: key,
        Body: uint8Array,
        ContentType: file.type,
        ACL: 'public-read', // Make the file publicly accessible
      };

      // Upload the file
      await this.s3Client.send(new PutObjectCommand(params));

      // Return the public URL
      return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw error;
    }
  }

  /**
   * @deprecated Use HttpFileService.uploadMultipleFiles instead.
   * Uploads multiple files to S3 and returns their public URLs
   * @param files Array of files to upload
   * @returns Array of public URLs to the uploaded files
   */
  async uploadMultipleFiles(files: Blob[]): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }
}

// DEPRECATED: This service is deprecated. For new code, use HttpFileService instead:
//
// ```typescript
// // Create a new HttpFileService instance
// const fileService = new HttpFileService('https://your-api-url.com');
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
// ```
//
// Legacy example code (not recommended for new development):
// For authenticated access:
// const s3Service = new S3FileService(
//   'YOUR_ACCESS_KEY_ID',
//   'YOUR_SECRET_ACCESS_KEY',
//   'us-east-1',
//   'your-bucket-name'
// );
//
// // For unauthenticated access to public buckets:
// const publicS3Service = new S3FileService(
//   'us-east-1',
//   'your-public-bucket-name'
// );
//
// // For single file upload
// const fileInput = document.getElementById('fileInput') as HTMLInputElement;
// const file = fileInput.files?.[0];
// if (file) {
//   const url = await s3Service.uploadFile(file);
//   console.log('File uploaded, public URL:', url);
// }
//
// // For multiple file upload
// const multiFileInput = document.getElementById('multiFileInput') as HTMLInputElement;
// const files = multiFileInput.files;
// if (files && files.length > 0) {
//   const urls = await s3Service.uploadMultipleFiles(Array.from(files));
//   console.log('Files uploaded, public URLs:', urls);
// }
