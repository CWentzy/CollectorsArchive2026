namespace CollectorsArchive.Server.Models.ApiInput
{
    public class CardDetailsRequest
    {
        public required int GameID { get; set; }
        public required string CardID { get; set; }
    }
}
