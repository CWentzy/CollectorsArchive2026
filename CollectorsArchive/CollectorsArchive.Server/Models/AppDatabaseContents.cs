using Microsoft.EntityFrameworkCore;
using CollectorsArchive.Server.Models;

namespace CollectorsArchive.Server
{
    public class AppDatabaseContents : DbContext
    {
    

        // this entity will be our table in the database, it will store user information .
        // The UserID field will be the primary key that we specify in sql, and the email and username
        // user name will be the email id of the user without @domain part this is the class that we created in Models/User.cs
        public DbSet<UserInformation> Users { get; set; }

        // here I am doing is creating a constructor for the AppDatabaseContents class that takes in DbContextOptions and passes it to the base class constructor
        public AppDatabaseContents(DbContextOptions<AppDatabaseContents> options) : base(options)
        {
        }

        // this since we already has the database and the tables created in sql, we need to tell entity framework to use the existing database and tables instead of trying to create new ones.
        // So we will override the OnModelCreating method and specify the table name and column names for the User entity.
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UserInformation>(entity =>
            {
                entity.ToTable("UserInformation"); 

                entity.HasKey(e => e.UserID);

                entity.Property(e => e.UserID)
                      .HasColumnName("UserID");

                entity.Property(e => e.Email)
                      .HasColumnName("email");

                entity.Property(e => e.UserName)
                      .HasColumnName("username");
            });
        }
    }
}
