import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import SummaryViewer from "../components/SummaryViewer";
import TaskCard from "../components/TaskCard";
import {
  getMeetingById,
  getTasksByMeetingId,
  updateTask,
} from "../services/meetingService";

export default function MeetingSummary() {
  const { id } = useParams();
  const location = useLocation();
  const [meeting, setMeeting] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const load = useCallback(async () => {
    // Check if we have local (in-memory) results from navigation state
    const localData = location.state;
    if (localData?.meeting) {
      setMeeting(localData.meeting);
      setTasks(localData.tasks || []);
      setDecisions(localData.decisions || []);
      setLoading(false);
      return;
    }

    // Check for demo mode (ID starts with "demo-")
    if (id?.startsWith("demo-")) {
      const demoData = sessionStorage.getItem(`demo-meeting-${id}`);
      if (demoData) {
        try {
          const parsed = JSON.parse(demoData);
          setMeeting(parsed);
          setTasks(parsed.tasks || []);
          setDecisions(parsed.decisions || []);
          setLoading(false);
          return;
        } catch (e) {
          console.warn("Could not parse demo data:", e);
        }
      }
      setFetchError("Demo meeting not found. Please upload a new meeting.");
      setLoading(false);
      return;
    }

    // Fetch from Supabase
    setLoading(true);
    setFetchError(null);
    try {
      const [meetingData, tasksData] = await Promise.all([
        getMeetingById(id),
        getTasksByMeetingId(id),
      ]);
      setMeeting(meetingData);
      setTasks(tasksData || []);
    } catch (err) {
      console.error("Failed to load meeting:", err);
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatusChange(taskId, newStatus) {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );

    // In demo mode, update sessionStorage instead of DB
    if (id?.startsWith("demo-")) {
      const demoData = sessionStorage.getItem(`demo-meeting-${id}`);
      if (demoData) {
        try {
          const parsed = JSON.parse(demoData);
          parsed.tasks = parsed.tasks.map((t) =>
            t.id === taskId ? { ...t, status: newStatus } : t,
          );
          sessionStorage.setItem(`demo-meeting-${id}`, JSON.stringify(parsed));
        } catch (e) {
          console.warn("Could not update demo task:", e);
        }
      }
      return;
    }

    try {
      await updateTask(taskId, newStatus);
    } catch (err) {
      console.warn("Could not update task:", err.message);
      // Revert on failure
      load();
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <svg
          className="w-6 h-6 animate-spin text-primary-600"
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
      </div>
    );

  if (fetchError)
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-400 flex items-center justify-center mx-auto mb-4">
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
        <h3 className="text-base font-semibold text-slate-900 mb-1">
          Failed to load meeting
        </h3>
        <p className="text-sm text-slate-500 mb-4">{fetchError}</p>
        <button onClick={load} className="btn-primary inline-flex">
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
    );

  if (!meeting)
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
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
        <h3 className="text-base font-semibold text-slate-900 mb-1">
          Meeting not found
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          The meeting you're looking for doesn't exist or was removed.
        </p>
        <Link to="/meetings" className="btn-primary inline-flex">
          Browse Meetings
        </Link>
      </div>
    );

  const dateObj = new Date(meeting.created_at);
  const dateFormatted = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/" className="hover:text-primary-600 transition-colors">
          Dashboard
        </Link>
        <svg
          className="w-3.5 h-3.5 text-slate-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <Link
          to="/meetings"
          className="hover:text-primary-600 transition-colors"
        >
          Meetings
        </Link>
        <svg
          className="w-3.5 h-3.5 text-slate-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-900 font-medium truncate max-w-[200px]">
          {meeting.title}
        </span>
      </nav>

      {/* Meeting header card */}
      <div className="card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
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
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {meeting.title}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">{dateFormatted}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 pl-16 sm:pl-0">
          <span className="badge-done text-xs">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </span>
          <button className="btn-ghost text-xs">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share
          </button>
        </div>
      </div>

      {/* Local results banner */}
      {id === "local" && (
        <div className="card border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0"
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
          <div>
            <p className="text-sm font-medium text-amber-800">
              Local results — not saved to database
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              These results are stored in memory only. Sign in and re-upload to
              save permanently.
            </p>
          </div>
        </div>
      )}

      {/* Summary & Transcript */}
      <SummaryViewer
        summary={meeting.summary}
        transcript={meeting.transcript}
      />

      {/* Extracted Tasks */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Extracted Tasks
          </h2>
          <span className="text-xs text-slate-500">{tasks.length} items</span>
        </div>
        {tasks.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-sm text-slate-500">
              No tasks extracted for this meeting yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </section>

      {/* Key Decisions */}
      {decisions.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Key Decisions
            </h2>
            <span className="text-xs text-slate-500">
              {decisions.length} items
            </span>
          </div>
          <div className="card divide-y divide-slate-100">
            {decisions.map((decision, idx) => (
              <div key={idx} className="p-4 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  {idx + 1}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {decision}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
