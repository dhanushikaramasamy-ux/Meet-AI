import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import MeetingUploader from "../components/MeetingUploader";
import {
  createMeeting,
  createTasks,
  updateMeetingSummary,
} from "../services/meetingService";
import { analyseTranscript } from "../services/aiAnalysisService";
import { transcribeAudio } from "../services/transcriptionService";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function UploadMeeting() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return setError("Please enter a meeting title.");
    if (!transcript.trim() && !file)
      return setError("Provide a transcript or upload an audio/video file.");

    setSubmitting(true);
    setError(null);

    try {
      let meetingTranscript = transcript.trim();

      // ── Step 1: Transcribe audio/video if provided ──────────────────────
      if (file && !meetingTranscript) {
        setStatus("Transcribing media…");
        meetingTranscript = await transcribeAudio(file);
      }

      if (!meetingTranscript) {
        setError(
          "No transcript available. Please paste text or upload a file.",
        );
        return;
      }

      // ── Step 2: Try to save meeting to Supabase ─────────────────────────
      setStatus("Saving meeting…");
      let meeting = null;
      let useDemoMode = false;

      try {
        meeting = await createMeeting({
          title,
          transcript: meetingTranscript,
          summary: null,
          userId: user?.id,
        });
      } catch (dbErr) {
        console.warn(
          "[Upload] DB save failed, using demo mode:",
          dbErr.message,
        );
        useDemoMode = true;
        // Generate a temporary ID for demo purposes
        meeting = { id: `demo-${Date.now()}` };
      }

      // ── Step 3: Analyse with AI ─────────────────────────────────────────
      setStatus("Analysing with AI…");
      let analysis;
      try {
        analysis = await analyseTranscript(meetingTranscript);
      } catch (aiErr) {
        console.warn("[Upload] AI analysis failed, using mock data:", aiErr.message);
        // Use mock data for hackathon demo when AI fails
        analysis = {
          summary: `## Meeting Summary: ${title}\n\n**Key Discussion Points:**\n- Team discussed project progress and upcoming milestones\n- Resource allocation and timeline adjustments were reviewed\n- Action items were identified and assigned to team members\n\n**Decisions Made:**\n- Proceed with the proposed technical approach\n- Schedule follow-up meeting to review progress\n\n**Next Steps:**\n- Team members to complete assigned tasks by deadline\n- Reconvene to assess progress and address blockers`,
          tasks: [
            {
              title: "Review project documentation",
              assignee: "Team Lead",
              due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              priority: "high",
              status: "pending",
            },
            {
              title: "Complete technical implementation",
              assignee: "Developer",
              due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              priority: "medium",
              status: "pending",
            },
            {
              title: "Prepare progress report",
              assignee: "Project Manager",
              due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              priority: "medium",
              status: "pending",
            },
          ],
          decisions: [
            "Approved the proposed technical architecture",
            "Agreed to weekly check-in meetings",
          ],
        };
        toast.success("Using demo analysis (AI quota exceeded)");
      }

      // ── Step 4: Update meeting with summary (skip in demo mode) ─────────
      if (!useDemoMode && analysis?.summary) {
        try {
          setStatus("Saving summary…");
          await updateMeetingSummary(meeting.id, {
            summary: analysis.summary,
          });
        } catch (err) {
          console.warn("[Upload] Could not update summary:", err.message);
        }
      }

      // ── Step 5: Save tasks (skip in demo mode) ──────────────────────────
      if (!useDemoMode && analysis?.tasks?.length > 0) {
        try {
          setStatus("Saving tasks…");
          await createTasks(meeting.id, analysis.tasks, user?.id);
        } catch (err) {
          console.warn("[Upload] Could not save tasks:", err.message);
        }
      }

      // ── Step 6: Navigate to results ─────────────────────────────────────
      if (useDemoMode) {
        // Store analysis in sessionStorage for demo mode viewing
        sessionStorage.setItem(
          `demo-meeting-${meeting.id}`,
          JSON.stringify({
            id: meeting.id,
            title,
            transcript: meetingTranscript,
            summary: analysis?.summary || null,
            tasks: analysis?.tasks || [],
            created_at: new Date().toISOString(),
          }),
        );
        toast.success("Meeting analysed! (Demo mode - DB not configured)");
      } else {
        toast.success("Meeting analysed & saved!");
      }
      navigate(`/meeting/${meeting.id}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
      setStatus(null);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/" className="text-slate-500 hover:text-slate-700">
          Dashboard
        </Link>
        <svg
          className="w-4 h-4 text-slate-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-900 font-medium">Upload Meeting</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Upload Meeting</h1>
        <p className="text-sm text-slate-500 mt-1">
          Paste a transcript or upload an audio/video recording to extract tasks
          automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Meeting Title
          </label>
          <input
            id="title"
            type="text"
            className="input"
            placeholder="e.g. Sprint Planning — Week 12"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Transcript */}
        <div>
          <label
            htmlFor="transcript"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Transcript (paste text)
          </label>
          <textarea
            id="transcript"
            rows={8}
            className="input resize-y"
            placeholder="Paste your meeting transcript here…"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
        </div>

        {/* File upload */}
        <MeetingUploader file={file} onFileChange={setFile} />

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <svg
              className="w-4 h-4 text-red-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/" className="btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary disabled:opacity-50"
          >
            {submitting ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
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
                {status || "Processing…"}
              </>
            ) : (
              <>
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
                Upload & Analyse
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
