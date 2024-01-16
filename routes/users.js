const mongoose = require("mongoose");
const plm = require("passport-local-mongoose")

mongoose.connect("mongodb://localhost/Gmail");

const userSchema =  mongoose.Schema({
  name: String,
  username: {
    type: String,
    unique: true
  },
  password: String,
  email: {
    type: String,
    unique: true
  },
  mobile: String,
  gender: String,

  profilePic: {
    type: String,
    default: "def.jpg"
  },
  
  sentMails: [{
    type : mongoose.Schema.Types.ObjectId,
    ref: "mail"
  }],
  receivedMails: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "mail"
  }]
})

mongoose.plugin(plm);
module.exports = mongoose.model("user",userSchema); 