export default function StatsCard({
  label,
  value,
  change,
  changeType = "up",
  icon,
  color = "primary",
}) {
  const colorMap = {
    primary: {
      bg: "bg-primary-50",
      icon: "text-primary-600",
      ring: "ring-primary-600/10",
    },
    amber: {
      bg: "bg-amber-50",
      icon: "text-amber-600",
      ring: "ring-amber-600/10",
    },
    blue: { bg: "bg-blue-50", icon: "text-blue-600", ring: "ring-blue-600/10" },
    emerald: {
      bg: "bg-emerald-50",
      icon: "text-emerald-600",
      ring: "ring-emerald-600/10",
    },
    red: { bg: "bg-red-50", icon: "text-red-600", ring: "ring-red-600/10" },
  };
  const c = colorMap[color] || colorMap.primary;

  return (
    <div className="card group hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">
            {value}
          </p>
          {change && (
            <p
              className={`text-xs font-medium flex items-center gap-1 ${
                changeType === "up"
                  ? "text-emerald-600"
                  : changeType === "down"
                    ? "text-red-600"
                    : "text-slate-500"
              }`}
            >
              {changeType === "up" && (
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              )}
              {changeType === "down" && (
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              )}
              {change}
            </p>
          )}
        </div>
        <div
          className={`w-11 h-11 rounded-xl ${c.bg} ${c.icon} ring-1 ${c.ring} flex items-center justify-center group-hover:scale-110 transition-transform`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
