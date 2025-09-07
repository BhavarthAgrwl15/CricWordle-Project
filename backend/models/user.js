const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  username: { type: String, required: true, trim: true },
  
  isAdmin: { type: Boolean, default: false }
});

module.exports = mongoose.model("User", userSchema);