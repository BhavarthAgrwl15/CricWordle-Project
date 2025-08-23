const mongoose = require("mongoose");

const dailyWordSchema = new mongoose.Schema({
  date: { type: String, required: true }, // format: YYYY-MM-DD
  category: { type: String, required: true, enum: ["cricket", "fruits", "animals", "general"] },
  level: { type: Number, required: true, enum: [1, 2, 3] }, // 1 => 3-letter, etc.
  answer: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Compound index for fast lookup
dailyWordSchema.index({ date: 1, category: 1, level: 1 }, { unique: true });

module.exports = mongoose.model("DailyWord", dailyWordSchema)