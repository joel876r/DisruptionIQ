import React from 'react';

/**
 * Holographic AI Voice Mascot Component.
 * Inspired directly by the futuristic cybernetic voice interface in the reference design.
 * 100% Pure vector SVG code with animated digital audio spectrum visor.
 */
export default function HolographicVoiceHead({ status }) {
  const isListening = status === 'listening';
  const isSpeaking = status === 'speaking';
  const isThinking = status === 'processing';

  return (
    <div
      role="img"
      aria-label="Sol Holographic Voice Assistant"
      className="relative flex flex-col items-center justify-center my-3 select-none pointer-events-none"
    >
      {/* Ambient Radial Lighting Behind Head */}
      <div
        className={`absolute -inset-4 rounded-full blur-2xl transition-all duration-700 opacity-60 ${
          isListening
            ? 'bg-red-500/50 scale-120'
            : isSpeaking
            ? 'bg-blue-500/60 scale-115'
            : isThinking
            ? 'bg-amber-500/50 scale-110'
            : 'bg-cyan-500/35 scale-100'
        }`}
        aria-hidden="true"
      />

      {/* Futuristic Holographic Cyber Head */}
      <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full filter drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Cyber Gradient */}
            <radialGradient id="cyberHeadGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#1e3a8a" stopOpacity="0.9" />
              <stop offset="85%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            {/* Glowing Spectrum Bar Gradient */}
            <linearGradient id="spectrumGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="25%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="75%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>

          {/* Outer Hologram Particle Ring */}
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="1.5"
            strokeDasharray="4 8"
            className="animate-spin"
            style={{ animationDuration: '24s' }}
            opacity="0.5"
          />

          {/* Stylized Head Contour */}
          <path
            d="M50,85 C46,35 154,35 150,85 C146,128 126,165 100,172 C74,165 54,128 50,85 Z"
            fill="url(#cyberHeadGrad)"
            stroke="#38bdf8"
            strokeWidth="2"
          />

          {/* Digital Geometric Facets */}
          <path
            d="M60,65 L100,45 L140,65 L125,120 L100,145 L75,120 Z"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="1"
            opacity="0.3"
          />

          {/* Glowing Equalizer Visor across Eyes */}
          <g transform="translate(62, 80)">
            {/* Background visor pill */}
            <rect
              x="-6"
              y="-10"
              width="88"
              height="30"
              rx="12"
              fill="#090d1f"
              stroke="#06b6d4"
              strokeWidth="1.5"
              opacity="0.9"
            />

            {/* Spectrum Equalizer Bars */}
            <rect x="2" y="-4" width="4" height={isSpeaking ? "20" : isListening ? "14" : "8"} rx="2" fill="url(#spectrumGrad)" className={isSpeaking ? "bar-1" : ""} />
            <rect x="10" y="-4" width="4" height={isSpeaking ? "24" : isListening ? "18" : "12"} rx="2" fill="url(#spectrumGrad)" className={isSpeaking ? "bar-2" : ""} />
            <rect x="18" y="-4" width="4" height={isSpeaking ? "16" : isListening ? "22" : "10"} rx="2" fill="url(#spectrumGrad)" className={isSpeaking ? "bar-3" : ""} />
            <rect x="26" y="-4" width="4" height={isSpeaking ? "26" : isListening ? "24" : "14"} rx="2" fill="url(#spectrumGrad)" className={isSpeaking ? "bar-4" : ""} />
            <rect x="34" y="-4" width="4" height={isSpeaking ? "22" : isListening ? "16" : "16"} rx="2" fill="url(#spectrumGrad)" className={isSpeaking ? "bar-1" : ""} />
            <rect x="42" y="-4" width="4" height={isSpeaking ? "26" : isListening ? "20" : "14"} rx="2" fill="url(#spectrumGrad)" className={isSpeaking ? "bar-2" : ""} />
            <rect x="50" y="-4" width="4" height={isSpeaking ? "18" : isListening ? "22" : "10"} rx="2" fill="url(#spectrumGrad)" className={isSpeaking ? "bar-3" : ""} />
            <rect x="58" y="-4" width="4" height={isSpeaking ? "22" : isListening ? "16" : "12"} rx="2" fill="url(#spectrumGrad)" className={isSpeaking ? "bar-4" : ""} />
            <rect x="66" y="-4" width="4" height={isSpeaking ? "16" : isListening ? "12" : "8"} rx="2" fill="url(#spectrumGrad)" className={isSpeaking ? "bar-5" : ""} />
          </g>

          {/* Chin / Jaw Line Light Accent */}
          <path
            d="M85,155 Q100,165 115,155"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Neck support glow */}
          <path
            d="M88,168 L88,185 L112,185 L112,168 Z"
            fill="#0f172a"
            stroke="#1e3a8a"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Cyber Name Badge */}
      <div className="mt-1 px-3 py-0.5 rounded-full bg-[#0a1533]/80 border border-cyan-400/40 text-center shadow-lg">
        <span className="text-[11px] sm:text-xs font-bold text-cyan-300 font-tamil tracking-wider">
          Sol / சொல் • குரல் உதவியாளர்
        </span>
      </div>
    </div>
  );
}
