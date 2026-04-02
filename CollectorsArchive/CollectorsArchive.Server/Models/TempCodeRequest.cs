namespace CollectorsArchive.Server.Models
{
    public class TempCodeRequest
    {
        public string Email { get; set; }
        public string? Name { get; set; } // ? must be like this other wise https want makes it required field 
    }
}
