import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useGame } from "../contexts/game-context";

/* ---------- Small UI helpers ---------- */
function Tile({ children, state }) {
  const base =
    "h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 grid place-items-center rounded-md font-bold text-xs md:text-sm lg:text-base shrink-0";
  const byState = {
    correct: "bg-green-600 text-white",
    present: "bg-yellow-500 text-black",
    miss: "bg-gray-600 text-white",
    incorrect:"bg-red-500 text-black"
  };
  return <div className={`${base} ${byState[state]} shadow-md shadow-black/30`}>{children}</div>;
}

function HowToPlayCard({ title, tiles, text }) {
  return (
    <div className="rounded-xl border border-gray-700/70 bg-white/10 backdrop-blur-xl p-5 text-center">
      {/* One line on desktop; shrink on small to avoid wrap */}
      <div className="flex flex-nowrap justify-center gap-1 mb-3 scale-90 sm:scale-95 md:scale-100">
        {tiles.map(({ ch, state }, i) => (
          <Tile key={i} state={state}>
            {ch}
          </Tile>
        ))}
      </div>
      <div className="text-sm text-gray-300">
        <span className="font-medium text-gray-100">{title}</span> — {text}
      </div>
    </div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-gray-700/60 bg-white/5">
      <button
        onClick={() => setOpen((s) => !s)}
        className="w-full text-left px-4 py-3 flex items-center justify-between"
      >
        <span className="text-sm text-gray-200">{q}</span>
        <span className="text-gray-400 text-xs">{open ? "–" : "+"}</span>
      </button>
      {open && <p className="px-4 pb-4 text-sm text-gray-400">{a}</p>}
    </div>
  );
}

function ReviewCard({ name, text }) {
  return (
    <div className="rounded-xl border border-gray-700/70 bg-white/10 p-4">
      <div className="flex items-center gap-2 text-yellow-400 text-sm">★★★★★</div>
      <p className="text-sm text-gray-300 mt-2">{text}</p>
      <div className="mt-2 text-xs text-gray-400">— {name}</div>
    </div>
  )
}

/* ---------- Small utility component: stat card ---------- */
function StatCard({ label, value, subtitle, accent = "from-gray-800 to-gray-700" }) {
  return (
    <div className="rounded-xl border border-gray-700/70 bg-gradient-to-r p-4 shadow-md from-black/30 to-black/10">
      <div className="text-xs text-gray-400 uppercase tracking-wide">{label}</div>
      <div className="mt-2 flex items-baseline gap-3">
        <div className="text-2xl font-bold text-white">{value}</div>
        {subtitle && <div className="text-sm text-gray-300">{subtitle}</div>}
      </div>
    </div>
  );
}

