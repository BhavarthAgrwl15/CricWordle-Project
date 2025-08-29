const express = require("express");
const DailyWord = require("../models/daily-word");
const GameSession = require("../models/game-session");
const authMiddleware = require("../middleware/auth"); // import

const router = express.Router();

// ✅ Get all categories (public)
router.get("/", async (req, res) => {
  try {
    const categories = await DailyWord.distinct("category");
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// ✅ Initialize puzzle session (protected)
router.post("/init", authMiddleware, async (req, res) => {
  try {
    const { category, level, date } = req.body;
    const userId = req.user._id;

    if (!category || !level) {
      return res.status(400).json({ msg: "category and level are required" });
    }

    const day = date ? String(date).slice(0, 10) : new Date().toISOString().slice(0, 10);

    // fetch DailyWord
    const dailyWord = await DailyWord.findOne({ date: day, category, level });
    if (!dailyWord) return res.status(404).json({ msg: "No word found" });

    const maxAttempts = 6;
    const expiresAt = new Date();
    expiresAt.setHours(23, 59, 59, 999);

    const session = new GameSession({
      userId,
      date: day,
      category,
      level: String(level),
      wordId: dailyWord._id,
      maxAttempts,
      attempts: [],
      expiresAt
    });

    await session.save();

    const wordLength = dailyWord.word.length;

    // ✅ send maxScore from dailyWord.points
    res.json({
      puzzleId: session._id,
      maxAttempts,
      wordLength,
      expiresAt,
      maxScore: dailyWord.points   // new field
    });
  } catch (err) {
    console.error("puzzle.init err:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
});


// ✅ Guess route (protected)
router.post("/guess", authMiddleware, async (req, res) => {
  try {
    const { puzzleId, guess } = req.body;
    const userId = req.user._id;

    if (!puzzleId || !guess) return res.status(400).json({ msg: "puzzleId and guess are required" });

    const session = await GameSession.findById(puzzleId).populate("wordId");
    if (!session) return res.status(404).json({ msg: "Puzzle session not found" });

    if (session.userId.toString() !== userId.toString()) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    if (session.finishedAt) return res.status(400).json({ msg: "Puzzle already finished" });

    const solution = (session.wordId.answer || session.wordId.word).toLowerCase();
    const attempt = guess.toLowerCase();

    if (attempt.length !== solution.length) return res.status(400).json({ msg: "Guess length mismatch" });

    const feedback = Array(solution.length).fill("absent");
    const used = Array(solution.length).fill(false);

    for (let i = 0; i < solution.length; i++) {
      if (attempt[i] === solution[i]) { feedback[i] = "correct"; used[i] = true; }
    }
    for (let i = 0; i < solution.length; i++) {
      if (feedback[i] === "correct") continue;
      for (let j = 0; j < solution.length; j++) {
        if (!used[j] && attempt[i] === solution[j]) { feedback[i] = "present"; used[j] = true; break; }
      }
    }

    session.attempts.push(guess);
    await session.save();

    const attemptsLeft = session.maxAttempts - session.attempts.length;
    const solved = feedback.every(f => f === "correct");

    res.json({ feedback, solved, attemptsLeft: Math.max(attemptsLeft, 0) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// ✅ Finish puzzle route (protected)
router.post("/finish", authMiddleware, async (req, res) => {
  try {
    const { puzzleId, score } = req.body;   // ✅ frontend sends achieved score
    const userId = req.user._id;

    if (!puzzleId) return res.status(400).json({ msg: "puzzleId is required" });

    const session = await GameSession.findById(puzzleId).populate("wordId");
    if (!session) return res.status(404).json({ msg: "Puzzle session not found" });

    if (session.userId.toString() !== userId.toString()) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    if (session.finishedAt) return res.status(400).json({ msg: "Puzzle already finished" });

    // ✅ store score provided by frontend
    session.finishedAt = new Date();
    session.score = Number(score) || 0;
    await session.save();

    res.json({ success: true, score: session.score, maxScore: session.wordId.points });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

module.exports = router;