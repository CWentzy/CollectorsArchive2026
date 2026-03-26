/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        CardSearchQueryBuilder.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     A static class called to create sql queries when performing card searches.
 *                  Because there are a variety of paramters and the ways those parameters are used
 *                  can change
 */

using CollectorsArchive.Server.Models.ApiInput;
using System.Text;

namespace CollectorsArchive.Server
{
    public static class CardSearchQueryBuilder
    {
        public static string CardSearchYGO(AdvancedSearch parameters)
        {
            StringBuilder query = new StringBuilder();

            query.Append("SELECT " +
                            "YGOCard.CardID, " +
                            "YGOCard.CardName, " +
                            "CardSuperType.SuperTypeName AS 'SuperType', " +
                            "CardSubType.SubTypeName AS 'SubType'" +
                         "FROM YGOCard " +
                            "JOIN CardSuperType ON YGOCard.SuperType = CardSuperType.SuperTypeID " +
                            "JOIN CardSubType ON YGOCard.SubType = CardSubType.SubTypeID ");

            SearchFiltersYGO ygoParameters = (SearchFiltersYGO)parameters.AdvancedFilters;

            if (parameters.Query != null) { }
            if (ygoParameters.superTypes != null) { query.Append(YGOStringParameter(ygoParameters.superTypes, 
                                                    "CardSuperType.SuperTypeName")); }
            if (ygoParameters.subTypes != null) { query.Append(YGOStringParameter(ygoParameters.subTypes,
                                                    "CardSubType.SubTypeName")); }
            if (ygoParameters.attributes != null) { query.Append(YGOStringParameter(ygoParameters.attributes,
                                                    "MonsterAttribute.AttributeName")); }
            if (ygoParameters.classifications != null) { query.Append(YGOStringParameter(ygoParameters.classifications,
                                                    "MonsterClassification.ClassificationName")); }


            //if (ygoParameters.classifications != null)
            //{
            //    query.Append(YGOStringParameter(ygoParameters.classifications,
            //                                        "MonsterClassification.ClassificationName"));
            //}
            //if (ygoParameters.classifications != null)
            //{
            //    query.Append(YGOStringParameter(ygoParameters.classifications,
            //                                        "MonsterClassification.ClassificationName"));
            //}
            //if (ygoParameters.classifications != null)
            //{
            //    query.Append(YGOStringParameter(ygoParameters.classifications,
            //                                        "MonsterClassification.ClassificationName"));
            //}

            return query.ToString();
        }


        private static string YGOStringParameter(string[] parameter, string columnName)
        {
            StringBuilder param = new StringBuilder();

            param.Append($"AND {columnName} IN (");
            foreach (string type in parameter)
            {
                param.Append($"{type},");
            }
            param.Remove(param.Length - 1, 1);
            param.Append(") ");

            return param.ToString();
        }


        private static string YGOIntParameter(int[] parameter, string columnName)
        {
            StringBuilder param = new StringBuilder();

            param.Append($"AND {columnName} BETWEEN {parameter[0]} AND {parameter[1]}");

            return param.ToString();
        }
    }
}
