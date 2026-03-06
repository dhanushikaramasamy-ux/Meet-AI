import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  {
    title: "AI Transcription",
    description:
      "Upload audio or paste transcripts — our AI converts meetings into structured text in seconds.",
    icon: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z",
    color: "primary",
  },
  {
    title: "Smart Task Extraction",
    description:
      "Automatically extract action items, assign owners, and set deadlines from every meeting.",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    color: "emerald",
  },
  {
    title: "Executive Summaries",
    description:
      "Get concise, AI-generated summaries with key decisions, risks, and follow-ups highlighted.",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    color: "blue",
  },
  {
    title: "Team Analytics",
    description:
      "Track task completion, meeting productivity, and team contribution — all in real-time dashboards.",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    color: "amber",
  },
];

const COLOR_MAP = {
  primary: {
    bg: "bg-primary-50",
    text: "text-primary-600",
    ring: "ring-primary-100",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    ring: "ring-emerald-100",
  },
  blue: { bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-100" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-100" },
};

const STATS = [
  { value: "10K+", label: "Meetings processed" },
  { value: "98%", label: "Task accuracy" },
  { value: "85%", label: "Time saved" },
  { value: "500+", label: "Teams using" },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold shadow-sm">
              AI
            </div>
            <span className="text-lg font-bold text-slate-900">
              Meet<span className="text-primary-600">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a
              href="#features"
              className="hover:text-slate-900 transition-colors"
            >
              Features
            </a>
            <a href="#stats" className="hover:text-slate-900 transition-colors">
              About
            </a>
            <a href="#cta" className="hover:text-slate-900 transition-colors">
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/" className="btn-primary text-sm">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/signin" className="btn-ghost text-sm">
                  Sign In
                </Link>
                <Link to="/signup" className="btn-primary text-sm">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/50 via-white to-white" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary-100/30 blur-3xl -translate-y-1/2" />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
            Powered by GPT-4o & Gemini
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight max-w-4xl mx-auto">
            Turn Every Meeting Into{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
              Actionable Results
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Upload meeting recordings or transcripts. Get AI-generated
            summaries, automatically extracted tasks, and real-time team
            analytics — all in one place.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? "/" : "/signup"}
              className="btn-primary text-base px-8 py-3 shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30 transition-all"
            >
              Start For Free
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <a href="#features" className="btn-secondary text-base px-8 py-3">
              See How It Works
            </a>
          </div>

          {/* Mock dashboard preview */}
          <div className="mt-16 max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-4 text-xs text-slate-400 font-mono">
                app.meetai.dev
              </span>
            </div>
            <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-50 to-white">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  {
                    label: "Total Meetings",
                    value: "24",
                    trend: "+12%",
                    color: "primary",
                  },
                  {
                    label: "Tasks Created",
                    value: "87",
                    trend: "+23%",
                    color: "emerald",
                  },
                  {
                    label: "Completed",
                    value: "61",
                    trend: "+8%",
                    color: "blue",
                  },
                  {
                    label: "Hours Saved",
                    value: "34h",
                    trend: "+18%",
                    color: "amber",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-white rounded-xl border border-slate-200/80 p-4"
                  >
                    <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-slate-900">
                        {s.value}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600">
                        {s.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  "Sprint Planning — Week 12",
                  "Design Review — Homepage",
                  "Client Kickoff — Acme Corp",
                ].map((m) => (
                  <div
                    key={m}
                    className="bg-white rounded-xl border border-slate-200/80 p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {m}
                        </p>
                        <p className="text-xs text-slate-400">
                          3 tasks extracted
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-2">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Everything your team needs
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              From recording to results — automate the entire meeting workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => {
              const c = COLOR_MAP[f.color];
              return (
                <div
                  key={f.title}
                  className="bg-white rounded-2xl border border-slate-200/60 p-6 hover:shadow-lg hover:border-slate-200 transition-all duration-300 group"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${c.bg} ${c.text} ring-1 ${c.ring} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={f.icon}
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Stats ───────────────────────────────────────────────────────── */}
      <section id="stats" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-10 sm:p-16 text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Trusted by teams worldwide
            </h2>
            <p className="text-primary-100 max-w-xl mx-auto mb-12">
              Organizations of all sizes use MeetAI to eliminate manual meeting
              follow-ups.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="text-3xl sm:text-4xl font-extrabold">
                    {s.value}
                  </p>
                  <p className="text-primary-200 text-sm mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────────────── */}
      <section id="cta" className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Ready to make every meeting count?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Start free — no credit card required. Your first 10 meetings are on
            us.
          </p>
          <Link
            to={isAuthenticated ? "/" : "/signup"}
            className="btn-primary text-base px-10 py-3.5 shadow-lg shadow-primary-600/20"
          >
            Get Started For Free
          </Link>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold">
                AI
              </div>
              <span className="text-sm font-semibold text-slate-700">
                MeetAI
              </span>
            </div>
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Syft Technologies. All rights
              reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-slate-700 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-slate-700 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-slate-700 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
