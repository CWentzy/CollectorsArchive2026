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
		SuperTypeName VARCHAR (50),
		SuperTypeNameFR VARCHAR (50),
		SuperTypeNameDE VARCHAR (50),
		SuperTypeNameIT VARCHAR (50),
		SuperTypeNamePT VARCHAR (50)
	);

	CREATE TABLE CardSubType (
		SubTypeID INT IDENTITY(1,1) PRIMARY KEY,
		SubTypeName VARCHAR (50),
		SubTypeNameFR VARCHAR (50),
		SubTypeNameDE VARCHAR (50),
		SubTypeNameIT VARCHAR (50),
		SubTypeNamePT VARCHAR (50)
	);

	CREATE TABLE MonsterAttribute (
		AttributeID INT IDENTITY(1,1) PRIMARY KEY,
		AttributeName VARCHAR (10),
		AttributeNameFR VARCHAR (10),
		AttributeNameDE VARCHAR (10),
		AttributeNameIT VARCHAR (10),
		AttributeNamePT VARCHAR (10)
	);

	CREATE TABLE YGOCard (
		-- CardID INT IDENTITY(1,1) PRIMARY KEY,
		CardID VARCHAR(10) PRIMARY KEY,
		CardName VARCHAR (100),
		CardNameFR VARCHAR (100),
		CardNameDE VARCHAR (100),
		CardNameIT VARCHAR (100),
		CardNamePT VARCHAR (100),
		-- CardCode VARCHAR (8),
		CardText VARCHAR (1500),
		CardTextFR VARCHAR (1500),
		CardTextDE VARCHAR (1500),
		CardTextIT VARCHAR (1500),
		CardTextPT VARCHAR (1500),
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
		ClassificationName VARCHAR (20),
		ClassificationNameFR VARCHAR (20),
		ClassificationNameDE VARCHAR (20),
		ClassificationNameIT VARCHAR (20),
		ClassificationNamePT VARCHAR (20)
	);

	CREATE TABLE CardMonsterClassification (
		CardClassificationID INT IDENTITY(1,1) PRIMARY KEY,
		CardID VARCHAR (10) FOREIGN KEY REFERENCES YGOCard(CardID),
		ClassificationID INT FOREIGN KEY REFERENCES MonsterClassification(ClassificationID)
	);


