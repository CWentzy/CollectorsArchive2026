/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        API_YGOSet.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     Models the de-serialized data from the YGOPRODECK set list API. Includes 
 *                  functions creating SQL statements for INSERT operations.
 */

using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;

namespace YGODataUtility
{

    // ----------------------------------------------------------------------------------------- //
    // ----------------------------------- DATA HOLDER CLASS ----------------------------------- //
    // ----------------------------------------------------------------------------------------- //

    /// <summary>
    /// The JSON retrieved from the API places all of the card objects within a single 'data' 
    /// object.
    /// </summary>
    public class API_YGOCardDataHolder
    {
        public List<API_YGOCard> data { get; set; }
    }




    // ----------------------------------------------------------------------------------------- //
    // ------------------------------------ CARD DATA CLASS ------------------------------------ //
    // ----------------------------------------------------------------------------------------- //

    /// <summary>
    /// Stores the de-serialized JSON data for a single card. Multiple values are nullable due to
    /// different card types contain different properties.
    /// </summary>
    public class API_YGOCard
    {

        // ------------------------------------- PROPERTIES ------------------------------------ //

        public int id { get; set; }
        public string idString { get { return id.ToString("D8"); } }
        public string name { get; set; }
        public string humanReadableCardType { get; set; }
        public string desc { get; set; }
        public string race {  get; set; }


        // ----- Monster Specific Attributes -----

        public int? atk { get; set; }
        public int? def { get; set; }
        public int? level { get; set; }
        public string attribute { get; set; }


        // ----- Unique Monster Specific Attributes -----

        public int? linkval { get; set; }
        public int? scale { get; set; }


        // ----- Card Set Data -----

        public List<API_YGOCardPrinitng> card_sets { get; set; }


        // ----- Card Images -----

        public List<API_YGOCardImage> card_images { get; set; }


        // ------------------------------------- FUNCTIONS ------------------------------------- //

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        public SqlCommand GetInsertCommand()
        {
            SqlCommand cmd = new SqlCommand();
            
            // ----- Determine Super Type -----
            string[] cardTypes = humanReadableCardType.Split(' ');
            string superType = cardTypes.First().ToUpper() == "SKILL" ? "SKILL" : cardTypes.Last().ToUpper();

            switch (superType)
            {
                case "SPELL":
                case "TRAP":
                    cmd.CommandText = "INSERT INTO YGOCard (CardName, CardID, CardText, SuperType, SubType) VALUES " +
                                        "(@cardName, @cardCode, @cardText, " +
                                        "(SELECT SuperTypeID FROM CardSuperType WHERE SuperTypeName = @superType), " +
                                        "(SELECT SubTypeID FROM CardSubType WHERE SubTypeName = @subType));";
                    break;
                case "SKILL":
                case "TOKEN":
                    cmd.CommandText = "INSERT INTO YGOCard (CardName, CardID, CardText, SuperType) VALUES " +
                                        "(@cardName, @cardCode, @cardText, " +
                                        "(SELECT SuperTypeID FROM CardSuperType WHERE SuperTypeName = @superType));";
                    break;
                default:
                    if (cardTypes.Contains("Pendulum"))
                    {
                        cmd.CommandText = "INSERT INTO YGOCard (CardName, CardID, CardText, SuperType, SubType, Attribute, CardLevel, " +
                                            "AttackValue, DefenseValue, PendulumScale) VALUES " +
                                            "(@cardName, @cardCode, @cardText, " +
                                            "(SELECT SuperTypeID FROM CardSuperType WHERE SuperTypeName = @superType), " +
                                            "(SELECT SubTypeID FROM CardSubType WHERE SubTypeName = @subType), " +
                                            "(SELECT AttributeID FROM MonsterAttribute WHERE AttributeName = @attribute), " +
                                            "@level, @atk, @def, @pend);";
                    }
                    else if (cardTypes.Contains("Link"))
                    {
                        cmd.CommandText = "INSERT INTO YGOCard (CardName, CardID, CardText, SuperType, SubType, Attribute, " +
                                            "AttackValue, LinkRating) VALUES " +
                                            "(@cardName, @cardCode, @cardText, " +
                                            "(SELECT SuperTypeID FROM CardSuperType WHERE SuperTypeName = @superType), " +
                                            "(SELECT SubTypeID FROM CardSubType WHERE SubTypeName = @subType), " +
                                            "(SELECT AttributeID FROM MonsterAttribute WHERE AttributeName = @attribute), " +
                                            "@atk, @link);";
                    }
                    else
                    {
                        cmd.CommandText = "INSERT INTO YGOCard (CardName, CardID, CardText, SuperType, SubType, Attribute, CardLevel, " +
                                            "AttackValue, DefenseValue) VALUES " +
                                            "(@cardName, @cardCode, @cardText, " +
                                            "(SELECT SuperTypeID FROM CardSuperType WHERE SuperTypeName = @superType), " +
                                            "(SELECT SubTypeID FROM CardSubType WHERE SubTypeName = @subType), " +
                                            "(SELECT AttributeID FROM MonsterAttribute WHERE AttributeName = @attribute), " +
                                            "@level, @atk, @def);";
                    }
                    break;
            }

            if (level == 0 && cardTypes.Contains("Link")) { level = null; }

            cmd.Parameters.AddWithValue("@cardName", name);
            cmd.Parameters.AddWithValue("@cardCode", idString);
            cmd.Parameters.AddWithValue("@cardText", desc);
            cmd.Parameters.AddWithValue("@superType", superType);

            if (superType == "SPELL" || superType == "TRAP") { cmd.Parameters.AddWithValue("@subType", cardTypes[0]); }

            if (superType == "MONSTER")
            {
                cmd.Parameters.AddWithValue("@subType", race);
                cmd.Parameters.AddWithValue("@attribute", attribute);
                cmd.Parameters.AddWithValue("@atk", atk);
                

                if (level != null) 
                { 
                    cmd.Parameters.AddWithValue("@level", level);
                    cmd.Parameters.AddWithValue("@def", def);
                }


                if (cardTypes.Contains("Pendulum")) { cmd.Parameters.AddWithValue("@pend", scale); }
                if (cardTypes.Contains("Link")) 
                { 
                    cmd.Parameters.AddWithValue("@link", linkval);
                }
            }

            return cmd;
        }

    }
}
