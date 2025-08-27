const express = require("express");
const router = express.Router();
const GameSession = require("../models/game-session");
const User = require("../models/user");
const authMiddleware = require("../middleware/auth");

// Leaderboard route (public)
router.get("/leaderboard", async (req, res) => {
  try {
    const { date, category, limit = 10 } = req.body;
    if (!date) return res.status(400).json({ error: "date query param is required" });

    const filter = { date };
    if (category) filter.category = category;

    const results = await GameSession.find(filter)
      .populate("userId", "name email")  // get user name/email
      .sort({ score: -1 })
      .limit(parseInt(limit))
      .select("category levelReached userId attempts score"); // 👈 only pull needed fields

    const response = results.map(item => ({
      userId: item.userId?._id || null,
      user: item.userId?.name || "Anonymous",
      category: item.category,
      attempts: item.attempts,
      score: item.score,
      levelReached: item.levelReached,
    }));

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// Profile route (protected)
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = req.user; // already fetched in middleware

    const sessions = await GameSession.find({ userId: user._id })
      .sort({ date: -1 })
      .limit(7);

    res.json({ user, recentSessions: sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;