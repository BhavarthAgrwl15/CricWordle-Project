import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScoreboardCard from "../pages/scoreboard";
import { fetchCategories, gameInit } from "../services/game-api";

const accents = [
  { text: "text-amber-300", border: "border-amber-500/50", glow: "shadow-[0_10px_30px_-10px_rgba(251,191,36,0.35)]" },
  { text: "text-rose-300", border: "border-rose-500/50", glow: "shadow-[0_10px_30px_-10px_rgba(244,63,94,0.35)]" },
  { text: "text-cyan-300", border: "border-cyan-500/50", glow: "shadow-[0_10px_30px_-10px_rgba(34,211,238,0.35)]" },
  { text: "text-indigo-300", border: "border-indigo-500/50", glow: "shadow-[0_10px_30px_-10px_rgba(99,102,241,0.35)]" },
  { text: "text-emerald-300", border: "border-emerald-500/50", glow: "shadow-[0_10px_30px_-10px_rgba(16,185,129,0.35)]" },
  { text: "text-fuchsia-300", border: "border-fuchsia-500/50", glow: "shadow-[0_10px_30px_-10px_rgba(217,70,239,0.35)]" },
];

const emojis = ["🏏", "⭐", "🏟️", "⚡", "🎯", "🔥", "🧩", "🛡️", "🚀", "🎮"];

function prettyTitle(s = "") {
  return s.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim().toUpperCase();
}

export default function CategoriesPage() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [starting, setStarting] = useState(false); // optional: show loader when creating puzzle
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchCategories();
        if (mounted) setCats(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setErr(e?.message || "Failed to load categories");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const displayCards = useMemo(() => {
    return cats.map((raw, i) => {
      const key = String(raw).trim();
      const title = prettyTitle(key);
      const accent = accents[i % accents.length];
      const emoji = emojis[i % emojis.length];
      console.log(key, title);

      const stats = {
        length: ["3–5", "4–6", "5–7", "4–8"][i % 4],
        guesses: "6",
        bonus: ["+1/day", "+2/day", "+3/week", "+1/day"][i % 4],
      };

      const desc = `${title} — take on themed words & climb the daily leaderboard.`;

      return { key, title, emoji, desc, accent, stats, category: key };
    });
  }, [cats]);

  // Handler is in parent — receives clicked category
  const handlePlay = async (category) => {
    if (!category) {
      alert("Invalid category");
      return;
    }

    try {
      setStarting(true);
      console.log("Starting puzzle for category:", category);
      // call backend to create puzzle/session
      const puzzle = await gameInit({ category, level: "1" , date: "2025-08-25"});
      // navigate to /play and pass state (puzzle info + category)
      navigate("/play", { state: { puzzle, category, level: "1" } });
    } catch (err) {
      console.error("gameInit error:", err);
      alert(err?.msg || err?.message || "Could not start puzzle");
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen w-full text-gray-100 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-4xl select-none">🏏</div>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-white">Choose Your Category</h1>
          <p className="text-sm md:text-base text-gray-400 mt-2">Pick a theme and start the daily puzzle.</p>
        </div>

        {loading && <div className="grid place-items-center py-14 text-gray-400">Loading categories…</div>}

        {!loading && err && (
          <div className="grid place-items-center py-10">
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{err}</div>
          </div>
        )}

        {!loading && !err && (
          <>
            {displayCards.length === 0 ? (
              <div className="grid place-items-center py-14 text-gray-400">No categories available right now.</div>
            ) : (
              <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                {displayCards.map((c, i) => (
                  <ScoreboardCard
                    key={c.key}
                    i={i}
                    title={c.title}
                    emoji={c.emoji}
                    desc={c.desc}
                    accent={c.accent}
                    stats={c.stats}
                    category={c.category}
                    onPlay={handlePlay} // PASS parent handler
                  />
                ))}
              </div>
            )}
          </>
        )}

        {starting && (
          <div className="text-center mt-6 text-sm text-gray-200">Starting puzzle…</div>
        )}

        <div className="text-center text-[11px] text-gray-400 mt-8">Tip: come back daily — words rotate every day.</div>
      </div>
    </div>
  );
}