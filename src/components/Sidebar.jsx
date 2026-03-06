import { Link, useLocation } from "react-router-dom";
import OrgSwitcher from "./OrgSwitcher";
import { useAuth } from "../context/AuthContext";
import useTasks from "../hooks/useTasks";

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      {
        to: "/",
        label: "Dashboard",
        icon: (
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
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"
            />
          </svg>
        ),
      },
      {
        to: "/tasks",
        label: "Tasks",
        icon: (
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        ),
        badge: "pending", // dynamic — resolved at render time
      },
    ],
  },
  {
    label: "Meetings",
    items: [
      {
        to: "/upload",
        label: "Upload Meeting",
        icon: (
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
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        ),
      },
      {
        to: "/meetings",
        label: "All Meetings",
        icon: (
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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Analytics",
    items: [
      {
        to: "/analytics",
        label: "Reports",
        icon: (
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
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        ),
      },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { pathname } = useLocation();
  const { displayName, initials, user } = useAuth();
  const { tasks } = useTasks();
  const pendingCount = tasks.filter(
    (t) => t.status === "pending" || t.status === "in-progress",
  ).length;

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-200 shadow-sidebar z-40 flex flex-col transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-64"
      }`}
    >
      {/* Org Switcher */}
      <div
        className={`px-3 pt-4 pb-2 border-b border-slate-100 ${collapsed ? "px-2" : ""}`}
      >
        {collapsed ? (
          <button
            onClick={onToggle}
            className="w-10 h-10 mx-auto rounded-lg bg-primary-600 text-white flex items-center justify-center text-xs font-bold"
          >
            AI
          </button>
        ) : (
          <OrgSwitcher />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {section.label}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map(({ to, label, icon, badge }) => {
                const isActive = pathname === to;
                return (
                  <li key={to}>
                    <Link
                      to={to}
                      title={collapsed ? label : undefined}
                      className={
                        isActive
                          ? "sidebar-item-active"
                          : "sidebar-item-inactive"
                      }
                    >
                      <span className="flex-shrink-0">{icon}</span>
                      {!collapsed && (
                        <>
                          <span className="flex-1">{label}</span>
                          {badge && (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                              {badge === "pending"
                                ? pendingCount || null
                                : badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom section — collapse toggle + user */}
      <div className="border-t border-slate-100 p-3 space-y-2">
        {/* Settings */}
        <Link
          to="/settings"
          className={`sidebar-item-inactive ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Settings" : undefined}
        >
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
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {!collapsed && <span className="flex-1">Settings</span>}
        </Link>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className={`sidebar-item-inactive w-full ${collapsed ? "justify-center" : ""}`}
        >
          <svg
            className={`w-5 h-5 transition-transform ${collapsed ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
          {!collapsed && <span className="flex-1">Collapse</span>}
        </button>

        {/* User */}
        <div
          className={`flex items-center gap-3 px-2 py-2 rounded-lg ${collapsed ? "justify-center" : ""}`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {displayName}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.email || ""}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
