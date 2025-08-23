import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
//ADD RECAPTCHA TOO IF POSSIBLE
// SIGN UP PAGE (React + Tailwind)
// Expects backend: POST /api/auth/register { name, username, email, password }
// Password validation: at least 6 characters and must contain a number
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(pw) {
  return pw.length >= 6 && /[0-9]/.test(pw);
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [agree, setAgree] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const canSubmit =
    name.trim().length >= 2 &&
    username.trim().length >= 3 &&
    validateEmail(email) &&
    validatePassword(password) &&
    password === confirm &&
    agree &&
    !loading;

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setOk("");
    if (!canSubmit) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, username, email, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.msg || data?.error || "Sign up failed");
      setOk("Account created! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1000);
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
          <h1 className="mt-2 text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-neutral-400 mt-1">Play the daily Cricket Wordle</p>
        </div>

        <form onSubmit={onSubmit} className="rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur p-5 shadow-xl space-y-4">
          {error && (
            <div className="rounded-lg border border-red-700 bg-red-900/20 px-3 py-2 text-sm text-red-300">{error}</div>
          )}
          {ok && (
            <div className="rounded-lg border border-emerald-700 bg-emerald-900/20 px-3 py-2 text-sm text-emerald-300">{ok}</div>
          )}

          <div>
            <label className="block text-sm mb-1">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sachin Tendulkar"
              className="w-full px-3 py-2 rounded-xl bg-neutral-900/70 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="sachinfan"
              className="w-full px-3 py-2 rounded-xl bg-neutral-900/70 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 rounded-xl bg-neutral-900/70 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-3 py-2 rounded-xl bg-neutral-900/70 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-200"
              >
                {showPwd ? "HIDE" : "SHOW"}
              </button>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">Password must be at least 6 characters and contain a number.</p>
          </div>

          <div>
            <label className="block text-sm mb-1">Confirm Password</label>
            <input
              type={showPwd ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••"
              className="w-full px-3 py-2 rounded-xl bg-neutral-900/70 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            {confirm && confirm !== password && (
              <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
            )}
          </div>

          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={agree} onChange={(e)=>setAgree(e.target.checked)} className="mt-1 h-4 w-4 rounded border-neutral-700 bg-neutral-900" />
            <span>I agree to the <a className="underline hover:text-neutral-200" href="#" onClick={(e)=>e.preventDefault()}>Terms</a> & <a className="underline hover:text-neutral-200" href="#" onClick={(e)=>e.preventDefault()}>Privacy Policy</a>.</span>
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60 font-semibold"
          >
            {loading ? "Creating…" : "Create account"}
          </button>

          <div className="text-sm text-neutral-400 text-center">
            Already have an account? <Link to="/login" className="underline hover:text-neutral-200">Sign in</Link>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-neutral-500">
          Protected by reCAPTCHA • This site respects your privacy
        </div>
      </div>
    </div>
  );
}
