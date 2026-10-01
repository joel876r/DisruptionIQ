import React from 'react';

/**
 * Accessible Header Component featuring prominent Sol / சொல் branding.
 * Specifically designed for rural Indian women with clear, high-contrast typography.
 */
export default function Header({ status }) {
  // Human readable Tamil status for screen readers and visual guidance
  const statusLabels = {
    idle: 'தயாராக உள்ளது (Ready)',
    listening: 'கேட்கிறது... (Listening)',
    processing: 'சிந்திக்கிறது... (Thinking)',
    speaking: 'பதிலளிக்கிறது (Speaking)',
    error: 'மீண்டும் அழுத்தவும் (Retry)',
  };

  const statusColors = {
    idle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    listening: 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse',
    processing: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    speaking: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    error: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  };

  return (
    <header
      role="banner"
      className="w-full pt-6 pb-4 px-4 flex flex-col items-center justify-center text-center border-b border-slate-800/80 bg-sol-surface/50 backdrop-blur-md"
    >
      <div className="flex items-center gap-3">
        {/* Decorative Pure CSS Emblem */}
        <span
          className="w-4 h-4 rounded-full bg-sol-primary animate-pulse"
          aria-hidden="true"
        />
        <h1
          className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white flex items-center gap-2 drop-shadow-md"
          tabIndex={0}
          aria-label="Sol / சொல் - Voice Assistant"
        >
          <span>Sol</span>
          <span className="text-sol-accent font-black">/</span>
          <span className="text-sol-accent font-tamil">சொல்</span>
        </h1>
      </div>

      <p className="mt-1 text-sm sm:text-base font-semibold text-emerald-400 font-tamil tracking-wide">
        கலைஞர் மகளிர் உரிமைத் திட்டம் • குரல் வழி உதவி
      </p>

      {/* Accessible Live Status Badge */}
      <div
        role="status"
        aria-live="polite"
        className={`mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${
          statusColors[status] || statusColors.idle
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            status === 'listening' ? 'bg-red-400' : 'bg-emerald-400'
          }`}
          aria-hidden="true"
        />
        <span>{statusLabels[status] || statusLabels.idle}</span>
      </div>
    </header>
  );
}
