/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        Program.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     Performs a web scrape on https://gatherer.wizards.com for all the set and card
 *                  data to insert into our database. 
 */

using HtmlAgilityPack;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Web;

namespace MTGWebScraper
{
    internal class Program
    {
        const string _baseURL = "https://gatherer.wizards.com";
        const string _startURL = "https://gatherer.wizards.com/sets";

        //const string _connectionString = "Data Source=localhost;Initial Catalog=CardCollectionPersonal;Integrated Security=true;";
        const string _connectionString = "Server=tcp:collectorsarchive-server.database.windows.net,1433;Initial Catalog=CollectorsArchive;Persist Security Info=False;User ID=collectorsarchive-server-admin;Password=S4cudS$YEu9T4Esu;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";

        static readonly List<string> SuperTypes = new List<string> { "Basic", "Legendary", "Snow", "Host", "World", "Ongoing" };
        static readonly List<string> CardTypes = new List<string> { "Land", "Creature", "Artifact", "Enchantment", "Planeswalker", "Battle", "Sorcery", "Instant", "Kindred",
                                                                    "Conspiracy", "Dungeon", "Phenomenon", "Plane", "Scheme", "Vanguard", "Summon", "Eaturecray" };

        static void Main(string[] args)
        {
            HtmlWeb web = new HtmlWeb();

            List<MTGSet> sets = RetrieveSets(web);

            SqlConnection conn = new SqlConnection(_connectionString);
            using (conn)
            {
                conn.Open();

                SqlCommand cmd = new SqlCommand("SELECT COUNT(*) FROM MTGCard", conn);
                int index = (Int32)cmd.ExecuteScalar() + 1;

                foreach (MTGSet set in sets)
                {
                    set.SetID = InsertSet(conn, set);
                    if (set.SetID == 0) { continue; }
                    List<string> cardURLs = RetrieveCardURLs(web, set);

                    foreach (string cardLink in cardURLs)
                    {
                        MTGCard newCard = RetrieveCardData(conn, web, cardLink);

                        if (newCard.CardID == null)
                        {
                            newCard.CardID = index.ToString("0000000000");
                            InsertCardData(conn, newCard);
                            index++;
                        }

                        InsertPrintData(conn, web, cardLink, newCard, set);
                    }
                }
            }
        }



        // -------------------------------------- MTG SETS ------------------------------------- //

        public static List<MTGSet> RetrieveSets(HtmlWeb web)
        {
            var doc = web.Load(_startURL);
            List<MTGSet> sets = new List<MTGSet>();

            while (true)
            {
                var setRows = doc.DocumentNode.SelectNodes("//tbody/tr[@data-testid='setResultsRow']");

                foreach (var row in setRows)
                {
                    var columns = row.ChildNodes;
                    var setlink = columns[1].SelectSingleNode("./a");

                    sets.Add(new MTGSet
                    {
                        UrlExtension = setlink.Attributes["href"].Value,
                        SetName = setlink.InnerHtml,
                        SetCode = columns[2].InnerHtml,
                        ReleaseDate = DateTime.Parse(columns[4].InnerHtml)
                    });
                }

                string link = string.Empty;
                var buttons = doc.DocumentNode.SelectNodes("//div/a/svg/path");

                foreach (var next in buttons)
                {
                    if (next.Attributes["d"].Value == "m9 18 6-6-6-6")
                    {
                        link = next.ParentNode.ParentNode.Attributes["href"].Value;
                    }
                }

                if (link == string.Empty) { break; }
                doc = web.Load(_baseURL + link);
            }

            return sets;
        }


        public static int InsertSet(SqlConnection conn, MTGSet set)
        {
            int setID = 0;

            SqlCommand cmd = new SqlCommand("MTGCheckSet", conn);
            cmd.CommandType = System.Data.CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@Game", 2);
            cmd.Parameters.AddWithValue("@SetName", HttpUtility.HtmlDecode(set.SetName));
            cmd.Parameters.AddWithValue("@SetCode", set.SetCode);

            var result = cmd.ExecuteScalar();

            if (result == null)
            {
                string commandText = "INSERT INTO CardSet (GameID, SetName, SetCode, ReleaseDate) VALUES (2, @SetName, @SetCode, @ReleaseDate)";
                cmd = new SqlCommand(commandText, conn);
                cmd.Parameters.AddWithValue("@SetName", HttpUtility.HtmlDecode(set.SetName));
                cmd.Parameters.AddWithValue("@SetCode", set.SetCode);
                cmd.Parameters.AddWithValue("@ReleaseDate", set.ReleaseDate);
                cmd.ExecuteScalar();

                Console.WriteLine($"Added: {set.SetName}");
            }
            else
            {
                Console.WriteLine($"Not Added: {set.SetName}");
                return 0;
            }

            cmd = new SqlCommand("SELECT CardSetID FROM CardSet WHERE GameID = 2 AND SetName = @SetName", conn);
            cmd.Parameters.AddWithValue("@SetName", HttpUtility.HtmlDecode(set.SetName));
            setID = (Int32)cmd.ExecuteScalar();

            return setID;
        }



