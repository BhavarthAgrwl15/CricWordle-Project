const express = require("express");
const DailyWord = require("../models/daily-word");
const PuzzleSession = require("../models/game-session");

const router = express.Router();

// ✅ Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await DailyWord.distinct("category");
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// ✅ Initialize puzzle session
router.post("/init", async (req, res) => {
  try {
    const { category, level } = req.body;

    if (!category || !level) {
      return res.status(400).json({ msg: "category and level are required" });
    }

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const dailyWord = await DailyWord.findOne({ date: today, category, level });

    if (!dailyWord) {
      return res.status(404).json({ msg: "No word found for this category & level today" });
    }

    const maxAttempts = 6;
    const expiresAt = new Date();
    expiresAt.setHours(23, 59, 59, 999);

    const session = new PuzzleSession({
      userId: req.user?._id, // attach req.user via auth middleware
      wordId: dailyWord._id,
      category,
      level,
      maxAttempts,
      attempts: [],
      expiresAt
    });

    await session.save();

    res.json({
      puzzleId: session._id,
      maxAttempts,
      wordLength: dailyWord.word.length,
      expiresAt
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// ✅ Guess route
router.post("/guess", async (req, res) => {
  try {
    const { puzzleId, guess } = req.body;

    if (!puzzleId || !guess) {
      return res.status(400).json({ msg: "puzzleId and guess are required" });
    }

    const puzzle = await DailyWord.findById(puzzleId);
    if (!puzzle) {
      return res.status(404).json({ msg: "Puzzle not found" });
    }

    const solution = puzzle.word.toLowerCase();
    const attempt = guess.toLowerCase();

    if (attempt.length !== solution.length) {
      return res.status(400).json({ msg: "Guess length mismatch" });
    }

    const feedback = Array(solution.length).fill("absent");
    const used = Array(solution.length).fill(false);

    // Mark correct
    for (let i = 0; i < solution.length; i++) {
      if (attempt[i] === solution[i]) {
        feedback[i] = "correct";
        used[i] = true;
      }
    }

    // Mark present
    for (let i = 0; i < solution.length; i++) {
      if (feedback[i] === "correct") continue;
      for (let j = 0; j < solution.length; j++) {
        if (!used[j] && attempt[i] === solution[j]) {
          feedback[i] = "present";
          used[j] = true;
          break;
        }
      }
    }

    let attemptsLeft = puzzle.attemptsLeft ?? 6;
    attemptsLeft = Math.max(attemptsLeft - 1, 0);

    const solved = feedback.every(f => f === "correct");

    puzzle.attemptsLeft = attemptsLeft;
    await puzzle.save();

    res.json({ feedback, solved, attemptsLeft });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// ✅ Finish puzzle
router.post("/finish", async (req, res) => {
  try {
    const { puzzleId, result } = req.body;

    const session = await PuzzleSession.findById(puzzleId);
    if (!session) {
      return res.status(404).json({ msg: "Puzzle session not found" });
    }
    if (session.finishedAt) {
      return res.status(400).json({ msg: "Puzzle already finished" });
    }

    let score = 0;
    if (result === "won") {
      score = (6 - session.attemptsLeft) * 10; // scoring logic
    }

    session.finishedAt = new Date();
    session.score = score;
    await session.save();

    res.json({ success: true, score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

module.exports = router;
