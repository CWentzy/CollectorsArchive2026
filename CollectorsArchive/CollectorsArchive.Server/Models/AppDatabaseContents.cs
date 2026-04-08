using CollectorsArchive.Server.Models;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace CollectorsArchive.Server
{
    public class AppDatabaseContents : DbContext
    {

        // this entity will be our table in the database, it will store user information .
        // The UserID field will be the primary key that we specify in sql, and the email and username
        // user name will be the email id of the user without @domain part this is the class that we created in Models/User.cs

        // In your DbContext
        public DbSet<UserProfile> UserProfile { get; set; }
        public DbSet<ToVerifyTheTempCode> ToVerifyTheTempCode { get; set; }

        // public DbSet<UserProfile> UserProfiles { get; set; } THIS CAN BE SCRAPPED TOO
        public DbSet<UserCard> UserCards { get; set; }

        // here I am doing is creating a constructor for the AppDatabaseContents class that takes in DbContextOptions and passes it to the base class constructor
        public AppDatabaseContents(DbContextOptions<AppDatabaseContents> options) : base(options)
        {
        }

        // this since we already has the database and the tables created in sql, we need to tell entity framework to use the existing database and tables instead of trying to create new ones.
        // So we will override the OnModelCreating method and specify the table name and column names for the User entity.
        /*
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UserInformation>(entity =>
            {
                entity.ToTable("UserProfile");

                entity.HasKey(e => e.UserProfileId);

                entity.Property(e => e.UserProfileId)
                      .HasColumnName("UserProfileID");

                entity.Property(e => e.Email)
                      .HasColumnName("Email");

                entity.Property(e => e.UserName)
                      .HasColumnName("Username");

                entity.Property(e => e.GoogleSubject)
                      .HasColumnName("GoogleSubject");
                entity.Property(e => e.Bio)
                       .HasColumnName("Bio");
                entity.Property(e => e.PhotoUrl)
                       .HasColumnName("PhotoURL");
                entity.Property(e => e.JoinDate)
                       .HasColumnName("JoinDate");

            });
            modelBuilder.Entity<UserProfile>(entity =>
            {
                entity.ToTable("UserProfile");
                entity.HasKey(e => e.ProfileId);
                entity.Property(e => e.ProfileId).HasColumnName("ProfileID");
                entity.Property(e => e.UserId).HasColumnName("UserID");
                entity.Property(e => e.Bio).HasColumnName("Bio");
                entity.Property(e => e.PhotoUrl).HasColumnName("PhotoURL");
                entity.Property(e => e.JoinDate).HasColumnName("JoinDate");
            }); //CAN BE SCRAPPED TOO
            modelBuilder.Entity<UserCard>(entity =>
            {
                entity.ToTable("UserCard");
                entity.HasKey(e => e.UserCardID);
                entity.Property(e => e.UserCardID).HasColumnName("UserCardID");
                entity.Property(e => e.UserProfileID).HasColumnName("UserID");
                entity.Property(e => e.PrintID).HasColumnName("PrintID");
                entity.Property(e => e.Quantity).HasColumnName("Quantity");
                entity.Property(e => e.CardEditionID).HasColumnName("CardEditionID");
            });
        }
        */


    }
}
