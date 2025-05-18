namespace FileServer
{
    public class FileStorageOptions
    {
        public string StoragePath { get; set; } = "uploads";
        public string PublicUrl { get; set; } = "http://localhost:5000";
    }
}
