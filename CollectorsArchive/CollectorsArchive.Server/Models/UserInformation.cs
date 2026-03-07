using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CollectorsArchive.Server.Models
{
    [Table("User")]

    // Enforce uniqueness at the database level
    [Index(nameof(Email), IsUnique = true)]
    [Index(nameof(UserName), IsUnique = true)]
    public class UserInformation
    {
        [Key]
        [Column("UserID")]
        public int UserId { get; set; }

        // Email cannot be null and must be unique
        [Required]
        [MaxLength(255)]
        [Column("email")]
        public string Email { get; set; } = string.Empty;

        // Username cannot be null and must be unique
        [Required]
        [MaxLength(100)]
        [Column("username")]
        public string UserName { get; set; } = string.Empty;

        // GoogleSubject is optional (null for non‑Google users)
        [MaxLength(255)]
        [Column("GoogleSubject")]
        public string? GoogleSubject { get; set; }
    }
}
