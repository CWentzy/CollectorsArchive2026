-- ============================================================================================= --
-- PROGRAMMER(S):	Curtis Wentzlaff (7274749)
-- FILE NAME:		CardDisplay.sql
-- ASSIGNMENT:		PROG3221 - Capstone
-- DESCRIPTION:		Creates the stored procedures used for displaying card information.
-- ============================================================================================= --

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ============================================================================================= --
-- =============================CONFIRM THE CORRECT DATABASE EXISTS============================= --
-- ============================================================================================= --

IF DB_ID('CollectorsArchive') IS NULL
BEGIN
    RETURN;
END

USE CollectorsArchive;
GO


-- DESCRIPTION:		Returns the display information of a single Yu-Gi-Oh.
-- PARAMETERS:		@CardID
CREATE OR ALTER PROCEDURE DisplayCardYGO
    @CardID VARCHAR(10)
AS
BEGIN

SELECT YGOCard.CardID,
    YGOCard.CardName,
    YGOCard.CardText,
    CardSuperType.SuperTypeName AS 'SuperType',
    CardSubType.SubTypeName AS 'SubType',
    MonsterAttribute.AttributeName AS 'Attribute',
    PendulumScale,
    CardLevel,
    AttackValue,
    DefenseValue,
    LinkRating
FROM YGOCard
    JOIN CardSuperType ON YGOCard.SuperType = CardSuperType.SuperTypeID
    JOIN CardSubType ON YGOCard.SubType = CardSubType.SubTypeID
    LEFT JOIN MonsterAttribute ON YGOCard.Attribute = MonsterAttribute.AttributeID
WHERE YGOCard.CardID = @CardID

END



SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- DESCRIPTION:		Returns the printing information for a specified card
-- PARAMETERS:		@CardID
CREATE OR ALTER PROCEDURE DisplayCardPrintings
    @CardID VARCHAR(10)
AS
BEGIN

SELECT CardPrinting.PrintID,
	CardSet.SetCode,
	CardSet.SetName,
	CardPrinting.CardRarity,
	CardSet.ReleaseDate
FROM CardPrinting 
	JOIN CardSet ON CardPrinting.CardSetID = CardSet.CardSetID
WHERE CardID = @CardID
    
END


SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- DESCRIPTION:		Returns the first 12 Yu-Gi-Oh cards (based on CardID) in a User's collection
-- PARAMETERS:		@UserName
CREATE OR ALTER PROCEDURE DisplayUserCollection
    @UserName VARCHAR(100)
AS
BEGIN

SELECT TOP 12 CardPrinting.PrintID,
	YGOCard.CardID,
	YGOCard.CardName,
	CardSet.SetName,
	CardSet.SetCode + '-' + CardPrinting.CardSetIndex AS 'SetCode',
	CardPrinting.CardRarity,
	UserCard.Quantity
FROM UserCard
	JOIN [User] ON UserCard.UserID = [User].UserID
	JOIN CardPrinting ON UserCard.PrintID = CardPrinting.PrintID
	JOIN CardSet ON CardPrinting.CardSetID = CardSet.CardSetID
	JOIN YGOCard ON CardPrinting.CardID = YGOCard.CardID
WHERE [User].UserName = @UserName
    
END





-- ============================================================================================= --
-- =============================== PROCEDURES CREATED FOR TESTING ============================== --
-- ============================================================================================= --

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- DESCRIPTION:		Returns the first 12 Yu-Gi-Oh cards (based on CardID) in a User's collection
-- PARAMETERS:		@UserName
CREATE OR ALTER PROCEDURE DisplayUserCollection
    @UserName VARCHAR(100)
AS
BEGIN

SELECT TOP 12
    UserCard.PrintID AS 'CardID',
    YGOCard.CardName
FROM UserCard
    JOIN YGOCard ON UserCard.PrintID = YGOCard.CardID
    JOIN dbo.[User] ON UserCard.UserID = [User].UserID
WHERE [User].UserName = @UserName
    
END



