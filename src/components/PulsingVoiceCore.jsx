import React from 'react';

/**
 * Massive High-Contrast Voice Core Button for Sol / சொல்.
 * Designed specifically for rural Indian women with zero digital literacy:
 * - Massive touch target (140px on mobile, 160px on PC)
 * - Clear, high-contrast visual status indicators (Emerald = Ready, Red = Recording, Blue = Speaking)
 * - Pure Tamil visual guidance captions and animated audio spectrum
 */
export default function PulsingVoiceCore({ status, onClick, hasStarted }) {
  const isListening = status === 'listening';
  const isSpeaking = status === 'speaking';
  const isThinking = status === 'processing';

  const getAriaLabel = () => {
    if (isListening) return 'கேட்கிறது... பேசலாம் - Listening, tap to finish';
    if (isThinking) return 'விவரங்களைச் சரிபார்க்கிறது... - Processing';
    if (isSpeaking) return 'Sol பேசுகிறது... - Speaking';
    if (!hasStarted) return 'திட்ட விண்ணப்பத்தைத் தொடங்க அழுத்தவும் - Tap to start';
    return 'குரல் வழி பேச அழுத்தவும் - Tap to speak';
  };

  // Gradient styling based on interaction state
  let coreGradient = 'from-emerald-500 via-teal-600 to-cyan-600 shadow-[0_0_60px_rgba(16,185,129,0.5)]';
  if (isListening) {
    coreGradient = 'from-rose-600 via-red-600 to-amber-500 shadow-[0_0_80px_rgba(239,68,68,0.85)]';
  } else if (isThinking) {
    coreGradient = 'from-amber-500 via-yellow-600 to-orange-500 shadow-[0_0_60px_rgba(245,158,11,0.65)]';
  } else if (isSpeaking) {
    coreGradient = 'from-cyan-400 via-sky-500 to-blue-600 shadow-[0_0_70px_rgba(6,182,212,0.7)]';
  }

  return (
    <div
      role="region"
      aria-label="மத்திய குரல் கட்டுப்பாட்டு பகுதி (Main Microphone Controller)"
      className="w-full flex flex-col items-center justify-center my-3 select-none"
    >
      {/* Animated Action Prompt Badge */}
      <div className="mb-3 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-lg flex items-center gap-2">
        <span
          className={`w-3 h-3 rounded-full ${
            isListening
              ? 'bg-red-500 animate-ping'
              : isSpeaking
              ? 'bg-cyan-400 animate-pulse'
              : isThinking
              ? 'bg-amber-400 animate-spin'
              : 'bg-emerald-400 animate-pulse'
          }`}
        />
        <span className="text-xs sm:text-sm font-bold font-tamil text-slate-200">
          {isListening
            ? '🔴 உங்கள் குரல் கேட்கிறது... பேசலாம்!'
            : isSpeaking
            ? '🔊 Sol பதில் கூறுகிறது... கேட்கவும்'
            : isThinking
            ? '⏳ சரிபார்க்கிறது... ஒரு நொடி...'
            : !hasStarted
            ? '👇 தொடங்க பொத்தானைத் தொடவும்'
            : '👇 பேச பொத்தானைத் தொடவும்'}
        </span>
      </div>

      {/* Massive Central Microphone Button Container */}
      <div className="relative flex items-center justify-center">
        {/* Outer Expanding Waves when Recording */}
        {isListening && (
          <>
            <div className="absolute w-36 h-36 sm:w-48 sm:h-48 rounded-full border-4 border-red-500/50 animate-ping pointer-events-none" />
            <div className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full border-2 border-amber-400/30 animate-pulse pointer-events-none" />
          </>
        )}

        {/* Ambient Glow Halo */}
        <div
          className={`absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full blur-2xl opacity-70 pointer-events-none transition-all duration-500 ${
            isListening
              ? 'bg-red-500 scale-135'
              : isSpeaking
              ? 'bg-cyan-400 scale-120'
              : 'bg-emerald-500 scale-110'
          }`}
        />

        {/* The Massive High-Contrast Microphone Core */}
        <button
          type="button"
          role="button"
          tabIndex={0}
          onClick={onClick}
          aria-label={getAriaLabel()}
          aria-pressed={isListening}
          aria-live="assertive"
          className={`relative z-10 w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr ${coreGradient} border-4 border-white/90 p-1 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 transform active:scale-90 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-300 shadow-2xl ${
            isListening ? 'animate-mic-wave' : 'animate-breathe'
          }`}
        >
          {/* Inner Decorative Bezel */}
          <div className="w-full h-full rounded-full border-2 border-white/30 flex flex-col items-center justify-center bg-black/15">
            {isSpeaking ? (
              /* Live Audio Waveform Bars */
              <div className="flex items-center gap-1.5 h-10">
                <span className="w-1.5 bg-white rounded-full bar-1 shadow" />
                <span className="w-1.5 bg-white rounded-full bar-2 shadow" />
                <span className="w-1.5 bg-white rounded-full bar-3 shadow" />
                <span className="w-1.5 bg-white rounded-full bar-4 shadow" />
                <span className="w-1.5 bg-white rounded-full bar-5 shadow" />
              </div>
            ) : (
              /* High-Contrast Bold Microphone Vector */
              <svg
                className="w-12 h-12 sm:w-16 sm:h-16 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-transform duration-200"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}
          </div>
        </button>
      </div>

      {/* Prominent Text Guidance for Elderly/Rural Women */}
      <div className="mt-3 flex items-center gap-1.5 text-center">
        <span className="text-sm sm:text-base font-extrabold text-white font-tamil tracking-wide drop-shadow">
          {!hasStarted ? 'விண்ணப்பிக்க தொடங்குங்கள்' : 'பேச பொத்தானைத் தொடுங்கள்'}
        </span>
      </div>
    </div>
  );
}
