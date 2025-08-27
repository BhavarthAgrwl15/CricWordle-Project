// Profile.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
// Adjust this import to your actual hook location:
import { useGame } from "../contexts/game-context";

/* ------------------------- UI Primitives ------------------------- */
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
function Stat({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-gray-700/60 bg-white/5 p-4">
      <div className="text-[11px] uppercase tracking-wider text-gray-400">{label}</div>
      <div className="mt-1 text-2xl font-extrabold text-white">{value}</div>
      {sub ? <div className="mt-1 text-xs text-gray-400">{sub}</div> : null}
    </div>
  );
}
function Pill({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-3 py-1.5 text-sm rounded-full border",
        active
          ? "border-emerald-500/60 text-white bg-emerald-500/10"
          : "border-gray-600 text-gray-300 hover:bg-white/5",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/* ------------------------- Helpers ------------------------- */
const fmtSec = (s) => {
  if (s === null || s === undefined) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m ? `${m}m ${sec}s` : `${sec}s`;
};
const byDateDesc = (a, b) => (a?.date > b?.date ? -1 : a?.date < b?.date ? 1 : 0);
const sameDay = (a, b) => a && b && a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);

function computeStreaks(sessions = []) {
  if (!sessions.length) return { current: 0, best: 0 };
  const byDay = new Map();
  for (const s of sessions) {
    const day = (s.date || "").slice(0, 10);
    if (!day) continue;
    const win = (s.score ?? 0) > 0;
    byDay.set(day, (byDay.get(day) ?? false) || win);
  }
  const days = Array.from(byDay.keys()).sort().reverse();
  let best = 0,
    cur = 0,
    lastDay = null;
  for (const d of days) {
    const dt = new Date(d + "T00:00:00Z");
    if (byDay.get(d)) {
      if (!lastDay) cur = 1;
      else cur = Math.round((lastDay - dt) / 86400000) === 1 ? cur + 1 : 1;
      best = Math.max(best, cur);
    } else cur = 0;
    lastDay = dt;
  }
  const today = new Date();
  const lastPlayed = days.length ? new Date(days[0] + "T00:00:00Z") : null;
  const ok =
    lastPlayed &&
    (sameDay(lastPlayed, today) || Math.round((today - lastPlayed) / 86400000) === 1);
  return { current: ok ? cur : 0, best };
}

function computeAggregates(sessions = []) {
  const total = sessions.length;
  const wins = sessions.filter((s) => s.finishedAt && (s.score ?? 0) > 0).length;
  const bestScore = total ? Math.max(...sessions.map((s) => s.score ?? 0)) : 0;
  const avgScore = total
    ? Math.round((sessions.reduce((a, s) => a + (s.score ?? 0), 0) / total) * 10) / 10
    : 0;
  const avgTime = total
    ? Math.round(sessions.reduce((a, s) => a + (s.timeTakenSec ?? 0), 0) / total)
    : 0;

  const categories = sessions.reduce((m, s) => {
    if (!s.category) return m;
    m[s.category] = (m[s.category] || 0) + 1;
    return m;
  }, {});

  const winRate = total ? Math.round((wins / total) * 100) : 0;

  // attempts -> treat arrays as counts
  const attemptsList = sessions
    .map((s) => {
      if ("attempts" in s) {
        if (Array.isArray(s.attempts)) return s.attempts.length;
        if (typeof s.attempts === "number") return s.attempts;
      }
      if ("attemptsCount" in s) return s.attemptsCount;
      return null;
    })
    .filter((x) => typeof x === "number");
  const avgGuesses =
    attemptsList.length
      ? Math.round(
          (attemptsList.reduce((a, b) => a + b, 0) / attemptsList.length) * 10
        ) / 10
      : null;

  const streaks = computeStreaks(sessions);
  return { total, wins, winRate, bestScore, avgScore, avgTime, categories, avgGuesses, streaks };
}

/* ------------------------- Visual bits ------------------------- */
function Achievement({ title, desc, icon }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-700/60 bg-white/5 p-3">
      <img src={icon} alt={title} className="h-10 w-10" />
      <div>
        <div className="font-semibold text-gray-100">{title}</div>
        <div className="text-xs text-gray-400">{desc}</div>
      </div>
    </div>
  );
}
function Sparkline({ values = [], max = 10, height = 48 }) {
  if (!values.length) return <div className="mt-1 h-12 text-sm text-gray-400">No data yet.</div>;
  const w = Math.max(120, values.length * 24);
  const h = height;
  const maxVal = Math.max(1, max);
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * (w - 8) + 4;
      const y = h - 6 - (Math.min(v, maxVal) / maxVal) * (h - 12);
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} className="max-w-full">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.6"
        strokeWidth="2"
        points={points}
        className="text-emerald-300"
      />
      <line x1="4" y1={h - 6} x2={w - 4} y2={h - 6} className="stroke-gray-700/60" strokeWidth="1" />
    </svg>
  );
}

