import { useState, useEffect } from "react";
import { getRecentActivity } from "../services/meetingService";

const AVATAR_COLORS = [
  "bg-purple-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
];

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getRecentActivity(10);
        setActivities(data || []);
      } catch (err) {
        console.error("Failed to load activity:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Recent Activity
        </h3>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-6">
          <svg
            className="w-5 h-5 animate-spin text-primary-500 mb-2"
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
          <p className="text-xs text-slate-400">Loading activity…</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-xs text-slate-500 font-medium">No activity yet</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Actions on tasks will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((item, i) => {
            const taskDesc = item.tasks?.description || "a task";
            const initial = taskDesc[0]?.toUpperCase() || "?";
            return (
              <div key={item.id} className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5`}
                >
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">
                    {item.action}{" "}
                    <span className="font-medium text-slate-900">
                      &ldquo;{taskDesc}&rdquo;
                    </span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {relativeTime(item.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
