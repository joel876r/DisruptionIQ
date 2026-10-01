import React from 'react';

/**
 * Magnificent High-Contrast Center Voice Microphone Button.
 * Designed with Indian temple gold borders, radial ambient auras,
 * and high-visibility cues for rural Indian women with zero digital literacy.
 */
export default function MicButton({ status, onClick, hasStarted }) {
  const isListening = status === 'listening';
  const isProcessing = status === 'processing';
  const isSpeaking = status === 'speaking';

  const getAriaLabel = () => {
    if (isListening) return 'கேட்கிறது... பேசலாம் - Currently listening, tap to stop';
    if (isProcessing) return 'தகவலைச் சரிபார்க்கிறது... - Processing, please wait';
    if (isSpeaking) return 'Sol பதிலளிக்கிறது... - Sol is speaking, tap to stop';
    if (!hasStarted) return 'வணக்கம் சொல்லவும் உரையாடலைத் தொடங்கவும் பெரிய பொத்தானை அழுத்தவும் - Tap to start';
    return 'குரல் வழி பேச இந்த பெரிய பொத்தானை அழுத்தவும் - Tap to speak';
  };

  const getStatusTextTamil = () => {
    if (isListening) return 'கேட்கிறது... பேசுங்கள்';
    if (isProcessing) return 'சரிபார்க்கிறது...';
    if (isSpeaking) return 'Sol பேசுகிறது...';
    if (!hasStarted) return 'தொடங்க அழுத்தவும்';
    return 'பேச தட்டுங்கள்';
  };

  const getSubStatusTextEnglish = () => {
    if (isListening) return 'Listening... speak now';
    if (isProcessing) return 'Verifying...';
    if (isSpeaking) return 'Speaking...';
    if (!hasStarted) return 'Tap to Start';
    return 'Tap to Speak';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  // Button background & glow themes
  let buttonBg = 'bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 border-amber-300';
  let outerGlow = 'shadow-[0_0_60px_rgba(16,185,129,0.5)]';

  if (isListening) {
    buttonBg = 'bg-gradient-to-tr from-red-700 via-rose-600 to-amber-600 border-yellow-200 animate-voice-ripple';
    outerGlow = 'shadow-[0_0_80px_rgba(239,68,68,0.8)]';
  } else if (isProcessing) {
    buttonBg = 'bg-gradient-to-tr from-amber-700 via-amber-600 to-yellow-500 border-yellow-300';
    outerGlow = 'shadow-[0_0_60px_rgba(245,158,11,0.6)]';
  } else if (isSpeaking) {
    buttonBg = 'bg-gradient-to-tr from-blue-700 via-indigo-600 to-teal-500 border-cyan-300';
    outerGlow = 'shadow-[0_0_70px_rgba(59,130,246,0.7)]';
  }

  return (
    <section
      aria-label="குரல் உள்ளீட்டு பகுதி (Voice Input Section)"
      className="relative flex flex-col items-center justify-center my-auto py-4 select-none"
    >
      {/* Radiant Background Aura */}
      <div
        className={`absolute w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96 rounded-full blur-3xl opacity-40 transition-all duration-700 pointer-events-none ${
          isListening
            ? 'bg-red-500 scale-125'
            : isSpeaking
            ? 'bg-blue-500 scale-115'
            : isProcessing
            ? 'bg-amber-500 scale-110'
            : 'bg-emerald-500 scale-100'
        }`}
        aria-hidden="true"
      />

      {/* Orbiting Spinner during reasoning */}
      {isProcessing && (
        <div
          className="absolute w-64 h-64 sm:w-76 sm:h-76 md:w-84 md:h-84 rounded-full border-4 border-amber-400/20 border-t-amber-400 animate-spin pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* The Single Massive High-Contrast Center Button */}
      <button
        type="button"
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        aria-label={getAriaLabel()}
        aria-pressed={isListening}
        aria-live="assertive"
        className={`relative z-10 w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-full border-[6px] sm:border-8 text-white flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 cursor-pointer focus:outline-none focus:ring-8 focus:ring-amber-400 ${buttonBg} ${outerGlow}`}
      >
        {/* Decorative Inner Ring */}
        <div
          className="absolute inset-2 sm:inset-3 rounded-full border-2 border-white/30 border-dashed pointer-events-none"
          aria-hidden="true"
        />

        {/* Center Dynamic Visuals */}
        {isSpeaking ? (
          /* Dancing Equalizer Wave Bars */
          <div className="flex items-center gap-1.5 h-16 sm:h-20" aria-hidden="true">
            <span className="w-2.5 sm:w-3 bg-white rounded-full bar-1 shadow-md" />
            <span className="w-2.5 sm:w-3 bg-amber-300 rounded-full bar-2 shadow-md" />
            <span className="w-2.5 sm:w-3 bg-white rounded-full bar-3 shadow-md" />
            <span className="w-2.5 sm:w-3 bg-amber-300 rounded-full bar-4 shadow-md" />
            <span className="w-2.5 sm:w-3 bg-white rounded-full bar-5 shadow-md" />
          </div>
        ) : (
          /* High-Contrast Pure Vector SVG Microphone */
          <svg
            className="w-18 h-18 sm:w-22 sm:h-22 md:w-26 md:h-26 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        )}

        {/* Big Bold Tamil Call to Action Inside Button */}
        <span className="mt-2 text-xl sm:text-2xl font-black font-tamil tracking-wide drop-shadow-md text-amber-200">
          {getStatusTextTamil()}
        </span>
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-100 opacity-90 drop-shadow">
          {getSubStatusTextEnglish()}
        </span>
      </button>

      {/* High-visibility Voice State Guidance */}
      <div className="mt-4 text-center">
        <p className="text-base sm:text-lg font-bold text-amber-300 font-tamil drop-shadow">
          {isListening
            ? '🔴 பொத்தான் சிகப்பாக உள்ளது • உங்கள் பதிலை இப்போது பேசலாம்'
            : isSpeaking
            ? '🔵 Sol பேசுகிறது • கவனமாகக் கேட்கவும்'
            : isProcessing
            ? '🟡 சரிபார்க்கிறது... ஒரு வினாடி காத்திருக்கவும்'
            : '🟢 பெரிய பொத்தானைத் தொட்டு தமிழில் பேசவும்'}
        </p>
      </div>
    </section>
  );
}
