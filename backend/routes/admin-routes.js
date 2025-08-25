const express = require("express");
const router = express.Router();
const DailyWord = require("../models/daily-word");

// POST /api/daily-words/seed
router.post("/seed", async (req, res) => {
  try {
    const wordSets = req.body;
    if (!Array.isArray(wordSets)) {
      return res.status(400).json({ error: "Body must be an array" });
    }

    const docs = wordSets
      .map(set => {
        const { date, category, level, word } = set;
        if (!date || !category || !level || !word) return null;

        return {
          date: String(date).trim(),
          category: String(category).toLowerCase().trim(),
          level: String(level).trim(),
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
