export default function ProgressBar({ label, value, max, color = "primary" }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  const barColors = {
    primary: "bg-primary-600",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    blue: "bg-blue-500",
    red: "bg-red-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm font-semibold text-slate-900">{pct}%</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColors[color] || barColors.primary}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
