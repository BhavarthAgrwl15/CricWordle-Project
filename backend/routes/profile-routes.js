// routes/leaderboardRoutes.js
const express = require("express");
const router = express.Router();
const GameSession = require("../models/GameSession");

// GET /api/leaderboard?date=YYYY-MM-DD&category=&limit=10
router.get("/", async (req, res) => {
  try {
    const { date, category, limit = 10 } = req.query;

    if (!date) {
      return res.status(400).json({ error: "date query param is required" });
    }

    // Build filter
    const filter = { date };
    if (category) filter.category = category;

    // Query GameSession
    const results = await GameSession.find(filter)
      .populate("userId", "name email") // fetch user details from User collection
      .sort({ score: -1 }) // highest score first
      .limit(parseInt(limit));

    // Format response
    const response = results.map(item => ({
      user: item.userId ? item.userId.name : "Anonymous",
      score: item.score,
      levelReached: item.levelReached,
    }));

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// GET /api/profile/me
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // current logged in user (set in authMiddleware)
    const user = await User.findById(req.user.id).select("name email createdAt");

    if (!user) return res.status(404).json({ error: "User not found" });

    // fetch last 5 sessions (most recent)
    const sessions = await GameSession.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(7);

    res.json({ user, recentSessions: sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;