import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

/* ---------- Small UI helpers ---------- */
function Tile({ children, state }) {
  const base =
    "h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 grid place-items-center rounded-md font-bold text-xs md:text-sm lg:text-base shrink-0";
  const byState = {
    correct: "bg-green-600 text-white",
    present: "bg-yellow-500 text-black",
    miss: "bg-gray-600 text-white",
  };
  return <div className={`${base} ${byState[state]} shadow-md shadow-black/30`}>{children}</div>;
}

function HowToPlayCard({ title, tiles, text }) {
  return (
    <div className="rounded-xl border border-gray-700/70 bg-white/10 backdrop-blur-xl p-5 text-center">
      {/* One line on desktop; shrink on small to avoid wrap */}
      <div className="flex flex-nowrap justify-center gap-1 mb-3 scale-90 sm:scale-95 md:scale-100">
        {tiles.map(({ ch, state }, i) => (
          <Tile key={i} state={state}>{ch}</Tile>
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

function CategoryMini({ icon, title, desc, to }) {
  return (
    <div className="rounded-xl border border-gray-700/70 bg-white/10 backdrop-blur-xl p-5">
      <div className="flex items-center gap-3">
        <div className="text-xl">{icon}</div>
        <h4 className="text-lg font-semibold text-white">{title}</h4>
      </div>
      <p className="text-sm text-gray-300 mt-2 leading-relaxed">{desc}</p>
      <Link
        to={to}
        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white font-semibold shadow-lg shadow-black/40 transition-transform duration-200 hover:scale-[1.02]"
      >
        Play →
      </Link>
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
  );
}

/* --------------- Page --------------- */
export default function Home() {
  // ⏱️ countdown to next local midnight (no backend)
  const [remaining, setRemaining] = useState("");
  useEffect(() => {
    const nextMidnight = () => { const n = new Date(); n.setHours(24,0,0,0); return n; };
    const tick = () => {
      const ms = +nextMidnight() - Date.now();
      const h = Math.max(0, Math.floor(ms / 3600000));
      const m = Math.max(0, Math.floor((ms % 3600000) / 60000));
      const s = Math.max(0, Math.floor((ms % 60000) / 1000));
      setRemaining(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  // local stats placeholders (until backend)
  const { streak, bestTime, lastPlayed, completedToday, goal, lastCategory } = useMemo(() => {
    const s = localStorage.getItem("cw_streak") || "—";
    const b = localStorage.getItem("cw_best_time") || "—";
    const lp = localStorage.getItem("cw_last_played") || "—";
    const ct = Number(localStorage.getItem("cw_completed_today") || 0);
    const g = Number(localStorage.getItem("cw_daily_goal") || 2);
    const lc = localStorage.getItem("cw_last_category") || "";
    return { streak: s, bestTime: b, lastPlayed: lp, completedToday: ct, goal: g, lastCategory: lc };
  }, []);
  const progress = Math.max(0, Math.min(1, goal ? completedToday / goal : 0));
  const progressWidth = `${Math.round(progress * 100)}%`;

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
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white font-semibold shadow-lg shadow-black/40 transition-all duration-300 transform hover:scale-105"
            >
              Start Playing
            </Link>
            <Link
              to="/leaderboard"
              className="px-6 py-3 rounded-2xl border border-gray-400 text-gray-300 hover:bg-gray-200/10 font-semibold shadow-md shadow-gray-600/30 transition-all duration-300 transform hover:scale-105"
            >
              View Leaderboard
            </Link>
          </div>
        </header>

        {/* HOW TO PLAY — FULL WIDTH */}
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
              ]} // YORKER
              text="Letter is in the word but in a different spot."
            />
            <HowToPlayCard
              title="Miss"
              tiles={[
                { ch: "G", state: "miss" },
                { ch: "O", state: "miss" },
                { ch: "O", state: "miss" },
                { ch: "G", state: "miss" },
                { ch: "L", state: "miss" },
                { ch: "Y", state: "miss" },
              ]} // GOOGLY
              text="Letter is not in the word."
            />
          </div>

          <p className="mt-3 text-xs text-gray-400 text-center">
            Puzzles reset at midnight • One per category per day • Word length varies daily.
          </p>
        </section>

        {/* Main grid BELOW the full-width How-to section */}
        <div className="grid gap-6 lg:grid-cols-3 lg:auto-rows-fr">
          {/* TODAY (spans two rows) */}
          <section className="lg:row-span-2 rounded-2xl border border-gray-700/70 bg-white/10 backdrop-blur-xl p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] flex flex-col">
            <h3 className="text-lg font-semibold text-white">Today at a Glance</h3>
            <ul className="mt-3 text-sm text-gray-300 space-y-2">
              <li className="flex items-center justify-between">
                <span>Your streak</span> <span className="text-gray-100 font-medium">{streak}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Best time</span> <span className="text-gray-100 font-medium">{bestTime}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Last played</span> <span className="text-gray-100 font-medium">{lastPlayed}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Next reset</span> <span className="text-gray-100 font-medium">{remaining}</span>
              </li>
            </ul>

            {/* Daily goal / progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-300 mb-1">
                <span>Daily goal</span>
                <span className="text-gray-100 font-medium">{completedToday}/{goal}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-700/60 overflow-hidden">
                <div className="h-full bg-gray-200" style={{ width: progressWidth }} />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 grid gap-3">
              <Link to="/categories" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white font-semibold shadow-lg shadow-black/40 transition-transform duration-200 hover:scale-[1.02]">
                Play today’s boards →
              </Link>
              {lastCategory && (
                <Link to={`/session/${lastCategory}`} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-500/70 text-gray-200 hover:bg-gray-200/10 font-semibold shadow-md shadow-black/30 transition-transform duration-200 hover:scale-[1.01] capitalize">
                  Resume last session ({lastCategory})
                </Link>
              )}
            </div>

            {/* Quick Tips + cricket-themed starters */}
            <div className="mt-5 rounded-xl border border-gray-700/60 bg-white/5 p-4 flex-1">
              <h4 className="text-sm font-semibold text-gray-200">Quick tips</h4>
              <ul className="mt-2 space-y-1.5 text-sm text-gray-300">
                <li>• Start with a strong opener mixing vowels & common consonants.</li>
                <li>• Use tile feedback—avoid reusing eliminated letters.</li>
                <li>• Mixed is toughest—think players, grounds, shots, slang.</li>
                <li>• Players = usually surnames. Grounds = stadium names.</li>
                <li>• Stuck? Try a vowel-heavy probe word.</li>
                <li>• Keep your streak—even a slower solve beats a miss.</li>
              </ul>
              <div className="mt-3 text-xs text-gray-400">
                Cricket-themed starters to try:&nbsp;
                <span className="text-gray-300">STUMP</span>,&nbsp;
                <span className="text-gray-300">BATON</span>,&nbsp;
                <span className="text-gray-300">FIELD</span> 🏏
              </div>
            </div>
          </section>

          {/* CATEGORIES PREVIEW (also spans two rows to match height) */}
          <section className="lg:col-span-2 lg:row-span-2 h-full flex flex-col rounded-2xl border border-gray-700/70 bg-white/10 backdrop-blur-xl p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
            <h3 className="text-lg font-semibold text-white">Categories</h3>

            {/* Let cards expand to fill vertical space */}
            <div className="mt-3 grid gap-3 sm:grid-cols-2 flex-1">
              <CategoryMini
                icon="⚡"
                title="Terms"
                to="/session/terms"
                desc={
                  "Core cricket lingo: yorker, googly, powerplay, strike-rate. Expect tactics, fielding positions, and rules in textbook spellings."
                }
              />
              <CategoryMini
                icon="⭐"
                title="Players"
                to="/session/players"
                desc={
                  "Legendary surnames and iconic nicknames across eras and formats. Think roles (opener, finisher, all-rounder) and record holders."
                }
              />
              <CategoryMini
                icon="🏟️"
                title="Grounds"
                to="/session/grounds"
                desc={
                  "Stadiums and venues worldwide—Lord’s, MCG, Eden Gardens. City clues help, but crisp spelling wins the day."
                }
              />
              <CategoryMini
                icon="🎯"
                title="Mixed"
                to="/session/mixed"
                desc={
                  "Anything cricket: shots, trophies, kit, slang, tournaments. The toughest pool—bring broad cricket IQ and steady nerves."
                }
              />
            </div>

            {/* Bottom CTA to balance spacing */}
            <Link
              to="/categories"
              className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white font-semibold shadow-lg shadow-black/40 transition-transform duration-200 hover:scale-[1.02]"
            >
              Choose a category →
            </Link>
          </section>
        </div>

        {/* FAQ (above reviews) */}
        <section className="mt-8 rounded-2xl border border-gray-700/70 bg-white/10 backdrop-blur-xl p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
          <h3 className="text-lg font-semibold text-white mb-3">FAQ</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <FAQItem q="Do all categories reset daily?" a="Yes. Each category has one puzzle per day." />
            <FAQItem q="Is the word length fixed?" a="No — it varies by the daily word selected by the backend." />
            <FAQItem q="How are ranks decided?" a="By fastest correct solve; tie-breaker is fewer guesses." />
            <FAQItem q="Can I play missed days?" a="No. Streaks continue only on consecutive days." />
          </div>
        </section>

        {/* Reviews */}
        <section className="mt-8 rounded-2xl border border-gray-700/70 bg-white/5 backdrop-blur p-5">
          <h3 className="text-lg font-semibold text-white mb-3">Player Reviews</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <ReviewCard name="Ayaan" text="Daily categories are 🔥 — Mixed is tough but addictive!" />
            <ReviewCard name="Meera" text="Clean UI. Tiles feel satisfying. Streak mechanic keeps me coming back." />
            <ReviewCard name="Ravi"  text="Leaderboard by time adds real pressure. Grounds category is my fav." />
          </div>
        </section>

        {/* Footer quick highlights */}
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
