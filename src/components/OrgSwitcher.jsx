import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function OrgSwitcher() {
  const [open, setOpen] = useState(false);
  const { displayName, initials } = useAuth();
  const ref = useRef(null);

  const orgName = displayName ? `${displayName}'s Workspace` : "My Workspace";
  const orgLogo = initials || "AI";

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-slate-100 transition-colors"
      >
        {/* Org logo */}
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center text-xs font-bold">
          {orgLogo}
        </span>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {orgName}
          </p>
          <p className="text-xs text-slate-500">Free plan</p>
        </div>
        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-xl border border-slate-200 shadow-lg py-1 animate-fade-in">
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Workspaces
            </p>
          </div>
          <div className="flex items-center gap-3 w-full px-3 py-2 bg-primary-50">
            <span className="w-7 h-7 rounded-md bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
              {orgLogo}
            </span>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-slate-900">{orgName}</p>
              <p className="text-xs text-slate-500">Free</p>
            </div>
            <svg
              className="w-4 h-4 text-primary-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="border-t border-slate-100 mt-1 pt-1">
            <button className="flex items-center gap-3 w-full px-3 py-2 hover:bg-slate-50 transition-colors text-slate-600">
              <span className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center">
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
              </span>
              <span className="text-sm font-medium">Create organization</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
