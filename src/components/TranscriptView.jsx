import React from 'react';

/**
 * High-Contrast Accessible Transcript & Sol Response Display.
 * Displays spoken input and Sol's spoken guidance in large, clear Tamil typography.
 */
export default function TranscriptView({
  transcript,
  lastSolResponse,
  onRepeat,
  errorMessage,
}) {
  return (
    <section
      aria-label="உரையாடல் பகுதி (Conversation Section)"
      className="w-full max-w-xl mx-auto px-4 py-3 flex flex-col gap-3"
    >
      {/* Error alert if any */}
      {errorMessage && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-red-900/60 border-2 border-red-500 text-white text-center text-base sm:text-lg font-tamil font-bold"
        >
          {errorMessage}
        </div>
      )}

      {/* Sol's Spoken Guidance / Question (Primary focus) */}
      {lastSolResponse && (
        <div
          role="region"
          aria-label="Sol பதிலளித்த விவரம்"
          className="p-4 sm:p-5 rounded-2xl bg-sol-surface/90 border-2 border-emerald-500/50 shadow-xl flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              Sol / சொல் கூறியது:
            </span>

            {/* Accessible Repeat Audio Button */}
            <button
              type="button"
              onClick={onRepeat}
              role="button"
              aria-label="சொல் கூறிய பதிலை மீண்டும் கேட்க இந்த பொத்தானை அழுத்தவும் (Replay Voice Response)"
              className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/60 text-emerald-200 text-sm font-semibold border border-emerald-400/40 flex items-center gap-1.5 transition-colors focus:ring-2 focus:ring-yellow-400"
            >
              <svg
                className="w-4 h-4 text-emerald-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18V6l-5 4H4v4h3l5 4z"
                />
              </svg>
              <span>மீண்டும் கேள் (Replay)</span>
            </button>
          </div>

          <p className="text-xl sm:text-2xl text-white font-tamil leading-relaxed font-semibold">
            {lastSolResponse}
          </p>
        </div>
      )}

      {/* User's Spoken Voice Transcript */}
      {transcript && (
        <div
          role="region"
          aria-label="நீங்கள் பேசிய விவரம்"
          className="p-3 sm:p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-200"
        >
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            நீங்கள் பேசியது (You said):
          </span>
          <p className="text-lg sm:text-xl text-yellow-300 font-tamil mt-1 font-medium">
            "{transcript}"
          </p>
        </div>
      )}
    </section>
  );
}
