// src/components/NavBar.jsx
import React, { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/auth-context";

export default function NavBar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click / escape
  useEffect(() => {
    console.log("navbar",user);
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    function onEsc(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // If logout is async (calling API), await it. In our context it's sync but supporting both.
      await logout();
    } catch (err) {
      console.warn("logout failed", err);
    } finally {
      setMenuOpen(false);
      navigate("/"); // send user to home after logout
    }
  };

  const userInitial = (() => {
    if (!user) return "U";
    if (user.name && user.name.length) return user.name.trim()[0].toUpperCase();
    if (user.username && user.username.length) return user.username.trim()[0].toUpperCase();
    if (user.email && user.email.length) return user.email.trim()[0].toUpperCase();
    return "U";
  })();

  return (
    <nav className="bg-black/70 backdrop-blur sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
          🏏 <span>Cricket Wordle</span>
        </Link>

        {/* Menu */}
        <ul className="hidden md:flex space-x-8 text-gray-300 font-medium">
          <li>
            <Link to="/" className="hover:text-white transition">Home</Link>
          </li>
          <li>
            <Link to="/categories" className="hover:text-white transition">Categories</Link>
          </li>
          <li>
            <Link to="/leaderboard" className="hover:text-white transition">Leaderboard</Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-white transition">About</Link>
          </li>
        </ul>

        {/* Auth / Profile */}
        <div className="flex items-center gap-4 relative" ref={menuRef}>
          {!user ? (
            // not logged in
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
            // logged in: show avatar / dropdown
            <>
              <button
                onClick={() => setMenuOpen(v => !v)}
                aria-haspopup="true"
                aria-expanded={menuOpen}
                className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-sm font-semibold text-white hover:scale-[1.02] transition-shadow shadow-sm"
                title={user.name || user.email || "Profile"}
              >
                {userInitial}
              </button>

              {/* dropdown */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-3 w-44 bg-black/90 border border-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-800">
                    <div className="text-sm text-gray-200 font-semibold truncate">{user.name || user.username || user.email}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </div>

                  <div className="flex flex-col py-2">
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="px-4 py-2 text-sm text-gray-200 hover:bg-white/5 transition"
                    >
                      Profile
                    </Link>

                    <Link
                      to="/leaderboard"
                      onClick={() => setMenuOpen(false)}
                      className="px-4 py-2 text-sm text-gray-200 hover:bg-white/5 transition"
                    >
                      Leaderboard
                    </Link>

                    <div className="border-t border-gray-800 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-white/5 transition"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
