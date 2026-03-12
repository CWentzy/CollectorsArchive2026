using System.Text.Json.Serialization;

namespace CollectorsArchive.Server.Models
{
    public class GoogleAuthRequest
    {
        // Adding this attribute makes it bulletproof
        [JsonPropertyName("googleIDToken")]
        public string GoogleIDToken { get; set; } = string.Empty;
    }


}
