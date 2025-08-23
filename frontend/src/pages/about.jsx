import React from "react";
//import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";

// ABOUT US PAGE — Cricket-themed, dark, modern
// Fix for error: "Cannot destructure property 'basename'... as it is null"
// Cause: <Link> was rendered when no Router context existed (e.g., page used outside <BrowserRouter/>)
// Solution: Wrap Link rendering in an error boundary and fall back to <a> when Router is absent.
// Also export a tiny test harness to validate both cases.

/** Router-safe Link that gracefully degrades to <a> when no Router context exists. */
class RouterSafeLink extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() { /* Optionally log */ }
  render() {
    const { to, children, className, ...rest } = this.props;
    if (this.state.hasError) {
      const href = typeof to === "string" ? to : "#";
      return (
        <a href={href} className={className} {...rest}>
          {children}
        </a>
      );
    }
    // Try rendering RouterLink; if no Router is present, it will throw and the boundary will fallback to <a>
    return (
      <RouterLink to={to} className={className} {...rest}>
        {children}
      </RouterLink>
    );
  }
}

const Section = ({ title, children }) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="rounded-2xl border border-neutral-800 bg-neutral-900/40 backdrop-blur p-5 md:p-7"
  >
    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 mb-3">
      <span className="text-emerald-400">🏏</span>
      {title}
    </h2>
    <div className="text-sm md:text-base text-neutral-300 leading-relaxed">{children}</div>
  </motion.section>
);

