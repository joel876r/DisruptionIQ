import React from 'react';

/**
 * Pulsing Cyber Voice Core Button.
 * Inspired directly by the center phone in the reference design.
 * Features concentric glowing ripples, rich cyber-blue aura, and accessible voice triggers.
 */
export default function PulsingVoiceCore({ status, onClick, hasStarted }) {
  const isListening = status === 'listening';
  const isSpeaking = status === 'speaking';
  const isThinking = status === 'processing';

  const getAriaLabel = () => {
    if (isListening) return 'கேட்கிறது... பேசலாம் - Listening, tap to finish';
    if (isThinking) return 'விவரங்களைச் சரிபார்க்கிறது... - Processing';
    if (isSpeaking) return 'Sol பேசுகிறது... - Speaking';
    if (!hasStarted) return 'தொடங்க பொத்தானை அழுத்தவும் - Tap to start';
    return 'குரல் வழி பேச அழுத்தவும் - Tap to speak';
  };

  // Button background and rings
  let coreGradient = 'from-blue-600 via-indigo-600 to-cyan-500 shadow-[0_0_50px_rgba(59,130,246,0.6)]';
  if (isListening) {
    coreGradient = 'from-rose-600 via-red-600 to-amber-500 shadow-[0_0_60px_rgba(239,68,68,0.8)] animate-pulse';
  } else if (isThinking) {
    coreGradient = 'from-amber-600 via-yellow-500 to-orange-500 shadow-[0_0_50px_rgba(245,158,11,0.6)]';
  } else if (isSpeaking) {
    coreGradient = 'from-cyan-500 via-blue-600 to-indigo-600 shadow-[0_0_60px_rgba(6,182,212,0.7)]';
  }

  return (
    <div
      role="region"
      aria-label="குரல் கட்டுப்பாட்டு பொத்தான் (Voice Core Controller)"
      className="w-full flex flex-col items-center justify-center my-2 select-none"
    >
      <div className="relative flex items-center justify-center">
        {/* Outer Radiant Shockwaves when Listening */}
        {isListening && (
          <>
            <div className="absolute w-28 h-28 rounded-full border-2 border-red-500/40 animate-ping pointer-events-none" />
            <div className="absolute w-36 h-36 rounded-full border border-red-400/20 animate-pulse pointer-events-none" />
          </>
        )}

        {/* Ambient Glow */}
        <div
          className={`absolute w-24 h-24 rounded-full blur-xl opacity-60 pointer-events-none transition-all duration-500 ${
            isListening ? 'bg-red-500 scale-125' : isSpeaking ? 'bg-cyan-400 scale-110' : 'bg-blue-600 scale-100'
          }`}
        />

        {/* The Central Glowing Voice Button */}
        <button
          type="button"
          role="button"
          tabIndex={0}
          onClick={onClick}
          aria-label={getAriaLabel()}
          aria-pressed={isListening}
          aria-live="assertive"
          className={`relative z-10 w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr ${coreGradient} border-4 border-white/80 p-0.5 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 transform active:scale-90 focus:outline-none focus:ring-4 focus:ring-cyan-300 shadow-2xl`}
        >
          {/* Inner Light Ring */}
          <div className="w-full h-full rounded-full border border-white/40 flex items-center justify-center bg-black/10">
            {isSpeaking ? (
              /* Mini Audio Waveform */
              <div className="flex items-center gap-1 h-6">
                <span className="w-1 bg-white rounded-full bar-1" />
                <span className="w-1 bg-white rounded-full bar-2" />
                <span className="w-1 bg-white rounded-full bar-3" />
                <span className="w-1 bg-white rounded-full bar-4" />
              </div>
            ) : (
              /* Sleek Microphone Icon */
              <svg className="w-8 h-8 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}
          </div>
        </button>
      </div>

      {/* High-Contrast Rural Helper Caption */}
      <span className="mt-2 text-xs font-bold text-cyan-200 font-tamil tracking-wide drop-shadow">
        {isListening
          ? '🔴 கேட்கிறது... உங்கள் பதிலை பேசவும்'
          : isSpeaking
          ? '🔵 கவனமாகக் கேட்கவும்...'
          : isThinking
          ? '🟡 சரிபார்க்கிறது...'
          : !hasStarted
          ? 'தொடங்க அழுத்தவும் (Tap to Start)'
          : 'பேச தட்டுங்கள் (Tap to Speak)'}
      </span>
    </div>
  );
}
