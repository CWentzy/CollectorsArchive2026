namespace CollectorsArchive.Server.Models
{
    public class UserCard
    {
        public int UserCardID { get; set; }
        public int UserID { get; set; }
        public int PrintID { get; set; }
        public int Quantity { get; set; }
        public string? CardEditionID { get; set; }
    }
}
