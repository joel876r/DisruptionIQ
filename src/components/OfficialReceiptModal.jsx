import React from 'react';

/**
 * Official Tamil Nadu Government Scheme Application Receipt Modal.
 * Generates official acknowledgment token and proof of scheme application
 * for Kalaignar Magalir Urimai Thittam with high-contrast, polished typography.
 */
export default function OfficialReceiptModal({ application, solution, onReplay, onReset }) {
  if (!application || application.submission_status !== 'submitted') return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="அரசு விண்ணப்ப ஒப்புகைச் சீட்டு (Official Scheme Application Receipt)"
      className="w-full max-w-md mx-auto my-2 p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-[#0a1b42] via-[#06102a] to-[#02050f] border-2 border-amber-400 shadow-[0_0_80px_rgba(245,158,11,0.45)] relative overflow-hidden text-center z-20"
    >
      {/* Decorative Gold Header Emblem */}
      <div className="flex flex-col items-center">
        {/* Tamil Nadu Govt Emblem (Vector Ring) */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 p-0.5 shadow-xl flex items-center justify-center mb-2.5 animate-breathe">
          <div className="w-full h-full rounded-full bg-[#071330] flex items-center justify-center">
            <svg className="w-9 h-9 text-amber-400 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>

        <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-tamil">
          தமிழ்நாடு அரசு • வருவாய்த்துறை
        </span>
        <h2 className="text-xl font-black text-white font-tamil mt-1 leading-snug">
          கலைஞர் மகளிர் உரிமைத் திட்டம்
        </h2>
        <span className="text-xs sm:text-sm font-extrabold text-emerald-300 font-tamil mt-0.5">
          விண்ணப்ப பதிவு ஒப்புகைச் சீட்டு (Official Receipt)
        </span>
      </div>

      {/* Official Application Token & Benefit Box */}
      <div className="mt-4 p-4 rounded-2xl bg-[#091538]/90 border border-cyan-400/40 text-left space-y-2.5 shadow-inner">
        <div className="flex justify-between items-center border-b border-slate-700/70 pb-2">
          <span className="text-xs text-slate-400 font-bold uppercase font-tamil">விண்ணப்ப பதிவு எண்:</span>
          <span className="text-sm font-mono font-black text-cyan-300">{application.application_id}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400 font-bold font-tamil">விண்ணப்பதாரர்:</span>
          <span className="text-sm font-extrabold text-white font-tamil">{application.applicant_name || 'அம்மா'}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400 font-bold font-tamil">மாத உதவித்தொகை:</span>
          <span className="text-sm sm:text-base font-black text-amber-400 font-tamil">₹1,000 / மாதம் (DBT)</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400 font-bold font-tamil">வரவு வங்கி கணக்கு:</span>
          <span className="text-xs sm:text-sm font-bold text-emerald-300 font-tamil truncate max-w-[200px]">
            {application.bank_name || 'நேரடி வங்கி கணக்கு'}
          </span>
        </div>

        <div className="flex justify-between items-center pt-1 border-t border-slate-700/70">
          <span className="text-xs text-slate-400 font-bold font-tamil">பதிவு நிலை (Status):</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-400/50 flex items-center gap-1">
            <span>வெற்றிகரமாக பதிவு செய்யப்பட்டது</span>
            <span>✔</span>
          </span>
        </div>
      </div>

      {/* Pure Vector Simulated Barcode */}
      <div className="mt-3 p-2.5 rounded-xl bg-white/95 flex flex-col items-center justify-center shadow-md">
        <div className="flex items-center gap-1 h-7">
          <span className="w-1 bg-black h-full" />
          <span className="w-0.5 bg-black h-full" />
          <span className="w-2 bg-black h-full" />
          <span className="w-0.5 bg-black h-full" />
          <span className="w-1.5 bg-black h-full" />
          <span className="w-1 bg-black h-full" />
          <span className="w-0.5 bg-black h-full" />
          <span className="w-2.5 bg-black h-full" />
          <span className="w-1 bg-black h-full" />
          <span className="w-0.5 bg-black h-full" />
          <span className="w-1.5 bg-black h-full" />
          <span className="w-2 bg-black h-full" />
          <span className="w-0.5 bg-black h-full" />
          <span className="w-1 bg-black h-full" />
        </div>
        <span className="text-xs font-mono text-black font-black tracking-widest mt-1">
          {application.application_id}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={onReplay}
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base font-tamil shadow-lg border border-emerald-300 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18V6l-5 4H4v4h3l5 4z" />
          </svg>
          <span>ஒப்புகை விவரத்தைக் கேள் (Listen)</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm font-tamil border border-slate-600 transition-all flex items-center justify-center gap-1.5"
        >
          <span>🔄 புதிய விண்ணப்பம் தொடங்க (New Application)</span>
        </button>
      </div>
    </div>
  );
}
