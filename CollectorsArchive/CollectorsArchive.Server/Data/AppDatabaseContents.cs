using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using CollectorsArchive.Server.Models;


namespace CollectorsArchive.Server
{
    public class AppDatabaseContents: DbContext
    {
        public AppDatabaseContents(DbContextOptions<AppDatabaseContents> options) 
            : base(options) { }

        // this represets the table in the database that will store user information.
        // The name of the table will be "Users" and it will have the columns UserId, Email, UserName
        public DbSet<UserInformation> UserInformation { get; set; }
    }
}
