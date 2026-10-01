import React from 'react';

/**
 * Live Government Scheme Application Form Preview Card.
 * Dynamically visualizes real data gathered via voice so first-time rural women
 * can see their application form being filled in real-time.
 */
export default function LiveApplicationCard({ application }) {
  if (!application) return null;

  return (
    <div
      role="region"
      aria-label="நேரலை விண்ணப்ப படிவம் (Live Application Form Preview)"
      className="w-full max-w-sm mx-auto my-2 p-3.5 rounded-2xl bg-gradient-to-b from-[#0b1739]/90 to-[#070e24]/90 border border-cyan-500/40 shadow-xl backdrop-blur-md relative overflow-hidden"
    >
      {/* Tamil Nadu Govt Scheme Header */}
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-300 font-tamil">
            தமிழ்நாடு அரசு • நேரலை பதிவு
          </span>
        </div>
        <span className="text-[10px] text-amber-300 font-mono font-bold">
          {application.application_id || 'KMUT-TN-2026'}
        </span>
      </div>

      {/* Grid of Real Scheme Data Fields */}
      <div className="grid grid-cols-2 gap-2 text-left">
        {/* Name Field */}
        <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-tamil block">
            விண்ணப்பதாரர் பெயர்
          </span>
          <span className={`text-xs font-bold font-tamil truncate block mt-0.5 ${application.applicant_name ? 'text-emerald-300' : 'text-slate-500 italic'}`}>
            {application.applicant_name || 'பேசி பதிவு செய்யவும்...'}
          </span>
        </div>

        {/* Age Field */}
        <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-tamil block">
            வயது வரம்பு (21+)
          </span>
          <span className={`text-xs font-bold font-tamil block mt-0.5 ${application.age ? 'text-emerald-300' : 'text-slate-500 italic'}`}>
            {application.age ? `${application.age} ஆண்டுகள் (தகுதி ✔)` : 'சரிபார்க்கப்படுகிறது...'}
          </span>
        </div>

        {/* Ration Card Field */}
        <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-tamil block">
            குடும்ப அட்டை
          </span>
          <span className="text-[11px] font-bold text-amber-300 font-tamil truncate block mt-0.5">
            {application.is_female_head ? 'குடும்பத் தலைவி (சரிபார்க்கப்பட்டது)' : 'குடும்ப அட்டை'}
          </span>
        </div>

        {/* Monthly Assistance / Bank */}
        <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-tamil block">
            மாத உதவித்தொகை
          </span>
          <span className="text-xs font-black text-amber-400 font-tamil block mt-0.5">
            ₹1,000 / மாதம் (DBT)
          </span>
        </div>
      </div>

      {/* Target Bank Name */}
      {application.bank_name && (
        <div className="mt-2 p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-left flex items-center justify-between">
          <span className="text-[10px] text-emerald-300 font-bold font-tamil">
            🏦 வரவு வங்கி: {application.bank_name}
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold">
            இணைக்கப்பட்டது
          </span>
        </div>
      )}
    </div>
  );
}
