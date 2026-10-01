import React from 'react';

/**
 * Mobile-First 9:16 Aspect Ratio Viewport Container.
 * Renders an ultra-sleek smartphone frame on desktop screens
 * and spans 100% native height on mobile devices.
 */
export default function PhoneFrame({ children }) {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#02050e] p-0 sm:p-4 md:p-6 overflow-hidden select-none">
      {/* Outer Ambient Background Glow on Desktop */}
      <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_40%,#1e3a8a_0%,#090d24_50%,#02050e_100%)]" />

      {/* 9:16 Mobile Phone Frame */}
      <div className="relative w-full h-[100dvh] sm:h-[860px] sm:max-w-[414px] sm:rounded-[52px] bg-[#050b1a] sm:border-[8px] sm:border-[#1e293b] sm:shadow-[0_0_80px_rgba(37,99,235,0.35),0_25px_50px_-12px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-hidden z-10">
        
        {/* Phone Top Bezel / Dynamic Island (Visible on Desktop & Tablet) */}
        <div className="w-full pt-3 px-6 pb-2 flex items-center justify-between text-slate-300 text-xs font-semibold shrink-0 z-30 bg-[#050b1a]/80 backdrop-blur-md">
          {/* Time */}
          <span className="tracking-tight text-white">{currentTime}</span>

          {/* Dynamic Island Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-black/90 border border-slate-800 shadow-inner">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-bold tracking-wider font-tamil">சொல் AI</span>
          </div>

          {/* Phone Status Icons (5G, Wifi, Battery) */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-[10px] font-bold tracking-wider">5G</span>
            {/* Battery Icon */}
            <div className="w-5 h-2.5 rounded-sm border border-slate-400 p-0.5 flex items-center">
              <div className="h-full w-4/5 bg-emerald-400 rounded-2xs" />
            </div>
          </div>
        </div>

        {/* Scrollable Active Screen Canvas */}
        <div className="flex-1 w-full flex flex-col overflow-y-auto overflow-x-hidden relative scrollbar-none">
          {children}
        </div>

        {/* Phone Bottom Home Indicator Bar */}
        <div className="w-full pb-2 pt-1 flex justify-center shrink-0 z-30 bg-[#050b1a]/90">
          <div className="w-32 h-1 bg-slate-600/60 rounded-full" />
        </div>
      </div>
    </div>
  );
}
