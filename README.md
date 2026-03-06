# AI Meeting Intelligence Assistant

> Convert meeting transcripts or audio into structured tasks, summaries, and execution dashboards.

---

## 1. Project Overview

The **AI Meeting Intelligence Assistant** is a web application that transforms raw meeting content — audio recordings or text transcripts — into actionable intelligence. It automatically extracts tasks, assigns owners, generates concise summaries, and presents everything through an intuitive dashboard so teams can move from discussion to execution without missing a beat.

---

## 2. Problem Statement

Meetings are where decisions are made, yet the output of most meetings is lost within minutes. Teams struggle with:

- **No single source of truth** — action items live in scattered notes, chat messages, and memories.
- **Manual summarisation is time-consuming** — someone has to take notes and distribute them.
- **Tasks fall through the cracks** — without a structured handoff, follow-ups are missed.
- **No accountability** — it's unclear who owns what by when.

Organizations need an automated bridge between _talking about work_ and _tracking work_.

---

## 3. Proposed Solution

A full-stack web application that:

1. Accepts meeting audio files or pasted transcripts.
2. Transcribes audio via **OpenAI Whisper** (future integration).
3. Analyses transcripts with **LLMs (OpenAI / Gemini)** to extract tasks, assignees, deadlines, and summaries.
4. Presents extracted data in a **Task Dashboard** with status tracking.
5. Allows human review and editing before tasks are finalised.
6. Stores all data in **Supabase** (Postgres + Auth + Storage).

---

## 4. Architecture Overview

```
┌──────────────┐      ┌──────────────────────┐
│   React SPA  │◄────►│  Supabase Backend    │
│  (Vite + TW) │      │  - Auth              │
└──────┬───────┘      │  - PostgreSQL DB     │
       │              │  - Storage (audio)   │
       │              └──────────┬───────────┘
       │                         │
       ▼                         ▼
┌──────────────┐      ┌──────────────────────┐
│  AI Services │      │  Supabase Edge Fns   │
│  - Whisper   │      │  (future)            │
│  - GPT / Gem │      └──────────────────────┘
└──────────────┘
```

**Data flow:**

1. User uploads audio / pastes transcript → stored in Supabase Storage / DB.
2. Transcription service converts audio → text.
3. AI analysis service extracts tasks + summary from text.
4. Results written to Supabase `tasks` and `meetings` tables.
5. Dashboard reads and displays tasks with filters, status, and assignment.

---

## 5. Tech Stack

| Layer       | Technology                           |
| ----------- | ------------------------------------ |
| Frontend    | React 18, Vite, TailwindCSS          |
| Routing     | React Router DOM v6                  |
| Backend/DB  | Supabase (PostgreSQL, Auth, Storage) |
| AI (future) | OpenAI Whisper, OpenAI GPT / Gemini  |
| Language    | JavaScript (ES Modules)              |

---

## 6. Folder Structure

```
ai-meeting-intelligence/
│
├── README.md              # This file
├── PROD.md                # Product vision
├── FEATURES.md            # Feature specifications
├── SPRINTS.md             # Development roadmap
│
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
│
├── public/
│   └── vite.svg
│
└── src/
    ├── main.jsx           # App entry point
    ├── App.jsx            # Root component + routing
    │
    ├── pages/
    │   ├── Dashboard.jsx
    │   ├── UploadMeeting.jsx
    │   ├── Tasks.jsx
    │   └── MeetingSummary.jsx
    │
    ├── components/
    │   ├── Navbar.jsx
    │   ├── TaskCard.jsx
    │   ├── MeetingUploader.jsx
    │   └── SummaryViewer.jsx
    │
    ├── services/
    │   ├── supabaseClient.js
    │   ├── meetingService.js
    │   ├── transcriptionService.js   # AI placeholder
    │   └── aiAnalysisService.js      # AI placeholder
    │
    ├── hooks/
    │   └── useTasks.js
    │
    └── styles/
        └── index.css
```

---

## 7. Setup Instructions

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- A Supabase project (free tier works)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd ai-meeting-intelligence

# Install dependencies
npm install

# Copy environment template and fill in your Supabase credentials
cp .env.example .env

# Start the development server
npm run dev
```

The app will open at **http://localhost:5173**.

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Run the SQL from `supabase/schema.sql` in the **SQL Editor**.
3. Copy your **Project URL** and **Anon Key** into `.env`.

---

## 8. Environment Variables

| Variable                 | Description                 |
| ------------------------ | --------------------------- |
| `VITE_SUPABASE_URL`      | Your Supabase project URL   |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

Create a `.env` file in the project root (see `.env.example`).

---

## 9. Future AI Integrations

### Transcription — OpenAI Whisper

- Service: `src/services/transcriptionService.js`
- Accepts audio `Blob` / `File`, sends to Whisper API, returns text transcript.
- Will be triggered after a meeting audio file is uploaded.

### Analysis — OpenAI GPT / Google Gemini

- Service: `src/services/aiAnalysisService.js`
- Accepts a transcript string, returns structured JSON with:
  - Summary paragraph
  - Array of extracted tasks (description, assignee, deadline)
  - Key decisions
- Model selection (GPT vs Gemini) will be configurable via environment variable.

### Planned AI Pipeline

```
Audio Upload → Whisper Transcription → LLM Analysis → Task + Summary Storage → Dashboard
```

---

## License

MIT
