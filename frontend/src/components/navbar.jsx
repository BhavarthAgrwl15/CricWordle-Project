// src/components/NavBar.jsx
import React, { useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/auth-context";
import { FaFire, FaSignOutAlt } from "react-icons/fa";
import { useGame } from "../contexts/game-context";

export default function NavBar() {
  const { user, logout } = useContext(AuthContext);
  const { profile } = useGame();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.warn("logout failed", err);
    } finally {
      navigate("/");
    }
  };

 // ✅ Calculate streak (only counts if most recent session is today)
const streakCount = useMemo(() => {
  if (!profile?.recentSessions?.length) return 0;

  // Sort recent session dates (latest first)
  const dates = [...new Set(profile.recentSessions.map((s) => s.date))].sort(
    (a, b) => new Date(b) - new Date(a)
  );

  let today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;

  // First check: if latest date is not today → return 0 immediately
  const mostRecent = new Date(dates[0]);
  mostRecent.setHours(0, 0, 0, 0);
  if (mostRecent.getTime() !== today.getTime()) return 0;

  // Now count backwards day by day
  for (let i = 0; i < dates.length; i++) {
    const d = new Date(dates[i]);
    d.setHours(0, 0, 0, 0);

    if (d.getTime() === today.getTime()) {
      streak++;
      today.setDate(today.getDate() - 1); // go one day back
    } else {
      break;
    }
  }

  return streak;
}, [profile]);


  return (
    <nav className="bg-black/70 backdrop-blur sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-3 grid grid-cols-3 items-center">
        {/* Left: Logo + CricWordle */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            {/* rectangular rounded container that sizes by height; image keeps its aspect ratio */}
            <div className="h-12 md:h-16 rounded-xl overflow-hidden shadow-md transition-transform duration-300 group-hover:scale-105 bg-white/5">
              <img
                src="/logo3.png" /* transparent PNG/SVG provided */
                alt="Cricket Wordle"
                className="h-full w-auto block object-contain"
              />
            </div>
          </Link>
        </div>

        {/* Center: Menu */}
        <ul className="flex justify-center space-x-8 text-gray-300 font-medium">
          <li>
            <Link to="/" className="hover:text-white transition">
              Home
            </Link>
          </li>
          <li>
            <Link to="/categories" className="hover:text-white transition">
              Categories
            </Link>
          </li>
          <li>
            <Link to="/leaderboard" className="hover:text-white transition">
              Leaderboard
            </Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-white transition">
              About
            </Link>
          </li>
        </ul>

        {/* Right: Streak + Profile + Logout */}
        <div className="flex items-center gap-5 justify-end">
          {!user ? (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-300 hover:text-white transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-400 text-gray-200 hover:bg-gray-200/10 transition shadow-md"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {/* 🔥 Streak */}
              <div className="flex items-center gap-1 text-blue-400 font-semibold">
                <FaFire className="w-5 h-5" />
                <span>{streakCount}</span>
              </div>

              {/* Profile link */}
              <Link
                to="/profile"
                className="flex items-center gap-2 text-gray-200 font-medium hover:text-white transition cursor-pointer"
                title={user.name || user.username || user.email}
              >
                <span className="truncate max-w-[120px]">
                  {user.name || user.username || user.email}
                </span>
                <img
                  src="/jersey.jpg"
                  alt="Jersey"
                  className="h-8 w-8 object-cover rounded-full border border-gray-500 shadow-sm"
                />
              </Link>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-rose-400 hover:bg-white/5 transition"
              >
                <FaSignOutAlt /> Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
