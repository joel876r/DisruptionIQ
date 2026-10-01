import React from 'react';
import Header from './components/Header';
import AvatarGuide from './components/AvatarGuide';
import SchemeProgress from './components/SchemeProgress';
import MicButton from './components/MicButton';
import QuickChips from './components/QuickChips';
import TranscriptView from './components/TranscriptView';
import SolutionCard from './components/SolutionCard';
import AnimatedWalkthrough from './components/AnimatedWalkthrough';
import HelpBanner from './components/HelpBanner';
import { useSpeech } from './hooks/useSpeech';

/**
 * Main Sol / சொல் PWA Application Component.
 * Implements the Zero-UI paradigm with animated Tamil guide avatar,
 * visual 5-step criteria progress, context-aware reasoning, and complete solution delivery.
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
    isEligible,
    solution,
    toggleListening,
    sendManualAnswer,
    repeatLastResponse,
    resetConversation,
  } = useSpeech();

  return (
    <div className="flex flex-col min-h-screen justify-between bg-sol-background text-sol-text font-tamil relative overflow-x-hidden">
      {/* Top Header Branding with Reset Option */}
      <Header status={status} onReset={resetConversation} />

      {/* 5-Step Visual Scheme Criteria Stepper */}
      <SchemeProgress
        passedCriteria={passedCriteria}
        currentStep={currentStep}
      />

      {/* Main Interactive Zero-UI Canvas */}
      <main
        role="main"
        className="flex-1 flex flex-col items-center justify-center w-full px-3 py-2 max-w-2xl mx-auto"
      >
        {/* Animated Tamil Sister Avatar Mascot ("Sol Akka") */}
        <AvatarGuide status={status} />

        {/* If Solution is ready, display the celebratory solution card */}
        {solution ? (
          <SolutionCard
            solution={solution}
            onReplay={repeatLastResponse}
            onReset={resetConversation}
          />
        ) : (
          <>
            {/* The Single Massive High-Contrast Microphone Button */}
            <MicButton
              status={status}
              onClick={toggleListening}
              hasStarted={hasStarted}
            />

            {/* Quick Touch/Voice Response Chips */}
            <QuickChips
              onSelect={sendManualAnswer}
              disabled={status === 'processing'}
              currentStep={currentStep}
            />

            {/* Spoken Dialogue & Transcript Card */}
            <TranscriptView
              transcript={transcript}
              lastSolResponse={lastSolResponse}
              onRepeat={repeatLastResponse}
              errorMessage={errorMessage}
            />

            {/* Animated 3-Step Walkthrough Guide */}
            {!hasStarted && <AnimatedWalkthrough hasStarted={hasStarted} />}
          </>
        )}
      </main>

      {/* Accessible 3-Step Voice Guidance Footer */}
      <HelpBanner />
    </div>
  );
}