        // -------------------------------- CARDS AND PRINTINGS -------------------------------- //

        public static List<string> RetrieveCardURLs(HtmlWeb web, MTGSet set)
        {
            List<string> cardURLs = new List<string>();
            var doc = web.Load(_baseURL + set.UrlExtension);
            

            while (true)
            {
                var cardLinks = doc.DocumentNode.SelectNodes("//div[@data-testid='imageListCard']/a");

                foreach (var cardLink in cardLinks)
                {
                    cardURLs.Add(cardLink.Attributes["href"].Value);
                }

                string link = string.Empty;
                var buttons = doc.DocumentNode.SelectNodes("//div[@data-testid='paginationButtonNext']/a/svg/path");

                if (buttons != null)
                {
                    foreach (var next in buttons)
                    {
                        if (next.Attributes["d"].Value == "m9 18 6-6-6-6")
                        {
                            link = next.ParentNode.ParentNode.Attributes["href"].Value;
                            break;
                        }
                    }

                    if (link == string.Empty) { break; }
                    doc = web.Load(_baseURL + link);
                }
                else { break; }
            }

            return cardURLs;
        }


        public static MTGCard RetrieveCardData(SqlConnection conn, HtmlWeb web, string cardLink)
        {
            MTGCard newCard = new MTGCard();
            var doc = web.Load(_baseURL + cardLink);
            var cardInfo = doc.DocumentNode.SelectSingleNode("//div/section[@data-testid='cardDetailsWrapper']");


            // Add attributes to CardData
            newCard.CardName = cardInfo.SelectSingleNode("//section[@data-testid='cardDetailsHeaderContent']/h1").InnerHtml;

            string commandText = "SELECT CardID FROM MTGCard WHERE CardNameEN = '" + HttpUtility.HtmlDecode(newCard.CardName).Replace("'", "''") + "'";
            SqlCommand cmd = new SqlCommand(commandText, conn);
            object result = cmd.ExecuteScalar();
            if (result != null)
            {
                newCard.CardID = result.ToString();
            }

            if (newCard.CardID != null) { return newCard; }

            var manaCost = cardInfo.SelectSingleNode("//section[@data-testid='cardDetailsHeaderContent']/article");
            if (manaCost != null)
            {
                foreach (var node in manaCost.ChildNodes)
                {
                    if (node.OriginalName == "div") { newCard.ManaCost += node.InnerHtml; }
                    else if (node.OriginalName == "svg") { newCard.ManaCost += node.Attributes["data-manacost"].Value; }
                }
            }
            
            string typeline = cardInfo.SelectSingleNode("//section[@data-testid='cardDetailsHeaderContent']/h1[@data-testid='cardDetailsTypeLine']").InnerHtml;
            string[] types = typeline.Split(' ');
            foreach (string type in types)
            {
                if (type == string.Empty || type == "-" || type == "–") { continue; } // The second '–' is the unicode character En Dash (&#8211 or \u2013)
                if (SuperTypes.Contains(type)) { newCard.SuperType += $" {type}"; }
                else if (CardTypes.Contains(type)) { newCard.Type += $" {type}"; }
                else { newCard.SubType += $" {type}"; }
            }

            var powerToughness = cardInfo.SelectSingleNode("//section[@data-testid='cardDetailsHeaderContent']/section/div");
            if (powerToughness != null)
            {
                if (powerToughness.ChildNodes.Count > 1)
                {
                    newCard.Power = powerToughness.ChildNodes[0].InnerHtml;
                    newCard.Toughness = powerToughness.ChildNodes[2].InnerHtml;
                }
                else
                {
                    newCard.Loyalty = powerToughness.ChildNodes[0].InnerHtml;
                }
            }


            // Card Text ---UNFINSHED---
            newCard.CardText = string.Empty;
            var cardTextNode = cardInfo.SelectSingleNode("//section[@data-testid='cardDetailsHeaderContent']/article[@data-testid='cardDetailsOracleText']");
            if (cardTextNode != null)
            {
                foreach (var node in cardTextNode.ChildNodes)
                {
                    if (node.OriginalName == "span")
                    {
                        if (node.Attributes.Count == 0) { newCard.CardText += node.InnerHtml; }
                    }
                }
            }

            return newCard;
        }


