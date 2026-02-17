using Microsoft.EntityFrameworkCore;
using CollectorsArchive.Server.Models;

namespace CollectorsArchive.Server
{
    public class AppDatabaseContents : DbContext
    {
        public AppDatabaseContents(DbContextOptions<AppDatabaseContents> options)
            : base(options) { }

        public DbSet<UserInformation> UserInformation { get; set; }
        //To configure the unique constraint on email and username
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserInformation>(entity =>
            {
                
                entity.HasIndex(e => new { e.Email, e.UserName }).IsUnique();
            });
        }
    }
}
