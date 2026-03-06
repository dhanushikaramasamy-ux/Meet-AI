# SPRINTS — Development Roadmap

---

## Sprint 1 — Foundation & UI Shell

**Goal:** Set up the project, configure routing, and build the core UI structure so that all pages are navigable with placeholder content.

### Tasks

- [x] Initialize Vite + React + TailwindCSS project
- [x] Configure folder structure (`pages/`, `components/`, `services/`, `hooks/`, `styles/`)
- [x] Set up React Router with routes for Dashboard, Upload Meeting, Tasks, Meeting Summary
- [x] Build `Navbar` component with navigation links
- [x] Create placeholder pages: `Dashboard`, `UploadMeeting`, `Tasks`, `MeetingSummary`
- [x] Apply base TailwindCSS styling and layout (sidebar/topbar + content area)

### Expected Deliverables

- Running dev server with navigable multi-page SPA
- Consistent layout with Navbar across all routes
- README, PROD, FEATURES, and SPRINTS documentation complete

---

## Sprint 2 — Meeting Upload & Storage

**Goal:** Allow users to upload meeting audio files or paste transcripts, store them in Supabase, and list past meetings.

### Tasks

- [ ] Create Supabase project and run database schema (`users`, `meetings`, `tasks`, `task_logs`)
- [ ] Implement `supabaseClient.js` with environment-variable configuration
- [ ] Build `MeetingUploader` component (file drag-and-drop + text area)
- [ ] Implement `meetingService.js` — `createMeeting()`, `getMeetings()`, `getMeetingById()`
- [ ] Connect `UploadMeeting` page to Supabase (insert new meeting on submit)
- [ ] List recent meetings on Dashboard with title and date

### Expected Deliverables

- Fully functional meeting upload flow (text mode)
- Meetings persisted in Supabase `meetings` table
- Dashboard shows list of uploaded meetings

---

## Sprint 3 — Transcript Processing & Task Extraction (Mock)

**Goal:** Simulate the AI pipeline with mock logic so the full data flow works end-to-end before real AI is connected.

### Tasks

- [ ] Create `transcriptionService.js` placeholder that returns a mock transcript from uploaded audio
- [ ] Create `aiAnalysisService.js` placeholder that extracts mock tasks from any transcript
- [ ] Wire mock analysis into the upload flow — after saving a meeting, generate mock tasks
- [ ] Store extracted tasks in `tasks` table linked by `meeting_id`
- [ ] Build `SummaryViewer` component to display meeting summary text
- [ ] Build `MeetingSummary` page — fetch and display transcript + summary + tasks for a meeting

### Expected Deliverables

- End-to-end flow: Upload → Mock transcript → Mock task extraction → DB storage
- Meeting Summary page shows transcript, summary, and extracted tasks
- Mock data is realistic enough to validate the UI

---

## Sprint 4 — Task Dashboard & Task Management

**Goal:** Build a full-featured task dashboard with filtering, status management, and activity logging.

### Tasks

- [ ] Implement `useTasks` hook — fetch tasks, update status, filter by meeting/assignee/status
- [ ] Build `TaskCard` component with status badge, assignee, deadline, and action buttons
- [ ] Build `Tasks` page — list all tasks with filter controls
- [ ] Implement task status transitions (`pending` → `in-progress` → `done`)
- [ ] Log status changes to `task_logs` table
- [ ] Add dashboard metrics: total tasks, completed, overdue, pending

### Expected Deliverables

- Task Dashboard with real-time data from Supabase
- Task status management with audit log
- Filter and search capabilities

---

## Sprint 5 — AI Integration & Polish

**Goal:** Replace mock services with real AI APIs and polish the application for production readiness.

### Tasks

- [ ] Integrate OpenAI Whisper API in `transcriptionService.js`
- [ ] Integrate OpenAI GPT or Google Gemini in `aiAnalysisService.js`
- [ ] Add human review UI — approve / edit / reject extracted tasks before saving
- [ ] Implement Supabase Auth (email + password sign-up/login)
- [ ] Add protected routes (redirect unauthenticated users to login)
- [ ] Responsive design pass — ensure mobile and tablet layouts work
- [ ] Error handling and loading states across all pages
- [ ] Write README setup instructions for AI API keys

### Expected Deliverables

- Real AI-powered transcription and task extraction
- Human review workflow
- Authentication and route protection
- Production-ready, responsive UI
