import React from 'react';

/**
 * Accessible 3-Step Voice Guidance Footer for Rural Indian Women.
 * Zero-UI philosophy: Simple numbered steps in plain Tamil.
 */
export default function HelpBanner() {
  return (
    <footer
      role="contentinfo"
      className="w-full max-w-xl mx-auto px-4 py-4 border-t border-slate-800/80 bg-sol-surface/30 backdrop-blur-sm"
    >
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="flex flex-col items-center p-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="w-6 h-6 rounded-full bg-sol-primary text-white text-xs font-black flex items-center justify-center mb-1">
            1
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-200 font-tamil">
            பொத்தானைத் தொடுங்கள்
          </span>
          <span className="text-[10px] text-slate-400">Tap Button</span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center mb-1">
            2
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-200 font-tamil">
            தமிழில் பேசுங்கள்
          </span>
          <span className="text-[10px] text-slate-400">Speak Tamil</span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center mb-1">
            3
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-200 font-tamil">
            பதிலைக் கேளுங்கள்
          </span>
          <span className="text-[10px] text-slate-400">Listen to Sol</span>
        </div>
      </div>

      <div className="mt-2 text-center text-[11px] text-slate-500 font-tamil">
        தமிழ்நாடு அரசு • கலைஞர் மகளிர் உரிமைத் திட்டம் • ₹1,000 மாத உதவி
      </div>
    </footer>
  );
}
