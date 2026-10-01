import React from 'react';

/**
 * Single Massive High-Contrast Microphone Button Component.
 * The centerpiece of Sol's Zero-UI design philosophy for rural Indian women.
 * Provides maximum visual affordance, tactile vibration, and comprehensive a11y.
 */
export default function MicButton({ status, onClick, hasStarted }) {
  const isListening = status === 'listening';
  const isProcessing = status === 'processing';
  const isSpeaking = status === 'speaking';

  // Dynamic accessible labels in Tamil and English
  const getAriaLabel = () => {
    if (isListening) return 'கேட்கிறது... பேசுவதை நிறுத்த பொத்தானை அழுத்தவும் - Currently listening, tap to stop';
    if (isProcessing) return 'சிந்திக்கிறது... தயவுசெய்து காத்திருக்கவும் - Processing speech, please wait';
    if (isSpeaking) return 'Sol பேசுகிறது... கேட்கவும் - Sol is currently speaking, tap to interrupt';
    if (!hasStarted) return 'வணக்கம் சொல்லவும் உரையாடலைத் தொடங்கவும் நடுவில் உள்ள பொத்தானை அழுத்தவும் - Tap to start Sol voice assistant';
    return 'குரல் வழி பேச இந்த பெரிய பொத்தானை அழுத்தவும் - Tap to speak';
  };

  const getStatusTextTamil = () => {
    if (isListening) return 'கேட்கிறது... பேசுங்கள்';
    if (isProcessing) return 'சிந்திக்கிறது...';
    if (isSpeaking) return 'Sol பேசுகிறது...';
    if (!hasStarted) return 'தொடங்க அழுத்தவும்';
    return 'பேச தட்டுங்கள்';
  };

  const getSubStatusTextEnglish = () => {
    if (isListening) return 'Listening... speak now';
    if (isProcessing) return 'Thinking...';
    if (isSpeaking) return 'Speaking...';
    if (!hasStarted) return 'Tap to Start';
    return 'Tap to Speak';
  };

  // Keyboard navigation support (Enter / Space)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  // Determine button styling based on state
  let buttonStyle = 'bg-sol-primary hover:bg-emerald-500 border-emerald-300 shadow-[0_0_50px_rgba(22,163,74,0.5)]';
  if (isListening) {
    buttonStyle = 'bg-sol-listening hover:bg-red-500 border-red-200 shadow-[0_0_70px_rgba(220,38,38,0.8)] animate-pulse';
  } else if (isProcessing) {
    buttonStyle = 'bg-sol-thinking hover:bg-amber-500 border-amber-200 shadow-[0_0_50px_rgba(217,119,6,0.6)]';
  } else if (isSpeaking) {
    buttonStyle = 'bg-sol-speaking hover:bg-blue-500 border-blue-200 shadow-[0_0_60px_rgba(37,99,235,0.7)]';
  }

  return (
    <section
      aria-label="குரல் உள்ளீட்டு பகுதி (Voice Input Section)"
      className="relative flex flex-col items-center justify-center my-auto py-6"
    >
      {/* Outer Multi-layered Animated Pulse Rings (Visible when listening) */}
      {isListening && (
        <>
          <div
            className="absolute w-72 h-72 sm:w-88 sm:h-88 rounded-full border-4 border-red-500/40 animate-ping pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full border-2 border-red-400/20 animate-pulse pointer-events-none"
            aria-hidden="true"
          />
        </>
      )}

      {/* Rotating Spinner for Thinking State */}
      {isProcessing && (
        <div
          className="absolute w-64 h-64 sm:w-76 sm:h-76 md:w-80 md:h-80 rounded-full border-4 border-amber-400/20 border-t-amber-400 animate-spin pointer-events-none"
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
        className={`relative z-10 w-56 h-56 sm:w-68 sm:h-68 md:w-76 md:h-76 rounded-full border-8 text-white flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 cursor-pointer select-none focus:outline-none focus:ring-8 focus:ring-yellow-400 ${buttonStyle}`}
      >
        {/* Dynamic Center Graphics: Equalizer bars when speaking, mic icon otherwise */}
        {isSpeaking ? (
          <div
            className="flex items-center gap-1.5 h-16 sm:h-20"
            aria-hidden="true"
          >
            <span className="w-2.5 sm:w-3 bg-white rounded-full animate-wave-bar-1" />
            <span className="w-2.5 sm:w-3 bg-white rounded-full animate-wave-bar-2" />
            <span className="w-2.5 sm:w-3 bg-white rounded-full animate-wave-bar-3" />
            <span className="w-2.5 sm:w-3 bg-white rounded-full animate-wave-bar-4" />
            <span className="w-2.5 sm:w-3 bg-white rounded-full animate-wave-bar-5" />
          </div>
        ) : (
          /* Pure Vector SVG Microphone Icon */
          <svg
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 text-white drop-shadow-lg"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        )}

        {/* Clear Tamil Prompt Text Inside Massive Button */}
        <span className="mt-2 text-xl sm:text-2xl font-bold font-tamil tracking-wide drop-shadow">
          {getStatusTextTamil()}
        </span>
        <span className="text-xs sm:text-sm font-semibold opacity-90 tracking-wider uppercase">
          {getSubStatusTextEnglish()}
        </span>
      </button>

      {/* High-visibility Voice State Caption for Rural Accessibility */}
      <div className="mt-6 text-center">
        <p className="text-lg sm:text-xl font-bold text-sol-accent font-tamil">
          {isListening
            ? 'பொத்தான் சிகப்பாக உள்ளது • நீங்கள் பேசலாம்'
            : isSpeaking
            ? 'கவனமாகக் கேட்கவும்'
            : isProcessing
            ? 'தயவுசெய்து ஒரு வினாடி காத்திருக்கவும்'
            : 'பச்சை நிற பொத்தானைத் தொட்டு பேசவும்'}
        </p>
      </div>
    </section>
  );
}
