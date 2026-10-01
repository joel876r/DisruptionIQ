import React from 'react';
import PhoneFrame from './components/PhoneFrame';
import HolographicVoiceHead from './components/HolographicVoiceHead';
import LiveApplicationCard from './components/LiveApplicationCard';
import OfficialReceiptModal from './components/OfficialReceiptModal';
import PulsingVoiceCore from './components/PulsingVoiceCore';
import QuickChips from './components/QuickChips';
import { useSpeech } from './hooks/useSpeech';

/**
 * Sol / சொல் - 9:16 Mobile-First Government Voice Assistant PWA
 * Inspired by the reference design with deep cyber-blue atmosphere,
 * holographic AI voice mascot, live real-time scheme application preview,
 * and official Tamil Nadu Government scheme submission.
 */
export default function App() {
  const {
    status,
    transcript,
    lastSolResponse,
    hasStarted,
    errorMessage,
    currentStep,
    passedCriteria,
    solution,
    applicationData,
    toggleListening,
    sendManualAnswer,
    repeatLastResponse,
    resetConversation,
  } = useSpeech();

  const isSubmitted = applicationData?.submission_status === 'submitted';

  return (
    <PhoneFrame>
      <div className="flex flex-col min-h-full justify-between p-3 sm:p-4 text-white relative">
        
        {/* Top Minimal Bar */}
        <header
          role="banner"
          className="w-full flex items-center justify-between pt-1 pb-2 border-b border-slate-800/80"
        >
          {/* Sol / சொல் Brand */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1">
              <span>Sol</span>
              <span className="text-cyan-400 font-tamil font-black">/ சொல்</span>
            </h1>
          </div>

          {/* Reset / New Application Button */}
          <button
            type="button"
            onClick={resetConversation}
            aria-label="உரையாடலை மீண்டும் தொடங்க (Reset)"
            className="p-1.5 px-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-tamil flex items-center gap-1 transition-all active:scale-95"
          >
            <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>புதிய பதிவு</span>
          </button>
        </header>

        {/* Scheme Badge */}
        <div className="w-full text-center mt-1">
          <span className="text-[10px] font-extrabold text-cyan-300 font-tamil tracking-wider uppercase bg-[#09153a] px-3 py-1 rounded-full border border-cyan-500/30 shadow">
            கலைஞர் மகளிர் உரிமைத் திட்டம் • ₹1,000 / மாதம்
          </span>
        </div>

        {/* Main Content Area */}
        <main role="main" className="flex-1 flex flex-col justify-center my-auto">
          {/* If Application is finalized and submitted, show official receipt */}
          {isSubmitted ? (
            <OfficialReceiptModal
              application={applicationData}
              solution={solution}
              onReplay={repeatLastResponse}
              onReset={resetConversation}
            />
          ) : (
            <>
              {/* Cybernetic Holographic Head Mascot */}
              <HolographicVoiceHead status={status} />

              {/* Dialogue Transcript Bubble (Clean, Modern, Legible) */}
              <div
                role="region"
                aria-live="polite"
                aria-label="Sol உரையாடல்"
                className="w-full max-w-sm mx-auto my-2 p-3.5 rounded-2xl bg-[#09122c]/90 border border-cyan-400/40 shadow-xl backdrop-blur-md"
              >
                {/* Active Sol Prompt */}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase text-cyan-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    Sol / சொல்:
                  </span>
                  {lastSolResponse && (
                    <button
                      type="button"
                      onClick={repeatLastResponse}
                      className="text-[10px] text-cyan-300 hover:text-white flex items-center gap-1 font-bold"
                    >
                      <span>🔊 மீண்டும் கேள்</span>
                    </button>
                  )}
                </div>

                <p className="text-base sm:text-lg font-bold text-white font-tamil leading-relaxed">
                  {lastSolResponse || 'வணக்கம் அம்மா! கலைஞர் மகளிர் உரிமைத் திட்டத்திற்கு பதிவு செய்ய கீழே உள்ள பொத்தானை அழுத்தவும்.'}
                </p>

                {/* User's Spoken Speech (if any) */}
                {transcript && (
                  <div className="mt-2 pt-2 border-t border-slate-700/60 text-left">
                    <span className="text-[9px] uppercase font-bold text-slate-400">நீங்கள் பேசியது:</span>
                    <p className="text-xs sm:text-sm font-semibold text-yellow-300 font-tamil mt-0.5">
                      "{transcript}"
                    </p>
                  </div>
                )}
              </div>

              {/* Error Message if any */}
              {errorMessage && (
                <div role="alert" className="p-2 rounded-xl bg-red-950/80 border border-red-500 text-red-200 text-xs font-tamil text-center my-1">
                  {errorMessage}
                </div>
              )}

              {/* Live Real Government Application Form Preview */}
              <LiveApplicationCard application={applicationData} />

              {/* Quick Tactile Voice Response Chips */}
              <QuickChips
                onSelect={sendManualAnswer}
                disabled={status === 'processing'}
                currentStep={currentStep}
              />
            </>
          )}
        </main>

        {/* Bottom Glowing Voice Core */}
        {!isSubmitted && (
          <footer role="contentinfo" className="w-full shrink-0 pt-1">
            <PulsingVoiceCore
              status={status}
              onClick={toggleListening}
              hasStarted={hasStarted}
            />
          </footer>
        )}
      </div>
    </PhoneFrame>
  );
}
