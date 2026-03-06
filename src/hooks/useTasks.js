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
      if (mountedRef.current) setTasks(data || []);
    } catch (err) {
      console.warn("[useTasks] Could not fetch tasks:", err.message);
      if (mountedRef.current) {
        setTasks([]);
        setError(err.message);
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
