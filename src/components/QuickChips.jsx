import React from 'react';

/**
 * Large High-Contrast Quick Response Chips.
 * Enables zero-effort voice-or-tap replies for rural women in noisy village surroundings.
 */
export default function QuickChips({ onSelect, disabled = false, currentStep = 'welcome' }) {
  const isQuestionStep = ['age', 'ration_card', 'income', 'electricity', 'land'].includes(currentStep);

  return (
    <div
      role="group"
      aria-label="விரைவு பதில்கள் (Quick Action Chips)"
      className="w-full max-w-xl mx-auto px-3 py-2 flex flex-wrap items-center justify-center gap-2"
    >
      {isQuestionStep && (
        <>
          {/* Affirmative 'Yes' Chip */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect('ஆம், சரி')}
            className="flex-1 min-w-[130px] py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-base sm:text-lg font-tamil shadow-lg border-2 border-emerald-300 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            aria-label="ஆம் அல்லது சரி என்று பதிலளிக்க (Answer Yes)"
          >
            <span className="w-5 h-5 rounded-full bg-white text-emerald-700 flex items-center justify-center text-xs font-black">
              ✓
            </span>
            <span>ஆம் / சரி (Yes)</span>
          </button>

          {/* Negative 'No' Chip */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect('இல்லை')}
            className="flex-1 min-w-[130px] py-3 px-4 rounded-2xl bg-rose-700 hover:bg-rose-600 active:scale-95 text-white font-bold text-base sm:text-lg font-tamil shadow-lg border-2 border-rose-300 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            aria-label="இல்லை என்று பதிலளிக்க (Answer No)"
          >
            <span className="w-5 h-5 rounded-full bg-white text-rose-700 flex items-center justify-center text-xs font-black">
              ✕
            </span>
            <span>இல்லை (No)</span>
          </button>
        </>
      )}

      {/* Helpful Query Chips */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect('விண்ணப்பிக்க என்னென்ன ஆவணங்கள் தேவை?')}
        className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-yellow-300 font-semibold text-xs sm:text-sm font-tamil border border-yellow-400/40 flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
        aria-label="தேவையான ஆவணங்களை அறிய (What documents are needed?)"
      >
        <span>📄</span>
        <span>ஆவணங்கள் என்ன? (Documents)</span>
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect('எங்கு சென்று விண்ணப்பிக்க வேண்டும்?')}
        className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-emerald-300 font-semibold text-xs sm:text-sm font-tamil border border-emerald-400/40 flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
        aria-label="விண்ணப்பிக்கும் இடத்தை அறிய (Where to apply?)"
      >
        <span>🏛️</span>
        <span>எங்கு செல்ல வேண்டும்? (Where to apply)</span>
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect('மறுபடியும் கேள்விகளை ஆரம்பியுங்கள்')}
        className="py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium text-xs font-tamil border border-slate-700 flex items-center gap-1 transition-all"
        aria-label="உரையாடலை மீண்டும் தொடங்க (Restart)"
      >
        <span>🔄</span>
        <span>மீண்டும் தொடங்கு</span>
      </button>
    </div>
  );
}
