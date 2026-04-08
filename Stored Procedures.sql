USE collectorsarchivedb;
GO

-- ALTERING PROCEDURES: GetListCards, GetPrintQuantityInList, IncrementPrintInList, DecrementPrintInList, GetUserLists, CreateUserList, RenameUserList, DeleteUserList, IncrementDecrementFromCollection, DisplayUserCollection.

-- 1. Getting the list card
CREATE OR ALTER PROCEDURE GetListCards
    @UserListID INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UserProfileID INT;
    SELECT @UserProfileID = UserProfileID
    FROM UserList
    WHERE UserListID = @UserListID;

    SELECT
        ygo.CardID,
        ygo.CardName,
        cp.PrintID,
        cs.SetCode,
        cs.SetName,
        cp.CardRarity,
        cs.CardSetID AS SetID,
        ISNULL(ulc.Quantity, 0) AS Quantity
    FROM UserListCard ulc
    -- Joining directly on PrintID
    INNER JOIN CardPrinting cp  ON cp.PrintID  = ulc.PrintID
    INNER JOIN YGOCard     ygo  ON ygo.CardID  = cp.CardID
    INNER JOIN CardSet      cs  ON cs.CardSetID = cp.CardSetID
    LEFT  JOIN UserCard     uc  ON uc.PrintID  = ulc.PrintID
                                AND uc.UserProfileID = @UserProfileID
    WHERE ulc.UserListID = @UserListID
    ORDER BY ygo.CardName ASC, cp.PrintID ASC;
END
GO

--2. Get quantity of a print in a specific list
CREATE OR ALTER PROCEDURE GetPrintQuantityInList
    @UserListID INT,
    @PrintID    INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ISNULL(Quantity, 0) AS Quantity
    FROM UserListCard
    WHERE UserListID = @UserListID AND PrintID = @PrintID;
END
GO

--3. Increment print quantity in a list (inserting if does not exists)
CREATE OR ALTER PROCEDURE IncrementPrintInList
    @UserListID INT,
    @PrintID    INT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1 FROM UserListCard
        WHERE UserListID = @UserListID AND PrintID = @PrintID
    )
    BEGIN
        UPDATE UserListCard
        SET Quantity = Quantity + 1
        WHERE UserListID = @UserListID AND PrintID = @PrintID;
    END
    ELSE
    BEGIN
        INSERT INTO UserListCard (UserListID, PrintID, Quantity)
        VALUES (@UserListID, @PrintID, 1);
    END

    -- Return new quantity
    SELECT Quantity FROM UserListCard
    WHERE UserListID = @UserListID AND PrintID = @PrintID;
END
GO

-- 4. Decrement print quantity in a list (remove row if hits 0)
CREATE OR ALTER PROCEDURE DecrementPrintInList
    @UserListID INT,
    @PrintID    INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CurrentQty INT;
    SELECT @CurrentQty = Quantity FROM UserListCard
    WHERE UserListID = @UserListID AND PrintID = @PrintID;

    IF @CurrentQty IS NULL OR @CurrentQty <= 0
        RETURN;

    IF @CurrentQty = 1
    BEGIN
        -- Remove the row completely when quantity hits 0
        DELETE FROM UserListCard
        WHERE UserListID = @UserListID AND PrintID = @PrintID;

        SELECT 0 AS Quantity;
    END
    ELSE
    BEGIN
        UPDATE UserListCard
        SET Quantity = Quantity - 1
        WHERE UserListID = @UserListID AND PrintID = @PrintID;

        SELECT Quantity FROM UserListCard
        WHERE UserListID = @UserListID AND PrintID = @PrintID;
    END
END
GO
--DONE


-- OTHER PROCEDURES: GetUserLists, CreateUserList, RenameUserList, DeleteUserList

CREATE OR ALTER PROCEDURE GetUserLists
    @UserProfileID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT UserListID, UserProfileID, UserListName
    FROM UserList
    WHERE UserProfileID = @UserProfileID
    ORDER BY UserListID ASC;
END
GO

CREATE OR ALTER PROCEDURE CreateUserList
    @UserProfileID INT,
    @UserListName  NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO UserList (UserProfileID, UserListName)
    VALUES (@UserProfileID, @UserListName);

    SELECT UserListID, UserProfileID, UserListName
    FROM UserList
    WHERE UserListID = SCOPE_IDENTITY();
