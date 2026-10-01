import React from 'react';

/**
 * Actionable Solution Modal & Card Component.
 * Displays final eligibility verdict, financial assistance details,
 * required document pictograms, and where to apply for Kalaignar Magalir Urimai Thittam.
 */
export default function SolutionCard({ solution, onReplay, onReset }) {
  if (!solution) return null;

  const isEligible = solution.status === 'eligible';

  // 4 Essential Documents with clear visual SVG pictograms
  const documentCards = [
    {
      title: 'ஆதார் அட்டை',
      sub: 'Aadhaar Card',
      desc: 'அனைத்து குடும்ப உறுப்பினர்களின் அட்டை',
      icon: (
        <svg className="w-8 h-8 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      ),
    },
    {
      title: 'ஸ்மார்ட் ரேஷன் கார்டு',
      sub: 'Smart Ration Card',
      desc: 'பெண் தலைவி பெயர் உள்ள அட்டை',
      icon: (
        <svg className="w-8 h-8 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      title: 'வங்கி பாஸ்புக்',
      sub: 'Bank Passbook',
      desc: 'உங்கள் பெயரில் உள்ள வங்கி கணக்கு',
      icon: (
        <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      ),
    },
    {
      title: 'மின் கட்டண ரசீது',
      sub: 'EB Current Bill',
      desc: 'சமீபத்திய மின் நுகர்வு எண் / ரசீது',
      icon: (
        <svg className="w-8 h-8 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="முழு தீர்வு மற்றும் வழிகாட்டல் (Final Solution and Guidance)"
      className="w-full max-w-2xl mx-auto my-4 p-5 sm:p-7 rounded-3xl bg-gradient-to-b from-emerald-950/95 via-slate-900/95 to-slate-950 border-4 border-amber-400 shadow-[0_0_80px_rgba(245,158,11,0.4)] relative overflow-hidden"
    >
      {/* Decorative pure CSS Confetti Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <span className="confetti-particle bg-yellow-400 left-[10%]" style={{ animationDelay: '0.2s' }} />
        <span className="confetti-particle bg-emerald-400 left-[25%]" style={{ animationDelay: '1.2s' }} />
        <span className="confetti-particle bg-red-400 left-[45%]" style={{ animationDelay: '0.7s' }} />
        <span className="confetti-particle bg-amber-400 left-[70%]" style={{ animationDelay: '1.5s' }} />
        <span className="confetti-particle bg-blue-400 left-[85%]" style={{ animationDelay: '0.9s' }} />
      </div>

      {/* Header Banner */}
      <div className="flex flex-col items-center text-center relative z-10">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 p-1 shadow-2xl flex items-center justify-center animate-bounce">
          <div className="w-full h-full rounded-full bg-emerald-700 flex items-center justify-center text-white">
            <svg className="w-10 h-10 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h2 className="mt-3 text-2xl sm:text-3xl font-black text-amber-300 font-tamil drop-shadow">
          வாழ்த்துகள்! நீங்கள் தகுதியுடையவர்!
        </h2>
        <p className="text-sm sm:text-base text-emerald-200 font-bold font-tamil mt-1">
          கலைஞர் மகளிர் உரிமைத் திட்டம் • ₹1,000 / மாதம்
        </p>

        {/* Monthly Assistance Highlight Badge */}
        <div className="mt-4 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-2xl sm:text-3xl shadow-lg border-2 border-white flex items-center gap-2">
          <span>மாதம் ₹1,000 உதவித்தொகை</span>
        </div>
      </div>

      {/* 4 Required Documents Grid */}
      <div className="mt-6 relative z-10">
        <h3 className="text-base sm:text-lg font-bold text-white font-tamil flex items-center gap-2 mb-3">
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          எடுத்துச் செல்ல வேண்டிய 4 முக்கிய ஆவணங்கள்:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {documentCards.map((doc, i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-slate-900/80 border-2 border-emerald-500/40 flex items-center gap-3.5 shadow-md"
            >
              <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                {doc.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-white font-tamil">
                  {doc.title}
                </span>
                <span className="text-xs text-amber-300 font-medium font-tamil">
                  {doc.desc}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                  {doc.sub}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Where to Go & Application Steps */}
      <div className="mt-6 p-4 rounded-2xl bg-emerald-950/70 border-2 border-emerald-400/60 relative z-10">
        <h3 className="text-base sm:text-lg font-bold text-emerald-300 font-tamil flex items-center gap-2">
          <span>📍</span>
          <span>எங்கு சென்று விண்ணப்பிக்க வேண்டும்?</span>
        </h3>
        <p className="text-lg text-white font-tamil font-bold mt-1">
          {solution.where_to_go}
        </p>

        <div className="mt-3 space-y-1.5 text-xs sm:text-sm text-emerald-100 font-tamil font-medium">
          {solution.action_steps &&
            solution.action_steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">✔</span>
                <span>{step}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
        <button
          type="button"
          onClick={onReplay}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-base font-tamil shadow-lg border-2 border-emerald-300 flex items-center justify-center gap-2 transition-all"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18V6l-5 4H4v4h3l5 4z" />
          </svg>
          <span>வழிகாட்டலை மீண்டும் கேள் (Listen Again)</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold text-sm font-tamil border border-slate-600 flex items-center justify-center gap-1.5 transition-all"
        >
          <span>🔄 புதிய சரிபார்ப்பு (New Check)</span>
        </button>
      </div>
    </div>
  );
}
