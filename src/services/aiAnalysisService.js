/**
 * AI Analysis Service — OpenAI GPT-4o / Google Gemini
 *
 * Analyses meeting transcripts to extract summaries, tasks, and decisions.
 * Set VITE_AI_PROVIDER=openai (default) or VITE_AI_PROVIDER=gemini in .env
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";
const AI_PROVIDER = import.meta.env.VITE_AI_PROVIDER || "gemini";

const SYSTEM_PROMPT = `You are a meeting analyst AI. Given a meeting transcript, extract:
1. "summary": A concise 2-4 sentence summary of the meeting.
2. "tasks": A JSON array of action items, each with "description" (string), "assigned_to" (string or null), and "deadline" (ISO date string or null).
3. "decisions": An array of key decisions made in the meeting.

Respond ONLY with valid JSON matching this schema:
{
  "summary": "...",
  "tasks": [{ "description": "...", "assigned_to": "...", "deadline": "YYYY-MM-DD" }],
  "decisions": ["..."]
}
Do NOT include markdown code fences. Output raw JSON only.`;

/**
 * Call OpenAI GPT-4o
 */
async function callOpenAI(transcript) {
  if (!OPENAI_API_KEY) {
    throw new Error(
      "OpenAI API key is not configured. Add VITE_OPENAI_API_KEY to your .env file.",
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  let response;
  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: transcript },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error("AI analysis timed out. Please try again.");
    }
    throw new Error(
      "Network error during AI analysis. Check your internet connection.",
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const status = response.status;
    if (status === 429) {
      throw new Error(
        "OpenAI API rate limit exceeded. Please wait and try again.",
      );
    }
    throw new Error(err.error?.message || `OpenAI API error: ${status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content.trim();
  return JSON.parse(content);
}

/**
 * Call Google Gemini
 */
async function callGemini(transcript) {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Gemini API key is not configured. Add VITE_GEMINI_API_KEY to your .env file.",
    );
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${SYSTEM_PROMPT}\n\nTranscript:\n${transcript}` }],
          },
        ],
        generationConfig: { temperature: 0.3, maxOutputTokens: 2000 },
      }),
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error("AI analysis timed out. Please try again.");
    }
    throw new Error(
      "Network error during AI analysis. Check your internet connection.",
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const status = response.status;
    const msg = err.error?.message || "";
    if (status === 429) {
      throw new Error(
        "Gemini API quota exceeded. Please wait a minute and try again, or check your billing at console.cloud.google.com.",
      );
    }
    throw new Error(msg || `Gemini API error: ${status}`);
  }

  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text.trim();
  // Strip markdown fences if Gemini wraps them
  const cleaned = content.replace(/^```json\s*/, "").replace(/```\s*$/, "");
  return JSON.parse(cleaned);
}

/**
 * Analyse a transcript and return structured data.
 *
 * @param {string} transcript - The meeting transcript text.
 * @param {string} [meetingId] - Optional meeting ID to link extracted tasks.
 * @param {string} [userId] - User ID for RLS.
 * @returns {Promise<{ summary: string, tasks: object[], decisions: string[] }>}
 */
export async function analyseTranscript(transcript) {
  const result =
    AI_PROVIDER === "gemini"
      ? await callGemini(transcript)
      : await callOpenAI(transcript);

  return result;
}

/**
 * Generate only a summary from a transcript.
 *
 * @param {string} transcript
 * @returns {Promise<string>}
 */
export async function generateSummary(transcript) {
  const result = await analyseTranscript(transcript);
  return result.summary;
}
