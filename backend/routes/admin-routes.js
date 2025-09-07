// routes/daily-words.js
const express = require("express");
const router = express.Router();
const DailyWord = require("../models/daily-word");

// -----------------------------
// GET all unique categories
// -----------------------------
router.get("/categories", async (req, res) => {
  try {
    const categories = await DailyWord.distinct("category");
    res.json({ categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// -----------------------------
// DELETE all words of a category
// -----------------------------
router.delete("/category/:category", async (req, res) => {
  try {
    const category = String(req.params.category).toLowerCase().trim();
    const result = await DailyWord.deleteMany({ category });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete category", details: err.message });
  }
});
router.get("/category/:category/words", async (req, res) => {
  try {
    const category = String(req.params.category).toLowerCase().trim();
    const words = await DailyWord.find({ category }).sort({ date: 1, level: 1 });
    res.json({ category, words });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch words", details: err.message });
  }
});
// -----------------------------
// SEED (existing functionality)
// -----------------------------
router.post("/seed", async (req, res) => {
  try {
    const wordSets = req.body;
    if (!Array.isArray(wordSets)) {
      return res.status(400).json({ error: "Body must be an array" });
    }

    const docs = wordSets
      .map(set => {
        const { date, category, level, word, points } = set;
        if (!date || !category || !level || !word || points == null) return null;

        return {
          date: String(date).trim(),
          category: String(category).toLowerCase().trim(),
          level: String(level).trim(),
          points: Number(points),
          word: String(word).toLowerCase().trim(),
        };
      })
      .filter(Boolean);

    if (docs.length === 0) {
      return res.status(400).json({ error: "No valid word entries provided" });
    }

    const result = await DailyWord.insertMany(docs, { ordered: false });
    res.json({ success: true, inserted: result.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Seed error", details: err.message });
  }
});

module.exports = router;
