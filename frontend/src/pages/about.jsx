// src/pages/About.jsx
import React from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/logo.png"; // ✅ update path if needed

/* ---------- Reusable bits ---------- */
function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-gray-700/70 bg-white/10 px-3 py-1 text-xs text-gray-200">
      {children}
    </span>
  );
}

function Badge({ label }) {
  return (
    <span className="rounded-lg border border-gray-700/70 bg-white/5 px-2.5 py-1 text-[11px] text-gray-300">
      {label}
    </span>
  );
}

function Card({ className = "", children }) {
  return (
    <div
      className={[
        "rounded-2xl border border-gray-700/70 bg-white/10 backdrop-blur-xl p-5",
        "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export default function About() {
  return (
    <div className="min-h-screen w-full text-gray-100 px-6 py-10">
      <div className="mx-auto w-full max-w-6xl">
        {/* ===== Split Hero ===== */}
        <section className="mb-10 grid items-center gap-6 md:grid-cols-5">
          {/* Left */}
          <div className="md:col-span-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400">
              <span className="h-[6px] w-[6px] rounded-full bg-gray-400/70" />
              About the Project
            </div>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight md:text-5xl">
              CricWordle — a daily cricket puzzle,{" "}
              <span className="text-gray-300">built for pace</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-300 md:text-base">
              Not just another Wordle clone. CricWordle focuses on{" "}
              <span className="font-medium text-gray-100">speed runs</span>,{" "}
              <span className="font-medium text-gray-100">fair timing</span>, and a{" "}
              <span className="font-medium text-gray-100">cricket-first vocabulary</span>.
              Designed to feel like a night match under lights—fast, focused, and fiercely competitive.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill>Daily reset</Pill>
              <Pill>Time-ranked leaderboard</Pill>
              <Pill>Streaks & badges</Pill>
              <Pill>Keyboard & touch</Pill>
              <Pill>Mobile-first</Pill>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/categories"
                className="rounded-xl bg-gradient-to-r from-gray-800 to-gray-700 px-5 py-2.5 font-semibold text-white shadow-lg shadow-black/40 transition-all hover:scale-[1.02] hover:from-gray-700 hover:to-gray-600"
              >
                Play Now
              </Link>
              <Link
                to="/signup"
                className="rounded-xl border border-gray-500/70 px-5 py-2.5 font-semibold text-gray-200 shadow-md shadow-black/30 transition-all hover:scale-[1.02] hover:bg-white/5"
              >
                Create Account
              </Link>
            </div>
          </div>

          {/* Right (Logo clickable) */}
          <div className="md:col-span-2 flex items-center justify-center">
            <Link to="/" className="block">
              <img
                src={Logo}
                alt="CricWordle Logo"
                className="max-h-40 object-contain drop-shadow-lg hover:scale-[1.05] transition-transform"
              />
            </Link>
          </div>
        </section>

        {/* ===== Features Grid (3 across) ===== */}
        <section className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <h2 className="text-lg font-semibold text-white">⚡ Gameplay</h2>
            <p className="mt-2 text-sm text-gray-300">
              Guess the cricket word in limited tries. Tile states mirror play:
              <span className="font-medium text-gray-200"> hit</span>,{" "}
              <span className="text-gray-300">edge</span>,{" "}
              <span className="text-gray-400">dot</span>.
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-white">🕛 Daily Reset (IST)</h2>
            <p className="mt-2 text-sm text-gray-300">
              Fresh board every midnight IST. Protect your streak and push for personal bests.
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-white">📂 Categories</h2>
            <ul className="mt-2 space-y-1 text-sm text-gray-300">
              <li>⭐ Legends</li>
              <li>🏏 Shots</li>
              <li>🏟️ Stadiums</li>
              <li>⚡ Terms</li>
            </ul>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-white">🏆 Achievements</h2>
            <ul className="mt-2 space-y-1 text-sm text-gray-300">
              <li>🎯 Fast Finisher (sub-30s)</li>
              <li>🎖️ Hat-trick Solver (3-day streak)</li>
              <li>🛡️ All-Rounder (3+ categories)</li>
            </ul>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-white">📊 Leaderboard</h2>
            <p className="mt-2 text-sm text-gray-300">
              Ranks by server-timed finish; tie-breakers by fewer guesses—fair and competitive.
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-white">👑 Champions</h2>
            <p className="mt-2 text-sm text-gray-300">
              A Hall of Fame for top streaks and fastest solves. Earn your crown!
            </p>
          </Card>
        </section>

        {/* ===== Story + Principles ===== */}
        {/* ... unchanged ... */}

        {/* ===== Credits ===== */}
        <section className="mt-6">
          <Card>
            <h3 className="text-lg font-semibold">Credits & Thanks</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-300">
              Thanks to open-source maintainers in the React and Tailwind communities. Cricket terms
              are curated from public glossaries and community inputs. The stadium vibe is inspired
              by night matches and broadcast graphics.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-300">
              Special thanks to <span className="font-medium text-gray-100">Aryan Maurya</span> for
              helping on this project.
            </p>
          </Card>
        </section>

        {/* ===== About Me + Contact ===== */}
        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <h3 className="text-lg font-semibold">About Me</h3>
            <div className="mt-3 flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-gray-300/20 text-sm font-semibold">
                BA
              </div>
              <div>
                <p className="text-sm leading-relaxed text-gray-300">
                  I’m <span className="font-medium text-gray-100">Bhavarth Agarwal</span> — a{" "}
                  <span className="font-medium text-gray-100">cricket nerd</span> and{" "}
                  <span className="font-medium text-gray-100">web-dev enthusiast</span>, currently a
                  student at <span className="font-medium text-gray-100">MNNIT Allahabad</span>.
                  CricWordle is my take on combining{" "}
                  <span className="font-medium text-gray-100">speed</span>,{" "}
                  <span className="font-medium text-gray-100">fairness</span>, and{" "}
                  <span className="font-medium text-gray-100">fun</span> in a compact daily game.
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  I still think some things can be improved — expect frequent iterations.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill>Open to feedback</Pill>
                  <Pill>Performance-minded</Pill>
                  <Pill>Cricket nerd</Pill>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact card (no form, just links) */}
          <Card>
            <h3 className="text-lg font-semibold">Contact Me</h3>
            <p className="mt-2 text-sm text-gray-300">Connect with me directly:</p>
            <div className="mt-4 flex flex-col gap-2 text-sm">
              <a
                href="https://github.com/BhavarthAgrwl15"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-gray-700/70 px-4 py-2 hover:bg-white/5 transition"
              >
                🌐 GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/bhavarth-agarwal/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-gray-700/70 px-4 py-2 hover:bg-white/5 transition"
              >
                💼 LinkedIn
              </a>
            </div>
          </Card>
        </section>

        {/* ===== Footer CTA ===== */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            to="/categories"
            className="rounded-xl bg-gradient-to-r from-gray-800 to-gray-700 px-5 py-2.5 font-semibold text-white shadow-lg shadow-black/40 transition-all hover:from-gray-700 hover:to-gray-600"
          >
            Jump into a Category
          </Link>
          <Link
            to="/leaderboard"
            className="rounded-xl border border-gray-500/70 px-5 py-2.5 font-semibold text-gray-200 transition-all hover:bg-white/5"
          >
            See Leaderboard
          </Link>
        </div>

        {/* Fine print */}
        <div className="mt-6 text-center text-[11px] text-gray-400">
          Privacy-first • Keyboard & touch-friendly • Mobile-ready
        </div>
      </div>
    </div>
  );
}
