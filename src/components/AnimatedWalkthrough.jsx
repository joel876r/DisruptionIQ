import React from 'react';

/**
 * Animated Visual 3-Step Instruction Guide for Rural Indian Women.
 * Teaches how to interact with Sol via pure CSS/SVG visual metaphors.
 */
export default function AnimatedWalkthrough({ hasStarted }) {
  return (
    <div
      role="region"
      aria-label="பயன்பாட்டு வழிகாட்டல் (Animated How-to-use Instructions)"
      className="w-full max-w-xl mx-auto px-3 py-2 select-none"
    >
      <div className="grid grid-cols-3 gap-2.5">
        {/* Step 1: Animated Finger Tapping Button */}
        <div className="flex flex-col items-center p-3 rounded-2xl bg-gradient-to-b from-emerald-950/60 to-slate-900/80 border border-emerald-500/30 text-center shadow-lg relative overflow-hidden group">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mb-2 relative">
            {/* Concentric Tap Pulse */}
            <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
            {/* SVG Hand / Tap Icon */}
            <svg className="w-6 h-6 text-emerald-300 relative z-10 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
          <span className="text-xs sm:text-sm font-bold text-white font-tamil leading-tight">
            1. பொத்தானைத் தொடுங்கள்
          </span>
          <span className="text-[10px] text-emerald-300/80 mt-0.5 font-medium">
            Tap Big Button
          </span>
        </div>

        {/* Step 2: Animated Voice Wave */}
        <div className="flex flex-col items-center p-3 rounded-2xl bg-gradient-to-b from-red-950/60 to-slate-900/80 border border-red-500/30 text-center shadow-lg relative overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center mb-2">
            {/* Equalizer animation */}
            <div className="flex items-center gap-1 h-5">
              <span className="w-1 bg-red-400 rounded-full bar-1" />
              <span className="w-1 bg-red-400 rounded-full bar-2" />
              <span className="w-1 bg-red-400 rounded-full bar-3" />
              <span className="w-1 bg-red-400 rounded-full bar-4" />
            </div>
          </div>
          <span className="text-xs sm:text-sm font-bold text-white font-tamil leading-tight">
            2. தமிழில் பேசுங்கள்
          </span>
          <span className="text-[10px] text-red-300/80 mt-0.5 font-medium">
            Speak in Tamil
          </span>
        </div>

        {/* Step 3: ₹1,000 Benefit Coin */}
        <div className="flex flex-col items-center p-3 rounded-2xl bg-gradient-to-b from-amber-950/60 to-slate-900/80 border border-amber-500/30 text-center shadow-lg relative overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-2">
            <span className="text-amber-300 font-extrabold text-base tracking-tighter animate-pulse">
              ₹1000
            </span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-white font-tamil leading-tight">
            3. உதவித்தொகை பெறுங்கள்
          </span>
          <span className="text-[10px] text-amber-300/80 mt-0.5 font-medium">
            Get ₹1,000 / Month
          </span>
        </div>
      </div>
    </div>
  );
}
