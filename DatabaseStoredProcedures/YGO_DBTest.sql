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


-- PRINTING SEARCH --
SELECT 
	CASE WHEN CardPrinting.GameID = 1 THEN YGOCard.CardName
		END AS 'CardName',
	CardSet.SetName,
	CardSet.SetCode,
	CardPrinting.CardSetIndex,
	CardSet.ReleaseDate,
	CardPrinting.CardRarity
FROM CardPrinting
	JOIN YGOCard ON CardPrinting.CardID = YGOCard.CardID
	JOIN CardSet ON CardPrinting.CardSetID = CardSet.CardSetID

-- CARD SERACH --
--WHERE CardName LIKE '%Blue-Eyes White Dragon%' AND CardRarity LIKE '%%'
--ORDER BY CardName, CardSet.ReleaseDate

-- SET SEARCH --
WHERE CardSet.SetName = 'Magician''s Force'
ORDER BY CardPrinting.CardSetIndex