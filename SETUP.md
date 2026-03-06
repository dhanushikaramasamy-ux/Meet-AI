# MeetAI — Setup Guide

## 1. Supabase Configuration (5 minutes)

### A. Disable Email Confirmation (CRITICAL)

1. Go to **[Supabase Dashboard](https://supabase.com/dashboard)**
2. Select your project (`upxmqchzsnhfnwpyspqk`)
3. Navigate to **Authentication → Providers → Email**
4. **Turn OFF** "Confirm email"
5. Click **Save**

> Without this, users cannot sign in after signing up.

### B. Run the Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/schema.sql`
4. Click **Run**
5. You should see "Success. No rows returned."

### C. Clean Up Old Unconfirmed Users (if needed)

1. Go to **Authentication → Users**
2. Delete any users with "Waiting for verification" status
3. They can sign up again fresh

## 2. Environment Variables

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_AI_PROVIDER=gemini
VITE_GEMINI_API_KEY=your-gemini-api-key
```

Get your Gemini API key from: https://aistudio.google.com/apikey

## 3. Run the App

```bash
npm install
npm run dev
```

## 4. Usage Flow

1. **Sign Up** → Create an account (name, email, password)
2. **Sign In** → Log in with your credentials
3. **Upload Meeting** → Paste a transcript or upload audio/video
4. **AI Analysis** → Gemini extracts summary, tasks, and decisions
5. **Dashboard** → See all meetings, tasks, team stats
6. **Tasks** → Filter, search, change status (pending → in-progress → done)
7. **Meetings** → Browse all meetings, click to see details

## Tech Stack

- React 18 + Vite + TailwindCSS
- Supabase (Auth + PostgreSQL + RLS)
- Google Gemini 2.0 Flash (AI analysis + transcription)
