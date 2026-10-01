import { useState, useEffect, useRef, useCallback } from 'react';
import { audioCue } from '../utils/audioCue';

const FIRST_INTERVIEW_PROMPT = 'வணக்கம் அம்மா! நான் சொல். கலைஞர் மகளிர் உரிமைத் திட்டத்திற்கு விண்ணப்பிக்க, உங்கள் முழு பெயர் என்னவென்று சொல்லுங்கள் அம்மா?';

/**
 * Enhanced Web Speech & Google Neural Tamil TTS coordinator for Sol.
 * Uses React refs to completely eliminate stale closures, ensuring 100% reliable
 * step-by-step interview progression.
 */
export function useSpeech() {
  const [status, setStatus] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'speaking' | 'error'
  const [transcript, setTranscript] = useState('');
  const [lastSolResponse, setLastSolResponse] = useState(FIRST_INTERVIEW_PROMPT);
  const [history, setHistory] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Scheme Application Data & Step
  const [currentStep, setCurrentStep] = useState('name');
  const [passedCriteria, setPassedCriteria] = useState([]);
  const [isEligible, setIsEligible] = useState(null);
  const [solution, setSolution] = useState(null);
  const [applicationData, setApplicationData] = useState({
    applicant_name: null,
    age: null,
    ration_card_type: 'PHH - வறுமைக் கோட்டிற்கு கீழ்',
    ration_card_number: null,
    is_female_head: true,
    annual_income: '₹2.5 லட்சத்திற்குள்',
    occupation: 'விவசாயம் / கூலி வேலை',
    electricity_units: '3600 யூனிட்டுக்குள்',
    land_extent: '5 ஏக்கருக்குள்',
    bank_name: null,
    application_id: `KMUT-TN-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    submission_status: 'gathering',
    applied_date: new Date().toLocaleDateString('en-GB'),
  });

  // State Refs to prevent React stale closure bugs inside event listeners
  const currentStepRef = useRef('name');
  const applicationDataRef = useRef(applicationData);
  const historyRef = useRef([]);

  // Keep refs in sync with state
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    applicationDataRef.current = applicationData;
  }, [applicationData]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const activeAudioRef = useRef(null);
  const isComponentMounted = useRef(true);

  // Stop any currently playing audio
  const stopAllAudio = useCallback(() => {
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      } catch (e) {
        // Ignore
      }
      activeAudioRef.current = null;
    }
    if (synthRef.current) {
      try {
        synthRef.current.cancel();
      } catch (e) {
        // Ignore
      }
    }
  }, []);

  /**
   * Speak out loud using Google Neural Tamil Audio Stream.
   */
  const playTamilAudio = useCallback((textToSpeak, audioUrl, onFinished) => {
    stopAllAudio();
    setStatus('speaking');

    const streamUrl = audioUrl || `/api/tts?text=${encodeURIComponent(textToSpeak)}`;
    const audio = new Audio(streamUrl);
    activeAudioRef.current = audio;

    let hasHandledEnd = false;
    const triggerFinished = () => {
      if (hasHandledEnd) return;
      hasHandledEnd = true;
      setStatus('idle');
      activeAudioRef.current = null;
      if (onFinished) onFinished();
    };

    audio.onplay = () => {
      setStatus('speaking');
      audioCue.playSuccess();
    };

    audio.onended = triggerFinished;

    audio.onerror = () => {
      console.warn('Google TTS stream error, falling back to Web Speech API');
      if (synthRef.current) {
        try {
          synthRef.current.cancel();
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.lang = 'ta-IN';
          utterance.rate = 0.95;
          utterance.pitch = 1.0;

          const voices = synthRef.current.getVoices();
          const tamilVoice = voices.find(
            (v) => v.lang.toLowerCase().includes('ta') || v.name.toLowerCase().includes('tamil')
          );
          if (tamilVoice) {
            utterance.voice = tamilVoice;
          }

          utterance.onend = triggerFinished;
          utterance.onerror = triggerFinished;

          synthRef.current.speak(utterance);
        } catch (e) {
          triggerFinished();
        }
      } else {
        triggerFinished();
      }
    };

    audio.play().catch((err) => {
      console.warn('Audio play autoplay restricted:', err);
      // Fallback to Web Speech API or mark finished
      if (synthRef.current) {
        try {
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.lang = 'ta-IN';
          utterance.onend = triggerFinished;
          utterance.onerror = triggerFinished;
          synthRef.current.speak(utterance);
        } catch (e) {
          triggerFinished();
        }
      } else {
        triggerFinished();
      }
    });
  }, [stopAllAudio]);

  /**
   * Send speech transcript or typed message to backend government interviewer.
   */
  const sendTranscriptToSol = useCallback(async (userText) => {
    if (!userText || !userText.trim()) {
      setStatus('idle');
      return;
    }

    setStatus('processing');
    setErrorMessage('');
    setTranscript(userText);

    try {
      // Use REFS to ensure freshest state is transmitted
      const activeStep = currentStepRef.current;
      const activeApp = applicationDataRef.current;
      const activeHistory = historyRef.current;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText,
          history: activeHistory,
          current_step: activeStep,
          application_data: activeApp,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || 'சரிங்க அம்மா, அடுத்த விவரத்தை சொல்லுங்கள்.';
      const nextStepVal = data.current_step || 'age';

      // Update both Ref and State immediately
      currentStepRef.current = nextStepVal;
      setCurrentStep(nextStepVal);

      setLastSolResponse(reply);

      if (data.passed_criteria) {
        setPassedCriteria(data.passed_criteria);
      }
      if (data.is_eligible !== undefined && data.is_eligible !== null) {
        setIsEligible(data.is_eligible);
      }
      if (data.solution) {
        setSolution(data.solution);
      }
      if (data.application) {
        applicationDataRef.current = data.application;
        setApplicationData(data.application);
      }

      const newHistory = [
        ...activeHistory,
        { role: 'user', content: userText },
        { role: 'model', content: reply },
      ];
      historyRef.current = newHistory;
      setHistory(newHistory);

      // Play authentic Google Tamil speech audio
      playTamilAudio(reply, data.audio_url, () => {
        if (nextStepVal !== 'submitted') {
          setTimeout(() => {
            if (recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                // Ignore
              }
            }
          }, 300);
        }
      });
    } catch (err) {
      console.error('Failed to communicate with Sol backend:', err);
      const fallbackReply = 'இணைப்பில் தாமதம் ஏற்பட்டுள்ளது. மீண்டும் சொல்லுங்கள் அம்மா.';
      setLastSolResponse(fallbackReply);
      playTamilAudio(fallbackReply, null);
    }
  }, [playTamilAudio]);

  // Initialize SpeechSynthesis and SpeechRecognition with callback ref
  useEffect(() => {
    isComponentMounted.current = true;
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ta-IN';
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setStatus('listening');
          audioCue.playMicStart();
        };

        recognition.onresult = (event) => {
          if (!isComponentMounted.current) return;
          const currentTranscript = event.results[0][0].transcript;
          setTranscript(currentTranscript);
          audioCue.playMicStop();
          sendTranscriptToSol(currentTranscript);
        };

        recognition.onerror = (event) => {
          console.warn('SpeechRecognition error:', event.error);
          audioCue.playError();
          if (event.error === 'no-speech') {
            setErrorMessage('குரல் கேட்கவில்லை. கீழே உள்ள பதில்களைத் தொடலாம் அல்லது தட்டச்சு செய்யலாம்.');
          } else if (event.error === 'not-allowed') {
            setErrorMessage('மைக்ரோஃபோன் அனுமதியை இயக்கவும் (Allow Microphone).');
          } else {
            setErrorMessage('மன்னிக்கவும், உங்கள் பதிலை மீண்டும் சொல்லுங்கள் அம்மா.');
          }
          setStatus('idle');
        };

        recognition.onend = () => {
          setStatus((prev) => (prev === 'listening' ? 'idle' : prev));
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      isComponentMounted.current = false;
      stopAllAudio();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [stopAllAudio, sendTranscriptToSol]);

  /**
   * Main interaction trigger: starts interview or toggles listening.
   */
  const toggleListening = () => {
    setErrorMessage('');

    if (status === 'speaking') {
      stopAllAudio();
      setStatus('idle');
      return;
    }

    if (!hasStarted) {
      setHasStarted(true);
      playTamilAudio(FIRST_INTERVIEW_PROMPT, null, () => {
        startListening();
      });
      return;
    }

    if (status === 'listening') {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
      setStatus('idle');
      return;
    }

    startListening();
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      setErrorMessage('குரல் ஏற்பி (Microphone) உங்கள் உலாவியில் கிடைக்கவில்லை. கீழே தட்டச்சு செய்யவும்.');
      return;
    }
    try {
      stopAllAudio();
      recognitionRef.current.start();
    } catch (err) {
      console.warn('Recognition start exception:', err);
      try {
        recognitionRef.current.abort();
        setTimeout(() => recognitionRef.current.start(), 150);
      } catch (inner) {
        setStatus('idle');
      }
    }
  };

  const sendManualAnswer = (answerText) => {
    stopAllAudio();
    setHasStarted(true);
    sendTranscriptToSol(answerText);
  };

  const repeatLastResponse = () => {
    if (lastSolResponse) {
      playTamilAudio(lastSolResponse, null);
    }
  };

  const resetConversation = () => {
    stopAllAudio();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // Ignore
      }
    }
    setStatus('idle');
    setTranscript('');
    setLastSolResponse(FIRST_INTERVIEW_PROMPT);
    setHistory([]);
    setPassedCriteria([]);
    setIsEligible(null);
    setSolution(null);
    setCurrentStep('name');
    currentStepRef.current = 'name';
    setHasStarted(false);
    setErrorMessage('');
    const freshApp = {
      applicant_name: null,
      age: null,
      ration_card_type: 'PHH - வறுமைக் கோட்டிற்கு கீழ்',
      ration_card_number: null,
      is_female_head: true,
      annual_income: '₹2.5 லட்சத்திற்குள்',
      occupation: 'விவசாயம் / கூலி வேலை',
      electricity_units: '3600 யூனிட்டுக்குள்',
      land_extent: '5 ஏக்கருக்குள்',
      bank_name: null,
      application_id: `KMUT-TN-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      submission_status: 'gathering',
      applied_date: new Date().toLocaleDateString('en-GB'),
    };
    applicationDataRef.current = freshApp;
    setApplicationData(freshApp);
  };

  return {
    status,
    transcript,
    lastSolResponse,
    hasStarted,
    errorMessage,
    currentStep,
    passedCriteria,
    isEligible,
    solution,
    applicationData,
    toggleListening,
    sendManualAnswer,
    repeatLastResponse,
    resetConversation,
  };
}
