import React from "react";
import { Link } from "react-router-dom";

const categories = [
  {
    key: "legends",
    title: "LEGENDS",
    emoji: "⭐",
    desc: "Iconic players across eras—test your cricket history.",
    to: "/play?category=legends",
    accent: { text: "text-amber-300", border: "border-amber-500/50", glow: "shadow-[0_10px_30px_-10px_rgba(251,191,36,0.35)]" },
    stats: { length: "4–6", guesses: "6", bonus: "+2/day" },
  },
  {
    key: "shots",
    title: "SHOTS",
    emoji: "🏏",
    desc: "Cover drives, scoops, reverse sweeps—name the stroke.",
    to: "/play?category=shots",
    accent: { text: "text-rose-300", border: "border-rose-500/50", glow: "shadow-[0_10px_30px_-10px_rgba(244,63,94,0.35)]" },
    stats: { length: "3–5", guesses: "6", bonus: "+1/day" },
  },
  {
    key: "stadiums",
    title: "STADIUMS",
    emoji: "🏟️",
    desc: "Wankhede to Lord’s—how well do you know the venues?",
    to: "/play?category=stadiums",
    accent: { text: "text-cyan-300", border: "border-cyan-500/50", glow: "shadow-[0_10px_30px_-10px_rgba(34,211,238,0.35)]" },
    stats: { length: "5–6", guesses: "6", bonus: "+3/week" },
  },
  {
    key: "terms",
    title: "TERMS",
    emoji: "⚡",
    desc: "Yorker, googly, powerplay—master the lingo.",
    to: "/play?category=terms",
    accent: { text: "text-indigo-300", border: "border-indigo-500/50", glow: "shadow-[0_10px_30px_-10px_rgba(99,102,241,0.35)]" },
    stats: { length: "3–6", guesses: "6", bonus: "+1/day" },
  },
];

// gently randomized-but-organized transforms
const transforms = [
  "rotate-[-1.5deg] md:translate-y-2",
  "rotate-[1.25deg] md:-translate-y-1",
  "rotate-[0.5deg]",
  "rotate-[-0.75deg] md:translate-y-1",
  "rotate-[1.75deg]",
  "rotate-[-0.25deg]",
];

function ScoreboardCard({ i, title, emoji, desc, to, accent, stats }) {
  const t = transforms[i % transforms.length];

  return (
    <div
      className={[
        "relative rounded-2xl border bg-white/10 backdrop-blur-xl p-5",
        "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.55)] hover:shadow-[0_14px_40px_-12px_rgba(0,0,0,0.6)]",
        "transition-transform duration-300 hover:scale-[1.02]",
        accent.border,
        t,
      ].join(" ")}
    >
      {/* local animations */}
      <style>{`
        @keyframes seamSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes batSwing{0%{transform:rotate(0deg)}50%{transform:rotate(-18deg)}100%{transform:rotate(0deg)}}
        .anim-seam { animation: seamSpin 10s linear infinite; transform-origin:center; }
        .hover-bat:hover .bat { animation: batSwing 600ms ease-in-out 1; }
      `}</style>

      {/* “screws” */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-3 top-3 h-2 w-2 rounded-full bg-gray-400/40 shadow-inner" />
        <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-gray-400/40 shadow-inner" />
        <div className="absolute left-3 bottom-3 h-2 w-2 rounded-full bg-gray-400/40 shadow-inner" />
        <div className="absolute right-3 bottom-3 h-2 w-2 rounded-full bg-gray-400/40 shadow-inner" />
      </div>

      {/* segmented header / LED area */}
      <div className={`mb-3 flex items-center gap-3 ${accent.text} hover-bat`}>
        <span className="text-xl select-none bat">{emoji}</span>
        <div className="flex-1 h-[40px] rounded-lg border border-gray-600/70 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 1px)",
              backgroundSize: "10px 10px",
            }}
          />
          <div className="relative h-full flex items-center justify-center px-3">
            <span className="tracking-[0.35em] text-sm font-mono text-gray-100">
              {title}
            </span>
          </div>
        </div>
        {/* spinning ball seam as tiny badge */}
        <div className="h-6 w-6 rounded-full border border-white/20 bg-gradient-to-br from-gray-200 to-gray-400 grid place-items-center">
          <div className="h-3 w-3 rounded-full bg-white/70 anim-seam" />
        </div>
      </div>

      {/* body */}
      <p className="text-sm text-gray-300">{desc}</p>

      {/* CTA */}
      <div className="mt-4">
        <Link
          to={to}
          className={[
            "inline-flex items-center gap-2 px-4 py-2 rounded-xl",
            "bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600",
            "text-white font-semibold transition-transform duration-200 hover:scale-[1.03]",
            "shadow-lg shadow-black/40",
            accent.glow,
          ].join(" ")}
        >
          Play <span aria-hidden>→</span>
        </Link>
      </div>

      {/* scoreboard rail with game stats */}
      <div className="mt-4 h-10 rounded-lg border border-gray-700/60 bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-between px-3 text-[11px] text-gray-300">
        <span className="flex items-center gap-1">
          🧩 <span className="text-gray-200">Word Length</span> ▸ {stats.length}
        </span>
        <span className="flex items-center gap-1">
          🎯 <span className="text-gray-200">Guesses</span> ▸ {stats.guesses}
        </span>
        <span className="flex items-center gap-1">
          🔥 <span className="text-gray-200">Streak Bonus</span> ▸ {stats.bonus}
        </span>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <div className="min-h-screen w-full text-gray-100 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* header */}
        <div className="text-center mb-10">
          <div className="text-4xl select-none">🏏</div>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-gray-200 to-white bg-clip-text text-transparent drop-shadow">
            Choose Your Category
          </h1>
          <p className="text-sm md:text-base text-gray-400 mt-2">
            Scored boards, live vibes. Pick one and take guard.
          </p>
        </div>

        {/* grid with scattered transforms */}
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => (
            <ScoreboardCard key={c.key} i={i} {...c} />
          ))}
        </div>

        {/* footer hint */}
        <div className="text-center text-[11px] text-gray-400 mt-8">
          Tip: Shuffle card order for a fresh “stadium wall” each visit.
        </div>
      </div>
    </div>
  );
}
                 