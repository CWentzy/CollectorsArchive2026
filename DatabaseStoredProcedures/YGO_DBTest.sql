use CollectorsArchive

SELECT * FROM YGOCard

SELECT COUNT(*) FROM YGOCard


-- SPELL/TRAP SEARCH SEARCH --
SELECT CardName, CardCode, CardSuperType.SuperTypeName, CardSubType.SubTypeName, CardText
FROM YGOCard 
	JOIN CardSuperType ON YGOCard.SuperType = CardSuperType.SuperTypeID
	JOIN CardSubType ON YGOCard.SubType = CardSubType.SubTypeID
WHERE CardSuperType.SuperTypeName = 'SPELL'			-- Value should be 'SPELL' or 'TRAP'
		AND CardName LIKE '%%'						-- Search card name
		AND CardText LIKE '%Dark Magician%'						-- Search card text
		AND CardSubType.SubTypeID IN (26,27, 28, 29, 30)		-- Include for SubType search (Index 26 - 32 of SubType Table