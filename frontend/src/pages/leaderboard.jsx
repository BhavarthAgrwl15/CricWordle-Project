import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

/* ------------------------- UI Primitives (match Profile.jsx) ------------------------- */
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

/* ------------------------- Helpers ------------------------- */
const todayStr = () => new Date().toISOString().slice(0, 10);
const fmtPct = (n) => (n || n === 0 ? `${Number(n).toFixed(1)}%` : "—");
const initialsOf = (name = "Anonymous") =>
  name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const PERIODS = [
  { key: "daily", label: "Daily", range: () => ({ start: todayStr(), end: todayStr() }) },
  {
    key: "weekly",
    label: "Weekly",
    range: () => {
      const d = new Date();
      const end = new Date(d);
      const start = new Date(d);
      start.setDate(d.getDate() - 6);
      return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
    },
  },
  {
    key: "monthly",
    label: "Monthly",
    range: () => {
      const d = new Date();
      const end = new Date(d);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
    },
  },
  { key: "all", label: "All-Time", range: () => ({ start: "1970-01-01", end: todayStr() }) },
];

const rankLabel = (i) =>
  i === 0 ? "Player of the Match" : i === 1 ? "Vice-Captain" : i === 2 ? "Impact Player" : "";
const trophy = (i) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏏");

/* Simple badge rules based on score / levelReached — tweak anytime */
function badgesForRow(row) {
  const out = [];
  if ((row?.score ?? 0) >= 100) out.push({ text: "Century Maker", tone: "amber" });
  if ((row?.score ?? 0) >= 200) out.push({ text: "Six Hitter", tone: "green" });
  if ((row?.levelReached ?? 0) >= 6) out.push({ text: "Perfect Streak", tone: "purple" });
  if ((row?.levelReached ?? 0) >= 3 && (row?.score ?? 0) < 100) out.push({ text: "Quick Solver", tone: "orange" });
  if (!out.length) out.push({ text: "Newcomer", tone: "slate" });
  return out.slice(0, 3);
}
const toneToClasses = {
  amber: "bg-amber-500/15 text-amber-200 border border-amber-400/30",
  green: "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30",
  purple: "bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-400/30",
  orange: "bg-orange-500/15 text-orange-200 border border-orange-400/30",
  blue: "bg-sky-500/15 text-sky-200 border border-sky-400/30",
  slate: "bg-slate-500/15 text-slate-200 border border-slate-400/30",
};

