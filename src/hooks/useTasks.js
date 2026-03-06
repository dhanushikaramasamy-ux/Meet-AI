import { useState, useEffect, useCallback, useRef } from "react";
import { getTasks, updateTask } from "../services/meetingService";

/**
 * Custom hook to fetch and manage tasks.
 * Falls back gracefully when Supabase is not configured.
 */
export default function useTasks(filters = {}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Race against a timeout so the UI never stays stuck
      const data = await Promise.race([
        getTasks(filters),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Fetch tasks timeout")), 8000),
        ),
      ]);

      // Also load demo tasks from sessionStorage
      const demoTasks = JSON.parse(
        sessionStorage.getItem("demo-tasks") || "[]",
      );
      const allTasks = [...(data || []), ...demoTasks];

      if (mountedRef.current) setTasks(allTasks);
    } catch (err) {
      console.warn("[useTasks] Could not fetch tasks:", err.message);
      // Fall back to demo tasks only
      const demoTasks = JSON.parse(
        sessionStorage.getItem("demo-tasks") || "[]",
      );
      if (mountedRef.current) {
        setTasks(demoTasks);
        if (demoTasks.length === 0) setError(err.message);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [filters.meetingId, filters.status]);

  useEffect(() => {
    mountedRef.current = true;
    fetchTasks();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchTasks]);

  /**
   * Update a task's status locally and remotely.
   */
  async function updateTaskStatus(taskId, newStatus) {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );

    // Check if it's a demo task
    if (String(taskId).startsWith("demo-task-")) {
      // Update in sessionStorage
      const demoTasks = JSON.parse(
        sessionStorage.getItem("demo-tasks") || "[]",
      );
      const updatedTasks = demoTasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t,
      );
      sessionStorage.setItem("demo-tasks", JSON.stringify(updatedTasks));
      return;
    }

    try {
      await updateTask(taskId, newStatus);
    } catch (err) {
      console.warn("[useTasks] Could not update task:", err.message);
      // Revert on failure
      fetchTasks();
    }
  }

  return { tasks, loading, error, updateTaskStatus, refetch: fetchTasks };
}
