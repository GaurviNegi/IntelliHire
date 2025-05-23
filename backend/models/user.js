const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Store test attempt details
  testAttempted:{type:Boolean, default:false},
  score:{type : Number , default: 0}, 
  tabViolation : {type:Boolean , default: false}
});

module.exports = mongoose.model("User", UserSchema);
