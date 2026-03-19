namespace CollectorsArchive.Server.Models
{
    public class DisplayCollectionModel
    {
        public int PrintID { get; set; }
        public string CardID { get; set; } = string.Empty;
        public string CardName { get; set; } = string.Empty;
        public string SetCode {  get; set; }
        public string CardRarity { get; set; }
    }
}
