-- ============================================================================================= --
-- PROGRAMMER(S):	Curtis Wentzlaff (7274749)
-- FILE NAME:		YGODataSetup.sql
-- ASSIGNMENT:		PROG3221 - Capstone
-- DESCRIPTION:		Creates and runs the stored procedure for setting up the Yu-Gi-Oh data 
--					tables.
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


-- ============================================================================================= --
-- ============================CREATE/ALTER YGO DATA RESET PROCEDURE============================ --
-- ============================================================================================= --

-- DESCRIPTION:		DROPs all existing Tables before recreating the tables and populating 
--                  descriptor tables with their information.
-- PARAMETERS:		None
CREATE OR ALTER PROCEDURE ResetYGOTables
AS
BEGIN

-- =====================================DROP EXISTING TABLES==================================== --

	IF (EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'CardMonsterClassification'))
	BEGIN
		DROP TABLE CardMonsterClassification;
	END

	IF (EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'MonsterClassification'))
	BEGIN
		DROP TABLE MonsterClassification;
	END

    IF (EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'YGOCard'))
	BEGIN
		DROP TABLE YGOCard;
	END

	IF (EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'MonsterAttribute'))
	BEGIN
		DROP TABLE MonsterAttribute;
	END

	IF (EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'CardSuperType'))
	BEGIN
		DROP TABLE CardSuperType;
	END

	IF (EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'CardSubType'))
	BEGIN
		DROP TABLE CardSubType;
	END


-- ======================================CREATE NEW TABLES====================================== --

	CREATE TABLE CardSuperType (
		SuperTypeID INT IDENTITY(1,1) PRIMARY KEY,
		SuperTypeName VARCHAR (50)
	);

	CREATE TABLE CardSubType (
		SubTypeID INT IDENTITY(1,1) PRIMARY KEY,
		SubTypeName VARCHAR (50)
	);

	CREATE TABLE MonsterAttribute (
		AttributeID INT IDENTITY(1,1) PRIMARY KEY,
		AttributeName VARCHAR(8)
	);

	CREATE TABLE YGOCard (
		CardID INT IDENTITY(1,1) PRIMARY KEY,
		CardName VARCHAR (100),
		CardCode VARCHAR (8),
		CardText VARCHAR (1500),
		SuperType INT FOREIGN KEY REFERENCES CardSuperType(SuperTypeID),
		SubType INT FOREIGN KEY REFERENCES CardSubType(SubTypeID),

		-- Monster Classifications is done through a separate table --

		-- Monster Specific Card Traits --
		PendulumScale TINYINT,		-- Values range from 0 - 13
		Attribute INT FOREIGN KEY REFERENCES MonsterAttribute(AttributeID),
		CardLevel TINYINT,			-- Values range from 0 - 12
		AttackValue SMALLINT,		-- Values range from 0 - 9999
		DefenseValue SMALLINT,		-- Values range from 0 - 9999
		LinkRating TINYINT			-- Values range from 0 - 8
	);

	CREATE TABLE MonsterClassification (
		ClassificationID INT IDENTITY(1,1) PRIMARY KEY,
		ClassificationName VARCHAR (20)
	);

	CREATE TABLE CardMonsterClassification (
		CardClassificationID INT IDENTITY(1,1) PRIMARY KEY,
		CardID INT FOREIGN KEY REFERENCES YGOCard(CardID),
		ClassificationID INT FOREIGN KEY REFERENCES MonsterClassification(ClassificationID)
	);


-- =================================POPULATE DESCRIPTOR TABLES================================== --

	INSERT INTO CardSuperType (SuperTypeName) VALUES
		('MONSTER'),
		('SPELL'),
		('TRAP'),
		('TOKEN'),
		('SKILL');


	INSERT INTO CardSubType (SubTypeName) VALUES

		-- Index 1 - 25: Moster Sub-Types --
		('Spellcaster'), ('Dragon'), ('Zombie'), ('Warrior'), ('Beast-Warrior'), ('Beast'),
		('Winged Beast'), ('Fiend'), ('Fairy'), ('Insect'), ('Dinosaur'), ('Reptile'), ('Fish'),
		('Sea Serpent'), ('Aqua'), ('Pyro'), ('Thunder'), ('Rock'),	('Plant'), ('Machine'),
		('Psychic'), ('Divine-Beast'), ('Wyrm'), ('Cyberse'), ('Illusion'),

		-- Index 26 - 29: Spell Specific Sub-Types --
		('Quick-Play'), ('Equip'), ('Field'), ('Ritual'),

		-- Index 30 - 31: Spell/Trap Shared Sub-Types --
		('Normal'), ('Continous'),

		-- Index 32 - __: Trap Specific SubTypes --
		('Counter');


	INSERT INTO MonsterAttribute (AttributeName) VALUES
		('EARTH'), ('WIND'), ('FIRE'), ('WATER'), ('LIGHT'), ('DARK'), ('DIVINE');


	INSERT INTO MonsterClassification (ClassificationName) VALUES
		('Normal'), ('Effect'), ('Ritual'), ('Fusion'), ('Synchro'), ('Xyz'), ('Toon'), ('Flip'),
		('Spirit'), ('Union'), ('Gemini'), ('Tuner'), ('Pendulum'), ('Link');


END
GO

EXEC ResetYGOTables;
GO