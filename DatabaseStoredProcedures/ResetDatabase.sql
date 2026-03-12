-- ============================================================================================= --
-- PROGRAMMER(S):	Curtis Wentzlaff (7274749)
-- FILE NAME:		ResetDatabase.sql
-- ASSIGNMENT:		PROG3221 - Capstone
-- DESCRIPTION:		Creates and runs the stored procedure for setting up the user and universal
--					card tables.
-- ============================================================================================= --

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- ============================================================================================= --
-- ================================CREATE NEW DATABASE IF NEEDED================================ --
-- ============================================================================================= --

IF DB_ID('CollectorsArchive') IS NULL
BEGIN
    CREATE DATABASE CollectorsArchive;
END
ELSE
BEGIN
    PRINT 'Database Exists';
END
GO

USE CollectorsArchive;
GO


-- ============================================================================================= --
-- ============================CREATE/ALTER DATABASE RESET PROCEDURE============================ --
-- ============================================================================================= --

-- DESCRIPTION:		DROPs all existing Tables before recreating the tables and populating 
--                  descriptor tables with their information.
-- PARAMETERS:		None
CREATE OR ALTER PROCEDURE ResetDatabase
AS
BEGIN

-- =====================================DROP EXISTING TABLES==================================== --

-- NOTE:	Tables are dropped in reverse order to how they are created to prevent errors with	 --
--			Forign Key dependencies.															 --


--	----- COMMUNAL CARD TABLES -----

    IF (EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'CardPrinting'))
	BEGIN
		DROP TABLE CardPrinting;
	END

	IF (EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'CardSet'))
	BEGIN
		DROP TABLE CardSet;
	END

	IF (EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'CardGame'))
	BEGIN
		DROP TABLE CardGame;
	END

	IF (EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'CardLanguage'))
	BEGIN
		DROP TABLE CardLanguage;
	END


-- ======================================CREATE NEW TABLES====================================== --

--	----- COMMUNAL CARD TABLES -----

	CREATE TABLE CardLanguage (
		LanguageID INT IDENTITY(1,1) PRIMARY KEY,
		LanguageName VARCHAR (30),
		LanguageCode VARCHAR (3)
	);

	CREATE TABLE CardGame (
		GameID INT IDENTITY(1,1) PRIMARY KEY,
		GameName VARCHAR (50),
		GameCode VARCHAR (5)
	);

	CREATE TABLE CardSet (
		CardSetID INT IDENTITY(1,1) PRIMARY KEY,
		GameID INT FOREIGN KEY REFERENCES CardGame(GameID),
		SetName VARCHAR (100),
		SetCode VARCHAR (8),
		ReleaseDate DATE
	);

	CREATE TABLE CardPrinting (
		PrintID INT IDENTITY(1,1) PRIMARY KEY,
		CardID VARCHAR (10), 
		GameID INT FOREIGN KEY REFERENCES CardGame(GameID),
		LanguageID INT FOREIGN KEY REFERENCES CardLanguage(LanguageID),
		CardSetID INT FOREIGN KEY REFERENCES CardSet(CardSetID),
		CardSetIndex VARCHAR (5),
		CardRarity VARCHAR (50)
	);

	
-- =================================POPULATE DESCRIPTOR TABLES================================== --

	INSERT INTO CardLanguage (LanguageName, LanguageCode) VALUES
		('English', 'EN'),
		('French','FR'),
		('German','DE'),
		('Italian','IT'),
		('Portuguese','PT');

	INSERT INTO CardGame (GameName, GameCode) VALUES
		('Yu-Gi-Oh', 'YGO'),
		('Magic The Gathering', 'MTG'),
		('Pokemon', 'PKMN');

END
GO

EXEC ResetDatabase;
GO