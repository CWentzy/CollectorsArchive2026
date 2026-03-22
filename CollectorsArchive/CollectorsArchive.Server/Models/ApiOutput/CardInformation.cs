/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        CardInformation.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     Models the information returned to the client after a search through the card
 *                  tables.
 */


namespace CollectorsArchive.Server.Models.ApiOutput
{
    public class CardInformation
    {
        public required int GameID { get; set; }
        public required string CardID { get; set; }
        public required string CardName { get; set; }
        public string? CardText { get; set; }

        // Generic object containing all of the additional card information depending on the game
        public object? CardAttributes { get; set; }
    }


    // -------------------------------- UNIQUE GAME INFORMATION -------------------------------- //

    public class YGOCard
    {
        public required string SuperType { get; set; }
        public required string SubType { get; set; }

        // Monster specific attributes
        public string? Attribute { get; set; }
        public string? Classifications { get; set; }    // This is a created field

        public string? Level { get; set; }              // This is also Rank (specifically for Xyz Monsters)
        public string? Attack { get; set; }
        public string? Defense { get; set; }

        public string? PendulumScale { get; set; }      // Only used by Pendulum Monsters
        public string? LinkRating { get; set; }         // Only used by Link Monsters
    }



    public class MTGCard
    {
        public required string ManaCost { get; set; }
        public required string? SuperType { get; set; }
        public required string Type { get; set; }

        public string? SubTypes { get; set; }

        // Creature specific attributes
        public string? Power { get; set; }
        public string? Toughness { get; set; }
    }
}
