// src/pages/CategoriesPage.jsx
import React, { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ScoreboardCard from "../pages/scoreboard";
import { fetchCategories } from "../services/game-api";
import { AuthContext } from "../contexts/auth-context";
import { useGame } from "../contexts/game-context";

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

/**
 * chunkArray(arr, size) -> splits arr into arrays of length `size` (last chunk may be smaller)
 */
function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export default function CategoriesPage() {
  const { user } = useContext(AuthContext);
  const { profile } = useGame();
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [starting, setStarting] = useState(false);
  const navigate = useNavigate();

  // Fetch categories on mount
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

  // Prepare display cards
  const displayCards = useMemo(() => {
    return cats.map((raw, i) => {
      const key = String(raw).trim();
      const title = prettyTitle(key);
      const accent = accents[i % accents.length];
      const emoji = emojis[i % emojis.length];

      const stats = {
        length: ["3–5", "4–6", "5–7", "4–8"][i % 4],
        guesses: "6",
        bonus: ["+1/day", "+2/day", "+3/week", "+1/day"][i % 4],
      };

      const desc = `${title} — take on themed words & climb the daily leaderboard.`;

      return { key, title, emoji, desc, accent, stats, category: key, level: "1" };
    });
  }, [cats]);

  // decide columns:
  // - exactly 4 cards => 2 columns
  // - >=5 cards => 3 columns
  // - otherwise fallback to min(3, count)
  const columns = useMemo(() => {
    if (displayCards.length === 4) return 2;
    if (displayCards.length >= 5) return 3;
    return Math.min(3, Math.max(1, displayCards.length));
  }, [displayCards.length]);

  // chunk into rows of size `columns`
  const rows = useMemo(() => chunkArray(displayCards, columns), [displayCards, columns]);

  // Handler when a category is clicked
  const handlePlay = (category) => {
    if (!category) return alert("Invalid category");

    setStarting(true);
    try {
      const today = new Date().toISOString().slice(0, 10);

      // find past sessions of this category
      const sessionsInCat = profile?.recentSessions?.filter((s) => s.category === category) || [];

      // compute next level
      const maxLevel = sessionsInCat.length ? Math.max(...sessionsInCat.map((s) => Number(s.level) || 0)) : 0;
      const nextLevel = maxLevel + 1;

      const initPayload = {
        userId: user?.id,
        category,
        level: String(nextLevel),
        date: today,
      };

      // navigate to start; Start.jsx will call gameInit
      navigate("/start", { state: { initPayload } });
    } catch (err) {
      console.error("navigate/start error:", err);
      alert(err?.msg || err?.message || "Could not open start screen");
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

        {loading && (
          <div className="grid place-items-center py-14 text-gray-400">Loading categories…</div>
        )}

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
              <div className="space-y-7">
                {/* Render each row. Full rows use a grid; partial final row is centered */}
                {rows.map((row, rowIndex) => {
                  const isFull = row.length === columns;
                  // grid style for full rows (responsive)
                  if (isFull) {
                    // build responsive columns: 1 column on small, columns on md+
                    const mdCols = `repeat(${columns}, minmax(0, 1fr))`;
                    return (
                      <div
                        key={rowIndex}
                        className="w-full"
                        style={{
                          display: "grid",
                          gap: "1.75rem", // close to gap-7
                          gridTemplateColumns: `repeat(1, minmax(0,1fr))`,
                        }}
                      >
                        {/* use CSS media query via style attribute for md+ to avoid Tailwind class complications */}
                        <div
                          style={{
                            display: "grid",
                            gap: "1.75rem",
                            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                          }}
                        >
                          {row.map((c) => (
                            <div key={c.key} className="w-full">
                              <ScoreboardCard
                                i={0}
                                title={c.title}
                                emoji={c.emoji}
                                desc={c.desc}
                                accent={c.accent}
                                stats={c.stats}
                                category={c.category}
                                length={c.level}
                                onPlay={handlePlay}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  } else {
                    // partial row -> center items
                    return (
                      <div key={rowIndex} className="w-full flex justify-center gap-7 px-4">
                        {row.map((c) => (
                          <div key={c.key} className="w-full max-w-[360px]">
                            <ScoreboardCard
                              i={0}
                              title={c.title}
                              emoji={c.emoji}
                              desc={c.desc}
                              accent={c.accent}
                              stats={c.stats}
                              category={c.category}
                              length={c.level}
                              onPlay={handlePlay}
                            />
                          </div>
                        ))}
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </>
        )}

        {starting && <div className="text-center mt-6 text-sm text-gray-200">Starting puzzle…</div>}

        <div className="text-center text-[11px] text-gray-400 mt-8">Tip: come back daily — words rotate every day.</div>
      </div>
    </div>
  );
}
