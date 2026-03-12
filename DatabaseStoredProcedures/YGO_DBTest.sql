use CollectorsArchive

SELECT * FROM CardSet  WHERE SetName LIKE '%Legend of %' ORDER BY ReleaseDate

SELECT * FROM CardSuperType

SELECT * FROM YGOCard

SELECT YGOCard.CardName
FROM YGOCard
LEFT JOIN CardPrinting ON CardPrinting.CardID = YGOCard.CardID
WHERE CardPrinting.CardID IS NULL

SELECT DISTINCT CardID FROM CardPrinting

SELECT COUNT(*) FROM YGOCard

SELECT DISTINCT CardRarity FROM CardPrinting

-- SPELL/TRAP SEARCH --
SELECT CardName, CardID, CardSuperType.SuperTypeName, CardSubType.SubTypeName, CardText
FROM YGOCard 
	JOIN CardSuperType ON YGOCard.SuperType = CardSuperType.SuperTypeID
	JOIN CardSubType ON YGOCard.SubType = CardSubType.SubTypeID
WHERE CardSuperType.SuperTypeName = 'SPELL'			-- Value should be 'SPELL' or 'TRAP'
		AND CardName LIKE '%%'						-- Search card name
		AND CardText LIKE '%Dark Magician%'						-- Search card text
		AND CardSubType.SubTypeID IN (26,27,28,29,30,31)		-- Include for SubType search (Index 26 - 32 of SubType Table


SELECT 
	CardPrinting.CardID,
    YGOCard.CardName,
	CardSet.SetCode + '-' + CardPrinting.CardSetIndex AS 'SetCode',
    CardPrinting.CardRarity
FROM CardPrinting
    JOIN CardSet ON CardPrinting.CardSetID = CardSet.CardSetID
    JOIN YGOCard ON CardPrinting.CardID = YGOCard.CardID
WHERE
	YGOCard.CardName = 'Dark Magician';


SELECT 
	YGOCard.CardID,
	YGOCard.CardName,
	YGOCard.CardText,
	CardSuperType.SuperTypeName,
	CardSubType.SubTypeName,
	YGOCard.PendulumScale,
	MonsterAttribute.AttributeName,
	YGOCard.CardLevel,
	YGOCard.AttackValue,
	YGOCard.DefenseValue,
	YGOCard.LinkRating
FROM YGOCard
	JOIN CardSuperType ON YGOCard.SuperType = CardSuperType.SuperTypeID
	JOIN CardSubType ON YGOCard.SubType = CardSubType.SubTypeID
	JOIN MonsterAttribute ON YGOCard.Attribute = MonsterAttribute.AttributeID;