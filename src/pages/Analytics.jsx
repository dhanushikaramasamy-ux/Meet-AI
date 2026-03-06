import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import { getMeetings, getTasks } from "../services/meetingService";

const COLORS = [
  "bg-purple-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];
const STROKE_COLORS = {
  pending: "#f59e0b",
  "in-progress": "#3b82f6",
  done: "#10b981",
};
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Analytics() {
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [t, m] = await Promise.all([getTasks(), getMeetings()]);
        setTasks(t || []);
        setMeetings(m || []);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Task counts by status
  const statusCounts = useMemo(() => {
    const c = { pending: 0, "in-progress": 0, done: 0 };
    tasks.forEach((t) => {
      if (c[t.status] !== undefined) c[t.status]++;
    });
    return c;
  }, [tasks]);

  const total = tasks.length;

  // Assignee completion stats
  const assigneeStats = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      const name = t.assigned_to || "Unassigned";
      if (!map[name]) map[name] = { total: 0, done: 0 };
      map[name].total++;
      if (t.status === "done") map[name].done++;
    });
    return Object.entries(map)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 6);
  }, [tasks]);

  // Meetings per day of week (last 30 days)
  const meetingsByDay = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    meetings.forEach((m) => {
      const d = new Date(m.created_at);
      if (d.getTime() >= cutoff) counts[d.getDay()]++;
    });
    const max = Math.max(...counts, 1);
    // Show Mon-Fri
    return [1, 2, 3, 4, 5].map((i) => ({
      day: DAY_NAMES[i],
      count: counts[i],
      pct: Math.round((counts[i] / max) * 100),
    }));
  }, [meetings]);

  // Donut chart values
  const donut = useMemo(() => {
    if (total === 0) return { pending: 0, inProgress: 0, done: 0 };
    return {
      pending: Math.round((statusCounts.pending / total) * 100),
      inProgress: Math.round((statusCounts["in-progress"] / total) * 100),
      done: Math.round((statusCounts.done / total) * 100),
    };
  }, [statusCounts, total]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">Loading your insights…</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-40" />
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200" />
                    <div className="flex-1 h-2.5 bg-slate-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (total === 0 && meetings.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Insights across your meetings and tasks
          </p>
        </div>
        <div className="card py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            No data to analyse yet
          </h3>
          <p className="text-sm text-slate-500 mb-5 max-w-sm mx-auto">
            Analytics will appear here once you upload meetings and tasks are
            extracted. Start by uploading your first meeting.
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
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Reports & Analytics
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Insights across your meetings and tasks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task completion by assignee */}
        <div className="card space-y-5">
          <h3 className="text-sm font-semibold text-slate-900">
            Task Completion by Assignee
          </h3>
          {assigneeStats.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              No task data yet.
            </p>
          ) : (
            assigneeStats.map(([name, { done: d, total: t }], i) => (
              <ProgressBar
                key={name}
                label={`${name} (${d}/${t})`}
                value={d}
                max={t}
                color={
                  ["primary", "blue", "emerald", "amber", "rose", "cyan"][i % 6]
                }
              />
            ))
          )}
        </div>

        {/* Meeting frequency */}
        <div className="card space-y-5">
          <h3 className="text-sm font-semibold text-slate-900">
            Meetings This Week
          </h3>
          <div className="flex items-end gap-3 h-36">
            {meetingsByDay.map((d) => (
              <div
                key={d.day}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div
                  className="w-full bg-slate-100 rounded-t-md overflow-hidden flex items-end"
                  style={{ height: "100px" }}
                >
                  <div
                    className="w-full bg-primary-500 rounded-t-md transition-all duration-500"
                    style={{ height: `${d.pct}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks by status donut */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Tasks by Status
          </h3>
          <div className="flex items-center gap-8">
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="3"
                />
                {total > 0 && (
                  <>
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke={STROKE_COLORS.pending}
                      strokeWidth="3"
                      strokeDasharray={`${donut.pending} 100`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke={STROKE_COLORS["in-progress"]}
                      strokeWidth="3"
                      strokeDasharray={`${donut.inProgress} 100`}
                      strokeDashoffset={`-${donut.pending}`}
                      strokeLinecap="round"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke={STROKE_COLORS.done}
                      strokeWidth="3"
                      strokeDasharray={`${donut.done} 100`}
                      strokeDashoffset={`-${donut.pending + donut.inProgress}`}
                      strokeLinecap="round"
                    />
                  </>
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-slate-900">
                  {total}
                </span>
                <span className="text-[10px] text-slate-500">Total</span>
              </div>
            </div>
            <div className="space-y-3">
              <LegendItem
                color="bg-amber-500"
                label="Pending"
                value={statusCounts.pending}
              />
              <LegendItem
                color="bg-blue-500"
                label="In Progress"
                value={statusCounts["in-progress"]}
              />
              <LegendItem
                color="bg-emerald-500"
                label="Completed"
                value={statusCounts.done}
              />
            </div>
          </div>
        </div>

        {/* Top contributors */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Top Contributors
          </h3>
          {assigneeStats.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              No contributors yet.
            </p>
          ) : (
            <div className="space-y-3">
              {assigneeStats.map(([name, { total: t }], i) => {
                const maxT = assigneeStats[0][1].total || 1;
                return (
                  <div key={name} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full ${COLORS[i % COLORS.length]} text-white flex items-center justify-center text-xs font-bold`}
                    >
                      {name[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-900">
                          {name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {t} tasks
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${COLORS[i % COLORS.length]}`}
                          style={{ width: `${(t / maxT) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-sm text-slate-700">{label}</span>
      <span className="text-sm font-semibold text-slate-900 ml-auto">
        {value}
      </span>
    </div>
  );
}
