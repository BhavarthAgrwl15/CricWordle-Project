// src/pages/Matrix.jsx
import React, { useState, useRef, useContext, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { sendGuess, finishPuzzle } from "../services/game-api";
import { AuthContext } from "../contexts/auth-context";
import toast, { Toaster } from "react-hot-toast";
import { useGame } from "../contexts/game-context";
import {
  FaTrophy,
  FaDice,
  FaLayerGroup,
  FaHeart,
} from "react-icons/fa";

export default function Matrix() {
  const location = useLocation();
  const navigate = useNavigate();
  const { puzzle, initPayload } = location.state || {};
  const { maxAttempts, wordLength, puzzleId, maxScore } = puzzle || {};
  const { user } = useContext(AuthContext);
  const { loadProfile } = useGame();
  const userId = user?.id;

  // ---- GRID ----
  const [grid, setGrid] = useState(
    Array.from({ length: maxAttempts }, () => Array(wordLength).fill(""))
  );
  const [feedbackGrid, setFeedbackGrid] = useState(
    Array.from({ length: maxAttempts }, () => Array(wordLength).fill(""))
  );
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);

  // ---- SCORE & ATTEMPTS ----
  const penalty = maxScore / maxAttempts;
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const attemptsLeft = maxAttempts - attemptsUsed;

  const inputRefs = useRef([]);

  useEffect(() => {
    focusCell(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const focusCell = (row, col) => {
    const idx = row * wordLength + col;
    const el = inputRefs.current[idx];
    if (el) {
      el.readOnly = false;
      el.focus();
    }
  };

  const handleInput = (val) => {
    if (currentRow >= maxAttempts) return;
    if (!/^[A-Z]$/i.test(val)) return;

    const newGrid = grid.map((r) => [...r]);
    newGrid[currentRow][currentCol] = val.toUpperCase();
    setGrid(newGrid);

    if (currentCol < wordLength - 1) {
      setCurrentCol((c) => {
        const next = c + 1;
        focusCell(currentRow, next);
        return next;
      });
    } else {
      handleSubmitRow(newGrid[currentRow].join(""));
    }
  };

  const handleBackspace = () => {
    if (currentRow >= maxAttempts) return;
    const newGrid = grid.map((r) => [...r]);

    if (currentCol > 0 && newGrid[currentRow][currentCol] === "") {
      const prevCol = currentCol - 1;
      newGrid[currentRow][prevCol] = "";
      setGrid(newGrid);
      setCurrentCol(prevCol);
      focusCell(currentRow, prevCol);
      return;
    }

    if (newGrid[currentRow][currentCol] !== "") {
      newGrid[currentRow][currentCol] = "";
      setGrid(newGrid);
      focusCell(currentRow, currentCol);
    }
  };

  const handleEnter = () => {
    if (currentRow >= maxAttempts) return;
    const row = grid[currentRow];
    if (!row || row.some((ch) => ch === "")) {
      toast.error("Complete the row before submitting");
      return;
    }
    const word = row.join("");
    handleSubmitRow(word);
  };

  const handleSubmitRow = async (typedWord) => {
    try {
      const newAttemptsUsed = attemptsUsed + 1;
      setAttemptsUsed(newAttemptsUsed);

      const result = await sendGuess({ puzzleId, guess: typedWord, userId });

      const newFeedback = feedbackGrid.map((r) => [...r]);
      newFeedback[currentRow] = result.feedback;
      setFeedbackGrid(newFeedback);

      let currentScore = Math.max(maxScore - newAttemptsUsed * penalty, 0);
      if (newAttemptsUsed == 1) currentScore = maxScore;

      if (result.solved) {
        await finishPuzzle({ puzzleId, result: "won", score: currentScore });
        toast.success(`🎉 You won! Score: ${currentScore}`);
        await loadProfile();
        setTimeout(() => navigate("/start"), 1200);
        return;
      }

      if (currentRow >= maxAttempts - 1) {
        await finishPuzzle({ puzzleId, result: "lost", score: currentScore });
        toast.error(`❌ You lost. Final Score: ${currentScore}`);
        await loadProfile();
        setTimeout(() => navigate("/start"), 1200);
        return;
      }

      setCurrentRow((r) => {
        const nextRow = r + 1;
        setCurrentCol(0);
        setTimeout(() => focusCell(nextRow, 0), 30);
        return nextRow;
      });
    } catch (err) {
      console.error(err);
      toast.error(err.msg || "Failed to submit guess");
    }
  };

  const getCellColor = (row, col) => {
    const fb = feedbackGrid[row][col];
    if (fb === "correct") return "bg-green-500 text-white";
    if (fb === "present") return "bg-yellow-400 text-black";
    if (fb === "absent") return "bg-red-500 text-white";
    return "bg-white/10 text-gray-100 border border-gray-600";
  };

  const getKeyColor = (letter) => {
    let status = "";
    feedbackGrid.forEach((row, r) => {
      row.forEach((fb, c) => {
        if (grid[r][c] === letter) {
          if (fb === "correct") status = "correct";
          else if (fb === "present" && status !== "correct") status = "present";
          else if (fb === "absent" && !status) status = "absent";
        }
      });
    });

    if (status === "correct") return "bg-green-600 text-white";
    if (status === "present") return "bg-yellow-400 text-black";
    if (status === "absent") return "bg-red-500 text-white";
    return "bg-white/10 text-gray-200 border border-gray-600";
  };

  const meta = useMemo(() => {
    return [
      { label: "Category", value: initPayload?.category, icon: <FaLayerGroup className="text-indigo-400" /> },
      { label: "Level", value: initPayload?.level, icon: <FaDice className="text-purple-400" /> },
      { label: "Attempts Left", value: attemptsLeft, icon: <FaHeart className="text-rose-400" /> },
      { label: "Max Score", value: maxScore, icon: <FaTrophy className="text-yellow-400" /> },
    ];
  }, [initPayload, attemptsLeft, maxScore]);

  const row1 = "QWERTYUIOP".split("");
  const row2 = "ASDFGHJKL".split("");
  const row3 = "ZXCVBNM".split("");

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key;
      if (/^[a-zA-Z]$/.test(k)) {
        handleInput(k.toUpperCase());
      } else if (k === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (k === "Enter") {
        e.preventDefault();
        handleEnter();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="min-h-screen w-full text-gray-100 px-6 py-10">
      <Toaster position="top-center" reverseOrder={false} />

      <header className="text-center mb-8">
        <div className="text-4xl">🎯</div>
      </header>

     
    

      {/* Grid */}
      <div className="flex justify-center mb-8">
        <div className="grid gap-2">
          {grid.map((row, rIdx) => (
            <div key={rIdx} className="flex gap-2">
              {row.map((cell, cIdx) => (
                <input
                  key={cIdx}
                  type="text"
                  value={cell}
                  maxLength={1}
                  style={{ caretColor: "transparent" }}
                  className={`w-12 h-12 md:w-14 md:h-14 text-center text-xl font-bold rounded-lg transition-colors duration-300 ${getCellColor(
                    rIdx,
                    cIdx
                  )} ${rIdx === currentRow && cIdx === currentCol ? "ring-2 ring-indigo-400" : ""}`}
                  readOnly={!(rIdx === currentRow && cIdx === currentCol)}
                  onChange={(e) => handleInput(e.target.value.toUpperCase())}
                  ref={(el) => (inputRefs.current[rIdx * wordLength + cIdx] = el)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Virtual Keyboard */}
      <div className="flex flex-col items-center gap-2">
        <div className="grid grid-cols-10 gap-2">
          {row1.map((l) => (
            <button
              key={l}
              onClick={() => handleInput(l)}
              className={`h-12 px-3 rounded-lg font-bold text-sm uppercase shadow-md transition-transform hover:scale-105 ${getKeyColor(
                l
              )}`}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-9 gap-2">
          {row2.map((l) => (
            <button
              key={l}
              onClick={() => handleInput(l)}
              className={`h-12 px-3 rounded-lg font-bold text-sm uppercase shadow-md transition-transform hover:scale-105 ${getKeyColor(
                l
              )}`}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEnter}
            className="h-12 px-5 rounded-lg font-semibold text-sm bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg hover:scale-105 transition"
          >
            ENTER
          </button>
          <div className="grid grid-cols-7 gap-2">
            {row3.map((l) => (
              <button
                key={l}
                onClick={() => handleInput(l)}
                className={`h-12 px-3 rounded-lg font-bold text-sm uppercase shadow-md transition-transform hover:scale-105 ${getKeyColor(
                  l
                )}`}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            onClick={handleBackspace}
            className="h-12 px-4 rounded-lg font-semibold text-sm bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg hover:scale-105 transition"
          >
            ⌫
          </button>
        </div>
        
      </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto mb-8 mt-10">
        {meta.map(({ label, value, icon }) => (
          <div
            key={label}
            className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-gray-700/60 p-4 rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
          >
            <div className="text-2xl">{icon}</div>
            <div>
              <p className="text-xs text-gray-300 uppercase tracking-wide">{label}</p>
              <p className="text-lg font-semibold text-white">{value ?? "—"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
