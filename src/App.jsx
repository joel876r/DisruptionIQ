import React, { useState } from 'react';
import HolographicVoiceHead from './components/HolographicVoiceHead';
import PulsingVoiceCore from './components/PulsingVoiceCore';
import OfficialReceiptModal from './components/OfficialReceiptModal';
import { useSpeech } from './hooks/useSpeech';

/**
 * Sol / சொல் - Authentic Government Scheme Voice Assistant PWA
 * Polished, high-contrast UI/UX tailored for rural Indian women with zero digital literacy.
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
  const isListening = status === 'listening';
  const isSpeaking = status === 'speaking';

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    sendManualAnswer(textInput);
    setTextInput('');
  };

  // Step tracker mapping
  const stepsList = [
    { id: 'name', label: '1. பெயர்', done: Boolean(applicationData?.applicant_name) },
    { id: 'age', label: '2. வயது (21+)', done: Boolean(applicationData?.age) },
    { id: 'ration_card', label: '3. ரேஷன் அட்டை', done: Boolean(passedCriteria.includes('ration_card')) },
    { id: 'income', label: '4. வருமானம்', done: Boolean(passedCriteria.includes('income')) },
    { id: 'electricity_land', label: '5. EB & நிலம்', done: Boolean(passedCriteria.includes('electricity') || passedCriteria.includes('land')) },
    { id: 'bank', label: '6. வங்கி DBT', done: Boolean(applicationData?.bank_name) },
  ];

  return (
    <div className="min-h-screen w-full bg-[#030712] text-white flex flex-col font-tamil selection:bg-emerald-500 selection:text-black">
      
      {/* Top Government Scheme Navigation Bar */}
      <header
        role="banner"
        className="w-full bg-[#07112c]/95 border-b border-emerald-500/30 px-3 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 p-0.5 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            <div className="w-full h-full rounded-full bg-[#06122d] flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-xl sm:text-2xl text-white tracking-wide">
                Sol <span className="text-emerald-400 font-extrabold">/ சொல்</span>
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-extrabold tracking-wide">
                அரசு குரல் சேவை
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-300 font-bold tracking-wide">
              தமிழ்நாடு அரசு • கலைஞர் மகளிர் உரிமைத் திட்டம் (மாதம் ₹1,000 DBT)
            </p>
          </div>
        </div>

        {/* Top Controls: Audio test & Restart */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={repeatLastResponse}
            aria-label="சொல் கூறியதை கேட்க (Listen to Sol)"
            className="px-3 py-2 rounded-xl bg-emerald-950/90 hover:bg-emerald-900 border-2 border-emerald-500/60 text-emerald-300 text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18V6l-5 4H4v4h3l5 4z" />
            </svg>
            <span className="hidden sm:inline">குரலைக் கேள்</span>
          </button>

          <button
            type="button"
            onClick={resetConversation}
            aria-label="புதிய விண்ணப்பம் தொடங்க (New Application)"
            className="px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border-2 border-slate-600 text-slate-200 text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">புதிய தொடக்கம்</span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Toggle (Visible only on mobile devices) */}
      <div className="lg:hidden w-full bg-[#081230] border-b border-slate-800 p-1.5 flex gap-1 z-30 sticky top-[65px]">
        <button
          type="button"
          onClick={() => setMobileTab('assistant')}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
            mobileTab === 'assistant'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg border border-emerald-300'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <span>🎙️ குரல் உதவியாளர் (Voice AI)</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('form')}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
            mobileTab === 'form'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg border border-emerald-300'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <span>📋 அரசு படிவம் (Govt Form)</span>
          {passedCriteria.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-black text-xs font-black flex items-center justify-center">
              {passedCriteria.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Responsive Grid Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Sol Cyber Voice Assistant (Col 1 to 7 on PC) */}
        <section
          aria-label="Sol குரல் உரையாடல் பகுதி"
          className={`w-full lg:col-span-7 flex flex-col justify-between bg-gradient-to-b from-[#081333] via-[#050c22] to-[#020510] rounded-3xl border-2 border-emerald-500/30 p-4 sm:p-7 shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-hidden ${
            mobileTab === 'form' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Futuristic Holographic Mascot Head */}
          <HolographicVoiceHead status={status} />

          {/* Dialogue Speech Card with High Legibility */}
          <div className="w-full my-3 p-4 sm:p-6 rounded-3xl bg-[#0a1840]/95 border-2 border-emerald-400/50 shadow-2xl backdrop-blur-xl relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                <span>Sol / சொல் வழிகாட்டல்:</span>
              </span>

              {/* Inline Listen Again Trigger */}
              <button
                type="button"
                onClick={repeatLastResponse}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-400/50 text-emerald-300 text-xs font-bold flex items-center gap-1 transition-all"
              >
                <span>🔊 மீண்டும் கேள்</span>
              </button>
            </div>

            <p className="text-xl sm:text-2xl font-black text-white font-tamil leading-relaxed tracking-wide drop-shadow-sm">
              {lastSolResponse}
            </p>

            {/* User Speech Transcription Card */}
            {transcript && (
              <div className="mt-4 p-3 rounded-2xl bg-amber-950/40 border border-amber-400/40 flex items-start gap-2 shadow-inner">
                <span className="text-xs uppercase font-black text-amber-400 shrink-0 mt-0.5">நீங்கள்:</span>
                <p className="text-base sm:text-lg font-extrabold text-amber-200 font-tamil leading-snug">
                  "{transcript}"
                </p>
              </div>
            )}
          </div>

          {/* Error Banner if any */}
          {errorMessage && (
            <div role="alert" className="p-3.5 rounded-2xl bg-red-950/90 border-2 border-red-500 text-red-100 text-sm font-extrabold text-center my-1.5 font-tamil shadow-lg">
              {errorMessage}
            </div>
          )}

          {/* Touch-Friendly Quick Tamil Response Chips */}
          <div className="w-full my-2 flex flex-wrap gap-2.5 justify-center z-10">
            {currentStep === 'name' && (
              <>
                <button
                  type="button"
                  onClick={() => sendManualAnswer('என் பெயர் கவிதா')}
                  className="px-4 py-2.5 rounded-2xl bg-[#091b42] hover:bg-[#0e265c] text-emerald-300 text-sm font-extrabold border-2 border-emerald-400/50 shadow-md active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>👩</span>
                  <span>"என் பெயர் கவிதா"</span>
                </button>
                <button
                  type="button"
                  onClick={() => sendManualAnswer('என் பெயர் சாந்தி')}
                  className="px-4 py-2.5 rounded-2xl bg-[#091b42] hover:bg-[#0e265c] text-emerald-300 text-sm font-extrabold border-2 border-emerald-400/50 shadow-md active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>👩</span>
                  <span>"என் பெயர் சாந்தி"</span>
                </button>
              </>
            )}

            {currentStep === 'age' && (
              <>
                <button
                  type="button"
                  onClick={() => sendManualAnswer('எனக்கு 32 வயது ஆகிறது')}
                  className="px-4 py-2.5 rounded-2xl bg-[#091b42] hover:bg-[#0e265c] text-emerald-300 text-sm font-extrabold border-2 border-emerald-400/50 shadow-md active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>🎂</span>
                  <span>"எனக்கு 32 வயது"</span>
                </button>
                <button
                  type="button"
                  onClick={() => sendManualAnswer('எனக்கு 45 வயது')}
                  className="px-4 py-2.5 rounded-2xl bg-[#091b42] hover:bg-[#0e265c] text-emerald-300 text-sm font-extrabold border-2 border-emerald-400/50 shadow-md active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>🎂</span>
                  <span>"எனக்கு 45 வயது"</span>
                </button>
              </>
            )}

            {currentStep === 'ration_card' && (
              <>
                <button
                  type="button"
                  onClick={() => sendManualAnswer('ஆமாம், குடும்பத் தலைவி நான்தான் ரேஷன் கார்டு உண்டு')}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-extrabold border-2 border-emerald-300 shadow-md active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>💳</span>
                  <span>"குடும்பத் தலைவி நான்தான்"</span>
                </button>
                <button
                  type="button"
                  onClick={() => sendManualAnswer('ரேஷன் கார்டு எண் 33/W/842104')}
                  className="px-4 py-2.5 rounded-2xl bg-[#091b42] hover:bg-[#0e265c] text-emerald-300 text-sm font-extrabold border-2 border-emerald-400/50 shadow-md active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>💳</span>
                  <span>"ரேஷன் கார்டு எண் உண்டு"</span>
                </button>
              </>
            )}

            {currentStep === 'income' && (
              <>
                <button
                  type="button"
                  onClick={() => sendManualAnswer('ஆண்டு வருமானம் ஒரு லட்சம், கூலி வேலை செய்கிறோம்')}
                  className="px-4 py-2.5 rounded-2xl bg-[#091b42] hover:bg-[#0e265c] text-amber-300 text-sm font-extrabold border-2 border-amber-400/50 shadow-md active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>🌾</span>
                  <span>"வருமானம் 1 லட்சம், கூலி வேலை"</span>
                </button>
                <button
                  type="button"
                  onClick={() => sendManualAnswer('வருமானம் இரண்டரை லட்சத்திற்குள் உள்ளது')}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-extrabold border-2 border-emerald-300 shadow-md active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>🌾</span>
                  <span>"2.5 லட்சத்திற்குள் உள்ளது"</span>
                </button>
              </>
            )}

            {currentStep === 'electricity_land' && (
              <>
                <button
                  type="button"
                  onClick={() => sendManualAnswer('ஆமாம், மின்சாரம் 1200 யூனிட் தான் நிலம் எதுவும் இல்லை')}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-extrabold border-2 border-emerald-300 shadow-md active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>⚡</span>
                  <span>"மின்சாரம் & நிலம் குறைவுதான்"</span>
                </button>
              </>
            )}

            {currentStep === 'bank' && (
              <>
                <button
                  type="button"
                  onClick={() => sendManualAnswer('இந்தியன் வங்கி கணக்கு எண் 60234589123')}
                  className="px-4 py-2.5 rounded-2xl bg-[#091b42] hover:bg-[#0e265c] text-emerald-300 text-sm font-extrabold border-2 border-emerald-400/50 shadow-md active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>🏦</span>
                  <span>"இந்தியன் வங்கி (Indian Bank)"</span>
                </button>
                <button
                  type="button"
                  onClick={() => sendManualAnswer('ஸ்டேட் பாங்க் ஆப் இந்தியா (SBI) கணக்கு உள்ளது')}
                  className="px-4 py-2.5 rounded-2xl bg-[#091b42] hover:bg-[#0e265c] text-emerald-300 text-sm font-extrabold border-2 border-emerald-400/50 shadow-md active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>🏦</span>
                  <span>"பாரத ஸ்டேட் வங்கி (SBI)"</span>
                </button>
              </>
            )}
          </div>

          {/* Massive Central Voice Microphone Controller */}
          <div className="my-2 flex flex-col items-center">
            <PulsingVoiceCore
              status={status}
              onClick={toggleListening}
              hasStarted={hasStarted}
            />
          </div>

          {/* Text Message Hybrid Input Bar */}
          <form
            onSubmit={handleTextSubmit}
            className="w-full mt-3 p-2 rounded-2xl bg-[#071330] border-2 border-emerald-500/40 flex items-center gap-2 shadow-xl"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="இங்கே தமிழில் தட்டச்சு செய்யவும்... (Type or Speak)"
              className="flex-1 bg-transparent px-3 py-2 text-sm sm:text-base text-white placeholder-slate-400 font-tamil focus:outline-none"
            />

            {/* Quick Microphone Button in text bar */}
            <button
              type="button"
              onClick={toggleListening}
              aria-label="மைக்ரோஃபோன் மூலம் பேச (Speak via Mic)"
              className={`p-2.5 rounded-xl transition-all ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-slate-800 text-emerald-300 hover:bg-slate-700'
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
              className="p-2.5 px-4 sm:px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base transition-all active:scale-95 flex items-center gap-1.5 shadow-md"
            >
              <span>அனுப்பு</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </section>

        {/* RIGHT COLUMN: Official Government Application Form Preview (Col 8 to 12 on PC) */}
        <section
          aria-label="அரசு விண்ணப்ப படிவ பகுதி"
          className={`w-full lg:col-span-5 flex flex-col bg-[#070f26] rounded-3xl border-2 border-slate-700/80 p-5 sm:p-6 shadow-2xl relative ${
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
                <div className="flex items-center gap-3.5 border-b border-slate-800 pb-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 p-0.5 flex items-center justify-center shrink-0 shadow-md">
                    <div className="w-full h-full rounded-full bg-[#081230] flex items-center justify-center">
                      <svg className="w-7 h-7 text-amber-400 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider block font-tamil">
                      தமிழ்நாடு அரசு • வருவாய்த்துறை
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-white font-tamil leading-tight">
                      கலைஞர் மகளிர் உரிமைத் திட்டம்
                    </h2>
                    <span className="text-xs font-extrabold text-emerald-400 font-tamil">
                      நேரடி பதிவு படிவம் (KMUT Portal)
                    </span>
                  </div>
                </div>

                {/* Progress Stepper Bar */}
                <div className="mb-4 p-3 rounded-2xl bg-[#091538] border border-slate-700/80">
                  <div className="flex items-center justify-between text-xs font-extrabold text-slate-300 mb-2 font-tamil">
                    <span>பதிவு நிலை (Progress):</span>
                    <span className="text-emerald-400 font-mono font-black">{passedCriteria.length} / 6 பூர்த்தி</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {stepsList.map((st) => (
                      <div
                        key={st.id}
                        className={`h-2 rounded-full transition-all ${
                          st.done
                            ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                            : currentStep === st.id
                            ? 'bg-amber-400 animate-pulse'
                            : 'bg-slate-700'
                        }`}
                        title={st.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Application ID Badge */}
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex justify-between items-center mb-4 shadow-inner">
                  <span className="text-xs text-slate-400 font-tamil font-bold">விண்ணப்ப பதிவு எண்:</span>
                  <span className="text-xs sm:text-sm font-mono font-black text-emerald-300">{applicationData.application_id}</span>
                </div>

                {/* Form Fields List (Real Government Application Fields) */}
                <div className="space-y-3">
                  {/* Field 1: Name */}
                  <div className="p-3.5 rounded-2xl bg-[#091538] border border-slate-700/80">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block font-tamil">
                      1. விண்ணப்பதாரர் பெயர் (Applicant Name):
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-sm sm:text-base font-extrabold font-tamil ${applicationData.applicant_name ? 'text-emerald-300' : 'text-slate-500 italic'}`}>
                        {applicationData.applicant_name || 'குரல் மூலம் சொல்லவும்...'}
                      </span>
                      {applicationData.applicant_name && (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black shadow">✓</span>
                      )}
                    </div>
                  </div>

                  {/* Field 2: Age */}
                  <div className="p-3.5 rounded-2xl bg-[#091538] border border-slate-700/80">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block font-tamil">
                      2. வயது (Age Requirement 21+):
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-sm sm:text-base font-extrabold font-tamil ${applicationData.age ? 'text-emerald-300' : 'text-slate-500 italic'}`}>
                        {applicationData.age ? `${applicationData.age} ஆண்டுகள் (தகுதி உறுதி செய்யப்பட்டது)` : 'சரிபார்க்கப்படுகிறது...'}
                      </span>
                      {applicationData.age && (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black shadow">✓</span>
                      )}
                    </div>
                  </div>

                  {/* Field 3: Ration Card */}
                  <div className="p-3.5 rounded-2xl bg-[#091538] border border-slate-700/80">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block font-tamil">
                      3. ஸ்மார்ட் குடும்ப அட்டை & குடும்பத் தலைவி:
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-sm sm:text-base font-extrabold font-tamil ${passedCriteria.includes('ration_card') ? 'text-emerald-300' : 'text-slate-500 italic'}`}>
                        {passedCriteria.includes('ration_card') ? `${applicationData.ration_card_number} (குடும்பத் தலைவி ✔)` : 'சரிபார்க்கப்படுகிறது...'}
                      </span>
                      {passedCriteria.includes('ration_card') && (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black shadow">✓</span>
                      )}
                    </div>
                  </div>

                  {/* Field 4: Annual Income & Work */}
                  <div className="p-3.5 rounded-2xl bg-[#091538] border border-slate-700/80">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block font-tamil">
                      4. ஆண்டு வருமானம் & தொழில்:
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-sm sm:text-base font-extrabold font-tamil ${passedCriteria.includes('income') ? 'text-emerald-300' : 'text-slate-500 italic'}`}>
                        {passedCriteria.includes('income') ? `${applicationData.annual_income} • ${applicationData.occupation}` : 'சரிபார்க்கப்படுகிறது...'}
                      </span>
                      {passedCriteria.includes('income') && (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black shadow">✓</span>
                      )}
                    </div>
                  </div>

                  {/* Field 5: Electricity & Land */}
                  <div className="p-3.5 rounded-2xl bg-[#091538] border border-slate-700/80">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block font-tamil">
                      5. மின்சாரம் & நில அளவு (EB & Land):
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-sm sm:text-base font-extrabold font-tamil ${passedCriteria.includes('electricity') || passedCriteria.includes('land') ? 'text-emerald-300' : 'text-slate-500 italic'}`}>
                        {passedCriteria.includes('electricity') || passedCriteria.includes('land')
                          ? `${applicationData.electricity_units} • ${applicationData.land_extent}`
                          : 'சரிபார்க்கப்படுகிறது...'}
                      </span>
                      {(passedCriteria.includes('electricity') || passedCriteria.includes('land')) && (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black shadow">✓</span>
                      )}
                    </div>
                  </div>

                  {/* Field 6: Bank Details */}
                  <div className="p-3.5 rounded-2xl bg-[#091538] border border-slate-700/80">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block font-tamil">
                      6. உதவித்தொகை வங்கி கணக்கு (₹1,000 DBT Bank):
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-sm sm:text-base font-extrabold font-tamil ${applicationData.bank_name ? 'text-emerald-300' : 'text-slate-500 italic'}`}>
                        {applicationData.bank_name || 'வங்கியை குரல் மூலம் சொல்லவும்...'}
                      </span>
                      {applicationData.bank_name && (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black shadow">✓</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Benefit Golden Banner */}
              <div className="mt-5 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/25 via-yellow-400/20 to-amber-500/25 border-2 border-amber-400/60 flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-xs text-amber-300 uppercase font-black block font-tamil">மாதாந்திர நிதி உதவி (Direct Benefit):</span>
                  <span className="text-2xl font-black text-amber-400">₹1,000 / மாதம்</span>
                </div>
                <span className="px-3 py-1.5 rounded-full bg-amber-400 text-slate-950 text-xs sm:text-sm font-black font-tamil shadow-md">
                  நேரடி வங்கி வரவு
                </span>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Accessible Footer */}
      <footer role="contentinfo" className="w-full bg-[#050b1a] border-t border-slate-800/80 py-3 px-4 text-center text-xs sm:text-sm text-slate-400 font-tamil">
        தமிழ்நாடு அரசு • கலைஞர் மகளிர் உரிமைத் திட்டம் • குரல் வழி நேரடி சேவை (Sol / சொல்)
      </footer>
    </div>
  );
}
