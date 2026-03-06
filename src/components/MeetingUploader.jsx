import { useRef, useState } from "react";

const ACCEPTED_TYPES =
  ".mp3,.wav,.m4a,.webm,.ogg,.flac,.aac,.mp4,.mov,.avi,.mkv,.mpeg,.3gp";

export default function MeetingUploader({ file, onFileChange }) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileChange(dropped);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave() {
    setDragActive(false);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        Audio / Video File{" "}
        <span className="text-slate-400 font-normal">(optional)</span>
      </label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? "border-primary-400 bg-primary-50"
            : file
              ? "border-primary-300 bg-primary-50/50"
              : "border-slate-200 hover:border-primary-300 hover:bg-slate-50"
        }`}
      >
        {file ? (
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mx-auto">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-900">{file.name}</p>
            <p className="text-xs text-slate-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileChange(null);
              }}
              className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16v-8m0 0l-3 3m3-3l3 3M21 15v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2"
                />
              </svg>
            </div>
            <p className="text-sm text-slate-600">
              <span className="font-medium text-primary-600">
                Click to upload
              </span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-slate-400">
              Audio: MP3, WAV, M4A, WEBM &bull; Video: MP4, MOV, AVI &mdash; Max
              50 MB
            </p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={(e) => onFileChange(e.target.files[0] || null)}
        />
      </div>
    </div>
  );
}
