namespace CollectorsArchive.Server.Models
{
    public class TempLoginCode
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string Code { get; set; }
        public DateTime Expiration { get; set; }
    }
}
