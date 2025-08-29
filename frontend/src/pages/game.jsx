// src/pages/Start.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
// Use your real path to the API helper that contains `gameInit`
import { gameInit } from "../services/game-api";
import { useGame } from "../contexts/game-context";

/* ------------------------- UI Primitive (matches your theme) ------------------------- */
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

/* ------------------------- Small helpers ------------------------- */
const safeText = (v, fallback = "—") =>
  v === null || v === undefined || v === "" ? fallback : String(v);

export default function Start() {
  const { state } = useLocation();
  const { profile } = useGame();
  const navigate = useNavigate();

  // Accept either a fully-formed puzzle or an init payload
  const passedPuzzle = state?.puzzle ?? null;
  const initPayload = state?.initPayload ?? null; // { category, level?, date? }

  const [puzzle, setPuzzle] = useState(passedPuzzle);
  const [loading, setLoading] = useState(!passedPuzzle && !!initPayload);
  const [error, setError] = useState("");

  // Initialize puzzle if we were sent a payload
  useEffect(() => {
    let dead = false;
    (async () => {
      if (!initPayload || puzzle) return;

      try {
        setLoading(true);
        setError("");

        const cat = initPayload.category;
        // Fallback date: today
        const date = initPayload.date || new Date().toISOString().slice(0, 10);

        // Fallback level: compute next from profile if missing, else default "1"
        let levelStr = initPayload.level;
        if (!levelStr && cat && Array.isArray(profile?.recentSessions)) {
          const sessionsInCat = profile.recentSessions.filter(
            (s) => s.category === cat
          );
          const maxPrevLevel = sessionsInCat.length
            ? Math.max(...sessionsInCat.map((s) => Number(s.level) || 0))
            : 0;
          levelStr = String(maxPrevLevel + 1);
        }
        if (!levelStr) levelStr = "1";
        console.log("Init payload:", { category: cat, level: levelStr, date });
        const p = await gameInit({ category: cat, level: levelStr, date });
        if (!dead) setPuzzle(p);
        console.log(p);
      } catch (e) {
        if (!dead)
          setError(
            e?.error || e?.msg || e?.message || "Failed to initialize game"
          );
      } finally {
        if (!dead) setLoading(false);
      }
    })();

    return () => {
      dead = true;
    };
  }, [initPayload, puzzle, profile]);

  // Title based on payload or returned puzzle
  const title = useMemo(() => {
    if (initPayload?.category || initPayload?.level) {
      const cat = safeText(initPayload?.category, "Puzzle");
      const lvl = safeText(initPayload?.level, "?");
      return `${cat} — Level ${lvl}`;
    }
    if (puzzle?.puzzleId) return `MaxScore #${puzzle.maxScore}`;
    return "Mystery Puzzle";
  }, [initPayload, puzzle]);

  // Meta preview tailored to your gameInit response:
  // { puzzleId, maxAttempts, wordLength, word, expiresAt }
  const meta = useMemo(() => {
    return {
      Category: safeText(initPayload?.category),
      Level: safeText(initPayload?.level),
      Date: safeText(initPayload?.date),
      "Word Length": puzzle?.wordLength ?? "—",
      "Max Attempts": puzzle?.maxAttempts ?? "—",
      // Expires: puzzle?.expiresAt
      //   ? new Date(puzzle.expiresAt).toLocaleString()
      //   : "—",
      "Max Score": puzzle?.maxScore ?? "—", // 👈 show maxScore instead
    };
  }, [puzzle, initPayload]);

  const handleStart = () => {
    if (puzzle) {
      // Carry both along (useful in /play UI)
      console.log(puzzle,initPayload);
      navigate("/play", { state: { puzzle, initPayload } });
    } else if (!initPayload) {
      navigate("/categories");
    }
  };

  const canStart = !!puzzle && !loading && !error;

  // Dev view: mask secret word if present

  return (
    <div className="min-h-screen w-full text-gray-100 px-6 py-8">
      <div className="mx-auto w-full max-w-4xl">
        {/* Hero */}
        <Card className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/10 border-emerald-700/40">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-4xl">🎮</div>
              <h1 className="mt-1 text-3xl md:text-4xl font-extrabold">
                Get Ready to Play
              </h1>
              <p className="mt-1 text-sm text-gray-300">
                Warm up your cricket brain and smash this one out of the park.
              </p>
            </div>
            <div className="hidden md:block text-sm text-gray-400">
              {initPayload
                ? loading
                  ? "Loading puzzle…"
                  : error
                  ? "Init failed"
                  : "Ready to start"
                : passedPuzzle
                ? "Loaded from previous screen"
                : "No puzzle payload — choose a category"}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleStart}
              disabled={!canStart}
              className={[
                "rounded-xl px-5 py-2 font-semibold text-white shadow",
                canStart
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
                  : "bg-gray-700 cursor-not-allowed opacity-60",
              ].join(" ")}
              title={
                canStart ? "Start Game" : loading ? "Preparing…" : "Not ready"
              }
            >
              {loading
                ? "Preparing…"
                : error
                ? "Retry after fixing issue"
                : "Start Game →"}
            </button>

            <Link
              to="/categories"
              className="rounded-xl border border-gray-600 px-5 py-2 font-semibold text-gray-200 hover:bg-white/5"
            >
              Pick Category
            </Link>
            <Link
              to="/leaderboard"
              className="rounded-xl border border-gray-600 px-5 py-2 font-semibold text-gray-200 hover:bg-white/5"
            >
              Leaderboard
            </Link>
          </div>

          {/* Error Note */}
          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
        </Card>

        {/* Puzzle summary */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <h3 className="text-lg font-semibold">🧩 Puzzle Preview</h3>

            {!puzzle ? (
              <div className="mt-2 text-sm text-gray-400">
                {loading
                  ? "Loading puzzle details…"
                  : initPayload
                  ? "Puzzle not ready yet."
                  : "No puzzle payload passed — select a category."}
              </div>
            ) : (
              <>
                <div className="mt-2 text-2xl font-extrabold text-white">
                  {title}
                </div>
                <div className="mt-1 text-sm text-gray-300">
                  Check the details and hit{" "}
                  <span className="font-semibold text-emerald-300">
                    Start Game
                  </span>{" "}
                  when you're ready.
                </div>

                {/* Pretty meta grid */}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {Object.entries(meta).map(([k, v]) => (
                    <div
                      key={k}
                      className="rounded-xl border border-gray-700/60 bg-white/5 px-3 py-2"
                    >
                      <div className="text-[11px] uppercase tracking-wider text-gray-400">
                        {k}
                      </div>
                      <div className="mt-0.5 text-gray-100">{v}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>

          <Card>
            <h3 className="text-lg font-semibold">⚙️ How to Play</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>
                You’ll see a cricket-themed puzzle (terms, legends, stadiums,
                etc.).
              </li>
              <li>
                Type your guess each attempt—aim for the best score and level.
              </li>
              <li>Climb the leaderboard with consistent high scores.</li>
            </ul>

            <div className="mt-3 space-y-1.5 text-sm">
              <p className="flex items-center">
                <span className="w-4 h-4 bg-red-500 rounded-sm inline-block mr-2"></span>
                <span className="text-gray-300">Red → Wrong letter</span>
              </p>
              <p className="flex items-center">
                <span className="w-4 h-4 bg-green-500 rounded-sm inline-block mr-2"></span>
                <span className="text-gray-300">Green → Correct letter</span>
              </p>
              <p className="flex items-center">
                <span className="w-4 h-4 bg-yellow-400 rounded-sm inline-block mr-2"></span>
                <span className="text-gray-300">
                  Yellow → Correct letter but wrong position
                </span>
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-gray-700/60 bg-white/5 px-3 py-2">
              <div className="text-[11px] uppercase tracking-wider text-gray-400">
                Tip
              </div>
              <div className="mt-0.5 text-gray-100">
                Press <span className="font-semibold">Enter</span> to submit a
                guess.
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom CTA mirrors the theme */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={handleStart}
            disabled={!canStart}
            className={[
              "rounded-xl px-5 py-2 font-semibold text-white shadow",
              canStart
                ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
                : "bg-gray-700 cursor-not-allowed opacity-60",
            ].join(" ")}
          >
            {loading ? "Preparing…" : "Start Game →"}
          </button>
          <Link
            to="/categories"
            className="rounded-xl border border-gray-600 px-5 py-2 font-semibold text-gray-200 hover:bg-white/5"
          >
            Choose Another
          </Link>
        </div>
      </div>
    </div>
  );
}
