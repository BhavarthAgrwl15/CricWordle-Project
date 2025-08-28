// src/pages/Matrix.jsx
import React, { useState, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { sendGuess, finishPuzzle } from "../services/game-api"; // your API functions
import { AuthContext } from "../contexts/auth-context";
import toast, { Toaster } from "react-hot-toast"; // toast library
import { useGame } from "../contexts/game-context";

export default function Matrix() {
  const location = useLocation();
  const navigate = useNavigate();
  const { puzzle } = location.state || {};
  const { maxAttempts, wordLength, word, puzzleId } = puzzle || {};
  const { user } = useContext(AuthContext);
    const { loadProfile } = useGame();
  const userId = user.id;

  const [grid, setGrid] = useState(
    Array.from({ length: maxAttempts }, () => Array(wordLength).fill(""))
  );
  const [feedbackGrid, setFeedbackGrid] = useState(
    Array.from({ length: maxAttempts }, () => Array(wordLength).fill(""))
  );
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);

  const inputRefs = useRef([]);

  const focusCell = (row, col) => {
    const idx = row * wordLength + col;
    const el = inputRefs.current[idx];
    if (el) el.focus();
  };

  const handleInput = (val) => {
    if (currentRow >= maxAttempts) return;

    const newGrid = grid.map((r) => [...r]);
    newGrid[currentRow][currentCol] = val;
    setGrid(newGrid);

    if (currentCol < wordLength - 1) {
      setCurrentCol(currentCol + 1);
      focusCell(currentRow, currentCol + 1);
    } else {
      handleSubmitRow(newGrid[currentRow].join(""));
    }
  };

  const handleBackspace = () => {
    if (currentCol === 0 && currentRow === 0) return;

    const newCol = currentCol > 0 ? currentCol - 1 : wordLength - 1;
    const newRow = currentCol > 0 ? currentRow : currentRow - 1;

    const newGrid = grid.map((r) => [...r]);
    newGrid[newRow][newCol] = "";
    setGrid(newGrid);
    setCurrentCol(newCol);
    setCurrentRow(newRow);
    focusCell(newRow, newCol);
  };

  const handleSubmitRow = async (typedWord) => {
    try {
      const result = await sendGuess({ puzzleId, guess: typedWord, userId });

      // update feedbackGrid
      const newFeedback = feedbackGrid.map((r) => [...r]);
      newFeedback[currentRow] = result.feedback;
      setFeedbackGrid(newFeedback);

      if (result.solved) {
        await finishPuzzle({ puzzleId, result: "won", userId });
        toast.success("Congratulations! You won!");
        await loadProfile();
        setTimeout(() => navigate("/start"), 1000); // navigate after 1.5s
        return;
      }

      if (currentRow >= maxAttempts - 1) {
        await finishPuzzle({ puzzleId, result: "lost", userId });
        toast.error("Puzzle over! You lost.");
        await loadProfile();
        setTimeout(() => navigate("/start"), 1000);  // navigate after 1.5s
        return;
      }

      // move to next row
      setCurrentRow(currentRow + 1);
      setCurrentCol(0);
      focusCell(currentRow + 1, 0);
    } catch (err) {
      console.error(err);
      toast.error(err.msg || "Failed to submit guess");
    }
  };

  const letters = "QWERTYUIOPASDFGHJKLZXCVBNM".split("");

  const getCellColor = (row, col) => {
    const fb = feedbackGrid[row][col];
    if (fb === "correct") return "bg-green-500 text-white";
    if (fb === "present") return "bg-yellow-400 text-black";
    if (fb === "absent") return "bg-red-500 text-white";
    return "bg-gray-600 text-white";
  };

return (
  <div className="p-4 flex flex-col items-center gap-6">
    <Toaster position="top-center" reverseOrder={false} />
    <h1 className="text-2xl font-bold mb-4">Matrix Game</h1>

    {/* Rules -- Grid -- Colored Boxes side by side */}
    <div className="flex flex-col md:flex-row gap-12 items-start">
      
      {/* Rules Section (you will write here) */}
      <div className="md:w-64">
        <h2 className="text-lg font-semibold mb-2">Rules</h2>
        <p className="text-sm text-gray-300">
          {/* ✍️ Add your own rules here */}
          Type the correct word within 6 guess.
        </p>
      </div>

      {/* Grid Section */}
      <div className="grid gap-2">
        {grid.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-2">
            {row.map((cell, cIdx) => (
              <input
                key={cIdx}
                type="text"
                value={cell}
                maxLength={1}
                className={`w-12 h-12 text-center text-xl border rounded 
                  ${getCellColor(rIdx, cIdx)} 
                  ${
                    rIdx === currentRow && cIdx === currentCol
                      ? "border-2 border-white"
                      : ""
                  }`}
                readOnly={!(rIdx === currentRow && cIdx === currentCol)}
                onChange={(e) => handleInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Backspace") handleBackspace();
                  if (e.key === "Enter" && currentCol === wordLength - 1) {
                    handleSubmitRow(grid[currentRow].join(""));
                  }
                }}
                ref={(el) => (inputRefs.current[rIdx * wordLength + cIdx] = el)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Colored Boxes Section */}
      <div className="flex flex-col gap-6 md:w-64 items-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded bg-green-500"></div>
          <span className="mt-2 text-sm text-center text-gray-200">
            Correct letter & position
          </span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded bg-yellow-400"></div>
          <span className="mt-2 text-sm text-center text-gray-200">
            Correct letter, wrong position
          </span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded bg-red-500"></div>
          <span className="mt-2 text-sm text-center text-gray-200">
            Letter not in the word
          </span>
        </div>
      </div>
    </div>

    {/* Virtual Keyboard */}
    <div className="grid grid-cols-10 gap-2 mt-6">
      {letters.map((l) => (
        <button
          key={l}
          className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
          onClick={() => handleInput(l)}
        >
          {l}
        </button>
      ))}
      <button
        className="col-span-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-500"
        onClick={handleBackspace}
      >
        Backspace
      </button>
    </div>
  </div>
);



}
