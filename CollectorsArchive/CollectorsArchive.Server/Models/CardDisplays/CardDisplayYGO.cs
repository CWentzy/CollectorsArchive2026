/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        CardDisplayYGO.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     Models the YuGiOh Card Information displayed when selecting the card from the
 *                  results list.
 */

namespace CollectorsArchive.Server.Models.CardDisplays
{
    public class CardDisplayYGO
    {
        public string CardID { get; set; } = string.Empty;
        public string name { get; set; } = string.Empty;
        public string superType { get; set; } = string.Empty;
        public string subType { get; set; } = string.Empty;
        public string cardText { get; set; } = string.Empty;

        public string? attribute { get; set; }

        // Stored procedure does NOT return classifications
        public string[]? classifications { get; set; }

        public int? level { get; set; }
        public int? Atk { get; set; }
        public int? Def { get; set; }

        // this will  matches SQL procedure  output
        public int? PendulumScale { get; set; }
        public int? LinkRating { get; set; }
    }
}

