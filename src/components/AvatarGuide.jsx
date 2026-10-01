import React from 'react';

/**
 * Animated Tamil Guide Avatar ("Sol Akka" / சொல் அக்கா)
 * Built with 100% pure SVG code (0 binary assets).
 * Creates instant emotional warmth and trust for rural Indian women with zero digital literacy.
 */
export default function AvatarGuide({ status }) {
  const isListening = status === 'listening';
  const isThinking = status === 'processing';
  const isSpeaking = status === 'speaking';

  return (
    <div
      role="img"
      aria-label={
        isListening
          ? 'சொல் உங்கள் பேச்சை கவனமாகக் கேட்கிறது (Sol is listening to you)'
          : isSpeaking
          ? 'சொல் உங்களிடம் பேசுகிறது (Sol is speaking to you)'
          : isThinking
          ? 'சொல் சிந்திக்கிறது (Sol is thinking)'
          : 'சொல் உங்களுடன் உரையாட தயாராக உள்ளது (Sol is ready)'
      }
      className="relative flex flex-col items-center justify-center my-1 select-none pointer-events-none"
    >
      {/* Outer Halo Glow */}
      <div
        className={`absolute -inset-2 rounded-full blur-xl transition-all duration-700 opacity-60 ${
          isListening
            ? 'bg-red-500/50 scale-110'
            : isSpeaking
            ? 'bg-blue-500/50 scale-105'
            : isThinking
            ? 'bg-amber-500/50 scale-105'
            : 'bg-emerald-500/30'
        }`}
        aria-hidden="true"
      />

      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-emerald-400 to-yellow-300 shadow-2xl flex items-center justify-center">
        <svg
          viewBox="0 0 160 160"
          className="w-full h-full rounded-full bg-slate-900 overflow-hidden"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="skinTone" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#b87333" />
              <stop offset="100%" stop-color="#8d4a1b" />
            </linearGradient>
            <linearGradient id="sareeColor" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#059669" />
              <stop offset="100%" stop-color="#047857" />
            </linearGradient>
          </defs>

          {/* Saree & Neck */}
          <path d="M40 160 C40 120, 120 120, 120 160 Z" fill="url(#sareeColor)" />
          <path d="M60 160 L100 135 L115 160 Z" fill="#d97706" />

          {/* Saree Border Gold Trim */}
          <path d="M40 160 C55 125, 105 125, 120 160" stroke="#facc15" stroke-width="4" fill="none" />

          {/* Face Base */}
          <circle cx="80" cy="75" r="42" fill="url(#skinTone)" />

          {/* Hair Bun / Style */}
          <path d="M38 75 C36 40, 124 40, 122 75 C115 48, 45 48, 38 75 Z" fill="#1e1815" />
          {/* Jasmine flower garland (Malli poo) on hair */}
          <circle cx="48" cy="52" r="5" fill="#fef08a" />
          <circle cx="56" cy="46" r="5" fill="#ffffff" />
          <circle cx="66" cy="42" r="5" fill="#fef08a" />
          <circle cx="76" cy="41" r="5" fill="#ffffff" />
          <circle cx="86" cy="42" r="5" fill="#fef08a" />
          <circle cx="96" cy="46" r="5" fill="#ffffff" />
          <circle cx="104" cy="52" r="5" fill="#fef08a" />

          {/* Traditional Red Bindi (Pottu) */}
          <circle cx="80" cy="62" r="3.5" fill="#dc2626" />
          <circle cx="80" cy="66" r="1.5" fill="#facc15" />

          {/* Eyes */}
          <g>
            {/* Left Eye */}
            <ellipse cx="64" cy="74" rx="5" ry="3" fill="#ffffff" />
            <circle cx="65" cy="74" r="2.2" fill="#18181b" />
            {/* Right Eye */}
            <ellipse cx="96" cy="74" rx="5" ry="3" fill="#ffffff" />
            <circle cx="95" cy="74" r="2.2" fill="#18181b" />
          </g>

          {/* Eyebrows */}
          <path d="M57 68 Q64 64, 71 68" stroke="#18181b" stroke-width="2" fill="none" stroke-linecap="round" />
          <path d="M89 68 Q96 64, 103 68" stroke="#18181b" stroke-width="2" fill="none" stroke-linecap="round" />

          {/* Gentle Smile / Speaking Mouth */}
          {isSpeaking ? (
            <path
              d="M71 91 Q80 102, 89 91 Z"
              fill="#b91c1c"
              className="animate-pulse"
            />
          ) : (
            <path
              d="M72 90 Q80 97, 88 90"
              stroke="#991b1b"
              stroke-width="3"
              fill="none"
              stroke-linecap="round"
            />
          )}

          {/* Gold Nose Pin (Mookuthi) */}
          <circle cx="74" cy="82" r="1.5" fill="#facc15" />

          {/* Gold Earrings (Jhumka) */}
          <g>
            <circle cx="36" cy="80" r="3" fill="#facc15" />
            <polygon points="33,83 39,83 36,89" fill="#facc15" />
            <circle cx="124" cy="80" r="3" fill="#facc15" />
            <polygon points="121,83 127,83 124,89" fill="#facc15" />
          </g>

          {/* Interactive Headphones / Listening Radio Waves (Active when listening) */}
          {isListening && (
            <g className="animate-pulse">
              <path d="M30 65 Q80 20, 130 65" stroke="#ef4444" stroke-width="4" fill="none" stroke-linecap="round" />
              <rect x="24" y="60" width="10" height="24" rx="5" fill="#ef4444" />
              <rect x="126" y="60" width="10" height="24" rx="5" fill="#ef4444" />
              {/* Radio Soundwave waves */}
              <circle cx="18" cy="72" r="6" stroke="#fca5a5" stroke-width="2" fill="none" />
              <circle cx="142" cy="72" r="6" stroke="#fca5a5" stroke-width="2" fill="none" />
            </g>
          )}

          {/* Thought bubbles (Active when thinking) */}
          {isThinking && (
            <g className="animate-bounce">
              <circle cx="126" cy="38" r="4" fill="#fbbf24" />
              <circle cx="136" cy="28" r="6" fill="#fbbf24" />
              <circle cx="148" cy="18" r="8" fill="#facc15" />
            </g>
          )}
        </svg>
      </div>

      {/* Guide Name Plate */}
      <div className="mt-1 px-3 py-0.5 rounded-full bg-slate-900/90 border border-amber-400/40 text-center shadow-lg">
        <span className="text-xs sm:text-sm font-bold text-amber-300 font-tamil">
          சொல் அக்கா (Sol Akka)
        </span>
      </div>
    </div>
  );
}
