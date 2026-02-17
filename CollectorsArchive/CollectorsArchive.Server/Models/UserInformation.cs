using System;
using System.Collections.Generic;
using System.Text;

namespace CollectorsArchive.Server.Models
{
    // Models/User.cs this file is for the user model, which will be used to store user information in the database. It will also be used to authenticate users when they log in. The password field will be used to store the user's password, but for google authentication,
    // I will store the sub (subject) field from the google token in this field instead of a password.
    public class UserInformation
    {
        public int UserId { get; set; }// database id
        public string Email { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
    }

}
