using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CollectorsArchive.Server.Models
{
    [Table("User")]
    public class UserInformation
    {
<<<<<<< HEAD
        [Key]
        [Column("UserID")]
        public int UserId { get; set; }
=======
        public int UserID { get; set; } // database id
        public string Email { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;

    }
>>>>>>> a0f0bec (Database connected successfully, renamed User to UserInformation, added/removed test column to verify connection)

        [Required]
        [MaxLength(255)]
        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [Column("username")]
        public string UserName { get; set; } = string.Empty;

        [MaxLength(255)]
        [Column("GoogleSubject")]
        public string? GoogleSubject { get; set; }
    }
}
