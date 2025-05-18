namespace FileServer.Models
{
    /// <summary>
    /// Response model for file upload operations
    /// </summary>
    public class FileUploadResponse
    {
        /// <summary>
        /// Unique identifier for the file
        /// </summary>
        public required string FileId { get; set; }

        /// <summary>
        /// Original name of the uploaded file
        /// </summary>
        public required string FileName { get; set; }

        /// <summary>
        /// URL to download the file
        /// </summary>
        public required string DownloadUrl { get; set; }
    }
}
