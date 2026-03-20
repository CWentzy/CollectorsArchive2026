-- ============================================================================================= --
-- PROGRAMMER(S):	Curtis Wentzlaff (7274749)
-- FILE NAME:		UserCollection.sql
-- ASSIGNMENT:		PROG3221 - Capstone
-- DESCRIPTION:		Creates the stored procedures used for adding cards to the collections and
--                  lists of users.
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
CREATE OR ALTER PROCEDURE AddToUserCollection
    @UserName VARCHAR(100),
    @PrintID INT
AS
BEGIN

INSERT INTO UserCard (UserID, PrintID, Quantity) VALUES
    ((SELECT UserID FROM [User] WHERE UserName = @UserName), @PrintID, 1)

END



SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- DESCRIPTION:		Returns the display information of a single Yu-Gi-Oh.
-- PARAMETERS:		@CardID
CREATE OR ALTER PROCEDURE RemoveCardFormUser
    @UserName VARCHAR(100),
    @PrintID INT
AS
BEGIN

DELETE FROM UserCard
WHERE UserID = (SELECT UserID FROM [User] WHERE UserName = @UserName)
    AND PrintID = @PrintID

END



SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- DESCRIPTION:		Returns the display information of a single Yu-Gi-Oh.
-- PARAMETERS:		@CardID
CREATE OR ALTER PROCEDURE UpdateUserCardQuantity
    @UserName VARCHAR(100),
    @PrintID INT,
    @Value INT
AS
BEGIN

UPDATE UserCard SET Quantity = @Value
WHERE UserID = (SELECT UserID FROM [User] WHERE UserName = @UserName)
    AND PrintID = @PrintID 

END