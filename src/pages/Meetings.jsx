import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getMeetings } from "../services/meetingService";

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fetchError, setFetchError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getMeetings();

      // Also load demo meetings from sessionStorage
      const demoMeetings = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith("demo-meeting-")) {
          try {
            const parsed = JSON.parse(sessionStorage.getItem(key));
            if (parsed) demoMeetings.push(parsed);
          } catch (e) {
            /* ignore parse errors */
          }
        }
      }

      // Combine DB meetings with demo meetings, sorted by date
      const allMeetings = [...(data || []), ...demoMeetings].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
      setMeetings(allMeetings);
    } catch (err) {
      console.error("Failed to fetch meetings:", err);
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = meetings.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Meetings</h1>
          <p className="text-sm text-slate-500 mt-1">
            {meetings.length} meeting{meetings.length !== 1 ? "s" : ""} recorded
          </p>
        </div>
        <Link to="/upload" className="btn-primary">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Upload Meeting
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search meetings…"
          className="input-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Error state */}
      {!loading && fetchError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <svg
            className="w-5 h-5 text-red-500 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-red-700 flex-1">{fetchError}</p>
          <button
            onClick={load}
            className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Meeting list */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <svg
              className="w-7 h-7 animate-spin text-primary-600 mb-3"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <p className="text-sm text-slate-500">Loading meetings…</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-400 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.25}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              No meetings yet
            </h3>
            <p className="text-sm text-slate-500 mb-5 max-w-xs mx-auto">
              Upload a meeting recording or paste a transcript to get started.
            </p>
            <Link to="/upload" className="btn-primary inline-flex">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Upload Meeting
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              No results
            </h3>
            <p className="text-sm text-slate-500">
              No meetings match &ldquo;{search}&rdquo;. Try a different search
              term.
            </p>
          </div>
        ) : (
          filtered.map((m) => (
            <Link
              key={m.id}
              to={`/meeting/${m.id}`}
              className="card-hover flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.75}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-primary-700 transition-colors truncate">
                  {m.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {new Date(m.created_at).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <svg
                className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
