-- ============================================================================
-- MeetAI — Complete Database Schema
-- Run this in Supabase Dashboard → SQL Editor → New Query → Run
--
-- IMPORTANT: Before running this, go to:
--   Supabase Dashboard → Authentication → Providers → Email
--   → Turn OFF "Confirm email"
--   This lets users sign in immediately after signup.
-- ============================================================================

-- ── Profiles (linked to Supabase Auth) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name  TEXT,
  email      TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name  = EXCLUDED.full_name,
    email      = EXCLUDED.email,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Meetings ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meetings (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title       TEXT NOT NULL,
  transcript  TEXT,
  summary     TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Tasks ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  assigned_to TEXT,
  deadline    DATE,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'done')),
  meeting_id  UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Task Logs (activity feed) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS task_logs (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id    UUID REFERENCES tasks(id) ON DELETE CASCADE,
  action     TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_meetings_user    ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_created ON meetings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_meeting_id ON tasks(meeting_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user       ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status     ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_task_logs_task   ON task_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_task_logs_time   ON task_logs(created_at DESC);

-- ── Row Level Security ──────────────────────────────────────────────────────
ALTER TABLE profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (safe to re-run)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own profile"    ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile"  ON profiles;
  DROP POLICY IF EXISTS "Users can insert own profile"  ON profiles;
  DROP POLICY IF EXISTS "Users can view own meetings"   ON meetings;
  DROP POLICY IF EXISTS "Users can insert own meetings" ON meetings;
  DROP POLICY IF EXISTS "Users can update own meetings" ON meetings;
  DROP POLICY IF EXISTS "Users can delete own meetings" ON meetings;
  DROP POLICY IF EXISTS "Users can view own tasks"      ON tasks;
  DROP POLICY IF EXISTS "Users can insert own tasks"    ON tasks;
  DROP POLICY IF EXISTS "Users can update own tasks"    ON tasks;
  DROP POLICY IF EXISTS "Users can delete own tasks"    ON tasks;
  DROP POLICY IF EXISTS "Users can view own task logs"  ON task_logs;
  DROP POLICY IF EXISTS "Users can insert own task logs" ON task_logs;
END $$;

-- Profiles
CREATE POLICY "Users can view own profile"    ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Meetings
CREATE POLICY "Users can view own meetings"   ON meetings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meetings" ON meetings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meetings" ON meetings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meetings" ON meetings FOR DELETE USING (auth.uid() = user_id);

-- Tasks
CREATE POLICY "Users can view own tasks"      ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks"    ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks"    ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks"    ON tasks FOR DELETE USING (auth.uid() = user_id);

-- Task logs
CREATE POLICY "Users can view own task logs" ON task_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM tasks WHERE tasks.id = task_logs.task_id AND tasks.user_id = auth.uid()));
CREATE POLICY "Users can insert own task logs" ON task_logs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM tasks WHERE tasks.id = task_logs.task_id AND tasks.user_id = auth.uid()));
