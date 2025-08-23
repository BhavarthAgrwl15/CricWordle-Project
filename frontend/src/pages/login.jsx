import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Basic Login Page for Cricket Wordle (React + Tailwind)
// Backend is expected to expose POST /api/auth/login
// - Recommended: issue an httpOnly cookie (so we don't store tokens here)
// - Otherwise, return { token, user } and you can store token in memory/localStorage
// Configure API base via VITE_API_BASE or default localhost:5000
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // send/receive cookies if server uses httpOnly cookie auth
        body: JSON.stringify({ email, password })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.msg || data?.error || "Login failed");
      }

      // If your server returns a token instead of cookie, you can store it here (optional):
      // if (data.token) localStorage.setItem("token", data.token);

      navigate("/play");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-emerald-950 via-neutral-950 to-black text-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="text-4xl">🏏</div>
          <h1 className="mt-2 text-2xl font-bold">Cricket Wordle</h1>
          <p className="text-sm text-neutral-400 mt-1">Login to play the daily puzzle</p>
        </div>

        <form onSubmit={onSubmit} className="rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur p-5 shadow-xl">
          {error && (
            <div className="mb-4 rounded-lg border border-red-700 bg-red-900/20 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full mb-4 px-3 py-2 rounded-xl bg-neutral-900/70 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />

          <label className="block text-sm mb-1">Password</label>
          <div className="relative mb-4">
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-xl bg-neutral-900/70 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-200"
            >
              {showPwd ? "HIDE" : "SHOW"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60 font-semibold"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <div className="flex items-center justify-between mt-4 text-sm text-neutral-400">
            <a className="hover:text-neutral-200" href="#" onClick={(e)=>e.preventDefault()}>Forgot password?</a>
            <a className="hover:text-neutral-200" href="/register">Create account</a>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-neutral-500">
          By continuing you agree to our Terms & Privacy Policy.
        </div>
      </div>
    </div>
  );
}
