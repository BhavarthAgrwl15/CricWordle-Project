export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 text-gray-100">
      {/* Heading */}
      <h2 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-gray-200 to-white bg-clip-text text-transparent drop-shadow-lg">
        Welcome to Cricket Wordle 🏏
      </h2>

      {/* Subtext */}
      <p className="text-lg md:text-xl text-gray-300 max-w-xl mb-10 drop-shadow">
        Step onto the pitch, guess the right words, and climb the leaderboard.  
        Test your cricketing knowledge every day under the floodlights!
      </p>

      {/* Buttons */}
      <div className="flex gap-6">
        <button className="px-6 py-3 rounded-2xl bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white font-semibold shadow-lg shadow-black/40 transition-all duration-300 transform hover:scale-105">
          Start Playing
        </button>
        <button className="px-6 py-3 rounded-2xl border border-gray-400 text-gray-300 hover:bg-gray-200/10 font-semibold shadow-md shadow-gray-600/30 transition-all duration-300 transform hover:scale-105">
          View Leaderboard
        </button>
      </div>

      {/* Bottom icons / highlights */}
      <div className="mt-12 flex gap-10 text-sm text-gray-400">
        <span className="flex items-center gap-2">
          ⚡ <span className="font-medium">Daily Challenges</span>
        </span>
        <span className="flex items-center gap-2">
          🏆 <span className="font-medium">Achievements</span>
        </span>
        <span className="flex items-center gap-2">
          📊 <span className="font-medium">Leaderboard</span>
        </span>
      </div>
    </div>
  );
}
