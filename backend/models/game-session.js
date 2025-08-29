const mongoose = require("mongoose");

const gameSessionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: false,    // optional so init works without auth
    index: true 
  },

  date: { 
    type: String,       // YYYY-MM-DD
    required: true
  },

  category: { 
    type: String, 
    required: true 
  },

  level: {                 // the current level for this session (if you need)
    type: String,
    required: true
  },
 
  wordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DailyWord",
    required: true
  },

  levelReached: { 
    type: Number, 
    default: 0 
  },

  maxAttempts: { 
    type: Number, 
    default: 6 
  },

  // attempts is an array of guesses (strings)
  attempts: { 
    type: [String],     
    default: [] 
  },

  score: { 
    type: Number, 
    default: 0 
  },

  timeTakenSec: { 
    type: Number, 
    default: 0 
  },

  details: [
    {
      level: { type: Number, required: true },
      attemptsForLevel: { type: Number, default: 0 },
      timeForLevel: { type: Number, default: 0 }
    }
  ],

  expiresAt: { type: Date },
  finishedAt: { type: Date },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("GameSession", gameSessionSchema);