        public static void InsertCardData(SqlConnection conn, MTGCard card)
        {
            string commandText = "SELECT CardID FROM MTGCard WHERE CardNameEN = @CardName";
            SqlCommand cmd = new SqlCommand(commandText, conn);
            cmd.Parameters.AddWithValue("@CardName", card.CardName);

            if (cmd.ExecuteScalar() != null) { return; }

            commandText = "INSERT INTO MTGCard (CardID, CardNameEN";
            if (card.Type != null) { commandText += ", CardType"; }
            if (card.CardText != null) { commandText += ", CardTextEN"; }
            if (card.ManaCost != null) { commandText += ", CardManaCost"; }
            if (card.SuperType != null) { commandText += ", SuperType"; }
            if (card.SubType != null) { commandText += ", SubType"; }
            if (card.Power != null) { commandText += ", PowerValue, ToughnessValue"; }
            if (card.Loyalty != null) { commandText += ", Loyalty"; }

            commandText += ") VALUES (@ID, @Name";

            if (card.Type != null) { commandText += ", @CardType"; }
            if (card.CardText != null) { commandText += ", @CardText"; }
            if (card.ManaCost != null) { commandText += ", @ManaCost"; }
            if (card.SuperType != null) { commandText += ", @SuperType"; }
            if (card.SubType != null) { commandText += ", @SubType"; }
            if (card.Power != null) { commandText += ", @Power, @Toughness"; }
            if (card.Loyalty != null) { commandText += ", @Loyalty"; }

            commandText += ")";


            cmd = new SqlCommand(commandText, conn);
            cmd.Parameters.AddWithValue("@ID", card.CardID);
            cmd.Parameters.AddWithValue("@Name", HttpUtility.HtmlDecode(card.CardName));

            if (card.Type != null) cmd.Parameters.AddWithValue("@CardType", HttpUtility.HtmlDecode(card.Type));
            if (card.CardText != null) cmd.Parameters.AddWithValue("@CardText", card.CardText);
            if (card.ManaCost != null) cmd.Parameters.AddWithValue("@ManaCost", card.ManaCost);
            if (card.SuperType != null) cmd.Parameters.AddWithValue("@SuperType", HttpUtility.HtmlDecode(card.SuperType));
            if (card.SubType != null) cmd.Parameters.AddWithValue("@SubType", HttpUtility.HtmlDecode(card.SubType));

            if (card.Power != null)
            {
                cmd.Parameters.AddWithValue("@Power", card.Power);
                cmd.Parameters.AddWithValue("@Toughness", card.Toughness);
            }

            if (card.Loyalty != null) { cmd.Parameters.AddWithValue("@Loyalty", card.Loyalty); }

            cmd.ExecuteScalar();
        }


        public static void InsertPrintData(SqlConnection conn, HtmlWeb web, string cardLink, MTGCard card, MTGSet set)
        {
            var doc = web.Load(_baseURL + cardLink);

            string index = doc.DocumentNode.SelectSingleNode("//h1[@data-testid='cardDetailsCardNumber']").InnerHtml;
            string rarity = doc.DocumentNode.SelectSingleNode("//h1[@data-testid='cardDetailsRarity']").InnerHtml;

            string commandText = "INSERT INTO CardPrinting (CardID, GameID, CardSetID, CardSetIndex, CardRarity) VALUES " +
                "((SELECT CardID FROM MTGCard WHERE CardID = @CardID), " +
                "(SELECT GameID FROM CardGame WHERE GameID = 2), " +
                "(SELECT CardSetID FROM CardSet WHERE CardSetID = @SetID), " +
                "@SetIndex, @Rarity)";
            SqlCommand cmd = new SqlCommand(commandText, conn);
            cmd.Parameters.AddWithValue("@CardID", card.CardID);
            cmd.Parameters.AddWithValue("@SetID", set.SetID);
            cmd.Parameters.AddWithValue("@SetIndex", index.PadLeft(4,'0'));
            cmd.Parameters.AddWithValue("@Rarity", rarity);
            cmd.ExecuteScalar();
        }


        public static string GetCardText(string cardTextRaw, HtmlNode currentNode)
        {
            foreach (var node in currentNode.ChildNodes)
            {
                if (node.OriginalName == "span")
                {
                    if (node.Attributes.Count == 0) { cardTextRaw += node.InnerHtml; }
                }
            }

            return cardTextRaw;
        }
    }
}
