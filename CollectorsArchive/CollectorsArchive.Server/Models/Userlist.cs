using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CollectorsArchive.Server.Models
{
    [Table("UserList")]
    public class UserList
    {
        [Key]
        public int UserListID { get; set; }

        [Required]
        public int UserProfileID { get; set; }

        [Required]
        [MaxLength(50)]
        public string UserListName { get; set; } = string.Empty;
    }
}
