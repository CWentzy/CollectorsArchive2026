using System;

namespace MTGWebScraper
{
    internal class MTGSet
    {
        public string UrlExtension { get; set; }
        public int SetID { get; set; }
        public string SetName { get; set; }
        public string SetCode { get; set; }
        public DateTime ReleaseDate { get; set; }
    }
}
