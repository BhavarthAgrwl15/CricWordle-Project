import React from "react";
import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="min-h-screen w-full text-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl">🏏</div>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-gray-200 to-white bg-clip-text text-transparent drop-shadow">
            About Cricket Wordle
          </h1>
          <p className="text-sm md:text-base text-gray-400 mt-2">
            Daily cricket word puzzles. Keep your streak, climb the ranks, and become a champion.
          </p>

          {/* CTA Buttons */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white font-semibold shadow-lg shadow-black/40 transition-transform duration-200 hover:scale-[1.02]"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2.5 rounded-xl border border-gray-500/70 text-gray-200 hover:bg-gray-200/10 font-semibold shadow-md shadow-black/30 transition-transform duration-200 hover:scale-[1.02]"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Gameplay */}
          <section className="rounded-2xl border border-gray-700/70 bg-white/10 backdrop-blur-xl p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
            <h2 className="text-lg font-semibold text-white">⚡ Gameplay</h2>
            <p className="mt-2 text-sm text-gray-300">
              Guess the cricket word in limited tries. Tile states: <span className="text-gray-200 font-medium">hit</span>,
              <span className="text-gray-300"> edge</span>, <span className="text-gray-400"> dot</span>.
            </p>
          </section>

          {/* Daily Reset */}
          <section className="rounded-2xl border border-gray-700/70 bg-white/10 backdrop-blur-xl p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
            <h2 className="text-lg font-semibold text-white">🕛 Daily Reset (IST)</h2>
            <p className="mt-2 text-sm text-gray-300">
              New puzzle every midnight IST. Keep your streak alive and improve your timing.
            </p>
          </section>

          {/* Categories */}
          <section className="rounded-2xl border border-gray-700/70 bg-white/10 backdrop-blur-xl p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
            <h2 className="text-lg font-semibold text-white">📂 Categories</h2>
            <ul className="mt-2 text-sm text-gray-300 space-y-1">
              <li>⭐ Legends</li>
              <li>🏏 Shots</li>
              <li>🏟️ Stadiums</li>
              <li>⚡ Cricket Terms</li>
            </ul>
          </section>

          {/* Achievements */}
          <section className="rounded-2xl border border-gray-700/70 bg-white/10 backdrop-blur-xl p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
            <h2 className="text-lg font-semibold text-white">🏆 Achievements</h2>
            <ul className="mt-2 text-sm text-gray-300 space-y-1">
              <li>🎯 Fast Finisher (sub-30s)</li>
              <li>🎖️ Hat-trick Solver (3-day streak)</li>
              <li>🛡️ All-Rounder (3+ categories)</li>
            </ul>
          </section>

          {/* Leaderboard */}
          <section className="rounded-2xl border border-gray-700/70 bg-white/10 backdrop-blur-xl p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
            <h2 className="text-lg font-semibold text-white">📊 Leaderboard</h2>
            <p className="mt-2 text-sm text-gray-300">
              Ranks by server-timed finish. Tie-breakers by fewer guesses.
            </p>
          </section>

          {/* Champions */}
          <section className="rounded-2xl border border-gray-700/70 bg-white/10 backdrop-blur-xl p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
            <h2 className="text-lg font-semibold text-white">👑 Champions</h2>
            <p className="mt-2 text-sm text-gray-300">
              Hall of Fame for top streaks and fastest solves. Earn your crown!
            </p>
          </section>
        </div>

        {/* Footer note */}
        <div className="text-center text-[11px] text-gray-400 mt-8">
          Privacy-first • Keyboard & touch-friendly • Mobile-ready
        </div>
      </div>
    </div>
  );
}