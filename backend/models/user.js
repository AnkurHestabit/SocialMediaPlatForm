
  
 const mongoose = require("mongoose");

 const UserSchema = new mongoose.Schema(
   {
    _id:{ type: String, required: true },
     facebookId: { type: String, unique: true, sparse: true }, // Unique for OAuth users
     name: { type: String, required: true },
     email: { type: String, unique: true, sparse: true }, // Allow multiple null values for OAuth users
     password: { type: String }, // Make password optional for OAuth users
     role: {
       type: String,
       enum: ["user", "admin"],
       default: "user",
     },
     token:String,
   },
   { timestamps: true }
 );
 
 const User = mongoose.model("User", UserSchema);
 module.exports = User;
 
 


