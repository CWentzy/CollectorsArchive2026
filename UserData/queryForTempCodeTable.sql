/* 
   Programmer: Ermiyas Gulti
   Description:
      This script resets the temporary authentication tables used 
      for email‑based login. It removes any existing temp‑code tables 
      and recreates a fresh ToVerifyTheTempCode table for storing 
      one‑time verification codes.

      Intended for development or maintenance when you need a clean 
      state for testing the login flow.
*/

USE collectorsarchivedb;
GO

DROP TABLE IF EXISTS TempLoginCodes;
DROP TABLE IF EXISTS ToVerifyTheTempCode;

CREATE TABLE ToVerifyTheTempCode (
    Id INT IDENTITY PRIMARY KEY,
    Email NVARCHAR(255) NOT NULL,
    Code NVARCHAR(10) NOT NULL,
    Expiration DATETIME NOT NULL
);