/* --------------- Page --------------- */
export default function Home() {
  const { profile } = useGame();

  // countdown to next local midnight
  const [remaining, setRemaining] = useState("");
  useEffect(() => {
    const nextMidnight = () => {
      const n = new Date();
      n.setHours(24, 0, 0, 0);
      return n;
    };
    const tick = () => {
      const ms = +nextMidnight() - Date.now();
      const h = Math.max(0, Math.floor(ms / 3600000));
      const m = Math.max(0, Math.floor((ms % 3600000) / 60000));
      const s = Math.max(0, Math.floor((ms % 60000) / 1000));
      setRemaining(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Compute streak from profile.recentSessions
  const streakCount = useMemo(() => {
    if (!profile?.recentSessions?.length) return 0;
    const dates = [
      ...new Set(profile.recentSessions.map((s) => (s.date ? s.date : s.createdAt ? s.createdAt : null))),
    ]
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a));
    let streak = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < dates.length; i++) {
      const d = new Date(dates[i]);
      d.setHours(0, 0, 0, 0);
      if (d.getTime() === today.getTime()) {
        streak++;
        today.setDate(today.getDate() - 1);
      } else if (d.getTime() === today.getTime() - 24 * 60 * 60 * 1000) {
        streak++;
        today.setDate(today.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [profile]);

  // lastPlayed computed from profile.recentSessions
  const lastPlayedFromProfile = useMemo(() => {
    if (!profile?.recentSessions?.length) return "—";
    const parsedDates = profile.recentSessions
      .map((s) => s.date || s.createdAt || null)
      .filter(Boolean)
      .map((d) => new Date(d));
    if (!parsedDates.length) return "—";
    const latest = parsedDates.sort((a, b) => b - a)[0];
    return latest.toLocaleDateString();
  }, [profile]);

  // maxScore across recentSessions
  const maxScore = useMemo(() => {
    if (!profile?.recentSessions?.length) return 0;
    const scores = profile.recentSessions.map((s) => (typeof s.score === "number" ? s.score : 0));
    return scores.length ? Math.max(...scores) : 0;
  }, [profile]);

  // recent sessions list (sorted newest first)
  const recentSessionsSorted = useMemo(() => {
    if (!profile?.recentSessions?.length) return [];
    return [...profile.recentSessions]
      .map((s) => ({
        date: s.date || s.createdAt || null,
        score: typeof s.score === "number" ? s.score : 0,
        category: s.category || s.sessionCategory || "—",
        level: s.level || s.levelReached || "—",
        raw: s,
      }))
      .filter((s) => s.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [profile]);

return (
  <div className="min-h-screen w-full text-gray-100 px-6 py-10">
    <div className="max-w-6xl mx-auto">
      {/* Hero */}
      <header className="text-center mb-10">
        <div className="text-4xl">🏏</div>
        <h1 className="mt-2 text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-gray-200 to-white bg-clip-text text-transparent drop-shadow-lg">
          Welcome to Cricket Wordle
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mt-3">
          Guess the daily cricket word, keep your streak, and top the leaderboard.
        </p>

        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <Link
            to="/categories"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold shadow-lg shadow-black/40 transition-all duration-300 transform hover:scale-105"
          >
            Play Now
          </Link>
          <Link
            to="/leaderboard"
            className="px-6 py-3 rounded-2xl border border-gray-400 text-gray-300 hover:bg-gray-200/10 font-semibold shadow-md shadow-gray-600/30 transition-all duration-300 transform hover:scale-105"
          >
            View Leaderboard
          </Link>
        </div>
      </header>

      {/* HOW TO PLAY */}
      <section className="rounded-2xl border border-gray-700/70 bg-white/10 backdrop-blur-xl p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] mb-6">
        <h3 className="text-lg font-semibold text-white text-center">How to Play</h3>
        <p className="text-sm text-gray-300 mt-1 text-center">
          You have <span className="font-medium text-gray-100">6 guesses</span>. Tiles show progress:
        </p>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
          <HowToPlayCard
            title="Correct"
            tiles={[
              { ch: "S", state: "miss" },
              { ch: "T", state: "miss" },
              { ch: "U", state: "correct" },
              { ch: "M", state: "miss" },
              { ch: "P", state: "miss" },
            ]}
            text="Letter is in the word and in the correct spot."
          />
          <HowToPlayCard
            title="Present"
            tiles={[
              { ch: "Y", state: "miss" },
              { ch: "O", state: "present" },
              { ch: "R", state: "miss" },
              { ch: "K", state: "miss" },
              { ch: "E", state: "miss" },
              { ch: "R", state: "miss" },
            ]}
            text="Letter is in the word but in a different spot."
          />
          <HowToPlayCard
            title="Miss"
            tiles={[
              { ch: "G", state: "miss" },
              { ch: "O", state: "incorrect" },
              { ch: "O", state: "miss" },
              { ch: "G", state: "miss" },
              { ch: "L", state: "miss" },
              { ch: "Y", state: "miss" },
            ]}
            text="Letter is not in the word."
          />
        </div>

        <p className="mt-3 text-xs text-gray-400 text-center">
          Puzzles reset at midnight • One per category per day • Word length varies daily.
        </p>
      </section>

      {/* Main layout: Stats | Quick Tips | FAQ  — equal height boxes */}
      <div className="grid gap-6 lg:grid-cols-3 lg:auto-rows-fr items-stretch">
        {/* Left: Today at a Glance */}
        <section className="rounded-2xl border border-gray-700/70 bg-white/10 backdrop-blur-xl p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] flex flex-col h-full">
          <h3 className="text-lg font-semibold text-white">Today at a Glance</h3>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <StatCard label="Streak" value={streakCount} subtitle="consecutive days" />
            <StatCard label="Top Score" value={maxScore} subtitle="best recent" />
          </div>

          <ul className="mt-5 text-sm text-gray-300 space-y-2">
            <li className="flex items-center justify-between">
              <span>Last played</span>
              <span className="text-gray-100 font-medium">{lastPlayedFromProfile}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Next reset</span>
              <span className="text-gray-100 font-medium">{remaining}</span>
            </li>
          </ul>

          {/* Actions */}
          <div className="mt-5 grid gap-3">
            <Link
              to="/play"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold shadow-lg transition-transform hover:scale-[1.02]"
            >
              Continue Playing →
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-500/70 text-gray-200 hover:bg-gray-200/10 font-semibold shadow-md"
            >
              View Profile
            </Link>
          </div>

          {/* push footer to bottom if needed */}
          <div className="mt-auto" />
        </section>

        {/* Middle: Quick Tips (new column) */}
        <section className="rounded-2xl border border-gray-700/70 bg-white/10 backdrop-blur-xl p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] flex flex-col h-full">
          <h3 className="text-lg font-semibold text-white">Quick Tips</h3>

          <div className="mt-4 space-y-3 text-sm text-gray-300">
            <div className="rounded-md bg-gray-800/60 p-3">
              <p className="font-medium text-gray-100">Smart openers</p>
              <p className="text-xs text-gray-400 mt-1">Start with words that mix vowels and common consonants to reveal structure quickly.</p>
            </div>

            <div className="rounded-md bg-gray-800/60 p-3">
              <p className="font-medium text-gray-100">Use feedback</p>
              <p className="text-xs text-gray-400 mt-1">Lock in confirmed letters and avoid reusing eliminated ones.</p>
            </div>

            <div className="rounded-md bg-gray-800/60 p-3">
              <p className="font-medium text-gray-100">Cricket categories</p>
              <p className="text-xs text-gray-400 mt-1">Think players (surnames), grounds, shots and cricket terms when stuck.</p>
            </div>

            <div className="rounded-md bg-gray-800/60 p-3">
              <p className="font-medium text-gray-100">Pacing</p>
              <p className="text-xs text-gray-400 mt-1">Take your time — maintaining the streak matters more than a single fast solve.</p>
            </div>
          </div>

          <div className="mt-auto" />
        </section>

        {/* Right: FAQ */}
        <section className="rounded-2xl border border-gray-700/70 bg-white/10 backdrop-blur-xl p-6 shadow-md flex flex-col h-full">
          <h3 className="text-lg font-semibold text-white mb-3">FAQ</h3>
          <div className="grid gap-3">
            <FAQItem q="Do all categories reset daily?" a="Yes. Each category has one puzzle per day." />
            <FAQItem q="Is the word length fixed?" a="No — it varies by the daily word selected by the backend." />
            <FAQItem q="How are ranks decided?" a="By fastest correct solve; tie-breaker is fewer guesses." />
            <FAQItem q="Can I play missed days?" a="No. Streaks continue only on consecutive days." />
          </div>

          <div className="mt-auto" />
        </section>
      </div>

      {/* Reviews */}
      <section className="mt-8 rounded-2xl border border-gray-700/70 bg-white/5 backdrop-blur p-5">
        <h3 className="text-lg font-semibold text-white mb-3">Player Reviews</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <ReviewCard name="Ayaan" text="Daily categories are 🔥 — Mixed is tough but addictive!" />
          <ReviewCard name="Meera" text="Clean UI. Tiles feel satisfying. Streak mechanic keeps me coming back." />
          <ReviewCard name="Ravi" text="Leaderboard by time adds real pressure. Grounds category is my fav." />
        </div>
      </section>

      {/* Footer */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
        <span className="flex items-center gap-2">⚡ Daily Challenges</span>
        <span className="flex items-center gap-2">🏆 Achievements</span>
        <span className="flex items-center gap-2">📊 Leaderboard</span>
        <span className="flex items-center gap-2">🛡️ Safe & Fair</span>
      </div>
    </div>
  </div>
);


}
