import React from 'react';

/**
 * High-Contrast Accessible Transcript & Sol Response Display.
 * Uses large Tamil typography, gold accents, and a Replay Audio button.
 */
export default function TranscriptView({
  transcript,
  lastSolResponse,
  onRepeat,
  errorMessage,
}) {
  return (
    <section
      aria-label="உரையாடல் பகுதி (Conversation Dialogue Section)"
      className="w-full max-w-xl mx-auto px-3 py-2 flex flex-col gap-2.5"
    >
      {/* Error alert if any */}
      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 rounded-2xl bg-red-950/90 border-2 border-red-500 text-white text-center text-sm sm:text-base font-tamil font-bold shadow-lg"
        >
          {errorMessage}
        </div>
      )}

      {/* Sol's Spoken Guidance / Question (Primary focus) */}
      {lastSolResponse && (
        <div
          role="region"
          aria-label="Sol கூறியது"
          className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border-2 border-amber-400/70 shadow-2xl flex flex-col gap-2 relative overflow-hidden backdrop-blur-md"
        >
          {/* Subtle Golden Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-emerald-400 to-yellow-300" />

          <div className="flex items-center justify-between mt-1">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              Sol / சொல்:
            </span>

            {/* Accessible Repeat Audio Button */}
            <button
              type="button"
              onClick={onRepeat}
              role="button"
              aria-label="சொல் கூறிய பதிலை மீண்டும் கேட்க (Replay Voice Response)"
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 text-xs sm:text-sm font-bold border border-amber-400/50 flex items-center gap-1.5 transition-all shadow active:scale-95"
            >
              <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18V6l-5 4H4v4h3l5 4z" />
              </svg>
              <span>மீண்டும் கேள் (Replay)</span>
            </button>
          </div>

          <p className="text-xl sm:text-2xl text-white font-tamil leading-relaxed font-bold tracking-wide">
            {lastSolResponse}
          </p>
        </div>
      )}

      {/* User's Spoken Voice Transcript */}
      {transcript && (
        <div
          role="region"
          aria-label="நீங்கள் பேசிய விவரம்"
          className="p-3 sm:p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-slate-200 flex items-start gap-2 shadow-sm"
        >
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide shrink-0 mt-0.5">
            நீங்கள்:
          </span>
          <p className="text-base sm:text-lg text-emerald-100 font-tamil font-semibold">
            "{transcript}"
          </p>
        </div>
      )}
    </section>
  );
}
