import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/auth-context";
import { fetchGameSessions, fetchAllGameSessions } from "../services/game-api";

/* --- simple Card replacement --- */
function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-gray-700/70 bg-white/10 backdrop-blur-xl p-5 shadow ${className}`}
    >
      {children}
    </div>
  );
}

/* --- utils --- */
const initialsOf = (name) =>
  (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function LeaderboardSessions() {
  const { me } = useContext(AuthContext);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [category, setCategory] = useState("cricket");
  const [date, setDate] = useState("");
  const [limit, setLimit] = useState(10);

  /** fetch sessions depending on filters */
 async function fetchBoard(useFilters = false) {
  try {
    setLoading(true);
    setErr("");
    let data;
    if (useFilters && (date || category || limit)) {
      // filtered call
      data = await fetchGameSessions({ date, category, limit });
    } else {
      // default: fetch all
      data = await fetchAllGameSessions();
    }

    // ✅ filter and sort
    const processed = (data || [])
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);
    console.log(processed);
    setRows(processed);
  } catch (e) {
    setErr(e.msg || "Failed to load sessions");
  } finally {
    setLoading(false);
  }
}


  // on mount → load all sessions
  useEffect(() => {
    fetchBoard(false);
  }, []);

  const myIndex = rows.findIndex((r) => r.userId && me && r.userId === me._id);

return (
  <div className="min-h-screen w-full text-gray-100 px-6 py-10">
    <div className="mx-auto w-full max-w-5xl space-y-8">
      {/* HERO */}
      <Card className="border border-gray-700/40 rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-white">📊 Game Sessions</h1>
            <p className="mt-2 text-sm text-gray-300">
              Track your raw session results — every attempt is shown.
            </p>
          </div>
          <div className="hidden md:block text-sm text-gray-400">
            {me ? (
              <>
                Signed in as{" "}
                <span className="text-gray-200 font-semibold">{me.name}</span>
              </>
            ) : (
              <span className="italic text-gray-500">Guest Mode</span>
            )}
          </div>
        </div>
      </Card>

      {/* FILTERS */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Card className="border border-gray-700 p-4 rounded-2xl">
          <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">
            Category
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Enter category"
            className="w-full rounded-xl border border-gray-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </Card>

        <Card className="border border-gray-700 p-4 rounded-2xl">
          <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-gray-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </Card>

        <Card className="border border-gray-700 p-4 rounded-2xl">
          <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">
            Limit
          </label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full rounded-xl border border-gray-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {[10, 25, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </Card>

        <Card className="flex items-center justify-center border border-gray-700 rounded-2xl">
          <button
            onClick={() => fetchBoard(true)}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 font-semibold text-white shadow hover:from-indigo-500 hover:to-purple-500 transition"
          >
            🔄 Refresh
          </button>
        </Card>
      </div>

      {/* LIST */}
      <Card className="border border-gray-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Latest Sessions</h3>
          {/* Show All button (only if filters are applied) */}
          {(date || category || limit !== 10) && (
            <button
              onClick={() => fetchBoard(false)}
              className="rounded-lg border border-gray-600 px-3 py-1 text-xs font-medium text-gray-300 hover:bg-white/10 transition"
            >
              Show All
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-400 animate-pulse">
            Loading…
          </div>
        ) : err ? (
          <div className="py-10 text-center">
            <div className="inline-block rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-400">
              {err}
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="py-10 text-center text-gray-400">No sessions found.</div>
        ) : (
          <ul className="space-y-4">
            {rows.map((r, idx) => {
              const mine = idx === myIndex;
              return (
                <li
                  key={`${r.user}-${idx}`}
                  className={[
                    "rounded-2xl border px-4 py-3 transition",
                    mine
                      ? "border-indigo-500 bg-indigo-900/10 ring-1 ring-indigo-400/30"
                      : "border-gray-700/40 hover:bg-white/5",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-indigo-700/30 text-indigo-200 border border-indigo-500/30">
                      <span className="text-sm font-bold">
                        {initialsOf(r.user)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="truncate font-semibold text-white">
                          {r.user || "Anonymous"}
                        </div>
                        {mine && (
                          <span className="rounded-md border border-indigo-500/30 px-2 py-0.5 text-[10px] text-indigo-200">
                            You
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex gap-4 text-xs text-gray-400">
                        <span>Attempts: {r.attempts?.length || 0}</span>
                        <span>Category: {r.category}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-right text-sm">
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-gray-400">
                          Score
                        </div>
                        <div className="font-extrabold text-amber-200">
                          {r.score}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-gray-400">
                          Level
                        </div>
                        <div className="font-semibold text-gray-100">
                          {r.levelReached ?? "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* CTA */}
      <div className="flex gap-3 justify-center">
        <Link
          to="/categories"
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2 font-semibold text-white shadow hover:from-indigo-500 hover:to-purple-500 transition"
        >
          ▶️ Play Now
        </Link>
        <Link
          to="/profile"
          className="rounded-xl border border-gray-600 px-6 py-2 font-semibold text-gray-200 hover:bg-white/10 transition"
        >
          📈 My Stats
        </Link>
      </div>
    </div>
  </div>
);


};
