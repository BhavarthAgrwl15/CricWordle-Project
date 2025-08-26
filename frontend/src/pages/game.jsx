import { useLocation } from "react-router-dom";

export default function GamePage() {
  const location = useLocation();
  const { puzzle, category, level } = location.state || {};

  if (!puzzle) {
    return <div className="p-6 text-red-400">⚠️ No puzzle data. Go back and pick a category.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Playing {category} (Level {level})</h1>
      <p>Puzzle ID: {puzzle.puzzleId}</p>
      <p>Word Length: {puzzle.wordLength}</p>
      <p>Max Attempts: {puzzle.maxAttempts}</p>
      <p>Expires At: {new Date(puzzle.expiresAt).toLocaleTimeString()}</p>
      {/* render your actual Wordle game UI here */}
    </div>
  );
}