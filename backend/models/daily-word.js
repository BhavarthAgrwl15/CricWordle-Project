const mongoose = require("mongoose");

const DailyWordSchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD
    required: true,
    index: true,
  },
  category: {
    type: String, // cricket, fruits, animals, etc.
    required: true,
    trim: true,
    lowercase: true,
  },
  level: {
    type: String, // can be "1", "2", "easy", "hard"
    required: true,
    trim: true,
  },
  word: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ensure uniqueness for each date+category+level
DailyWordSchema.index({ date: 1, category: 1, level: 1 }, { unique: true });

module.exports = mongoose.model("DailyWord", DailyWordSchema);