END
GO

CREATE OR ALTER PROCEDURE RenameUserList
    @UserListID   INT,
    @UserListName NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE UserList
    SET UserListName = @UserListName
    WHERE UserListID = @UserListID;
END
GO

CREATE OR ALTER PROCEDURE DeleteUserList
    @UserListID INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM UserListCard WHERE UserListID = @UserListID;
    DELETE FROM UserList WHERE UserListID = @UserListID;
END
GO



-- Increment the quantity in the collection part
CREATE OR ALTER PROCEDURE IncrementDecrementFromCollection
    @UserProfileID INT,
    @PrintID INT,
    @Increment BIT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CurrentQty INT;

    -- Get the current quantity
    SELECT @CurrentQty = Quantity
    FROM UserCard
    WHERE UserProfileID = @UserProfileID AND PrintID = @PrintID;

    IF @CurrentQty IS NOT NULL
    BEGIN
        IF @Increment = 1 -- Increase quantity by one
        BEGIN 
            UPDATE UserCard
            SET Quantity = Quantity + 1
            WHERE UserProfileID = @UserProfileID AND PrintID = @PrintID;
        END
        ELSE -- Decrease quantity by one
        BEGIN
            UPDATE UserCard
            SET Quantity = Quantity - 1
            WHERE UserProfileID = @UserProfileID AND PrintID = @PrintID;

            IF @CurrentQty <= 1
            BEGIN
                DELETE FROM UserCard
                WHERE UserProfileID = @UserProfileID AND PrintID = @PrintID;

                SELECT 0 AS Quantity;
                RETURN;
            END
        END
    END
    ELSE -- Record doesn't exist
    BEGIN
        
        IF @Increment = 1 --Add the card in the collection
        BEGIN
            INSERT INTO UserCard (UserProfileID, PrintID, Quantity)
            VALUES (@UserProfileID, @PrintID, 1);
        END
        ELSE --Returns
        BEGIN
            SELECT 0 AS Quantity;
            RETURN;
        END
    END

    -- updated quantity
    SELECT Quantity
    FROM UserCard
    WHERE UserProfileID = @UserProfileID AND PrintID = @PrintID;
END
GO

CREATE OR ALTER PROCEDURE DisplayUserCollection
    @UserName NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ygo.CardID,
        ygo.CardName,
        cp.PrintID,
        cs.SetCode,
        cs.SetName,
        cp.CardRarity,
        cs.CardSetID,
        ISNULL(uc.Quantity, 0) AS Quantity
    FROM UserCard uc
    INNER JOIN CardPrinting cp  ON cp.PrintID       = uc.PrintID
    INNER JOIN YGOCard     ygo  ON ygo.CardID        = cp.CardID
    INNER JOIN CardSet      cs  ON cs.CardSetID      = cp.CardSetID
    INNER JOIN UserProfile  up  ON up.UserProfileID  = uc.UserProfileID
    WHERE up.UserName = @UserName
    ORDER BY ygo.CardName ASC, cp.PrintID ASC;
END
GO

CREATE OR ALTER PROCEDURE GetListCards
    @UserListID INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UserProfileID INT;
    SELECT @UserProfileID = UserProfileID
    FROM UserList
    WHERE UserListID = @UserListID;

    SELECT
        ygo.CardID,
        ygo.CardName,
        cp.PrintID,
        cs.SetCode,
        cs.SetName,
        cp.CardRarity,
        cs.CardSetID AS SetID,
        ISNULL(uc.Quantity, 0) AS Quantity
    FROM UserListCard ulc
    -- Join directly on PrintID since that's all UserListCard stores now
    INNER JOIN CardPrinting cp  ON cp.PrintID   = ulc.PrintID
    INNER JOIN YGOCard     ygo  ON ygo.CardID   = cp.CardID
    INNER JOIN CardSet      cs  ON cs.CardSetID = cp.CardSetID
    LEFT  JOIN UserCard     uc  ON uc.PrintID   = ulc.PrintID
                                AND uc.UserProfileID = @UserProfileID
    WHERE ulc.UserListID = @UserListID
    ORDER BY ygo.CardName ASC, cp.PrintID ASC;
END
GO
