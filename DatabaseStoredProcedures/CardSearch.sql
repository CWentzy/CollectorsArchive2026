-- ============================================================================================= --
-- PROGRAMMER(S):	Curtis Wentzlaff (7274749)
-- FILE NAME:		CardSearch.sql
-- ASSIGNMENT:		PROG3221 - Capstone
-- DESCRIPTION:		Creates the stored procedures used for searching the Database and returning
--                  Card Information to the front end.
--
--                  *NOTE:  Not all Search options can used stored procedures due to the
--                          variance in user search parameters.*
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


-- DESCRIPTION:		Returns a list of all card printings found within the specifed Card Set.
-- PARAMETERS:		@GameID ->      Specifies the game to determine which tables to SELECT from
--                  @SetName ->     Specifies the name of the Set
CREATE OR ALTER PROCEDURE AdvancedSearchBySet
    @GameID VARCHAR (5),
    @SetName VARCHAR (100)
AS
BEGIN

SELECT CardPrinting.CardID,
    CASE WHEN @GameID = 'ygo' THEN YGOCard.CardName
		END AS 'CardName',
    CASE WHEN @GameID = 'ygo' THEN CardSet.SetCode + '-' + CardPrinting.CardSetIndex
        END AS 'SetCode',
    CardPrinting.CardRarity
FROM CardPrinting
    JOIN CardSet ON CardPrinting.CardSetID = CardSet.CardSetID
    JOIN YGOCard ON CardPrinting.CardID = YGOCard.CardID
WHERE CardSet.SetName = @SetName
ORDER BY CardPrinting.CardSetIndex

END



SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- DESCRIPTION:		Returns a list of all card printings found within the specifed Card Set.
-- PARAMETERS:		@GameID ->      Specifies the game to determine which tables to SELECT from
--                  @SetName ->     Specifies the name of the Set
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
    JOIN MonsterAttribute ON YGOCard.Attribute = MonsterAttribute.AttributeID
WHERE YGOCard.CardID = @CardID

END



SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

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



SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- DESCRIPTION:		Returns a list of all card printings found within the specifed Card Set.
-- PARAMETERS:		@GameID ->      Specifies the game to determine which tables to SELECT from
--                  @SetName ->     Specifies the name of the Set
CREATE OR ALTER PROCEDURE CVSearch
    @CardID VARCHAR(10)
AS
BEGIN

SELECT CardPrinting.CardID,
    YGOCard.CardName,
	CardSet.SetCode + '-' + CardPrinting.CardSetIndex AS 'SetCode',
    CardPrinting.CardRarity
FROM CardPrinting
    JOIN CardSet ON CardPrinting.CardSetID = CardSet.CardSetID
    JOIN YGOCard ON CardPrinting.CardID = YGOCard.CardID
WHERE CardPrinting.CardID = @CardID
ORDER BY YGOCard.CardName

END