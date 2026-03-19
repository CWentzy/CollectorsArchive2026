-- ============================================================================================= --
-- PROGRAMMER(S):	Bhawanjeet Kaur Gill (8958829)
-- FILE NAME:		UserData.sql
-- ASSIGNMENT:		PROG3221 - Capstone
-- DESCRIPTION:		Creates and runs the stored procedure for setting up the user data.
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
-- =====================================DROP EXISTING TABLES==================================== --

-- NOTE:	Tables are dropped in reverse order to how they are created to prevent errors with	 --
--			Forign Key dependencies.															 --

CREATE OR ALTER PROCEDURE ResetUserData
AS
BEGIN

-- ======================================CREATE NEW TABLES====================================== --

--	----- COMMUNAL USER TABLES -----

IF OBJECT_ID('UserCard', 'U') IS NOT NULL
    DROP TABLE UserCard;

IF OBJECT_ID('CardListCard', 'U') IS NOT NULL
    DROP TABLE CardListCard;

IF OBJECT_ID('CardList', 'U') IS NOT NULL
    DROP TABLE CardList;

IF OBJECT_ID('CardEdition', 'U') IS NOT NULL
    DROP TABLE CardEdition;

IF OBJECT_ID('CardListType', 'U') IS NOT NULL
    DROP TABLE CardListType;

IF OBJECT_ID('User', 'U') IS NOT NULL
    DROP TABLE UserInformation;


CREATE TABLE UserInformation(
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    UNIQUE(email, username) -- NEED TO BE UNIQUE FOR EVERY USER
    );
    
CREATE TABLE CardListType(
    ListTypeID INT IDENTITY(1,1) PRIMARY KEY,
    ListTypeName VARCHAR(100) NOT NULL
    );

CREATE TABLE CardEdition(
    CardEditionID INT IDENTITY(1,1) PRIMARY KEY,
    EditionName VARCHAR(25)
    );

CREATE TABLE CardList(
    CardListID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    TypeID INT NOT NULL,
    FOREIGN KEY (UserID) REFERENCES UserInformation(UserID),
    FOREIGN KEY (TypeID) REFERENCES CardListType(ListTypeID)
    );

CREATE TABLE CardListCard(
    ListCardID INT IDENTITY(1,1) PRIMARY KEY,
    CardListID INT NOT NULL,
    CardID INT NOT NULL,
    GameID INT NOT NULL,
    UNIQUE(CardID, GameID),
    FOREIGN KEY (CardListID) REFERENCES CardList (CardListID)
    );

CREATE TABLE UserCard(
    UserCardID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    PrintID INT NOT NULL,
    Quantity INT NOT NULL,
    CardEditionID INT,
    FOREIGN KEY (UserID) REFERENCES [User](UserID),
    FOREIGN KEY (PrintID) REFERENCES CardPrinting(PrintID),
    FOREIGN KEY (CardEditionID) REFERENCES CardEdition(CardEditionID)
    );


END
GO

EXEC ResetUserData;
GO



SELECT * FROM UserInformation;
GO