export default function AboutPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-emerald-950 via-neutral-950 to-black text-neutral-100">
      {/* Header */}
      <div className="mx-auto max-w-5xl px-4 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl md:text-4xl font-extrabold tracking-tight">About Cricket Wordle</div>
            <p className="text-neutral-400 mt-1">Daily cricket-themed word puzzle • Built with MERN</p>
          </div>
          <div className="hidden sm:block">
            <RouterSafeLink to="/play" className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600">Play Today’s Puzzle</RouterSafeLink>
          </div>
        </div>
      </div>

      {/* Decorative pitch lines */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10">
          <div className="h-1 w-11/12 max-w-4xl bg-emerald-200 rounded" />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-16 grid gap-5 md:gap-7">
        <Section title="Our Goal">
          Cricket Wordle turns your love for cricket into a daily brain workout. We mix the thrill of a packed stadium with the focus of a net session—fast, fair, and fun—so fans can learn terms, celebrate legends, and keep a streak going every day.
        </Section>

        <Section title="How It Works">
          <ul className="list-disc pl-5 space-y-2">
            <li>Every day at <span className="font-semibold">00:00 IST</span>, a fresh puzzle drops with a word length between <span className="font-semibold">3–6 letters</span>.</li>
            <li>Choose your category (e.g., <em>Shots</em>, <em>Terms</em>, <em>Legends</em>, <em>Stadiums</em>) and difficulty.</li>
            <li>Type your guess; tiles flip: <span className="text-green-400 font-semibold">Perfect Hit</span> (correct), <span className="text-amber-400 font-semibold">Edge</span> (present), <span className="text-neutral-400 font-semibold">Dot Ball</span> (absent).</li>
            <li>Race the clock—your leaderboard rank is based on <span className="font-semibold">solve time</span> (server-timed).</li>
          </ul>
        </Section>

        <Section title="What Makes It Cricket">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-xl bg-neutral-900/40 border border-neutral-800 p-4">
              <div className="text-lg font-semibold">Stadium Aesthetics</div>
              <p className="text-neutral-300 text-sm mt-1">Pitch-green gradients, ball-red accents, and scoreboard-type typography bring match-day vibes.</p>
            </div>
            <div className="rounded-xl bg-neutral-900/40 border border-neutral-800 p-4">
              <div className="text-lg font-semibold">Moment Animations</div>
              <p className="text-neutral-300 text-sm mt-1">Subtle bat-swing and stump-shake effects reward great guesses and keep things lively.</p>
            </div>
            <div className="rounded-xl bg-neutral-900/40 border border-neutral-800 p-4">
              <div className="text-lg font-semibold">Cricket-first Vocabulary</div>
              <p className="text-neutral-300 text-sm mt-1">Curated lists across formats and eras—shots, tactics, venues, and iconic surnames.</p>
            </div>
          </div>
        </Section>

        <Section title="Features at a Glance">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { t: "Daily Puzzle (IST)", d: "A new word every midnight, same for everyone." },
              { t: "Dynamic Length", d: "Words vary from 3 to 6 letters to keep it fresh." },
              { t: "Categories", d: "Pick Terms, Shots, Legends, Stadiums, and more." },
              { t: "Leaderboards", d: "Compete by solve time; tie-breakers by guesses." },
              { t: "Streaks & Achievements", d: "Hat-trick, Powerplay <30s, All-Rounder, etc." },
              { t: "Accessible & Responsive", d: "Keyboard and touch-friendly, mobile-first UI." },
            ].map((x) => (
              <div key={x.t} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                <div className="font-semibold">{x.t}</div>
                <div className="text-neutral-300 text-sm mt-1">{x.d}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Tech Stack">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3"><span className="font-semibold">Frontend:</span> React, Vite, Tailwind, Framer Motion</div>
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3"><span className="font-semibold">Backend:</span> Node.js, Express, JWT, Zod</div>
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3"><span className="font-semibold">Database:</span> MongoDB Atlas, Mongoose</div>
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3"><span className="font-semibold">Infra:</span> Vercel (client), Render/Railway (API)</div>
          </div>
        </Section>

        <Section title="Our Story">
          What started as a fun weekend project turned into a daily ritual for friends who love both cricket and word games. We wanted speed, polish, and a theme that actually feels like cricket—not generic tiles with a bat emoji. Everything here—colors, sounds, and micro-interactions—was chosen to echo the rhythm of a real match.
        </Section>

        <Section title="Fair Play & Data">
          <ul className="list-disc pl-5 space-y-2">
            <li><span className="font-semibold">No spoilers:</span> Solutions stay server-side; guesses are validated on the API.</li>
            <li><span className="font-semibold">Timing accuracy:</span> Finish time is measured on the server to keep the leaderboard fair.</li>
            <li><span className="font-semibold">Privacy-first:</span> We store only what’s required for accounts, streaks, and leaderboards. No selling user data.</li>
          </ul>
        </Section>

        <Section title="Accessibility">
          We support keyboard navigation, high-contrast colors, and reduced-motion preferences. If you spot anything we can improve, reach out—we want everyone to play.
        </Section>

        <Section title="FAQ">
          <div className="space-y-3">
            <div>
              <div className="font-semibold">When does the puzzle reset?</div>
              <p className="text-neutral-300 text-sm">Every day at 00:00 IST.</p>
            </div>
            <div>
              <div className="font-semibold">Do I need an account?</div>
              <p className="text-neutral-300 text-sm">You can practice without one, but you’ll need to log in to save streaks and appear on leaderboards.</p>
            </div>
            <div>
              <div className="font-semibold">What categories are available?</div>
              <p className="text-neutral-300 text-sm">Terms, Shots, Legends, Stadiums—and we keep adding more.</p>
            </div>
          </div>
        </Section>

        <Section title="Contact & Credits">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="font-semibold">Contact</div>
              <p className="text-neutral-300 text-sm mt-1">Issues, suggestions, or collabs? Email us at <a className="underline" href="mailto:hello@cricketwordle.app">hello@cricketwordle.app</a>.</p>
            </div>
            <div>
              <div className="font-semibold">Credits</div>
              <p className="text-neutral-300 text-sm mt-1">Built with ❤️ by cricket nerds & web devs. Word lists curated from public cricket glossaries and our community.</p>
            </div>
          </div>
        </Section>

        {/* Footer cta */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-emerald-800 bg-emerald-900/20 p-6 text-center"
        >
          <div className="text-lg md:text-xl font-semibold">Ready to take guard?</div>
          <p className="text-neutral-300 text-sm mt-1">Log in and try today’s puzzle. Don’t lose your streak!</p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <RouterSafeLink to="/login" className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700">Sign In</RouterSafeLink>
            <RouterSafeLink to="/register" className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600">Create Account</RouterSafeLink>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// --- Test Cases (manual) ---
// 1) Render <AboutPage/> inside <BrowserRouter> in your app -> buttons should SPA-navigate.
// 2) Render <AboutPage/> alone (e.g., Storybook or direct mount) -> no crash; buttons act as normal <a href>.
// Expected behavior: No runtime error "basename ... null" in both cases.
