// Profile.jsx
import React, { useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
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
    <div className="rounded-xl border border-gray-700/60 bg-white/5 backdrop-blur-xl p-4 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.5)]">
      <div className="text-[11px] uppercase tracking-wider text-gray-400">
        {label}
      </div>
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
const byDateDesc = (a, b) =>
  a?.date > b?.date ? -1 : a?.date < b?.date ? 1 : 0;

// NOTE: sameDay helper kept if needed later
const sameDay = (a, b) =>
  a && b && a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);

/**
 * computePlayStreaks(sessions)
 * - longest and current consecutive-days-played (irrespective of win)
 */
function computePlayStreaks(sessions = []) {
  const daysSet = new Set();
  for (const s of sessions) {
    const day = (s.date || "").slice(0, 10);
    if (day) daysSet.add(day);
  }
  const days = Array.from(daysSet);
  if (days.length === 0) return { current: 0, best: 0 };

  const dayNums = days
    .map((d) => new Date(d + "T00:00:00Z").getTime())
    .sort((a, b) => a - b);

  let best = 0;
  let cur = 0;
  let last = null;
  for (const t of dayNums) {
    if (last === null) cur = 1;
    else if (t - last === 86400000) cur += 1;
    else cur = 1;
    best = Math.max(best, cur);
    last = t;
  }

  const setNums = new Set(dayNums);
  let current = 0;
  let t = dayNums[dayNums.length - 1];
  while (setNums.has(t)) {
    current += 1;
    t -= 86400000;
  }
  return { current, best };
}

function computeAggregates(sessions = []) {
  const total = sessions.length;
  const wins = sessions.filter(
    (s) => s.finishedAt && (s.score ?? 0) > 0
  ).length;
  const bestScore = total ? Math.max(...sessions.map((s) => s.score ?? 0)) : 0;
  const avgScore = total
    ? Math.round(
        (sessions.reduce((a, s) => a + (s.score ?? 0), 0) / total) * 10
      ) / 10
    : 0;
  const avgTime = total
    ? Math.round(
        sessions.reduce((a, s) => a + (s.timeTakenSec ?? 0), 0) / total
      )
    : 0;

  const categories = sessions.reduce((m, s) => {
    if (!s.category) return m;
    m[s.category] = (m[s.category] || 0) + 1;
    return m;
  }, {});

  const winRate = total ? Math.round((wins / total) * 100) : 0;

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

  const avgGuesses = attemptsList.length
    ? Math.round(
        (attemptsList.reduce((a, b) => a + b, 0) / attemptsList.length) * 10
      ) / 10
    : null;

  const streaks = computePlayStreaks(sessions);
  return {
    total,
    wins,
    winRate,
    bestScore,
    avgScore,
    avgTime,
    categories,
    avgGuesses,
    streaks,
  };
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
  if (!values.length)
    return <div className="mt-1 h-12 text-sm text-gray-400">No data yet.</div>;
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
      <line
        x1="4"
        y1={h - 6}
        x2={w - 4}
        y2={h - 6}
        className="stroke-gray-700/60"
        strokeWidth="1"
      />
    </svg>
  );
}

