/**
 * Transcription Service — Google Gemini
 *
 * Converts audio/video files to text using the Gemini multimodal API.
 * Supports: MP3, WAV, M4A, WEBM, OGG, MP4, MOV, AVI, MKV
 * Requires VITE_GEMINI_API_KEY in .env
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

/**
 * Convert a File to a base64 data string.
 * @param {File} file
 * @returns {Promise<string>}
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result is "data:<mime>;base64,<data>" — extract just the data
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Map common file extensions to MIME types Gemini accepts.
 * @param {File} file
 * @returns {string}
 */
function getGeminiMimeType(file) {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const map = {
    // Audio
    mp3: "audio/mp3",
    wav: "audio/wav",
    m4a: "audio/mp4",
    ogg: "audio/ogg",
    webm: "audio/webm",
    flac: "audio/flac",
    aac: "audio/aac",
    // Video
    mp4: "video/mp4",
    mov: "video/mov",
    avi: "video/avi",
    mkv: "video/x-matroska",
    mpeg: "video/mpeg",
    "3gp": "video/3gpp",
    wmv: "video/wmv",
    flv: "video/x-flv",
  };
  return map[ext] || file.type || "application/octet-stream";
}

/**
 * Transcribe an audio or video file to text using Gemini.
 *
 * @param {File} mediaFile - The audio/video file to transcribe.
 * @returns {Promise<string>} The transcribed text.
 */
export async function transcribeAudio(mediaFile) {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Gemini API key is not configured. Add VITE_GEMINI_API_KEY to your .env file.",
    );
  }

  // Convert file to base64 (with 30s timeout for large files)
  let base64Data;
  try {
    base64Data = await Promise.race([
      fileToBase64(mediaFile),
      new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error("File reading timed out. The file may be too large."),
            ),
          30000,
        ),
      ),
    ]);
  } catch (err) {
    throw new Error(err.message || "Failed to read the media file.");
  }

  const mimeType = getGeminiMimeType(mediaFile);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  // Abort controller for 90-second timeout on the API call
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
              {
                text: "Transcribe this audio/video into plain text. Output ONLY the transcript text, nothing else. No timestamps, no speaker labels unless clearly identifiable, no commentary. If the audio is silent or unintelligible, respond with 'No speech detected.'",
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8000,
        },
      }),
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error(
        "Transcription timed out. Try a shorter audio/video clip.",
      );
    }
    throw new Error(
      "Network error during transcription. Check your internet connection.",
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
    if (status === 413 || msg.toLowerCase().includes("too large")) {
      throw new Error(
        "File is too large for the Gemini API. Try a shorter clip (under 2 minutes).",
      );
    }
    throw new Error(msg || `Gemini API error: ${status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!text || text === "No speech detected.") {
    throw new Error(
      "Could not transcribe the file. Make sure it contains clear speech.",
    );
  }

  return text;
}
