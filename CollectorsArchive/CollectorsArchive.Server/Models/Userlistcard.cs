using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CollectorsArchive.Server.Models
{
    [Table("UserListCard")]
    public class UserListCard
    {
        [Key]
        public int ListCardID { get; set; }

        [Required]
        public int UserListID { get; set; }

        [Required]
        public int CardID { get; set; }

        [Required]
        public int GameID { get; set; }
    }
}
