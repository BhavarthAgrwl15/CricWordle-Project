import express from "express";
import DailyWord from "../models/daily-word.js";
import PuzzleSession from "../models/game-session.js";

const router = express.Router();

// GET /api/categories
router.get("/", async (req, res) => {
  try {
    const categories = await DailyWord.distinct("category");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.post("/init", async (req, res) => {
  try {
    const { category, level } = req.body;

    // 1. Validate input
    if (!category || !level) {
      return res.status(400).json({ error: "category and level are required" });
    }

    // 2. Find today's word
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const dailyWord = await DailyWord.findOne({ date: today, category, level });

    if (!dailyWord) {
      return res.status(404).json({ error: "No word found for this category & level today" });
    }

    // 3. Create puzzle session
    const maxAttempts = 6;
    const expiresAt = new Date();
    expiresAt.setHours(23, 59, 59, 999); // expire at end of day

    const session = new PuzzleSession({
      userId: req.user?._id, // if you have auth middleware
      wordId: dailyWord._id,
      category,
      level,
      maxAttempts,
      attempts: [],
      expiresAt
    });

    await session.save();

    // 4. Send response
    res.json({
      puzzleId: session._id,
      maxAttempts,
      wordLength: dailyWord.word.length,
      expiresAt
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/guess", async (req, res) => {
  try {
    const { puzzleId, guess } = req.body;

    if (!puzzleId || !guess) {
      return res.status(400).json({ message: "puzzleId and guess are required" });
    }

    const puzzle = await DailyWord.findById(puzzleId);
    if (!puzzle) {
      return res.status(404).json({ message: "Puzzle not found" });
    }

    const solution = puzzle.word.toLowerCase();
    const attempt = guess.toLowerCase();

    if (attempt.length !== solution.length) {
      return res.status(400).json({ message: "Guess length mismatch" });
    }

    // feedback generation
    const feedback = Array(solution.length).fill("absent");
    const used = Array(solution.length).fill(false);

    // First pass: mark correct
    for (let i = 0; i < solution.length; i++) {
      if (attempt[i] === solution[i]) {
        feedback[i] = "correct";
        used[i] = true;
      }
    }

    // Second pass: mark present
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

    // update attemptsLeft
    let attemptsLeft = puzzle.attemptsLeft ?? 6;
    attemptsLeft = Math.max(attemptsLeft - 1, 0);

    const solved = feedback.every(f => f === "correct");

    // Optionally persist attemptsLeft if you want in DB
    puzzle.attemptsLeft = attemptsLeft;
    await puzzle.save();

    res.json({ feedback, solved, attemptsLeft });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.post("/finish", async (req, res) => {
  try {
    const { puzzleId, result } = req.body;

    const session = await PuzzleSession.findById(puzzleId);
    if (!session) {
      return res.status(404).json({ error: "Puzzle session not found" });
    }
    if (session.finishedAt) {
      return res.status(400).json({ error: "Puzzle already finished" });
    }

    // Compute score
    let score = 0;
    if (result === "won") {
      score = (6-session.attemptsLeft) * 10; // Example scoring rule(check again!!)
    }

    session.finishedAt = new Date();
    session.score = score;
    await session.save();

    res.json({ success: true, score });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;