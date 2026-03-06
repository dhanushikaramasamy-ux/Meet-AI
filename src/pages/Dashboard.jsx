import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import TaskCard from "../components/TaskCard";
import StatsCard from "../components/StatsCard";
import ActivityFeed from "../components/ActivityFeed";
import ProgressBar from "../components/ProgressBar";
import { getMeetings } from "../services/meetingService";
import useTasks from "../hooks/useTasks";
import { useAuth } from "../context/AuthContext";

const TEAM_COLORS = [
  "bg-purple-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-teal-500",
];

export default function Dashboard() {
  const { displayName } = useAuth();
  const { tasks, loading: loadingTasks } = useTasks();
  const [meetings, setMeetings] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const fetchMeetings = useCallback(async () => {
    setLoadingMeetings(true);
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
      setLoadingMeetings(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // Derive team members from task assignees
  const teamMembers = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      const name = t.assigned_to || "Unassigned";
      if (!map[name]) map[name] = 0;
      map[name]++;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count], i) => ({
        name,
        avatar: name[0]?.toUpperCase() || "?",
        color: TEAM_COLORS[i % TEAM_COLORS.length],
        tasks: count,
      }));
  }, [tasks]);

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const overdue = tasks.filter(
    (t) =>
      t.deadline && new Date(t.deadline) < new Date() && t.status !== "done",
  ).length;

  const isLoading = loadingTasks || loadingMeetings;
  const isEmpty = !isLoading && meetings.length === 0 && tasks.length === 0;

  if (!isLoading && fetchError) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        </div>
        <div className="card py-12 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-400 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-slate-900 mb-1">
            Failed to load data
          </h2>
          <p className="text-sm text-slate-500 mb-4 max-w-xs mx-auto">
            {fetchError}
          </p>
          <button onClick={fetchMeetings} className="btn-primary inline-flex">
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Loading your workspace…
            </p>
          </div>
        </div>

        {/* Skeleton stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-16" />
                  <div className="h-5 bg-slate-200 rounded w-10" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Skeleton body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="card animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-32" />
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-200 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-slate-200 rounded w-3/4" />
                      <div className="h-2.5 bg-slate-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="card animate-pulse space-y-4 py-8">
                <div className="h-4 bg-slate-200 rounded w-28 mx-auto" />
                <div className="w-20 h-20 rounded-full bg-slate-200 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome, {displayName}! Let's get started.
            </p>
          </div>
        </div>

        <div className="card py-16 text-center max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-2xl bg-primary-50 text-primary-500 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10"
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
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            No meetings yet
          </h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
            Upload your first meeting transcript or audio recording and let AI
            extract action items, summaries, and insights for you.
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
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Upload Your First Meeting
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, {displayName}. Here's what's happening with your
            meetings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary">
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export
          </button>
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
            New Meeting
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatsCard
          label="Total Tasks"
          value={total}
          change="+3 this week"
          changeType="up"
          color="primary"
          icon={
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
        />
        <StatsCard
          label="Pending"
          value={pending}
          change={`${overdue} overdue`}
          changeType={overdue > 0 ? "down" : "neutral"}
          color="amber"
          icon={
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatsCard
          label="In Progress"
          value={inProgress}
          change="On track"
          changeType="neutral"
          color="blue"
          icon={
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          }
        />
        <StatsCard
          label="Completed"
          value={done}
          change={`${total > 0 ? Math.round((done / total) * 100) : 0}% completion`}
          changeType="up"
          color="emerald"
          icon={
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent meetings */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Recent Meetings
              </h3>
              <Link
                to="/meetings"
                className="text-xs font-medium text-primary-600 hover:text-primary-700"
              >
                View all
              </Link>
            </div>
            <div className="space-y-2">
              {meetings.length === 0 && !loadingMeetings ? (
                <p className="text-sm text-slate-400 text-center py-6">
                  No meetings yet. Upload one to get started.
                </p>
              ) : (
                meetings.slice(0, 5).map((m) => (
                  <Link
                    key={m.id}
                    to={`/meeting/${m.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                      <svg
                        className="w-4 h-4"
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
                      <p className="text-sm font-medium text-slate-900 truncate group-hover:text-primary-700 transition-colors">
                        {m.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(m.created_at).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <svg
                      className="w-4 h-4 text-slate-300 group-hover:text-slate-500"
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

          {/* Task list */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Recent Tasks
              </h3>
              <Link
                to="/tasks"
                className="text-xs font-medium text-primary-600 hover:text-primary-700"
              >
                View all &rarr;
              </Link>
            </div>
            {tasks.length === 0 && !loadingTasks ? (
              <p className="text-sm text-slate-400 text-center py-6">
                No tasks yet. Upload a meeting to extract action items.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tasks.slice(0, 4).map((task) => (
                  <TaskCard key={task.id} task={task} compact />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: 1/3 width */}
        <div className="space-y-6">
          {/* Task completion progress */}
          <div className="card space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Task Completion
            </h3>
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="2.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                  strokeDasharray={`${total > 0 ? (done / total) * 100 : 0} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-slate-900">
                  {total > 0 ? Math.round((done / total) * 100) : 0}%
                </span>
              </div>
            </div>
            <ProgressBar
              label="Pending"
              value={pending}
              max={total}
              color="amber"
            />
            <ProgressBar
              label="In Progress"
              value={inProgress}
              max={total}
              color="blue"
            />
            <ProgressBar
              label="Completed"
              value={done}
              max={total}
              color="emerald"
            />
          </div>

          {/* Team members */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Team</h3>
              <button className="text-xs font-medium text-primary-600 hover:text-primary-700">
                Manage
              </button>
            </div>
            <div className="space-y-3">
              {teamMembers.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">
                  No assignees yet.
                </p>
              ) : (
                teamMembers.map((member) => (
                  <div key={member.name} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full ${member.color} text-white flex items-center justify-center text-xs font-bold`}
                    >
                      {member.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {member.name}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">
                      {member.tasks} tasks
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity */}
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