/* ------------------------- Page ------------------------- */
export default function Leaderboard() {
  // period + filters
  const [period, setPeriod] = useState("daily");
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState(25);
  const [date, setDate] = useState(todayStr()); // only for Daily

  // data
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [me, setMe] = useState(null);
  const [metrics, setMetrics] = useState({ players: 0, games: 0, winRate: 0, perfect: 0 });

  // view mode (avoid overlap): "list" (rich champions) OR "table" (classic scorecard)
  const [view, setView] = useState("list");

  // auth headers (best-effort)
  const authHeaders = useMemo(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  /* Categories */
  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        setLoadingCats(true);
        const res = await axios.get("/api/categories").catch(() => null);
        if (dead) return;
        if (Array.isArray(res?.data) && res.data.length) setCategories(res.data);
        else setCategories(["Legends", "Shots", "Stadiums", "Terms"]);
      } finally {
        if (!dead) setLoadingCats(false);
      }
    })();
    return () => {
      dead = true;
    };
  }, []);

  /* Me (optional) */
  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const { data } = await axios.get("/api/profile/me", { headers: authHeaders });
        if (!dead) setMe(data?.user || null);
      } catch {
        if (!dead) setMe(null);
      }
    })();
    return () => (dead = true);
  }, [authHeaders]);

  /* Transform sessions -> leaderboard rows */
  const aggregateSessionsToRows = (sessions = []) => {
    const map = new Map();
    let anonCounter = 0;
    for (const s of sessions) {
      const userKey = s.user
        ? s.user
        : s.userId
        ? `uid:${s.userId}`
        : `anon:${anonCounter++}`;
      const current = map.get(userKey) || {
        user: s.user || "Anonymous",
        score: 0,
        levelReached: 0,
        sessions: 0,
      };
      current.score = (current.score || 0) + (s.score || 0);
      current.levelReached = Math.max(current.levelReached || 0, s.levelReached ?? 0);
      current.sessions = (current.sessions || 0) + 1;
      map.set(userKey, current);
    }

    const arr = Array.from(map.values());
    arr.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.levelReached !== a.levelReached) return b.levelReached - a.levelReached;
      return (b.sessions || 0) - (a.sessions || 0);
    });
    return arr.slice(0, limit);
  };

  /* Metrics derived from sessions */
  const computeMetricsFromSessions = (sessions = [], aggregatedRows = []) => {
    const players = new Set(sessions.map((s) => s.user || s.userId || JSON.stringify(s))).size;
    const games = sessions.length;
    const winRate = games === 0 ? 0 : (sessions.filter((s) => (s.score || 0) > 0).length / games) * 100;
    const perfect = aggregatedRows.filter((r) => (r.levelReached || 0) >= 6).length;
    return { players, games, winRate, perfect };
  };

  /* ------------------------- fetchGameSessions helper ------------------------- */
  const GAME_API = { LIST: "/api/gamesessions" };
  const fetchGameSessions = async ({ date, start, end, category, limit = 10 } = {}) => {
    try {
      const params = {};
      if (date) params.date = date;
      if (start) params.start = start;
      if (end) params.end = end;
      if (category) params.category = category;
      if (limit) params.limit = limit;

      const res = await axios.get(GAME_API.LIST, { params });
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      throw err.response?.data || { msg: "Failed to fetch game session" };
    }
  };

  /* Fetch leaderboard */
  const fetchBoard = async () => {
    setLoading(true);
    setErr("");
    try {
      const sel = PERIODS.find((p) => p.key === period) || PERIODS[0];
      const { start, end } = sel.range();

      const params = {};
      if (period === "daily") params.date = date;
      else {
        params.start = start;
        params.end = end;
      }
      if (category) params.category = category;
      params.limit = limit;

      const sessions = await fetchGameSessions(params);
      const list = Array.isArray(sessions) ? sessions : [];
      const aggregated = aggregateSessionsToRows(list);

      setRows(aggregated);

      const m = computeMetricsFromSessions(list, aggregated);
      setMetrics({ players: m.players, games: m.games, winRate: m.winRate, perfect: m.perfect });
    } catch (e) {
      setErr(e?.msg || e?.message || "Failed to load leaderboard");
      setRows([]);
      setMetrics({ players: 0, games: 0, winRate: 0, perfect: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, date, category, limit]);

  const myIndex = useMemo(() => {
    if (!me?.name) return -1;
    return rows.findIndex((r) => (r.user || "").toLowerCase() === me.name.toLowerCase());
  }, [rows, me]);

  return (
    <div className="min-h-screen w-full text-gray-100 px-6 py-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* HERO (screenshot vibe, your theme) */}
        <Card className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/10 border-emerald-700/40">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-4xl">🏆</div>
              <h1 className="mt-1 text-3xl md:text-4xl font-extrabold">Championship Leaderboards</h1>
              <p className="mt-1 text-sm text-gray-300">Compete with cricket fans worldwide and climb to the top of the rankings.</p>
            </div>
            <div className="hidden md:block text-sm text-gray-400">
              {me ? (
                <>
                  Signed in as <span className="text-gray-200 font-semibold">{me.name}</span>
                </>
              ) : (
                "Guest Mode"
              )}
            </div>
          </div>

          {/* Period Tabs */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-700/70 bg-black/20 px-2 py-1">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={[
                    "px-3 py-1.5 rounded-full text-sm",
                    period === p.key ? "bg-emerald-600 text-white" : "text-gray-300 hover:bg-white/5",
                  ].join(" ")}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* View toggle (prevents overlapping list+table) */}
            <div className="ml-auto inline-flex rounded-full border border-gray-700/70 bg-black/20 p-1">
              {["list", "table"].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={[
                    "px-3 py-1.5 rounded-full text-sm capitalize",
                    view === v ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-white/5",
                  ].join(" ")}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* TOP STATS */}
        <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          <Card>
            <div className="text-sm text-gray-300">Total Players</div>
            <div className="mt-2 text-3xl font-extrabold text-white">{metrics.players.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Active players</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-300">
              Games {period === "daily" ? "Today" : "This " + (period === "weekly" ? "Week" : period === "monthly" ? "Month" : "Period")}
            </div>
            <div className="mt-2 text-3xl font-extrabold text-white">{metrics.games.toLocaleString()}</div>
            <div className="text-xs text-gray-400">From current selection</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-300">Avg Win Rate</div>
            <div className="mt-2 text-3xl font-extrabold text-emerald-300">{fmtPct(metrics.winRate)}</div>
            <div className="text-xs text-gray-400">Community average</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-300">Perfect Games</div>
            <div className="mt-2 text-3xl font-extrabold text-fuchsia-300">{metrics.perfect.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Solved in all attempts</div>
          </Card>
        </div>

        {/* FILTERS */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <Card>
            <div className="text-[11px] uppercase tracking-wider text-gray-400 mb-1">Category</div>
            {loadingCats ? (
              <div className="rounded-xl border border-gray-700/60 bg-white/5 px-3 py-2 text-gray-400">Loading…</div>
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl bg-black/30 border border-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </Card>

          {period === "daily" && (
            <Card>
              <div className="text-[11px] uppercase tracking-wider text-gray-400 mb-1">Date</div>
              <input
                type="date"
                value={date}
                max={todayStr()}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl bg-black/30 border border-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </Card>
          )}

          <Card>
            <div className="text-[11px] uppercase tracking-wider text-gray-400 mb-1">Limit</div>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full rounded-xl bg-black/30 border border-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Card>

          <Card>
            <div className="flex h-full items-end justify-end">
              <button
                onClick={fetchBoard}
                className="rounded-xl bg-gradient-to-r from-gray-800 to-gray-700 px-5 py-2 font-semibold text-white shadow hover:from-gray-700 hover:to-gray-600"
                title="Refresh"
              >
                Refresh
              </button>
            </div>
          </Card>
        </div>

        {/* PODIUM (Top 3) */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <div className="flex items-center justify-between">
                <div className="text-2xl">{trophy(i)}</div>
                <div className="text-[11px] uppercase tracking-wider text-gray-400">{rankLabel(i)}</div>
              </div>
              <div className="mt-3">
                {loading ? (
                  <div className="text-sm text-gray-400">Loading…</div>
                ) : rows[i] ? (
                  <>
                    <div className="text-lg font-semibold text-white">{rows[i].user || "Anonymous"}</div>
                    <div className="mt-1 text-sm text-gray-300">
                      Score <span className="font-bold text-gray-100">{rows[i].score}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-300">
                      Level Reached <span className="font-semibold text-gray-100">{rows[i].levelReached ?? "—"}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-400">No data yet — be the first to bat!</div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* RESULTS AREA — single place (List OR Table) to avoid overlap */}
        {view === "list" ? (
          <Card className="mt-6">
            <div className="mb-3">
              <h3 className="text-lg font-semibold">🏟️ Daily Champions</h3>
              <div className="text-xs text-gray-400">Top performers for the selected period</div>
            </div>

            {loading ? (
              <div className="py-10 text-center text-gray-400">Loading…</div>
            ) : err ? (
              <div className="py-10 text-center">
                <div className="inline-block rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">{err}</div>
              </div>
            ) : rows.length === 0 ? (
              <div className="py-10 text-center text-gray-400">No results for this selection.</div>
            ) : (
              <ul className="space-y-3">
                {rows.map((r, idx) => {
                  const rank = idx + 1;
                  const mine = idx === myIndex;
                  const badges = badgesForRow(r);
                  return (
                    <li
                      key={`${r.user}-${idx}`}
                      className={[
                        "rounded-2xl border border-gray-700/60 bg-white/5 px-4 py-3",
                        mine ? "ring-1 ring-emerald-500/40 bg-emerald-900/10" : "hover:bg-white/10",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="w-10 shrink-0 text-xl font-bold text-gray-200 tabular-nums">#{rank}</div>

                        {/* Avatar + Name + Badges */}
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-700/30 text-emerald-200 border border-emerald-500/30">
                            <span className="text-sm font-bold">{initialsOf(r.user)}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="truncate font-semibold text-white">{r.user || "Anonymous"}</div>
                              {mine && (
                                <span className="rounded-md border border-emerald-500/40 bg-emerald-900/20 px-2 py-0.5 text-[10px] text-emerald-200">You</span>
                              )}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              {badges.map((b, i) => (
                                <span
                                  key={i}
                                  className={["text-[10px] px-2 py-0.5 rounded-full", toneToClasses[b.tone] || toneToClasses.slate].join(" ")}
                                >
                                  {b.text}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Right Stat Strip */}
                        <div className="grid grid-cols-3 items-center gap-4 text-right text-sm">
                          <div>
                            <div className="text-[11px] uppercase tracking-wider text-gray-400">Level</div>
                            <div className="font-semibold text-gray-100">{r.levelReached ?? "—"}</div>
                          </div>
                          <div>
                            <div className="text-[11px] uppercase tracking-wider text-gray-400">Score</div>
                            <div className="font-extrabold text-amber-200">{r.score ?? 0}</div>
                          </div>
                          <div className="pr-1">
                            <div className="text-[11px] uppercase tracking-wider text-gray-400">Total</div>
                            <div className="font-extrabold text-amber-200">{r.score ?? 0}</div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        ) : (
          <Card className="mt-6 overflow-x-auto">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Scorecard</h3>
              <div className="text-xs text-gray-400">Tip: Adjust filters to “set your field”.</div>
            </div>

            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="py-2 pr-4">Rank</th>
                  <th className="py-2 pr-4">Player</th>
                  <th className="py-2 pr-4">Score</th>
                  <th className="py-2 pr-4">Level Reached</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-t border-gray-700/60">
                      <td className="py-3 pr-4 text-gray-500">—</td>
                      <td className="py-3 pr-4 text-gray-500">Loading…</td>
                      <td className="py-3 pr-4 text-gray-500">—</td>
                      <td className="py-3 pr-4 text-gray-500">—</td>
                    </tr>
                  ))
                ) : err ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center">
                      <div className="inline-block rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">{err}</div>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400">No results for this selection.</td>
                  </tr>
                ) : (
                  rows.map((r, idx) => {
                    const isMe = myIndex === idx;
                    const rank = idx + 1;
                    return (
                      <tr
                        key={`${r.user}-${idx}`}
                        className={["border-t border-gray-700/60", isMe ? "bg-emerald-900/20" : "hover:bg-white/5"].join(" ")}
                      >
                        <td className="py-3 pr-4 font-semibold text-gray-100">
                          {rank <= 3 ? trophy(idx) : `#${rank}`}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-100 font-medium">{r.user || "Anonymous"}</span>
                            {isMe && (
                              <span className="text-[10px] rounded-md border border-emerald-500/40 bg-emerald-900/20 px-2 py-0.5 text-emerald-200">You</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 pr-4 font-semibold text-gray-100">{r.score}</td>
                        <td className="py-3 pr-4">{r.levelReached ?? "—"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Card>
        )}

        {/* ACHIEVEMENT GUIDE */}
        <Card className="mt-6">
          <h3 className="text-lg font-semibold">🥇 Achievement Guide</h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <LegendPill tone="amber" text="Century Maker" sub="100+ score in a session" />
            <LegendPill tone="green" text="Six Hitter" sub="200+ total score" />
            <LegendPill tone="purple" text="Perfect Streak" sub="Level 6 reached" />
            <LegendPill tone="blue" text="Consistent Player" sub="Top 10 multiple times" />
            <LegendPill tone="orange" text="Quick Solver" sub="High level in few tries" />
            <LegendPill tone="slate" text="Newcomer" sub="New to the game" />
          </div>
        </Card>

        {/* CTA (match Profile.jsx) */}
        <div className="mt-8 flex gap-3">
          <Link
            to="/categories"
            className="rounded-xl bg-gradient-to-r from-gray-800 to-gray-700 px-5 py-2 font-semibold text-white shadow hover:from-gray-700 hover:to-gray-600"
          >
            Play Now →
          </Link>
          <Link
            to="/profile"
            className="rounded-xl border border-gray-600 px-5 py-2 font-semibold text-gray-200 hover:bg-white/5"
          >
            My Stats
          </Link>
        </div>
      </div>
    </div>
  );
}

/* --- small legend pill --- */
function LegendPill({ tone = "slate", text, sub }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-700/60 bg-white/5 px-3 py-2">
      <span className={["px-2 py-0.5 rounded-full text-[11px]", toneToClasses[tone]].join(" ")}>{text}</span>
      <span className="text-xs text-gray-400">{sub}</span>
    </div>
  );
}
