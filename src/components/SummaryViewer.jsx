import { useState } from "react";

const TABS = [
  {
    key: "summary",
    label: "Summary",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    key: "transcript",
    label: "Full Transcript",
    icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  },
];

export default function SummaryViewer({ summary, transcript }) {
  const [tab, setTab] = useState("summary");

  return (
    <div className="card overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-100 px-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium -mb-px border-b-2 transition-colors ${
              tab === t.key
                ? "border-primary-600 text-primary-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
            </svg>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5">
        {tab === "summary" ? (
          summary ? (
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {summary}
            </p>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-slate-400 italic">
                No summary available yet. Run AI analysis to generate one.
              </p>
            </div>
          )
        ) : transcript ? (
          <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed max-h-96 overflow-y-auto custom-scrollbar">
            {transcript}
          </pre>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-slate-400 italic">
              No transcript available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
