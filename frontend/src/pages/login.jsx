// src/pages/LoginPage.jsx
import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../contexts/auth-context";
import { GameContext } from "../contexts/game-context";

// Helper validators
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isUsername = (v) => /^[a-zA-Z0-9._-]{3,20}$/.test(v);

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { loadProfile } = useContext(GameContext); // 👈 bring in game context
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function validateIdentifier(v) {
    return isEmail(v) || isUsername(v);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!validateIdentifier(emailOrUsername)) {
      setError("Enter a valid email or username (3–20 chars, letters/numbers . _ -)");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }

    setLoading(true);
    try {
      // step 1: login to get token
      const data = await login({ emailOrUsername, password });
        console.log(data);
      if (data?.token) {
        localStorage.setItem("token", data.token);

        // step 2: fetch profile + store in GameContext
        const userdata=await loadProfile(data.token);
        console.log(userdata);
      }
      navigate("/");
    } catch (err) {
      const msg = err?.response?.data?.msg || err?.message || "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full text-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="text-4xl">🏏</div>
          <h1 className="mt-2 text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-gray-200 to-white bg-clip-text text-transparent drop-shadow">
            Cricket Wordle
          </h1>
          <p className="text-sm text-gray-400 mt-1">Login to play the daily puzzle</p>
        </div>

        {/* Frosted card */}
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-gray-700/70 bg-white/10 backdrop-blur-xl p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
        >
          {error && (
            <div className="mb-4 rounded-lg border border-red-600/80 bg-red-900/20 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <label className="block text-sm mb-1 text-gray-300">Email or Username</label>
          <input
            type="text"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value.trim())}
            placeholder="you@example.com or sachinfan"
            autoComplete="username"
            className="w-full mb-4 px-3 py-2 rounded-xl bg-white/5 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder-gray-400"
          />

          <label className="block text-sm mb-1 text-gray-300">Password</label>
          <div className="relative mb-4">
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              autoComplete="current-password"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 pr-12 placeholder-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-200"
            >
              {showPwd ? "HIDE" : "SHOW"}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 disabled:opacity-60 font-semibold shadow-lg shadow-black/40 transition-transform duration-200 hover:scale-[1.01]"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
            <a className="hover:text-gray-200" href="#" onClick={(e) => e.preventDefault()}>
              Forgot password?
            </a>
            <Link className="hover:text-gray-200" to="/register">
              Create account
            </Link>
          </div>
        </form>

        <div className="mt-6 text-center text-[11px] text-gray-400">
          By continuing you agree to our Terms & Privacy Policy.
        </div>
      </div>
    </div>
  );
}
