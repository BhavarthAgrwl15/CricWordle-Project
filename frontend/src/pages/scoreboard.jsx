import React from "react";

export default function ScoreboardCard({
  i = 0,
  title,
  emoji,
  desc,
  accent = {},
  stats = {},
  category,
  onPlay,
}) {
  const length = stats.length ?? "4–6";
  const guesses = stats.guesses ?? "6";
  const bonus = stats.bonus ?? "+1/day";

  return (
    <div
      className={[
        "relative rounded-2xl border bg-white/10 backdrop-blur-xl p-5",
        "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.55)] hover:shadow-[0_14px_40px_-12px_rgba(0,0,0,0.6)]",
        "transition-transform duration-300 hover:scale-[1.02]",
        accent.border || "",
      ].join(" ")}
    >
      {/* header */}
      <div className={`mb-3 flex items-center gap-3 ${accent.text || ""}`}>
        <span className="text-xl select-none">{emoji}</span>
        <div className="flex-1 h-[40px] rounded-lg border border-gray-600/70 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 1px)",
              backgroundSize: "10px 10px",
            }}
          />
          <div className="relative h-full flex items-center justify-center px-3">
            <span className="tracking-[0.35em] text-sm font-mono text-gray-100">
              {title}
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-300">{desc}</p>

      <div className="mt-4">
        <button
          onClick={() => onPlay?.(category)}
          className={[
            "inline-flex items-center gap-2 px-4 py-2 rounded-xl",
            "bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600",
            "text-white font-semibold transition-transform duration-200 hover:scale-[1.03]",
            "shadow-lg shadow-black/40",
            accent.glow || "",
          ].join(" ")}
        >
          Play <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}
