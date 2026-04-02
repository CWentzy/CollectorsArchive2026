-- ============================================================================================= --
-- PROGRAMMER(S):	Curtis Wentzlaff (7274749)
-- FILE NAME:		MTGDataSetup.sql
-- ASSIGNMENT:		PROG3221 - Capstone
-- DESCRIPTION:		Creates and runs the stored procedure for setting up the Magic the Gathering
--                  data tables.
-- ============================================================================================= --

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE MTGCheckSet
    @Game INT,
    @SetName VARCHAR (100),
    @SetCode VARCHAR (20)
AS
BEGIN

SELECT * 
FROM CardSet 
WHERE GameID = (SELECT GameID FROM CardGame WHERE GameID = @Game)
    AND SetName = @SetName
    AND SetCode = @SetCode

END



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


-- ============================================================================================= --
-- ============================CREATE/ALTER MTG DATA RESET PROCEDURE============================ --
-- ============================================================================================= --

-- DESCRIPTION:		DROPs all existing Tables before recreating the tables and populating 
--                  descriptor tables with their information.
-- PARAMETERS:		None
CREATE OR ALTER PROCEDURE ResetMTGTables
AS
BEGIN

-- =====================================DROP EXISTING TABLES==================================== --

IF (EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'MTGCard'))
BEGIN
	DROP TABLE MTGCard;
END


-- ======================================CREATE NEW TABLES====================================== --

CREATE TABLE MTGCard (
	CardID VARCHAR(10) PRIMARY KEY,
	CardNameEN VARCHAR (150),

	-- Variable Attributes
	CardTextEN VARCHAR (1500),
	SuperType VARCHAR (100),
	CardType VARCHAR (100),
	SubType VARCHAR (100),
	CardManaCost VARCHAR (30),

	-- Creature Specific Attributes
	PowerValue VARCHAR (8),
	ToughnessValue VARCHAR(8),

	-- Planeswalker Specific Attributes
	Loyalty VARCHAR (4)
);


-- =================================POPULATE DESCRIPTOR TABLES================================== --


END
GO

EXEC ResetMTGTables;
GO