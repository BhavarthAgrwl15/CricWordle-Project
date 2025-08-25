import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupUser } from "../services/user";
//ADD RECAPTCHA TOO IF POSSIBLE
// SIGN UP PAGE (React + Tailwind)
// Expects backend: POST /api/auth/register { name, username, email, password }
// Password validation: at least 6 characters and must contain a number


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
      const data = await signupUser({ name, username, email, password });
      setOk("Account created successfully! Redirecting to login..."+data);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Something went wrong");
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
            Create your account
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Play the daily Cricket Wordle
          </p>
        </div>

        {/* Frosted translucent card */}
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-gray-700/70 bg-white/10 backdrop-blur-xl p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] space-y-4"
        >
          {error && (
            <div className="rounded-lg border border-red-600/80 bg-red-900/20 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}
          {ok && (
            <div className="rounded-lg border border-green-600/80 bg-green-900/20 px-3 py-2 text-sm text-green-300">
              {ok}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm mb-1 text-gray-300">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sachin Tendulkar"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder-gray-400"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm mb-1 text-gray-300">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="sachinfan"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder-gray-400"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm mb-1 text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder-gray-400"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm mb-1 text-gray-300">Password</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
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
            <p className="text-[11px] text-gray-400 mt-1">
              Password must be at least 6 characters and contain a number.
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm mb-1 text-gray-300">
              Confirm Password
            </label>
            <input
              type={showPwd ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder-gray-400"
            />
            {confirm && confirm !== password && (
              <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
            )}
          </div>

          {/* Terms & Privacy */}
          <label className="flex items-start gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-600 bg-white/5"
            />
            <span>
              I agree to the{" "}
              <a
                className="underline hover:text-gray-200"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                Terms
              </a>{" "}
              &{" "}
              <a
                className="underline hover:text-gray-200"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                Privacy Policy
              </a>.
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 disabled:opacity-60 font-semibold shadow-lg shadow-black/40 transition-transform duration-200 hover:scale-[1.01]"
          >
            {loading ? "Creating…" : "Create account"}
          </button>

          {/* Already have account */}
          <div className="text-sm text-gray-400 text-center">
            Already have an account?{" "}
            <Link to="/login" className="underline hover:text-gray-200">
              Sign in
            </Link>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          Protected by reCAPTCHA • This site respects your privacy
        </div>
      </div>
    </div>
  );
}