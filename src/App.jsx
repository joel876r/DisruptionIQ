import React, { useState } from 'react';
import TamilAvatarVoiceGuide from './components/TamilAvatarVoiceGuide';
import PulsingVoiceCore from './components/PulsingVoiceCore';
import OfficialReceiptModal from './components/OfficialReceiptModal';
import { useSpeech } from './hooks/useSpeech';

/**
 * Sol / சொல் - Authentic Government Scheme Voice Assistant PWA
 * Fully responsive across Mobile and PC with live Government Application Form.
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

  const [textInput, setTextInput] = useState('');
  const [mobileTab, setMobileTab] = useState('assistant'); // 'assistant' | 'form'

  const isSubmitted = applicationData?.submission_status === 'submitted';

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    sendManualAnswer(textInput);
    setTextInput('');
  };

  return (
    <div className="min-h-screen w-full bg-[#030712] text-white flex flex-col font-tamil selection:bg-cyan-500 selection:text-black">
      
      {/* Top Government Scheme Navigation Bar */}
      <header
        role="banner"
        className="w-full bg-[#08112e]/90 border-b border-cyan-500/30 px-4 py-2.5 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#38bdf8]" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-white">Sol</span>
              <span className="text-cyan-400 font-black text-lg">/ சொல்</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold ml-1">
                அரசு குரல் உதவியாளர்
              </span>
            </div>
            <p className="text-[11px] text-cyan-200 font-bold tracking-wide">
              தமிழ்நாடு அரசு • கலைஞர் மகளிர் உரிமைத் திட்டம் (₹1,000 / மாதம்)
            </p>
          </div>
        </div>

        {/* Top Controls: Audio test & Restart */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={repeatLastResponse}
            aria-label="சொல் கூறியதை கேட்க (Listen to Sol)"
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18V6l-5 4H4v4h3l5 4z" />
            </svg>
            <span className="hidden sm:inline">குரலைக் கேள்</span>
          </button>

          <button
            type="button"
            onClick={resetConversation}
            aria-label="புதிய விண்ணப்பம் தொடங்க (New Application)"
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 transition-all"
          >
            <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">புதிய தொடக்கம்</span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Toggle (Visible only on mobile) */}
      <div className="lg:hidden w-full bg-[#0a1538] border-b border-slate-800 p-1 flex">
        <button
          type="button"
          onClick={() => setMobileTab('assistant')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'assistant' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400'
          }`}
        >
          <span>🎙️ குரல் உதவியாளர் (Voice AI)</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('form')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'form' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400'
          }`}
        >
          <span>📋 அரசு விண்ணப்ப படிவம் (Form)</span>
        </button>
      </div>

      {/* Main Responsive Grid Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Sol Cyber Voice Assistant (Col 1 to 7 on PC) */}
        <section
          aria-label="Sol குரல் உரையாடல் பகுதி"
          className={`w-full lg:col-span-7 flex flex-col justify-between bg-gradient-to-b from-[#060e26] via-[#04091a] to-[#02050f] rounded-3xl border border-cyan-500/30 p-4 sm:p-6 shadow-2xl relative overflow-hidden ${
            mobileTab === 'form' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Subtle Ambient Light */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* 3D Realistic Tamil AI Voice Guide with Actions & Lip-Sync */}
          <TamilAvatarVoiceGuide
            status={status}
            currentStep={currentStep}
            applicantName={applicationData?.applicant_name}
          />

          {/* Dialogue Speech Bubble */}
          <div className="w-full my-3 p-4 sm:p-5 rounded-2xl bg-[#09153a]/90 border-2 border-cyan-400/50 shadow-xl backdrop-blur-md relative z-10">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                Sol / சொல் உரையாடல்:
              </span>
              <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                நேரலை பதிவு (Live)
              </span>
            </div>

            <p className="text-lg sm:text-xl font-bold text-white font-tamil leading-relaxed">
              {lastSolResponse}
            </p>

            {/* User Speech Transcription */}
            {transcript && (
              <div className="mt-3 pt-2 border-t border-slate-700/80 flex items-start gap-1.5">
                <span className="text-[10px] uppercase font-bold text-emerald-400 shrink-0 mt-0.5">நீங்கள்:</span>
                <p className="text-sm font-semibold text-yellow-300 font-tamil">
                  "{transcript}"
                </p>
              </div>
            )}
          </div>

          {/* Error Banner if any */}
          {errorMessage && (
            <div role="alert" className="p-3 rounded-xl bg-red-950/80 border border-red-500 text-red-200 text-xs font-bold text-center my-1 font-tamil">
              {errorMessage}
            </div>
          )}

          {/* Quick Voice / Tap Suggestion Chips */}
          <div className="w-full my-2 flex flex-wrap gap-2 justify-center z-10">
            {currentStep === 'name' && (
              <>
                <button type="button" onClick={() => sendManualAnswer('என் பெயர் கவிதா')} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-cyan-500/40">
                  "என் பெயர் கவிதா"
                </button>
                <button type="button" onClick={() => sendManualAnswer('என் பெயர் சாந்தி')} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-cyan-500/40">
                  "என் பெயர் சாந்தி"
                </button>
              </>
            )}

            {currentStep === 'age' && (
              <>
                <button type="button" onClick={() => sendManualAnswer('எனக்கு 32 வயது')} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                  "எனக்கு 32 வயது"
                </button>
                <button type="button" onClick={() => sendManualAnswer('எனக்கு 45 வயது')} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                  "எனக்கு 45 வயது"
                </button>
              </>
            )}

            {currentStep === 'ration_card' && (
              <>
                <button type="button" onClick={() => sendManualAnswer('ஆமாம், குடும்பத் தலைவி நான்தான்')} className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold border border-emerald-300">
                  "ஆமாம், குடும்பத் தலைவி நான்தான்"
                </button>
                <button type="button" onClick={() => sendManualAnswer('ரேஷன் கார்டு எண் 33/W/842104')} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-cyan-500/40">
                  "ரேஷன் கார்டு எண் உண்டு"
                </button>
              </>
            )}

            {currentStep === 'income' && (
              <>
                <button type="button" onClick={() => sendManualAnswer('ஆண்டு வருமானம் ஒரு லட்சம், கூலி வேலை')} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-amber-500/40">
                  "வருமானம் 1 லட்சம், கூலி வேலை"
                </button>
                <button type="button" onClick={() => sendManualAnswer('வருமானம் இரண்டரை லட்சத்திற்குள் உள்ளது')} className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold border border-emerald-300">
                  "வருமானம் 2.5 லட்சத்திற்குள் உள்ளது"
                </button>
              </>
            )}

            {currentStep === 'electricity_land' && (
              <>
                <button type="button" onClick={() => sendManualAnswer('ஆமாம், மின்சாரம் மற்றும் நிலம் குறைவுதான்')} className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold border border-emerald-300">
                  "ஆமாம், நிலம் எதுவும் இல்லை"
                </button>
              </>
            )}

            {currentStep === 'bank' && (
              <>
                <button type="button" onClick={() => sendManualAnswer('இந்தியன் வங்கி கணக்கு உள்ளது')} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-cyan-500/40">
                  "இந்தியன் வங்கி (Indian Bank)"
                </button>
                <button type="button" onClick={() => sendManualAnswer('ஸ்டேட் பாங்க் ஆப் இந்தியா (SBI)')} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-cyan-500/40">
                  "பாரத ஸ்டேட் வங்கி (SBI)"
                </button>
              </>
            )}
          </div>

          {/* Voice Core Controller */}
          <div className="my-2 flex flex-col items-center">
            <PulsingVoiceCore
              status={status}
              onClick={toggleListening}
              hasStarted={hasStarted}
            />
          </div>

          {/* Text Message Input Bar (Inspired by the Reference Design) */}
          <form
            onSubmit={handleTextSubmit}
            className="w-full mt-3 p-1.5 rounded-2xl bg-[#091433] border border-cyan-500/40 flex items-center gap-2 shadow-lg"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="இங்கே தமிழில் தட்டச்சு செய்யவும்... (Type or Speak)"
              className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-400 font-tamil focus:outline-none"
            />

            {/* Quick Microphone Button */}
            <button
              type="button"
              onClick={toggleListening}
              aria-label="மைக்ரோஃபோன் மூலம் பேச (Speak via Mic)"
              className={`p-2 rounded-xl transition-all ${
                status === 'listening' ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-cyan-300 hover:bg-slate-700'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </button>

            {/* Send Button */}
            <button
              type="submit"
              aria-label="பதிலை அனுப்ப (Send)"
              className="p-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-all active:scale-95 flex items-center gap-1"
            >
              <span>அனுப்பு</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </section>

        {/* RIGHT COLUMN: Official Government Application Form Preview (Col 8 to 12 on PC) */}
        <section
          aria-label="அரசு விண்ணப்ப படிவ பகுதி"
          className={`w-full lg:col-span-5 flex flex-col bg-[#070f26] rounded-3xl border-2 border-slate-700/80 p-5 shadow-2xl relative ${
            mobileTab === 'assistant' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {isSubmitted ? (
            <OfficialReceiptModal
              application={applicationData}
              solution={solution}
              onReplay={repeatLastResponse}
              onReset={resetConversation}
            />
          ) : (
            <div className="flex flex-col h-full justify-between">
              {/* Official Govt Seal & Title */}
              <div>
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 p-0.5 flex items-center justify-center shrink-0">
                    <div className="w-full h-full rounded-full bg-[#081230] flex items-center justify-center">
                      <svg className="w-6 h-6 text-amber-400 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block font-tamil">
                      தமிழ்நாடு அரசு • வருவாய்த்துறை
                    </span>
                    <h2 className="text-base font-black text-white font-tamil leading-tight">
                      கலைஞர் மகளிர் உரிமைத் திட்டம்
                    </h2>
                    <span className="text-[11px] text-cyan-300 font-semibold font-tamil">
                      நேரடி பதிவு படிவம் (KMUT Portal)
                    </span>
                  </div>
                </div>

                {/* Application ID Badge */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center mb-4">
                  <span className="text-xs text-slate-400 font-tamil font-bold">விண்ணப்ப பதிவு எண்:</span>
                  <span className="text-xs font-mono font-black text-cyan-300">{applicationData.application_id}</span>
                </div>

                {/* Form Fields List (Real Government Application Fields) */}
                <div className="space-y-3">
                  {/* Field 1: Name */}
                  <div className="p-3 rounded-xl bg-[#091538] border border-slate-700/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      1. விண்ணப்பதாரர் பெயர் (Applicant Name):
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-sm font-bold font-tamil ${applicationData.applicant_name ? 'text-emerald-300' : 'text-slate-500 italic'}`}>
                        {applicationData.applicant_name || 'குரல் மூலம் சொல்லவும்...'}
                      </span>
                      {applicationData.applicant_name && (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">✓</span>
                      )}
                    </div>
                  </div>

                  {/* Field 2: Age */}
                  <div className="p-3 rounded-xl bg-[#091538] border border-slate-700/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      2. வயது (Age Requirement 21+):
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-sm font-bold font-tamil ${applicationData.age ? 'text-emerald-300' : 'text-slate-500 italic'}`}>
                        {applicationData.age ? `${applicationData.age} ஆண்டுகள் (தகுதி உறுதி செய்யப்பட்டது)` : 'சரிபார்க்கப்படுகிறது...'}
                      </span>
                      {applicationData.age && (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">✓</span>
                      )}
                    </div>
                  </div>

                  {/* Field 3: Ration Card */}
                  <div className="p-3 rounded-xl bg-[#091538] border border-slate-700/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      3. ஸ்மார்ட் ரேஷன் கார்டு எண் & குடும்பத் தலைவி:
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-bold text-amber-300 font-tamil">
                        {applicationData.ration_card_number} (குடும்பத் தலைவி ✔)
                      </span>
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">✓</span>
                    </div>
                  </div>

                  {/* Field 4: Annual Income & Work */}
                  <div className="p-3 rounded-xl bg-[#091538] border border-slate-700/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      4. ஆண்டு வருமானம் & தொழில்:
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-bold text-emerald-300 font-tamil">
                        {applicationData.annual_income} • {applicationData.occupation}
                      </span>
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">✓</span>
                    </div>
                  </div>

                  {/* Field 5: Bank Details */}
                  <div className="p-3 rounded-xl bg-[#091538] border border-slate-700/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      5. உதவித்தொகை வங்கி கணக்கு (₹1,000 DBT Bank):
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-sm font-bold font-tamil ${applicationData.bank_name ? 'text-cyan-300' : 'text-slate-500 italic'}`}>
                        {applicationData.bank_name || 'வங்கியை குரல் மூலம் சொல்லவும்...'}
                      </span>
                      {applicationData.bank_name && (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">✓</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Benefit Banner */}
              <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 border border-amber-400/50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-300 uppercase font-black block font-tamil">மாதாந்திர நிதி உதவி:</span>
                  <span className="text-xl font-black text-amber-400">₹1,000 / மாதம்</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold font-tamil shadow">
                  நேரடி வங்கி வரவு
                </span>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer Instructions */}
      <footer role="contentinfo" className="w-full bg-[#050b1a] border-t border-slate-800/80 py-2.5 px-4 text-center text-xs text-slate-400 font-tamil">
        தமிழ்நாடு அரசு • கலைஞர் மகளிர் உரிமைத் திட்டம் • குரல் வழி நேரடி சேவை
      </footer>
    </div>
  );
}
