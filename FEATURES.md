# FEATURES — System Feature Specifications

---

## 1. Meeting Upload

**Description:**
Users can upload audio files (MP3, WAV, M4A, WEBM) or paste raw transcript text for a meeting. Uploaded files are stored in Supabase Storage; transcripts are saved directly to the database.

|                   | Detail                                                                              |
| ----------------- | ----------------------------------------------------------------------------------- |
| **Inputs**        | Audio file (`File` object) or plain-text transcript (`string`), meeting title       |
| **Outputs**       | New `meetings` row with `id`, `title`, `transcript` (text or pending), `created_at` |
| **UI Components** | `UploadMeeting` page, `MeetingUploader` component                                   |

---

## 2. Transcript Processing

**Description:**
Audio files are sent to a transcription service (OpenAI Whisper) to produce a text transcript. If the user pastes text directly, this step is skipped. The transcript is stored in the `meetings.transcript` column.

|                   | Detail                                                                    |
| ----------------- | ------------------------------------------------------------------------- |
| **Inputs**        | Audio file URL from Supabase Storage                                      |
| **Outputs**       | Plain-text transcript string written to `meetings.transcript`             |
| **UI Components** | `MeetingUploader` (progress indicator), `SummaryViewer` (displays result) |

---

## 3. AI Action Item Extraction

**Description:**
The transcript is sent to an LLM (GPT / Gemini) with a structured prompt that instructs the model to identify discrete action items. Each extracted item includes a description and, where detectable, an assignee and deadline.

|                   | Detail                                                 |
| ----------------- | ------------------------------------------------------ |
| **Inputs**        | `meetings.transcript` (string)                         |
| **Outputs**       | Array of `{ description, assignee, deadline }` objects |
| **UI Components** | `TaskCard` (renders each extracted item), `Tasks` page |

---

## 4. Task Assignment Detection

**Description:**
Part of the AI extraction pipeline — the model identifies named individuals and maps them to tasks. If the system has a `users` table, it attempts to match names to known users.

|                   | Detail                                                              |
| ----------------- | ------------------------------------------------------------------- |
| **Inputs**        | Transcript text, list of known `users.name` values                  |
| **Outputs**       | `tasks.assigned_to` populated with a `user.id` or a raw name string |
| **UI Components** | `TaskCard` (shows assigned avatar/name)                             |

---

## 5. Meeting Summary Generation

**Description:**
The LLM produces a concise executive summary of the meeting covering key topics, decisions made, and open questions. The summary is stored alongside the meeting record.

|                   | Detail                                                                  |
| ----------------- | ----------------------------------------------------------------------- |
| **Inputs**        | `meetings.transcript`                                                   |
| **Outputs**       | Summary paragraph stored in `meetings` or a dedicated `summaries` field |
| **UI Components** | `MeetingSummary` page, `SummaryViewer` component                        |

---

## 6. Human Review Layer

**Description:**
Before AI-extracted tasks are finalized, a human reviewer can approve, edit, or reject each item. This ensures accuracy and prevents hallucinated tasks from entering the workflow.

|                   | Detail                                                               |
| ----------------- | -------------------------------------------------------------------- |
| **Inputs**        | Array of AI-proposed tasks                                           |
| **Outputs**       | Approved tasks inserted into `tasks` table; rejected items discarded |
| **UI Components** | `TaskCard` (with approve/edit/reject actions), `Tasks` page          |

---

## 7. Task Dashboard

**Description:**
A central dashboard that displays all tasks across all meetings. Tasks are filterable by status (pending, in-progress, done), assignee, and meeting. Provides at-a-glance metrics — total tasks, completed, overdue.

|                   | Detail                                                            |
| ----------------- | ----------------------------------------------------------------- |
| **Inputs**        | `tasks` table rows, optional filters                              |
| **Outputs**       | Rendered list/grid of `TaskCard` components with aggregated stats |
| **UI Components** | `Dashboard` page, `TaskCard` component                            |

---

## 8. Task Tracking

**Description:**
Each task has a lifecycle: `pending → in-progress → done`. Status changes are logged in `task_logs` for audit purposes. Users can update status, reassign, or change deadlines.

|                   | Detail                                               |
| ----------------- | ---------------------------------------------------- |
| **Inputs**        | Task ID, new status / assignee / deadline            |
| **Outputs**       | Updated `tasks` row, new `task_logs` entry           |
| **UI Components** | `TaskCard` (status toggle, edit modal), `Tasks` page |
