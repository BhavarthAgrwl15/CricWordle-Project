// src/pages/Matrix.jsx
import React, { useState, useRef, useContext, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { sendGuess, finishPuzzle } from "../services/game-api";
import { AuthContext } from "../contexts/auth-context";
import toast, { Toaster } from "react-hot-toast";
import { useGame } from "../contexts/game-context";
import Profile from "../pages/profile";

/* ---------- Extras (front-end only, no backend) ---------- */
const COMMENTARY = {
  start: [
    "Welcome to today’s word duel!",
    "Pitch looks true—batters should enjoy this!",
    "Crowd is buzzing. Ready when you are!",
  ],
  correct: [
    "Glorious timing! Found the gap!",
    "Sweet spot! That raced away!",
    "Textbook stroke—beautiful!",
  ],
  present: [
    "So close! Just past the fielder!",
    "Great intent—placement next time!",
    "Right idea, wrong spot!",
  ],
  absent: [
    "Beaten! Superb delivery there.",
    "Dot ball—watchful play!",
    "That one zipped past the bat!",
  ],
  win: ["HOWZAT! That’s the match!", "Champions stuff!", "Clinical finish—take a bow!"],
  loss: ["All out—tough luck!", "Fielders win this one!", "That’s cricket—come back stronger!"],
};

const KEYBOARD = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["ENTER","Z","X","C","V","B","N","M","BACKSPACE"],
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const promote = (oldState, nextState) => {
  const rank = { empty: 0, absent: 1, present: 2, correct: 3 };
  return rank[nextState] > rank[oldState || "empty"] ? nextState : oldState;
};

const judgeLocally = (guess, target) => {
  const res = Array(guess.length).fill("absent");
  const t = target.split("");
  const g = guess.split("");
  // correct pass
  for (let i = 0; i < g.length; i++) {
    if (g[i] === t[i]) {
      res[i] = "correct";
      t[i] = "#";
      g[i] = "_";
    }
  }
  // present pass
  for (let i = 0; i < g.length; i++) {
    if (g[i] !== "_") {
      const idx = t.indexOf(g[i]);
      if (idx !== -1) {
        res[i] = "present";
        t[idx] = "#";
      }
    }
  }
  return res;
};

// (kept) fun "runs" meter for your UI vibe
const runsFor = (letterStates, attemptNumber) => {
  const correct = letterStates.filter((s) => s === "correct").length;
  const present = letterStates.filter((s) => s === "present").length;
  let runs = 0;
  if (correct === letterStates.length) runs = 6;
  else if (correct >= 3) runs = 4;
  else if (correct >= 1 || present >= 2) runs = 2;
  else if (present >= 1) runs = 1;
  if (attemptNumber <= 2 && runs > 0) runs += 1; // early aggression bonus
  return runs;
};

export default function Matrix() {
  const location = useLocation();
  const navigate = useNavigate();
  const { puzzle } = location.state || {};
  const {
    maxAttempts = 6,
    wordLength = 5,
    word = "",
    puzzleId,
    logo,
    // scoring params (safe defaults if not passed from backend)
    maxScore = 100,
    penalty: penaltyIn = undefined,
  } = puzzle || {};
  const penalty = Number.isFinite(penaltyIn) ? penaltyIn : Math.ceil(maxScore / maxAttempts);

  const { user } = useContext(AuthContext) || {};
  const { loadProfile, profile } = useGame();
  const userId = user?.id;

  useEffect(() => {
    if (!puzzle) {
      toast.error("No puzzle loaded");
      navigate("/start");
    }
  }, [puzzle, navigate]);

  // --- Handle reload/exit: auto lose ---
  useEffect(() => {
    const handleUnload = async () => {
      try {
        await finishPuzzle({ puzzleId, result: "lost", userId });
      } catch {}
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [puzzleId, userId]);

  // --- Grid states ---
  const [grid, setGrid] = useState(
    Array.from({ length: maxAttempts }, () => Array(wordLength).fill(""))
  );
  const [feedbackGrid, setFeedbackGrid] = useState(
    Array.from({ length: maxAttempts }, () => Array(wordLength).fill(""))
  );
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const inputRefs = useRef([]);

  // --- UX states ---
  const [commentary, setCommentary] = useState(pick(COMMENTARY.start));
  const [runs, setRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [ball, setBall] = useState(1);
  const [over, setOver] = useState(1);
  const [mood, setMood] = useState("excited");
  const [keyboardStates, setKeyboardStates] = useState({}); // letter -> state

  // Modals / result
  const [showResult, setShowResult] = useState(false);
  const [won, setWon] = useState(false);
  const [drsUsed, setDrsUsed] = useState(false);
  const [showDRS, setShowDRS] = useState(false);

  // Scoring (your logic)
  const [attemptsUsed, setAttemptsUsed] = useState(0);

  // Ambient commentary every 8s
  useEffect(() => {
    const id = setInterval(() => {
      if (!showResult) setCommentary(pick(COMMENTARY.start));
    }, 8000);
    return () => clearInterval(id);
  }, [showResult]);

  const focusCell = (row, col) => {
    const idx = row * wordLength + col;
    const el = inputRefs.current[idx];
    if (el) el.focus();
  };

  const handleInput = (val) => {
    if (currentRow >= maxAttempts || showResult) return;
    if (!/^[A-Za-z]$/.test(val)) return;

    const v = val.toUpperCase();
    const newGrid = grid.map((r) => [...r]);
    newGrid[currentRow][currentCol] = v;
    setGrid(newGrid);

    if (currentCol < wordLength - 1) {
      setCurrentCol(currentCol + 1);
      focusCell(currentRow, currentCol + 1);
    } else {
      handleSubmitRow(newGrid[currentRow].join(""));
    }
  };

  const handleBackspace = () => {
    if (showResult) return;
    if (currentCol === 0) return; // stop at start of row, no prev row

    const newCol = currentCol - 1;
    const newGrid = grid.map((r) => [...r]);
    newGrid[currentRow][newCol] = "";
    setGrid(newGrid);
    setCurrentCol(newCol);
    focusCell(currentRow, newCol);
  };

  const updateKeyboard = (guess, states) => {
    setKeyboardStates((prev) => {
      const next = { ...prev };
      for (let i = 0; i < guess.length; i++) {
        const ch = guess[i];
        next[ch] = promote(next[ch], states[i] || "empty");
      }
      return next;
    });
  };

  const applyResultUI = (rowIdx, states, typedWord) => {
    // update feedback grid
    const newFb = feedbackGrid.map((r) => [...r]);
    newFb[rowIdx] = states;
    setFeedbackGrid(newFb);

    // keyboard states
    updateKeyboard(typedWord, states);

    // "runs" vibe meter
    const r = runsFor(states, rowIdx + 1);
    setRuns((x) => x + r);

    const allCorrect = states.every((s) => s === "correct");
    setWon(allCorrect);

    // over/ball
    const nextBall = ball + 1;
    const nextOver = nextBall > 6 ? over + 1 : over;
    setBall(nextBall > 6 ? 1 : nextBall);
    setOver(nextOver);

    // commentary
    if (allCorrect) {
      setMood("ecstatic");
      setCommentary(pick(COMMENTARY.win));
      toast.success("🏆 HOWZAT! You won!");
    } else if (r >= 4) {
      setMood("excited");
      setCommentary(pick(COMMENTARY.correct));
      toast(`🎯 Boundary! +${r} runs`, { icon: "🏏" });
    } else if (r > 0) {
      setMood("excited");
      setCommentary(pick(COMMENTARY.present));
      toast(`⭐ ${r} run${r > 1 ? "s" : ""}`);
    } else {
      setMood("disappointed");
      setCommentary(pick(COMMENTARY.absent));
      toast("• Dot ball");
      setWickets((w) => w + 1);
    }

    const inningsOver = rowIdx >= maxAttempts - 1;
    if (allCorrect || inningsOver) {
      if (inningsOver && !allCorrect) setCommentary(pick(COMMENTARY.loss));
      // we still show the modal briefly; navigate happens from handleSubmitRow
      setTimeout(() => setShowResult(true), 800);
      return true;
    }
    return false;
  };

  // balls faced = completed submissions (rows filled)
  const ballsFaced = currentRow;
  const strikeRate = ballsFaced > 0 ? ((runs / ballsFaced) * 100).toFixed(1) : "0.0";

  // --------- YOUR SCORE+SUBMIT LOGIC COMBINED WITH UI/KEYBOARD/COMMENTARY ----------
  const handleSubmitRow = async (typedWord) => {
    if (typedWord.length !== wordLength) return;

    // increment attempts (your logic)
    const newAttemptsUsed = attemptsUsed + 1;
    setAttemptsUsed(newAttemptsUsed);

    // compute score (your logic)
    let currentScore = Math.max(maxScore - newAttemptsUsed * penalty, 0);
    if (newAttemptsUsed === 1) currentScore = maxScore;

    try {
      // Try backend first
      const result = await sendGuess({ puzzleId, guess: typedWord, userId });
      const states = Array.isArray(result?.feedback) ? result.feedback : [];
      if (states.length !== wordLength) throw new Error("Bad feedback");

      const finished = applyResultUI(currentRow, states, typedWord);

      if (result?.solved) {
        try {
          await finishPuzzle({ puzzleId, result: "won", score: currentScore, userId });
          toast.success(`🎉 You won! Score: ${currentScore}`);
          await loadProfile?.();
          console.log("Profile loaded", profile);
        } catch {}
        setTimeout(() => navigate("/start"), 1200);
        return;
      }

      if (currentRow >= maxAttempts - 1 || finished) {
        try {
          await finishPuzzle({ puzzleId, result: "lost", score: currentScore, userId });
          toast.error(`❌ You lost. Final Score: ${currentScore}`);
          await loadProfile?.();
        } catch {}
        setTimeout(() => navigate("/start"), 1200);
        return;
      }

      // move to next row
      setCurrentRow((r) => {
        const nextRow = r + 1;
        setCurrentCol(0);
        setTimeout(() => focusCell(nextRow, 0), 30);
        return nextRow;
      });
    } catch (err) {
      // Fallback: local judge using secret `word`
      if (!word) {
        console.error(err);
        toast.error(err?.msg || "Failed to submit guess");
        return;
      }

      const states = judgeLocally(typedWord.toUpperCase(), word.toUpperCase());
      const finished = applyResultUI(currentRow, states, typedWord);

      const solvedLocal = states.every((s) => s === "correct");

      if (solvedLocal) {
        try {
          await finishPuzzle({ puzzleId, result: "won", score: currentScore, userId });
          toast.success(`🎉 You won! Score: ${currentScore}`);
          await loadProfile?.();
        } catch {}
        setTimeout(() => navigate("/start"), 1200);
        return;
      }

      if (currentRow >= maxAttempts - 1 || finished) {
        try {
          await finishPuzzle({ puzzleId, result: "lost", score: currentScore, userId });
          toast.error(`❌ You lost. Final Score: ${currentScore}`);
          await loadProfile?.();
        } catch {}
        setTimeout(() => navigate("/start"), 1200);
        return;
      }

      setCurrentRow((r) => {
        const nextRow = r + 1;
        setCurrentCol(0);
        setTimeout(() => focusCell(nextRow, 0), 30);
        return nextRow;
      });
    }
  };
  // -------------------------------------------------------------------------------

  const handleKeyPress = useCallback(
    (key) => {
      if (showResult) return;
      if (key === "ENTER") {
        if (currentCol === wordLength - 1 && grid[currentRow][wordLength - 1] !== "") {
          handleSubmitRow(grid[currentRow].join(""));
        } else {
          toast("Complete the word first!");
        }
        return;
      }
      if (key === "BACKSPACE") {
        handleBackspace();
        return;
      }
      if (/^[A-Z]$/.test(key)) {
        handleInput(key);
      }
    },
    [currentRow, currentCol, grid, wordLength, showResult] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toUpperCase();
      if (k === "ENTER" || k === "BACKSPACE" || /^[A-Z]$/.test(k)) {
        e.preventDefault();
        handleKeyPress(k);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleKeyPress]);

  // DRS: one review to reclaim last ball (kept)
  const useDRS = () => {
    if (drsUsed || currentRow === 0 || showResult) return;
    setDrsUsed(true);
    setShowDRS(true);
    toast("🎯 DRS Review… third umpire checking");
    setTimeout(() => {
      const reversed = Math.random() > 0.3; // 70% reverse
      if (reversed) {
        toast.success("✅ Decision reversed! You get that ball back.");
        const prev = currentRow - 1;
        const newGrid = grid.map((r) => [...r]);
        const newFb = feedbackGrid.map((r) => [...r]);
        newGrid[prev] = Array(wordLength).fill("");
        newFb[prev] = Array(wordLength).fill("");
        setGrid(newGrid);
        setFeedbackGrid(newFb);
        setCurrentRow(prev);
        setCurrentCol(0);
        setWickets((w) => Math.max(0, w - 1));
        focusCell(prev, 0);
      } else {
        toast("❌ Decision stands.");
      }
      setShowDRS(false);
    }, 1500);
  };

  const getCellColor = (row, col) => {
    const fb = feedbackGrid[row][col];
    if (fb === "correct") return "bg-emerald-500/85 text-white border-emerald-300/80 backdrop-blur-sm";
    if (fb === "present") return "bg-amber-400/85 text-black border-amber-200/80 backdrop-blur-sm";
    if (fb === "absent") return "bg-rose-600/85 text-white border-rose-300/80 backdrop-blur-sm";
    return "bg-white/10 text-white border-white/15 backdrop-blur-sm";
  };

  const logoSrc = logo || "/assets/logo.png";

  return (
    <div className="min-h-screen w-full p-4 flex flex-col items-center gap-6 bg-transparent">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Logo + Title */}
      <div className="flex flex-col items-center gap-2">
        <img
          src={logoSrc}
          alt="Game Logo"
          className="h-12 w-auto drop-shadow-[0_6px_16px_rgba(0,0,0,0.45)] select-none"
          draggable={false}
        />
        <h1 className="text-3xl font-extrabold tracking-tight text-white/90 drop-shadow-[0_2px_12px_rgba(59,130,246,0.25)]">
          Welcome to Pitch
        </h1>
      </div>

      {/* Commentary */}
      <div
        className="w-full max-w-4xl rounded-2xl border border-white/15 bg-white/10 px-5 py-4
                   shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] backdrop-blur-md"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <div className="text-amber-300 text-2xl">🎙️</div>
          <div className="text-white/90">
            <p className="italic text-[15px] leading-relaxed">“{commentary}”</p>
            <div className="mt-1 text-xs text-white/60">Stadium Buzz: {mood}</div>
          </div>
        </div>
      </div>

      {/* Rules -- Grid -- Legend */}
      <div className="flex flex-col md:flex-row gap-12 items-start">
        {/* Rules + DRS */}
        <div
          className="md:w-64 rounded-2xl border border-white/15 bg-white/10 p-4
                     shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] backdrop-blur-md"
        >
          <h2 className="text-lg font-semibold mb-2 text-white/95">Rules</h2>
          <p className="text-sm text-white/80">
            Type the correct {wordLength}-letter word within {maxAttempts} guesses.
          </p>
          {!drsUsed && currentRow > 0 && !showResult && (
            <button
              onClick={useDRS}
              className="mt-3 w-full rounded-xl bg-purple-600 text-white px-3 py-2
                         hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400
                         transition-all"
            >
              🟣 Use DRS (1)
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="grid gap-3">
          {grid.map((row, rIdx) => (
            <div key={rIdx} className="flex gap-3">
              {row.map((cell, cIdx) => (
                <input
                  key={cIdx}
                  type="text"
                  value={cell}
                  maxLength={1}
                  className={`w-14 h-14 text-center text-[20px] font-bold rounded-xl border 
                              transition-all duration-150 caret-transparent selection:bg-transparent
                              ${getCellColor(rIdx, cIdx)}
                              ${rIdx === currentRow && cIdx === currentCol ? "outline-none ring-2 ring-sky-300/80" : "ring-0"}`}
                  readOnly={!(rIdx === currentRow && cIdx === currentCol)}
                  onChange={(e) => handleInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace") handleBackspace();
                    if (e.key === "Enter" && currentCol === wordLength - 1) {
                      handleSubmitRow(grid[currentRow].join(""));
                    }
                  }}
                  onClick={() => {
                    if (rIdx === currentRow) setCurrentCol(cIdx); // allow only current row
                  }}
                  ref={(el) => (inputRefs.current[rIdx * wordLength + cIdx] = el)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div
          className="flex flex-col gap-6 md:w-64 items-center rounded-2xl border border-white/15 bg-white/10 p-4
                     shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] backdrop-blur-md"
        >
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/85 border border-emerald-300/80 backdrop-blur-sm"></div>
            <span className="mt-2 text-sm text-center text-white/85">Correct letter & position</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-lg bg-amber-400/85 border border-amber-200/80 backdrop-blur-sm"></div>
            <span className="mt-2 text-sm text-center text-white/85">Correct letter, wrong position</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-lg bg-rose-600/85 border border-rose-300/80 backdrop-blur-sm"></div>
            <span className="mt-2 text-sm text-center text-white/85">Letter not in the word</span>
          </div>
        </div>
      </div>

      {/* Keyboard */}
      <div className="space-y-2">
        {KEYBOARD.map((row, i) => (
          <div key={i} className="flex justify-center gap-2">
            {row.map((k) => {
              const state = keyboardStates[k] || "empty";
              const base =
                "px-3 py-2 rounded-lg text-sm font-semibold border transition-colors active:scale-[0.98] shadow-sm backdrop-blur-md";
              const cls =
                state === "correct"
                  ? "bg-emerald-500/85 border-emerald-300/80 text-white hover:bg-emerald-500"
                  : state === "present"
                  ? "bg-amber-400/85 border-amber-200/80 text-black hover:bg-amber-300/90"
                  : state === "absent"
                  ? "bg-rose-600/85 border-rose-300/80 text-white hover:bg-rose-500/90"
                  : "bg-white/10 border-white/15 text-white hover:bg-white/15";
              return (
                <button
                  key={k}
                  className={`${base} ${cls} ${k === "ENTER" || k === "BACKSPACE" ? "px-5" : "w-10"}`}
                  onClick={() => handleKeyPress(k)}
                  title={k}
                >
                  {k === "BACKSPACE" ? "⌫" : k === "ENTER" ? "↵" : k}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Scorecard (glassy) */}
      <div className="w-full max-w-4xl grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center text-white shadow-lg backdrop-blur-md">
          <div className="text-3xl font-black text-emerald-300 drop-shadow-[0_0_12px_rgba(16,185,129,0.35)]">
            {runs}
          </div>
          <div className="text-xs text-white/75">Total Runs</div>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center text-white shadow-lg backdrop-blur-md">
          <div className="text-3xl font-black text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.35)]">
            {over}.{ball - 1}
          </div>
          <div className="text-xs text-white/75">Overs Bowled</div>
        </div>
        <div className="col-span-2 flex items-center justify-between text-sm rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white shadow backdrop-blur-md">
          <span className="text-white/80">Strike Rate</span>
          <span className="font-extrabold text-sky-200 drop-shadow-[0_0_10px_rgba(56,189,248,0.35)]">
            {strikeRate}
          </span>
        </div>
        <div className="col-span-2 flex items-center justify-between text-sm text-white/90">
          <span className="text-white/75">Balls Faced</span>
          <span className="font-bold">{ballsFaced}/{maxAttempts}</span>
        </div>
      </div>

      {/* DRS modal */}
      {showDRS && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-black/70 backdrop-blur-sm">
          <div className="max-w-md w-[90%] rounded-2xl border border-white/15 bg-white/10 p-6 text-center text-white shadow-2xl backdrop-blur-md">
            <div className="text-xl font-bold">👁️ DRS Review in Progress</div>
            <div className="mt-3 text-sm text-purple-200">Third umpire is reviewing…</div>
            <div className="mx-auto mt-5 h-9 w-9 animate-spin rounded-full border-2 border-purple-300 border-t-transparent" />
          </div>
        </div>
      )}

      {/* Result modal */}
      {showResult && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-[90%] rounded-2xl border border-white/15 bg-white/10 p-6 text-center text-white shadow-2xl backdrop-blur-md">
            <div className={`text-2xl font-extrabold ${won ? "text-emerald-300" : "text-rose-300"}`}>
              {won ? "HOWZAT! Match Won 🏏" : "All Out! Better Luck Next Time 😔"}
            </div>
            <div className="mt-2 text-white/90">
              The word was: <span className="font-black text-amber-300">{word?.toUpperCase()}</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl bg-white/10 p-4 border border-white/15 backdrop-blur-md">
                <div className="text-2xl font-black text-emerald-300">{runs}</div>
                <div className="text-white/75">Total Runs</div>
              </div>
              <div className="rounded-xl bg-white/10 p-4 border border-white/15 backdrop-blur-md">
                <div className="text-2xl font-black text-sky-200">{ballsFaced}</div>
                <div className="text-white/75">Balls Faced</div>
              </div>
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={async () => {
                  try {
                    await finishPuzzle({ puzzleId, result: won ? "won" : "lost", userId });
                    await loadProfile?.();
                  } catch {}
                  navigate("/start");
                }}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-white hover:bg-emerald-500 focus:ring-2 focus:ring-emerald-400 transition"
              >
                New Match
              </button>
              <button
                onClick={() => setShowResult(false)}
                className="rounded-xl border border-white/20 px-5 py-2.5 text-white hover:bg-white/10 focus:ring-2 focus:ring-white/30 transition"
              >
                View Board
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
