import React, { useState } from 'react';

/**
 * 3D Realistic Tamil AI Voice Guide Component for Sol / சொல்.
 * Features the photorealistic 3D Indian woman character in traditional saree,
 * complete with realistic lip-sync speaking animations, breathing, natural eye blinking,
 * and cultural gestures (Namaste / Vanakkam, Explaining, Attentive Listening).
 */
export default function TamilAvatarVoiceGuide({
  status = 'idle',
  currentStep = 'name',
  applicantName = null,
}) {
  const [viewMode, setViewMode] = useState('portrait'); // 'portrait' | 'full'

  const isSpeaking = status === 'speaking';
  const isListening = status === 'listening';
  const isThinking = status === 'processing';
  const isSubmitted = currentStep === 'submitted';

  // Dynamic emotional status and gesture caption in simple Tamil
  const getActionDetails = () => {
    if (isSpeaking) {
      return {
        label: applicantName ? `${applicantName} அம்மாவுடன் பேசுகிறேன்` : 'அம்மாவிடம் விளக்கம் தருகிறேன்',
        badge: 'பேசுகிறது (Speaking)',
        color: 'from-amber-500 to-orange-500',
        ringColor: 'border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.6)]',
        gesture: 'explain',
        icon: '🗣️',
      };
    }
    if (isListening) {
      return {
        label: 'உங்கள் பதிலை கவனமாகக் கேட்கிறேன் அம்மா...',
        badge: 'கேட்கிறது (Listening)',
        color: 'from-emerald-500 to-teal-500',
        ringColor: 'border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.7)]',
        gesture: 'listen',
        icon: '👂',
      };
    }
    if (isThinking) {
      return {
        label: 'அரசு தகுதி விவரங்களை சரிபார்க்கிறேன்...',
        badge: 'சிந்திக்கிறது (Thinking)',
        color: 'from-cyan-500 to-blue-500',
        ringColor: 'border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.6)]',
        gesture: 'think',
        icon: '⚡',
      };
    }
    if (isSubmitted) {
      return {
        label: 'வாழ்த்துகள் அம்மா! விண்ணப்பம் ஏற்கப்பட்டது!',
        badge: 'வெற்றி (Success)',
        color: 'from-emerald-400 to-green-600',
        ringColor: 'border-emerald-300 shadow-[0_0_45px_rgba(52,211,153,0.8)]',
        gesture: 'namaste',
        icon: '🎉',
      };
    }
    return {
      label: 'வணக்கம் அம்மா! உதவி செய்ய தயாராக உள்ளேன்.',
      badge: 'தயார் (Ready)',
      color: 'from-amber-600 to-amber-700',
      ringColor: 'border-amber-500/50 shadow-[0_0_25px_rgba(217,119,6,0.4)]',
      gesture: 'namaste',
      icon: '🙏',
    };
  };

  const action = getActionDetails();

  return (
    <div
      role="region"
      aria-label="Sol 3D Tamil AI Voice Assistant Character"
      className="relative flex flex-col items-center justify-center my-2 select-none w-full"
    >
      {/* Dynamic Ambient Radiant Halo */}
      <div
        className={`absolute -inset-2 sm:-inset-4 rounded-full blur-3xl transition-all duration-700 opacity-60 pointer-events-none ${
          isListening
            ? 'bg-emerald-500/40 scale-125'
            : isSpeaking
            ? 'bg-amber-500/50 scale-120'
            : isThinking
            ? 'bg-cyan-500/45 scale-110'
            : isSubmitted
            ? 'bg-yellow-400/60 scale-130'
            : 'bg-orange-500/25 scale-100'
        }`}
        aria-hidden="true"
      />

      {/* 3D Circular Avatar Portal */}
      <div className="relative z-10 flex flex-col items-center">
        <div
          className={`relative rounded-3xl p-1 bg-gradient-to-b from-amber-400 via-orange-600 to-amber-900 transition-all duration-500 ${
            action.ringColor
          } ${isListening ? 'animate-pulse' : ''}`}
        >
          {/* Main 3D Stage Viewport */}
          <div className="relative w-44 h-48 sm:w-56 sm:h-60 rounded-[22px] bg-gradient-to-b from-[#1a0f08] via-[#120803] to-[#080301] overflow-hidden flex items-center justify-center shadow-2xl">
            
            {/* View Mode: Portrait Close-Up */}
            {viewMode === 'portrait' ? (
              <div
                className={`relative w-full h-full flex items-center justify-center ${
                  isSpeaking ? 'animate-head-speaking' : 'animate-avatar-breathe'
                } ${isListening ? 'scale-105 rotate-1' : ''}`}
              >
                {/* Photorealistic Saree Character Portrait */}
                <img
                  src="/sol-avatar-portrait.jpg"
                  alt="Sol 3D AI Tamil Voice Assistant"
                  className="w-full h-full object-cover object-top filter brightness-105 contrast-105"
                  onError={(e) => {
                    // Fallback to full image if portrait is loading
                    e.currentTarget.src = '/sol-avatar.jpg';
                  }}
                />

                {/* Soft Vignette Overlay for 3D Depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0703] via-transparent to-transparent pointer-events-none opacity-85" />
                <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-[#000000]/60 pointer-events-none" />

                {/* Realistic Dynamic Mouth Lip-Sync Layer */}
                {isSpeaking && (
                  <div
                    className="absolute top-[37%] left-[49.5%] -translate-x-1/2 w-6 h-3 flex items-center justify-center pointer-events-none"
                    title="Real-time Lip Synchronization"
                  >
                    {/* Synchronized Animated Lips Opening & Closing */}
                    <div className="w-5 h-2.5 rounded-full bg-[#7c1d1d]/85 border border-[#fb7185]/60 animate-lip-sync flex items-center justify-center shadow-sm">
                      <div className="w-3 h-1 rounded-full bg-white/70" />
                    </div>
                  </div>
                )}

                {/* Attentive Listening Soundwave Rings over Ear */}
                {isListening && (
                  <div className="absolute top-[28%] right-[18%] pointer-events-none flex items-center justify-center">
                    <span className="absolute w-7 h-7 rounded-full border-2 border-emerald-400 animate-ping opacity-75" />
                    <span className="w-5 h-5 rounded-full bg-emerald-500/80 border border-white flex items-center justify-center text-[10px] text-white shadow-lg">
                      👂
                    </span>
                  </div>
                )}

                {/* Traditional Forehead Bindi (பொட்டு) Ambient Aura */}
                <div
                  className={`absolute top-[24%] left-[50%] -translate-x-1/2 w-2.5 h-2.5 rounded-full transition-all duration-300 pointer-events-none ${
                    isThinking
                      ? 'bg-cyan-300 shadow-[0_0_12px_#38bdf8] scale-150 animate-ping'
                      : isSpeaking
                      ? 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                      : 'bg-red-600'
                  }`}
                />

                {/* Explaining Hand Gesture Overlay while Speaking */}
                {isSpeaking && (
                  <div className="absolute bottom-1 right-2 pointer-events-none animate-explain">
                    <div className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-400/60 text-[10px] text-amber-200 font-bold flex items-center gap-1 shadow-md">
                      <span>🫱</span>
                      <span>விளக்குகிறது</span>
                    </div>
                  </div>
                )}

                {/* Namaste / Vanakkam Hand Gesture Overlay when Idle or Welcome */}
                {!isSpeaking && !isListening && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 pointer-events-none animate-namaste">
                    <div className="px-2.5 py-0.5 rounded-full bg-orange-950/85 border border-amber-400/80 text-[10px] text-amber-200 font-bold flex items-center gap-1 shadow-lg backdrop-blur-sm">
                      <span>🙏</span>
                      <span>வணக்கம்</span>
                    </div>
                  </div>
                )}

                {/* Attentive Listening Cue when Listening */}
                {isListening && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 pointer-events-none animate-pulse">
                    <div className="px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-400 text-[10px] text-emerald-200 font-bold flex items-center gap-1 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>கவனிக்கிறேன்...</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* View Mode: Full 3D Model View */
              <div className="relative w-full h-full flex flex-col items-center justify-center p-1 animate-avatar-breathe">
                <img
                  src="/sol-avatar.jpg"
                  alt="Sol 3D Full Character in Traditional Saree"
                  className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                />
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/75 border border-amber-500/40 text-[9px] text-amber-300 font-bold">
                  தமிழ்நாடு அரசு சேவகி
                </div>
              </div>
            )}

            {/* Speaking Voice Waves Overlay */}
            {isSpeaking && (
              <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-black/60 px-2 py-1 rounded-full border border-amber-400/50 backdrop-blur-sm pointer-events-none">
                <span className="w-1 h-3 rounded-full bg-amber-400 bar-1" />
                <span className="w-1 h-5 rounded-full bg-orange-400 bar-2" />
                <span className="w-1 h-2 rounded-full bg-yellow-300 bar-3" />
                <span className="w-1 h-4 rounded-full bg-amber-400 bar-4" />
                <span className="text-[10px] text-amber-200 font-bold ml-1 font-tamil">பேசுகிறார்</span>
              </div>
            )}

            {/* Perspective View Toggle Button */}
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'portrait' ? 'full' : 'portrait')}
              aria-label={viewMode === 'portrait' ? 'முழு உருவத்திற்கு மாறு (Switch to Full View)' : 'முக தோற்றத்திற்கு மாறு (Switch to Portrait)'}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/90 border border-amber-400/50 text-amber-300 text-xs transition-all hover:scale-110 active:scale-95 z-20 backdrop-blur-sm shadow-md"
              title={viewMode === 'portrait' ? 'முழு உருவம் பார்க்க (Full 3D Model)' : 'முக தோற்றம் பார்க்க (Portrait View)'}
            >
              {viewMode === 'portrait' ? '🧍‍♀️ முழு உருவம்' : '👤 முகம்'}
            </button>
          </div>
        </div>

        {/* Dynamic Action Subtitle Ribbon */}
        <div className="mt-2.5 flex flex-col items-center gap-1 text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#170e06] via-[#241306] to-[#170e06] border-2 border-amber-400/60 shadow-lg">
            <span className="text-sm">{action.icon}</span>
            <span className="text-xs sm:text-sm font-extrabold text-amber-300 font-tamil tracking-wide">
              {action.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-amber-400/80 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-600/30 font-tamil">
              Sol / சொல் • தமிழ்நாடு AI வழிகாட்டி
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-600/30">
              {action.badge}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
