import React from "react";

export default function ScoreboardCard({
  title,
  emoji,
  desc,
  accent = {},
  category,
  onPlay,
}) {
  return (
    <div
      className={[
        "relative rounded-2xl border bg-white/10 backdrop-blur-xl p-5",
        "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.55)] hover:shadow-[0_14px_40px_-12px_rgba(0,0,0,0.6)]",
        "transition-transform duration-300 hover:scale-[1.02]",
        accent.border || "",
      ].join(" ")}
    >
      {/* tiny pitch stripe at top (cricket quirk) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-yellow-400 via-green-600 to-yellow-400 rounded-b"></div>

      {/* header */}
      <div className={`mb-3 flex items-center gap-3 ${accent.text || ""}`}>
        <span className="text-xl select-none drop-shadow-lg">{emoji}</span>

        {/* scoreboard bar */}
        <div className="flex-1 h-[40px] rounded-lg border border-yellow-600/40 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden shadow-inner">
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 12px)",
            }}
          />
          <div className="relative h-full flex items-center justify-center px-3">
            <span className="tracking-[0.35em] text-sm font-mono text-green-400 drop-shadow">
              {title}
            </span>
          </div>
        </div>
      </div>

      {/* detailed description */}
      <p className="text-sm text-gray-200 leading-relaxed">
        {desc}
      </p>

      {/* play button */}
      <div className="mt-5">
        <button
          onClick={() => onPlay?.(category)}
          className={[
            "inline-flex items-center gap-2 px-5 py-2.5 rounded-full",
            "bg-gradient-to-r from-red-700 via-red-600 to-red-500",
            "hover:from-red-600 hover:to-red-400",
            "text-white font-bold uppercase tracking-wide",
            "shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-[1.08]",
            "relative overflow-hidden",
            accent.glow || "",
          ].join(" ")}
        >
          {/* seam lines on ball */}
          <span className="absolute left-2 w-1 h-6 bg-white/30 rounded-full rotate-12"></span>
          <span className="absolute left-3 w-1 h-6 bg-white/30 rounded-full -rotate-12"></span>
          Play <span aria-hidden>🏏</span>
        </button>
      </div>
    </div>
  );
}
