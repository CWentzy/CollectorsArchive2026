namespace CollectorsArchive.Server.Models
{
    public class GoogleAuthRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string GoogleSubject { get; set; } = string.Empty;
        public string? PhotoUrl { get; set; }
    }
}
