const STATUS_STYLES = {
  pending: "badge-pending",
  "in-progress": "badge-in-progress",
  done: "badge-done",
};

const NEXT_STATUS = {
  pending: "in-progress",
  "in-progress": "done",
  done: "pending",
};

const STATUS_ICONS = {
  pending: (
    <svg
      className="w-4 h-4 text-amber-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  "in-progress": (
    <svg
      className="w-4 h-4 text-blue-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  ),
  done: (
    <svg
      className="w-4 h-4 text-emerald-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

export default function TaskCard({ task, onStatusChange, compact = false }) {
  const { id, description, assigned_to, deadline, status = "pending" } = task;

  const isOverdue =
    deadline && new Date(deadline) < new Date() && status !== "done";

  if (compact) {
    return (
      <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors group">
        <span className="mt-0.5 flex-shrink-0">{STATUS_ICONS[status]}</span>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium leading-snug ${
              status === "done"
                ? "text-slate-400 line-through"
                : "text-slate-900"
            }`}
          >
            {description}
          </p>
          <div className="flex items-center gap-3 mt-1">
            {assigned_to && (
              <span className="text-xs text-slate-500">{assigned_to}</span>
            )}
            {deadline && (
              <span
                className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-slate-400"}`}
              >
                {isOverdue ? "Overdue · " : ""}
                {new Date(deadline).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card group hover:shadow-md hover:border-slate-200 transition-all duration-200">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <p
          className={`text-sm font-medium leading-snug flex-1 ${
            status === "done" ? "text-slate-400 line-through" : "text-slate-900"
          }`}
        >
          {description}
        </p>
        <span
          className={`flex-shrink-0 ${STATUS_STYLES[status] || "badge-pending"}`}
        >
          {status}
        </span>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
        {assigned_to && (
          <span className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
              {assigned_to.charAt(0)}
            </div>
            {assigned_to}
          </span>
        )}
        {deadline && (
          <span
            className={`flex items-center gap-1 ${isOverdue ? "text-red-500 font-medium" : ""}`}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {isOverdue && "Overdue · "}
            {new Date(deadline).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>

      {/* Action */}
      {onStatusChange && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <button
            onClick={() => onStatusChange(id, NEXT_STATUS[status])}
            className="text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
          >
            Mark as {NEXT_STATUS[status]}
          </button>
        </div>
      )}
    </div>
  );
}
