using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CollectorsArchive.Server.Models
{
    [Table("UserProfile")]

    // Enforce uniqueness at the database level
    [Index(nameof(Email), IsUnique = true)]
    [Index(nameof(UserName), IsUnique = true)]
    public class UserProfile
    {
        [Key]
        [Column("UserProfileID")]
        public int UserId { get; set; }

        // Email cannot be null and must be unique
        [Required]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        // Username cannot be null and must be unique
        [Required]
        [MaxLength(100)]
        public string UserName { get; set; } = string.Empty;

        // GoogleSubject is optional (null for non‑Google users)
        [MaxLength(255)]
        public string? GoogleSubject { get; set; }
        [MaxLength(500)]
        public string? Bio { get; set; }
        [MaxLength(500)]
        [Column("PhotoURL")]
        public string? PhotoUrl { get; set; }
        [Required]
        public DateTime JoinDate { get; set; }
    }
}