-- =================================POPULATE DESCRIPTOR TABLES================================== --

	INSERT INTO CardSuperType (SuperTypeName, SuperTypeNameFR, SuperTypeNameDE, SuperTypeNameIT, SuperTypeNamePT) VALUES
		('MONSTER', 'MONSTRE', 'MONSTER', 'MOSTRO', 'MOSTRO'),
		('SPELL', 'MAGIE', 'ZAUBER', 'MAGIA', 'TRAPPOLA'),
		('TRAP', 'PIÈGE', 'FALLE', 'MAGIA', 'ARMADILHA'),
		('TOKEN', 'JETON', 'SPIELMARKE', 'SEGNA-MONSTRO', 'FICHA'),
		('SKILL', 'COMPÉNTENCE', 'FÄHIGKEIT', 'ABILITÀ', 'HABILIDADE');


	INSERT INTO CardSubType (SubTypeName, SubTypeNameFR, SubTypeNameDE, SubTypeNameIT, SubTypeNamePT) VALUES

		-- Index 1 - 25: Moster Sub-Types --
		('Spellcaster', 'Magicien', 'Hexer', 'Incantatore', 'Mago'), 
		('Dragon', 'Dragon', 'Drache', 'Drago', 'Dragão'), 
		('Zombie', 'Zombie', 'Zombie', 'Zombie', 'Zumbi'), 
		('Warrior', 'Guerrier', 'Kreiger', 'Guerriero', 'Guerreiro'), 
		('Beast-Warrior', 'Bête-Gurrier', 'Ungeheuer-Kreiger', 'Guerriero-Bestia', 'Besta-Guerreira'), 
		('Beast', 'Bête', 'Ungeheuer', 'Bestia', 'Besta'),
		('Winged Beast', 'Bête Ailée', 'Geflügeltes Ungeheuer', 'Bestia Alata', 'Besta Alada'), 
		('Fiend', 'Démon', 'Unterweltler', 'Demone', 'Demônio'), 
		('Fairy', 'Elfe', 'Fee', 'Fata', 'Fada'), 
		('Insect', 'Insecte', 'Insekt', 'Insetto', 'Inseto'),
		('Dinosaur', 'Dinosaure', 'Dinosaurier', 'Dinosauro', 'Dinossauro'), 
		('Reptile', 'Reptile', 'Reptil', 'Rettile', 'Réptil'), 
		('Fish', 'Poisson', 'Fisch', 'Pesce', 'Peixe'),
		('Sea Serpent', 'Serpent de Mer', 'Seeschlange', 'Serpente Marino', 'Serpente Marinha'), 
		('Aqua', 'Aqua', 'Aqua', 'Acqua', 'Aqua'), 
		('Pyro', 'Pyro', 'Pyro', 'Pyro', 'Pino'), 
		('Thunder', 'Tonnerre', 'Donner', 'Tuono', 'Trovão'), 
		('Rock', 'Rocher', 'Fels', 'Roccia', 'Rocha'),
		('Plant', 'Plante', 'Pflanze', 'Pianta', 'Planta'), 
		('Machine', 'Machine', 'Maschine', 'Machina', 'Máquina'),
		('Psychic', 'Psychique', 'Psi', 'Psichico', 'Psíquico'), 
		('Divine-Beast', 'Bête Divine', 'Göttliches Ungeheuer', 'Divinità-Bestia', 'Besta Divina'), 
		('Wyrm', 'Wyrm', 'Wyrm', 'Wyrm', 'Wyrm'), 
		('Cyberse', 'Cyberse', 'Cyberse', 'Cyberso', 'Ciberso'), 
		('Illusion', 'Illusion', 'Illusion', 'Illusione', 'Illusão'),

		-- Index 26 - 29: Spell Specific Sub-Types --
		('Quick-Play', 'Jeu-Rapide', 'Schnell', 'Rapida', 'Rápida'), 
		('Equip', 'Équipement', 'Ausrüstung', 'Equipaggiamento', 'Equipamento'), 
		('Field', 'Terrain', 'Spielfeld', 'Terreno', 'Campo'), 
		('Ritual', 'Rituel', 'Ritual', 'Rituale', 'Ritual'),

		-- Index 30 - 31: Spell/Trap Shared Sub-Types --
		('Normal', 'Normale', 'Normal', 'Normali', 'Normal'), 
		('Continuous', 'Continu', 'Permanent', 'Continua', 'Contínua'),

		-- Index 32 - __: Trap Specific SubTypes --
		('Counter', 'Contre', 'Konter', 'Contro', 'Marcador');


	INSERT INTO MonsterAttribute (AttributeName, AttributeNameFR, AttributeNameDE, AttributeNameIT, AttributeNamePT) VALUES
		('EARTH', 'TERRE', 'ERDE', 'TERRA', 'TERRA'), 
		('WIND', 'VENT', 'WIND', 'VENTO', 'VENTO'), 
		('FIRE', 'FEU', 'FEUER', 'FUOCO', 'FOGO'), 
		('WATER', 'EAU', 'WASSER', 'ACQUA', 'ÁGUA'), 
		('LIGHT', 'LUMIÈRE', 'LICHT', 'LUCE', 'LUZ'), 
		('DARK', 'TÉNÈBRES', 'FINSTERNIS', 'OSCURITÀ', 'TREVAS'), 
		('DIVINE', 'DIVIN', 'GÖTTLICH', 'DIVINO', 'DIVINO');


	INSERT INTO MonsterClassification (ClassificationName, ClassificationNameFR, ClassificationNameDE, ClassificationNameIT, ClassificationNamePT) VALUES
		('Normal', 'Normal', 'Normal', 'Normale',  'Normal'), 
		('Effect', 'Effet', 'Effekt', 'Effetto', 'Efeito'), 
		('Ritual', 'Rituel', 'Ritual', 'Rituale', 'Ritual'), 
		('Fusion', 'Fusion', 'Fusion', 'Fusione', 'Fusão'), 
		('Synchro', 'Synchro', 'Synchro', 'Synchro', 'Sincro'), 
		('Xyz', 'Xyz', 'Xyz', 'Xyz', 'Xyz'), 
		('Toon', 'Toon', 'Toon', 'Toon', 'Toon'), 
		('Flip', 'Flip', 'Flipp', 'Scoperta', 'Virar'),
		('Spirit', 'Spirit', 'Spirit', 'Spirit', 'Espírito'), 
		('Union', 'Union', 'Union', 'Unione', 'União'), 
		('Gemini', 'Gémeau', 'Zwilling', 'Gemello', 'Gêmeos'), 
		('Tuner', 'Syntoniseur', 'Empfänger', 'Tuner', 'Regulador'), 
		('Pendulum', 'Pendule', 'Pendel', 'Pendulum', 'Pêndulo'), 
		('Link', 'Lien', 'Link', 'Link', 'Link');


END
GO

EXEC ResetYGOTables;
GO