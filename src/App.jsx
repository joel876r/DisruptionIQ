import React from 'react';
import Header from './components/Header';
import MicButton from './components/MicButton';
import TranscriptView from './components/TranscriptView';
import HelpBanner from './components/HelpBanner';
import { useSpeech } from './hooks/useSpeech';

/**
 * Main Sol / சொல் PWA Application Component.
 * Implements the Zero-UI paradigm for rural Indian women accessing
 * the Kalaignar Magalir Urimai Thittam scheme via voice.
 */
export default function App() {
  const {
    status,
    transcript,
    lastSolResponse,
    hasStarted,
    errorMessage,
    toggleListening,
    repeatLastResponse,
  } = useSpeech();

  return (
    <div className="flex flex-col min-h-screen justify-between bg-sol-background text-sol-text font-tamil">
      {/* Top Branding Section */}
      <Header status={status} />

      {/* Main Interactive Zero-UI Voice Canvas */}
      <main
        role="main"
        className="flex-1 flex flex-col items-center justify-center w-full px-4"
      >
        {/* Large Central Microphone Button */}
        <MicButton
          status={status}
          onClick={toggleListening}
          hasStarted={hasStarted}
        />

        {/* Dynamic Spoken Dialogue & Transcript */}
        <TranscriptView
          transcript={transcript}
          lastSolResponse={lastSolResponse}
          onRepeat={repeatLastResponse}
          errorMessage={errorMessage}
        />
      </main>

      {/* Accessible 3-Step Voice Guidance Footer */}
      <HelpBanner />
    </div>
  );
}
