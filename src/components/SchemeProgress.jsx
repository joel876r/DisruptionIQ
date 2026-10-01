import React from 'react';

/**
 * Visual 5-Step Scheme Verification Progress Stepper.
 * Uses large pictorial icons and glowing checkmarks so uneducated users
 * can visually track how many eligibility criteria have been satisfied.
 */
export default function SchemeProgress({ passedCriteria = [], currentStep = 'welcome' }) {
  const steps = [
    {
      id: 'age',
      label: 'வயது 21+',
      sub: 'Age 21+',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'ration_card',
      label: 'ரேஷன் அட்டை',
      sub: 'Ration Card',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      id: 'income',
      label: 'வருமானம்',
      sub: '< ₹2.5L',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'electricity',
      label: 'மின் பயன்பாடு',
      sub: '< 3600U',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 'land',
      label: 'நில அளவு',
      sub: '< 5 ஏக்கர்',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      role="region"
      aria-label="தகுதி சரிபார்ப்பு முன்னேற்றம் (Eligibility Progress Stepper)"
      className="w-full max-w-2xl mx-auto px-2 py-2"
    >
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {steps.map((step, idx) => {
          const isPassed = passedCriteria.includes(step.id);
          const isCurrent = currentStep === step.id;

          return (
            <div
              key={step.id}
              className={`flex-1 flex flex-col items-center p-1.5 sm:p-2 rounded-xl transition-all duration-500 border text-center ${
                isPassed
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : isCurrent
                  ? 'bg-amber-950/80 border-amber-400 text-amber-200 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500'
              }`}
            >
              {/* Icon / Checkmark Indicator */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm mb-1 ${
                  isPassed
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : isCurrent
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isPassed ? (
                  <svg className="w-5 h-5 text-white stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Step Title in Tamil */}
              <span className="text-[11px] sm:text-xs font-bold font-tamil truncate w-full">
                {step.label}
              </span>
              <span className="text-[9px] sm:text-[10px] opacity-75 hidden sm:block">
                {step.sub}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
