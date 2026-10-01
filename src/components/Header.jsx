import React from 'react';

/**
 * Accessible Premium Header Component for Sol / சொல்.
 * Features warm Tamil cultural aesthetics, high-contrast badges,
 * and a one-tap reset control.
 */
export default function Header({ status, onReset }) {
  const statusLabels = {
    idle: 'பேச தயாராக உள்ளது (Ready)',
    listening: 'கவனமாகக் கேட்கிறது... (Listening)',
    processing: 'தகவலைச் சரிபார்க்கிறது... (Thinking)',
    speaking: 'Sol பதிலளிக்கிறது (Speaking)',
    error: 'மீண்டும் அழுத்தவும் (Retry)',
  };

  const statusColors = {
    idle: 'bg-emerald-950/80 text-emerald-300 border-emerald-400/50',
    listening: 'bg-red-950/90 text-red-200 border-red-400 animate-pulse',
    processing: 'bg-amber-950/80 text-amber-200 border-amber-400/60',
    speaking: 'bg-blue-950/80 text-blue-200 border-blue-400/60',
    error: 'bg-rose-950/80 text-rose-200 border-rose-400',
  };

  return (
    <header
      role="banner"
      className="w-full pt-5 pb-3 px-4 flex flex-col items-center justify-center text-center border-b border-emerald-900/40 bg-gradient-to-b from-slate-950/90 to-slate-900/60 backdrop-blur-xl relative z-20 shadow-md"
    >
      <div className="w-full max-w-2xl flex items-center justify-between">
        {/* Reset Conversation Icon Button */}
        <button
          type="button"
          onClick={onReset}
          aria-label="உரையாடலை புதிதாக தொடங்க (Restart conversation)"
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-tamil flex items-center gap-1.5 transition-all focus:ring-2 focus:ring-yellow-400"
        >
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="hidden sm:inline">புதிய தொடக்கம்</span>
        </button>

        {/* Center Prominent Branding */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
            <h1
              className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-1.5 drop-shadow"
              tabIndex={0}
              aria-label="Sol / சொல் - Voice Assistant"
            >
              <span>Sol</span>
              <span className="text-amber-400 font-black">/</span>
              <span className="text-amber-400 font-tamil">சொல்</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-bold text-emerald-300 font-tamil tracking-wide mt-0.5">
            கலைஞர் மகளிர் உரிமைத் திட்டம் • ₹1,000 மாத உதவி
          </p>
        </div>

        {/* Language Indicator */}
        <div className="px-2.5 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-[11px] sm:text-xs font-bold text-emerald-300 font-tamil">
          தமிழ் (ta-IN)
        </div>
      </div>

      {/* Accessible Live Status Pill */}
      <div
        role="status"
        aria-live="polite"
        className={`mt-2.5 inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs sm:text-sm font-bold border shadow-inner ${
          statusColors[status] || statusColors.idle
        }`}
      >
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            status === 'listening' ? 'bg-red-400' : 'bg-emerald-400'
          }`}
          aria-hidden="true"
        />
        <span>{statusLabels[status] || statusLabels.idle}</span>
      </div>
    </header>
  );
}