/* ---------- Category Donut ---------- */
function CategoryDonut({ categories = {} }) {
  const entries = Object.entries(categories)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((a, [, n]) => a + n, 0);
  const palette = [
    "#34d399",
    "#10b981",
    "#22d3ee",
    "#60a5fa",
    "#a78bfa",
    "#f472b6",
    "#f59e0b",
    "#f97316",
  ];
  const r = 44; // radius
  const C = 2 * Math.PI * r; // circumference
  let acc = 0;

  return (
    <div className="flex flex-col md:flex-row gap-5 items-center">
      <svg width="120" height="120" viewBox="0 0 120 120" className="shrink-0">
        <g transform="translate(60,60)">
          <circle r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="14" />
          {entries.map(([label, n], i) => {
            const frac = total ? n / total : 0;
            const len = frac * C;
            const dashOffset = C - acc - len;
            acc += len;
            return (
              <circle
                key={label}
                r={r}
                fill="none"
                stroke={palette[i % palette.length]}
                strokeWidth="14"
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={dashOffset}
                transform="rotate(-90)"
              />
            );
          })}
        </g>
      </svg>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 w-full">
        {entries.length === 0 ? (
          <div className="text-gray-400 text-sm">No category data yet.</div>
        ) : (
          entries.map(([label, n], i) => {
            const pct = total ? Math.round((n / total) * 100) : 0;
            return (
              <div key={label} className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-sm" style={{ background: palette[i % palette.length] }} />
                <div className="flex-1 text-gray-200 text-sm truncate">{label}</div>
                <div className="text-gray-400 text-xs">
                  {n} • {pct}%
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ------------------------- Main ------------------------- */
/**
 * Profile uses const { profile } = useGame();
 * - Expects profile = { user, recentSessions }
 */
export default function Profile() {
  const { profile } = useGame(); // pulls from your game-context
  const [tab, setTab] = useState("overview"); // overview | achievements | history

  // derive user + sorted sessions from profile (reactive)
  const user = profile?.user ?? null;
  const sessions = useMemo(
    () =>
      Array.isArray(profile?.recentSessions)
        ? profile.recentSessions.slice().sort(byDateDesc)
        : [],
    [profile]
  );

  const stats = useMemo(() => computeAggregates(sessions), [sessions]);
  const sparkScores = sessions.slice().reverse().map((s) => s.score ?? 0);
  const sparkTimes = sessions.slice().reverse().map((s) => s.timeTakenSec ?? 0);

  const initials =
    (user?.name || "Y")
      .split(/\s+/)
      .map((x) => x[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "Y";
  const city = user?.city || user?.location || "—";
  const country = user?.country ? `, ${user.country}` : "";
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : null;

  return (
    <div className="min-h-screen w-full text-gray-100 px-6 py-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <Card className="mb-6 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-900/20 via-emerald-800/10 to-transparent" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-full grid place-items-center font-bold text-2xl bg-gradient-to-br from-emerald-700 to-emerald-600 border border-emerald-400/30 shadow-inner">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-extrabold">
                    {user?.name || "Your Profile"}
                  </h1>
                  {user?.rankGlobal && (
                    <span className="text-xs px-2 py-1 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-200">
                      ★ Rank #{user.rankGlobal} Globally
                    </span>
                  )}
                </div>
                <div className="mt-1 text-sm text-gray-300 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>📍 {city}{country}</span>
                  {memberSince && <span>• Joined {memberSince}</span>}
                  {user?.username && <span>• @{user.username}</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:max-w-[560px]">
              <Stat label="Total Score" value={(user?.totalPoints ?? stats.wins * 100) || 0} sub="points" />
              <Stat label="Win Rate" value={`${stats.winRate}%`} sub={`${stats.wins} wins`} />
              <Stat label="Current Streak" value={stats.streaks.current} sub={`Best: ${stats.streaks.best}`} />
              <Stat label="Avg Guesses" value={stats.avgGuesses ?? "—"} sub="per game" />
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            <Pill active={tab === "overview"} onClick={() => setTab("overview")}>
              Overview
            </Pill>
            <Pill active={tab === "achievements"} onClick={() => setTab("achievements")}>
              Achievements
            </Pill>
            <Pill active={tab === "history"} onClick={() => setTab("history")}>
              Game History
            </Pill>
          </div>
        </Card>

        {/* If profile is not yet loaded, show message */}
        {!profile && (
          <div className="grid place-items-center py-20 text-gray-400">
            Loading profile from game context…
          </div>
        )}

        {profile && (
          <>
            {/* -------- OVERVIEW -------- */}
            {tab === "overview" && (
              <>
                {/* Stats row */}
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Stat label="Innings Played" value={stats.total} sub={`${stats.wins} wins`} />
                  <Stat label="Win Rate" value={`${stats.winRate}%`} />
                  <Stat label="Highest Score" value={stats.bestScore} sub={`Avg ${stats.avgScore}`} />
                  <Stat label="Avg Time" value={fmtSec(stats.avgTime)} sub="per innings" />
                </section>

                {/* Achievements + Form Guide + Category Donut */}
                <section className="mt-6 grid gap-6 lg:grid-cols-3">
                  <Card className="lg:col-span-1">
                    <h3 className="text-lg font-semibold">🏆 Highlights</h3>
                    <div className="mt-4 space-y-3">
                      {stats.bestScore >= 50 && (
                        <Achievement title="Half-Century" desc="Scored 50+ in one go" icon="/trophies/halfcentury.png" />
                      )}
                      {stats.total >= 10 && (
                        <Achievement title="Ironman" desc="Played 10+ innings" icon="/trophies/ironman.png" />
                      )}
                      {stats.winRate >= 70 && (
                        <Achievement title="Sharpshooter" desc="70%+ win rate" icon="/trophies/sharpshooter.png" />
                      )}
                      {Object.keys(stats.categories).length >= 3 && (
                        <Achievement title="All-Rounder" desc="Tackled 3+ categories" icon="/trophies/allrounder.png" />
                      )}
                      {stats.avgTime > 0 && stats.avgTime <= 30 && (
                        <Achievement title="Speedster" desc="Average under 30s" icon="/trophies/speedster.png" />
                      )}
                      {stats.total === 0 && (
                        <div className="text-sm text-gray-400">
                          No trophies yet — knock a few runs!
                        </div>
                      )}
                    </div>
                  </Card>

                  <Card className="lg:col-span-1">
                    <h3 className="text-lg font-semibold">📈 Form Guide</h3>
                    <div className="mt-4">
                      <div className="text-xs text-gray-400 mb-1">Scores</div>
                      <Sparkline values={sparkScores} max={Math.max(10, ...sparkScores)} />
                    </div>
                    <div className="mt-5">
                      <div className="text-xs text-gray-400 mb-1">Time (seconds)</div>
                      <Sparkline values={sparkTimes} max={Math.max(60, ...sparkTimes)} />
                    </div>
                  </Card>

                  <Card className="lg:col-span-1">
                    <h3 className="text-lg font-semibold">🧭 Category Performance</h3>
                    <div className="mt-4">
                      <CategoryDonut categories={stats.categories} />
                    </div>
                  </Card>
                </section>

                {/* Recent sessions */}
                <section className="mt-6">
                  <Card>
                    <h3 className="text-lg font-semibold">📋 Match Log</h3>
                    <div className="mt-3 overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-400">
                            <th className="py-2 pr-4">Date</th>
                            <th className="py-2 pr-4">Category</th>
                            <th className="py-2 pr-4">Level</th>
                            <th className="py-2 pr-4">Score</th>
                            <th className="py-2 pr-4">Time</th>
                            <th className="py-2 pr-4">Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessions.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-6 text-center text-gray-400">
                                No games yet — take guard and face your first ball!
                              </td>
                            </tr>
                          ) : (
                            sessions.map((s) => (
                              <tr key={s._id} className="border-t border-gray-700/60">
                                <td className="py-2 pr-4 text-gray-200">{s.date}</td>
                                <td className="py-2 pr-4 text-gray-300">{s.category || "—"}</td>
                                <td className="py-2 pr-4">{s.level ?? "—"}</td>
                                <td className="py-2 pr-4 font-semibold text-gray-100">{s.score ?? 0}</td>
                                <td className="py-2 pr-4">{fmtSec(s.timeTakenSec)}</td>
                                <td
                                  className={`py-2 pr-4 ${
                                    s.score > 0 ? "text-emerald-400" : "text-rose-400"
                                  }`}
                                >
                                  {s.score > 0 ? "Not Out" : "Out"}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </section>

                <div className="mt-8 flex gap-3">
                  <Link
                    to="/categories"
                    className="rounded-xl bg-gradient-to-r from-gray-800 to-gray-700 px-5 py-2 font-semibold text-white shadow hover:from-gray-700 hover:to-gray-600"
                  >
                    Play Now →
                  </Link>
                  <Link
                    to="/leaderboard"
                    className="rounded-xl border border-gray-600 px-5 py-2 font-semibold text-gray-200 hover:bg-white/5"
                  >
                    Leaderboard
                  </Link>
                </div>
              </>
            )}

            {/* -------- ACHIEVEMENTS -------- */}
            {tab === "achievements" && (
              <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Achievement title="Debut" desc="Played your first game" icon="/trophies/debut.png" />
                {stats.total >= 10 && (
                  <Achievement title="Ironman" desc="Played 10+ innings" icon="/trophies/ironman.png" />
                )}
                {stats.winRate >= 70 && (
                  <Achievement title="Sharpshooter" desc="70%+ win rate" icon="/trophies/sharpshooter.png" />
                )}
                {stats.bestScore >= 50 && (
                  <Achievement title="Half-Century" desc="Scored 50+ in one go" icon="/trophies/halfcentury.png" />
                )}
                {Object.keys(stats.categories).length >= 3 && (
                  <Achievement title="All-Rounder" desc="Tackled 3+ categories" icon="/trophies/allrounder.png" />
                )}
                {stats.streaks.best >= 10 && (
                  <Achievement title="On Fire" desc="10-day best streak" icon="/trophies/streak.png" />
                )}
              </section>
            )}

            {/* -------- GAME HISTORY -------- */}
            {tab === "history" && (
              <section>
                <Card>
                  <h3 className="text-lg font-semibold">Game History</h3>
                  <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-400">
                          <th className="py-2 pr-4">Date</th>
                          <th className="py-2 pr-4">Category</th>
                          <th className="py-2 pr-4">Level</th>
                          <th className="py-2 pr-4">Guesses</th>
                          <th className="py-2 pr-4">Score</th>
                          <th className="py-2 pr-4">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-gray-400">
                              Nothing here yet.
                            </td>
                          </tr>
                        ) : (
                          sessions.map((s) => {
                            const guesses =
                              "attempts" in s
                                ? Array.isArray(s.attempts)
                                  ? s.attempts.length
                                  : typeof s.attempts === "number"
                                  ? s.attempts
                                  : "—"
                                : "attemptsCount" in s
                                ? s.attemptsCount
                                : "—";
                            return (
                              <tr key={s._id} className="border-t border-gray-700/60">
                                <td className="py-2 pr-4 text-gray-200">{s.date}</td>
                                <td className="py-2 pr-4 text-gray-300">{s.category || "—"}</td>
                                <td className="py-2 pr-4">{s.level ?? "—"}</td>
                                <td className="py-2 pr-4">{guesses}</td>
                                <td className="py-2 pr-4 font-semibold text-gray-100">{s.score ?? 0}</td>
                                <td className="py-2 pr-4">{fmtSec(s.timeTakenSec)}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