/* ---------- Donut math helpers ---------- */
function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function arcPath(cx, cy, rOuter, rInner, startAngle, endAngle) {
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;

  const p1 = polarToCartesian(cx, cy, rOuter, endAngle);
  const p2 = polarToCartesian(cx, cy, rOuter, startAngle);
  const p3 = polarToCartesian(cx, cy, rInner, startAngle);
  const p4 = polarToCartesian(cx, cy, rInner, endAngle);

  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 1 ${p4.x} ${p4.y}`,
    "Z",
  ].join(" ");
}

/* ---------- Interactive Category Donut ---------- */
function CategoryDonut({ categories = {} }) {
  const entries = Object.entries(categories)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);

  const total = entries.reduce((a, [, n]) => a + n, 0);

  // Tailwind-friendly palette (emerald/cyan/blue/violet/pink/amber/orange)
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

  const [hoverIdx, setHoverIdx] = useState(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const wrapRef = useRef(null);

  // SVG dimensions
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 78;
  const rInner = 48;

  // Build arcs
  let acc = -90; // start at 12 o'clock
  const arcs = entries.map(([label, n], i) => {
    const frac = total ? n / total : 0;
    const sweep = frac * 360;
    const startAngle = acc;
    const endAngle = acc + sweep;
    acc += sweep;
    const midAngle = (startAngle + endAngle) / 2;
    return {
      label,
      n,
      frac,
      startAngle,
      endAngle,
      midAngle,
      color: palette[i % palette.length],
      i,
    };
  });

  const hovered = hoverIdx != null ? arcs[hoverIdx] : null;

  const handleMove = (e) => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={wrapRef}
      className="relative flex flex-col md:flex-row gap-5 items-center"
      onMouseMove={handleMove}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        {/* Base ring */}
        <circle
          cx={cx}
          cy={cy}
          r={(rOuter + rInner) / 2}
          fill="none"
          stroke="rgba(255,255,255,.06)"
          strokeWidth={rOuter - rInner}
        />

        {/* Slices */}
        {arcs.map((a) => {
          const path = arcPath(
            cx,
            cy,
            rOuter + (hoverIdx === a.i ? 2 : 0),
            rInner - (hoverIdx === a.i ? 2 : 0),
            a.startAngle,
            a.endAngle
          );
          return (
            <path
              key={a.label}
              d={path}
              fill={a.color}
              opacity={hoverIdx == null || hoverIdx === a.i ? 0.95 : 0.35}
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHoverIdx(a.i)}
              onMouseLeave={() => setHoverIdx(null)}
            />
          );
        })}

        {/* Center readout */}
        <g>
          <circle cx={cx} cy={cy} r={rInner - 10} fill="rgba(255,255,255,0.04)" />
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            className="fill-gray-200"
            style={{ fontSize: 14, fontWeight: 700 }}
          >
            {hovered ? hovered.label : "Categories"}
          </text>
          <text
            x={cx}
            y={cy + 12}
            textAnchor="middle"
            className="fill-gray-400"
            style={{ fontSize: 12 }}
          >
            {total === 0
              ? "No data"
              : hovered
              ? `${hovered.n} • ${Math.round(hovered.frac * 100)}%`
              : `${total} plays`}
          </text>
        </g>
      </svg>

      {/* Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 w-full">
        {entries.length === 0 ? (
          <div className="text-gray-400 text-sm">No category data yet.</div>
        ) : (
          entries.map(([label, n], i) => {
            const pct = total ? Math.round((n / total) * 100) : 0;
            const active = hoverIdx === i;
            return (
              <button
                key={label}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                className={[
                  "group flex items-center gap-3 rounded-md px-2 py-1 text-left transition-colors",
                  active ? "bg-white/5" : "hover:bg-white/5",
                ].join(" ")}
              >
                <span
                  className="h-3 w-3 rounded-sm ring-1 ring-white/20"
                  style={{ background: palette[i % palette.length] }}
                />
                <div className="flex-1 text-gray-200 text-sm truncate">{label}</div>
                <div className="text-gray-400 text-xs tabular-nums">
                  {n} • {pct}%
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Floating tooltip */}
      {hovered && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-gray-700/60 bg-black/80 px-3 py-2 text-xs text-gray-100 shadow-xl backdrop-blur"
          style={{
            left: Math.min(mouse.x + 16, (wrapRef.current?.clientWidth || 0) - 140),
            top: Math.max(mouse.y - 10, 0),
            width: 140,
          }}
        >
          <div className="font-semibold">{hovered.label}</div>
          <div className="text-gray-300">{hovered.n} plays</div>
          <div className="text-gray-400">{Math.round(hovered.frac * 100)}%</div>
        </div>
      )}
    </div>
  );
}

/* ------------------------- Main ------------------------- */
export default function Profile() {
  const { profile } = useGame();
  const [tab, setTab] = useState("overview"); // overview | history

  const user = profile?.user ?? null;
  const sessions = useMemo(
    () =>
      Array.isArray(profile?.recentSessions)
        ? profile.recentSessions.slice().sort(byDateDesc)
        : [],
    [profile]
  );

  const stats = useMemo(() => computeAggregates(sessions), [sessions]);
  const sparkScores = sessions
    .slice()
    .reverse()
    .map((s) => s.score ?? 0);

  const initials =
    (user?.name || "Y")
      .split(/\s+/)
      .map((x) => x[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "Y";
  const city = user?.city || user?.location || "—";
  const country = user?.country ? `, ${user.country}` : "";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : null;

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
                </div>
                <div className="mt-1 text-sm text-gray-300 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>📍 {city}{country}</span>
                  {memberSince && <span>• Joined {memberSince}</span>}
                  {user?.username && <span>• @{user.username}</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:max-w-[560px]">
              <Stat
                label="Total Score"
                value={(user?.totalPoints ?? stats.wins * 100) || 0}
                sub="points"
              />
              <Stat
                label="Win Rate"
                value={`${stats.winRate}%`}
                sub={`${stats.wins} wins`}
              />
              <Stat
                label="Current Streak"
                value={stats.streaks.current}
                sub={`Best: ${stats.streaks.best}`}
              />
              <Stat
                label="Avg Guesses"
                value={stats.avgGuesses ?? "—"}
                sub="per game"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            <Pill active={tab === "overview"} onClick={() => setTab("overview")}>
              Overview
            </Pill>
            <Pill active={tab === "history"} onClick={() => setTab("history")}>
              Game History
            </Pill>
          </div>
        </Card>

        {/* Loading */}
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
                  </Card>

                  <Card className="lg:col-span-1">
                    <h3 className="text-lg font-semibold">🧭 Category Performance</h3>
                    <div className="mt-4">
                      <CategoryDonut categories={stats.categories} />
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

            {/* -------- HISTORY -------- */}
            {tab === "history" && (
              <section>
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
                              Nothing here yet.
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
                                  (s.score ?? 0) > 0 ? "text-emerald-400" : "text-rose-400"
                                }`}
                              >
                                {(s.score ?? 0) > 0 ? "Not Out" : "Out"}
                              </td>
                            </tr>
                          ))
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
