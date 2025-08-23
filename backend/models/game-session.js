const mongoose = require("mongoose");

const gameSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  category: { type: String, required: true },
  levelReached: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  timeTakenSec: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
  details: [
    {
      level: { type: Number, required: true },
      attemptsForLevel: { type: Number, default: 0 },
      timeForLevel: { type: Number, default: 0 }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("GameSession", gameSessionSchema);