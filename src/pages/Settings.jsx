import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getMeetings, getTasks } from "../services/meetingService";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const { displayName, user } = useAuth();
  const [meetingCount, setMeetingCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);

  useEffect(() => {
    async function loadCounts() {
      try {
        const [m, t] = await Promise.all([getMeetings(), getTasks()]);
        setMeetingCount((m || []).length);
        setTaskCount((t || []).length);
      } catch {
        // ignore
      }
    }
    loadCounts();
  }, []);

  const tabs = [
    { id: "general", label: "General" },
    { id: "team", label: "Team Members" },
    { id: "integrations", label: "Integrations" },
    { id: "billing", label: "Billing" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your workspace preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary-600 text-primary-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === "general" && (
        <div className="card max-w-2xl space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Organization Name
            </label>
            <input
              type="text"
              defaultValue={displayName ? `${displayName}'s Workspace` : ""}
              placeholder="Your organization name"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Default Timezone
            </label>
            <select className="input">
              <option>UTC</option>
              <option>US/Eastern</option>
              <option>US/Pacific</option>
              <option>Europe/London</option>
              <option>Asia/Kolkata</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              AI Model Preference
            </label>
            <select className="input">
              <option>OpenAI GPT-4o</option>
              <option>OpenAI GPT-4o Mini</option>
              <option>Google Gemini Pro</option>
              <option>Google Gemini Flash</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Used for meeting analysis and task extraction
            </p>
          </div>
          <div className="flex justify-end">
            <button className="btn-primary">Save Changes</button>
          </div>
        </div>
      )}

      {activeTab === "team" && (
        <div className="card max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Team Members
            </h3>
            <button className="btn-primary text-xs py-2 px-3">
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
              Invite Member
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {/* Current user */}
            <div className="flex items-center gap-3 py-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center text-xs font-bold">
                {displayName?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {displayName || "You"}
                </p>
                <p className="text-xs text-slate-500">{user?.email || ""}</p>
              </div>
              <span className="badge bg-slate-100 text-slate-600">Admin</span>
            </div>

            {/* Empty state for additional members */}
            <div className="py-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
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
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                No team members yet
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Invite colleagues to collaborate on meetings and tasks.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "integrations" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          {[
            {
              name: "Google Gemini",
              desc: "Transcription, meeting analysis & task extraction",
              connected: true,
              logo: "✨",
            },
            {
              name: "OpenAI GPT",
              desc: "Alternative AI model for analysis",
              connected: false,
              logo: "🤖",
            },
            {
              name: "Slack",
              desc: "Task notifications & reminders",
              connected: false,
              logo: "💬",
            },
            {
              name: "Google Calendar",
              desc: "Auto-import meeting recordings",
              connected: false,
              logo: "📅",
            },
            {
              name: "Jira",
              desc: "Export tasks to Jira tickets",
              connected: false,
              logo: "📋",
            },
          ].map((integration) => (
            <div key={integration.name} className="card flex items-start gap-3">
              <span className="text-2xl">{integration.logo}</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900">
                  {integration.name}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {integration.desc}
                </p>
              </div>
              <button
                className={
                  integration.connected
                    ? "btn-secondary text-xs py-1.5 px-3"
                    : "btn-primary text-xs py-1.5 px-3"
                }
              >
                {integration.connected ? "Configure" : "Connect"}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "billing" && (
        <div className="card max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Current Plan
              </h3>
              <p className="text-xs text-slate-500">Manage your subscription</p>
            </div>
            <span className="badge bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-600/20 text-sm px-3 py-1">
              Free
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">
                {meetingCount}
              </p>
              <p className="text-xs text-slate-500">Meetings</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">1</p>
              <p className="text-xs text-slate-500">Team Members</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{taskCount}</p>
              <p className="text-xs text-slate-500">Tasks</p>
            </div>
          </div>
          <button className="btn-secondary w-full">Upgrade Plan</button>
        </div>
      )}
    </div>
  );
}
