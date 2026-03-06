import { supabase } from "./supabaseClient";

function requireSupabase() {
  if (!supabase)
    throw new Error("Supabase is not configured. Check your .env file.");
}

/**
 * Safe query wrapper — returns a default value if the table doesn't exist,
 * the query fails (e.g. missing RLS policies, 404 relations), or the request
 * takes longer than 10 seconds. This ensures pages NEVER stay stuck loading.
 */
async function safeQuery(queryFn, fallback = []) {
  try {
    requireSupabase();
    const result = await Promise.race([
      queryFn(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Query timed out")), 10000),
      ),
    ]);
    const { data, error } = result;
    if (error) {
      console.warn("[meetingService] Query error:", error.code, error.message);
      return fallback;
    }
    return data ?? fallback;
  } catch (err) {
    console.warn("[meetingService] Query failed:", err.message);
    return fallback;
  }
}

/**
 * Create a new meeting record.
 * @param {{ title: string, transcript: string, summary?: string, userId: string }} meeting
 * @returns {Promise<object>}
 */
export async function createMeeting({ title, transcript, summary, userId }) {
  requireSupabase();
  const result = await Promise.race([
    supabase
      .from("meetings")
      .insert([
        { title, transcript, summary: summary || null, user_id: userId },
      ])
      .select()
      .single(),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Saving meeting timed out. Please try again.")),
        15000,
      ),
    ),
  ]);
  const { data, error } = result;
  if (error) {
    if (error.code === "42501" || error.message?.includes("policy")) {
      throw new Error(
        "You must be signed in to save meetings. Please sign in first.",
      );
    }
    throw error;
  }
  return data;
}

/**
 * Fetch all meetings for the authenticated user, ordered newest first.
 * @returns {Promise<object[]>}
 */
export async function getMeetings() {
  return safeQuery(() =>
    supabase
      .from("meetings")
      .select("*")
      .order("created_at", { ascending: false }),
  );
}

/**
 * Fetch a single meeting by ID.
 * Returns null on any error so the page can show "not found" instead of sticking on a spinner.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function getMeetingById(id) {
  try {
    requireSupabase();
    const { data, error } = await Promise.race([
      supabase.from("meetings").select("*").eq("id", id).single(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timed out")), 10000),
      ),
    ]);
    if (error) {
      console.warn("[meetingService] getMeetingById error:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn("[meetingService] getMeetingById failed:", err.message);
    return null;
  }
}

/**
 * Update a meeting's summary / decisions after AI analysis.
 * @param {string} meetingId
 * @param {{ summary?: string, decisions?: string[] }} fields
 * @returns {Promise<object>}
 */
export async function updateMeetingSummary(meetingId, fields) {
  requireSupabase();
  const result = await Promise.race([
    supabase
      .from("meetings")
      .update(fields)
      .eq("id", meetingId)
      .select()
      .single(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Updating meeting timed out.")), 15000),
    ),
  ]);
  const { data, error } = result;
  if (error) throw error;
  return data;
}

/**
 * Create tasks linked to a meeting.
 * @param {string} meetingId
 * @param {{ description: string, assigned_to?: string, deadline?: string }[]} tasks
 * @param {string} [userId]
 * @returns {Promise<object[]>}
 */
export async function createTasks(meetingId, tasks, userId) {
  requireSupabase();
  const rows = tasks.map((t) => ({
    meeting_id: meetingId,
    description: t.description,
    assigned_to: t.assigned_to || null,
    deadline: t.deadline || null,
    status: "pending",
    user_id: userId,
  }));

  const result = await Promise.race([
    supabase.from("tasks").insert(rows).select(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Creating tasks timed out.")), 15000),
    ),
  ]);
  const { data, error } = result;
  if (error) throw error;
  return data || [];
}

/**
 * Fetch all tasks, optionally filtered.
 * @param {{ meetingId?: string, status?: string }} [filters]
 * @returns {Promise<object[]>}
 */
export async function getTasks(filters = {}) {
  return safeQuery(() => {
    let query = supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters.meetingId) query = query.eq("meeting_id", filters.meetingId);
    if (filters.status) query = query.eq("status", filters.status);
    return query;
  });
}

/**
 * Fetch tasks for a specific meeting.
 * @param {string} meetingId
 * @returns {Promise<object[]>}
 */
export async function getTasksByMeetingId(meetingId) {
  return safeQuery(() =>
    supabase
      .from("tasks")
      .select("*")
      .eq("meeting_id", meetingId)
      .order("created_at", { ascending: false }),
  );
}

/**
 * Update a task's status and log the change.
 * @param {string} taskId
 * @param {string} newStatus
 * @returns {Promise<object>}
 */
export async function updateTask(taskId, newStatus) {
  requireSupabase();
  const { data, error } = await supabase
    .from("tasks")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", taskId)
    .select()
    .single();

  if (error) throw error;

  // Log the status change (non-blocking)
  try {
    await supabase
      .from("task_logs")
      .insert([{ task_id: taskId, action: `Status changed to ${newStatus}` }]);
  } catch (logErr) {
    console.warn("[meetingService] Could not log task change:", logErr.message);
  }

  return data;
}

/**
 * Fetch recent activity from task_logs, joined with task info.
 * @param {number} [limit=20]
 * @returns {Promise<object[]>}
 */
export async function getRecentActivity(limit = 20) {
  try {
    requireSupabase();
    // Try created_at first; fall back to timestamp for older schemas
    let { data, error } = await supabase
      .from("task_logs")
      .select("*, tasks(description, meeting_id)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error && error.message?.includes("created_at")) {
      ({ data, error } = await supabase
        .from("task_logs")
        .select("*, tasks(description, meeting_id)")
        .order("timestamp", { ascending: false })
        .limit(limit));
    }

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

/**
 * Delete a meeting and its related tasks.
 * @param {string} meetingId
 */
export async function deleteMeeting(meetingId) {
  requireSupabase();
  // Tasks cascade via FK, but delete explicitly for safety
  await supabase.from("tasks").delete().eq("meeting_id", meetingId);
  const { error } = await supabase
    .from("meetings")
    .delete()
    .eq("id", meetingId);
  if (error) throw error;
}
