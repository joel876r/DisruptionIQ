import { useState, useEffect, useRef, useCallback } from 'react';
import { audioCue } from '../utils/audioCue';

const INITIAL_TAMIL_GREETING = 'வணக்கம், நான் சொல். நான் உங்களுக்கு எப்படி உதவ முடியும்?';

/**
 * Enhanced React Hook for Sol Voice Interaction
 * Integrates Web Speech API with backend contextual state tracking,
 * eligibility criteria verification, and full solution delivery.
 */
export function useSpeech() {
  const [status, setStatus] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'speaking' | 'error'
  const [transcript, setTranscript] = useState('');
  const [lastSolResponse, setLastSolResponse] = useState('');
  const [history, setHistory] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Contextual Scheme State from Backend
  const [currentStep, setCurrentStep] = useState('welcome');
  const [passedCriteria, setPassedCriteria] = useState([]);
  const [isEligible, setIsEligible] = useState(null);
  const [solution, setSolution] = useState(null);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const currentUtteranceRef = useRef(null);
  const isComponentMounted = useRef(true);

  // Initialize SpeechSynthesis and SpeechRecognition
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
            setErrorMessage('குரல் கேட்கவில்லை. மீண்டும் பொத்தானை அழுத்தி பேசவும்.');
          } else if (event.error === 'not-allowed') {
            setErrorMessage('மைக்ரோஃபோன் அனுமதியை இயக்கவும் (Allow Microphone).');
          } else {
            setErrorMessage('மன்னிக்கவும், மீண்டும் முயற்சிக்கவும்.');
          }
          setStatus('idle');
        };

        recognition.onend = () => {
          setStatus((prev) => (prev === 'listening' ? 'idle' : prev));
        };

        recognitionRef.current = recognition;
      } else {
        setErrorMessage('உங்கள் உலாவியில் குரல் வசதி (Speech Recognition) ஆதரிக்கப்படவில்லை.');
      }
    }

    return () => {
      isComponentMounted.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore
        }
      }
      if (synthRef.current) {
        try {
          synthRef.current.cancel();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []);

  /**
   * Speak text in Tamil using native browser SpeechSynthesis.
   */
  const speakTamil = useCallback((textToSpeak, onFinished) => {
    if (!synthRef.current) {
      if (onFinished) onFinished();
      return;
    }

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'ta-IN';
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    const voices = synthRef.current.getVoices();
    const tamilVoice = voices.find(
      (v) => v.lang.toLowerCase().includes('ta-in') || v.lang.toLowerCase().includes('ta')
    );
    if (tamilVoice) {
      utterance.voice = tamilVoice;
    }

    utterance.onstart = () => {
      setStatus('speaking');
      audioCue.playSuccess();
    };

    utterance.onend = () => {
      setStatus('idle');
      if (onFinished) onFinished();
    };

    utterance.onerror = (event) => {
      console.warn('SpeechSynthesis error:', event);
      setStatus('idle');
      if (onFinished) onFinished();
    };

    currentUtteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, []);

  /**
   * Send recognized or selected text to the backend reasoning engine.
   */
  const sendTranscriptToSol = async (userText) => {
    if (!userText || !userText.trim()) {
      setStatus('idle');
      return;
    }

    setStatus('processing');
    setErrorMessage('');
    setTranscript(userText);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText,
          history: history,
          current_step: currentStep,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || 'சரிங்க, அடுத்த விவரத்தை சொல்லுங்கள்.';

      // Update state with backend contextual tracking
      setLastSolResponse(reply);
      setCurrentStep(data.current_step || 'age');
      if (data.passed_criteria) {
        setPassedCriteria(data.passed_criteria);
      }
      if (data.is_eligible !== undefined && data.is_eligible !== null) {
        setIsEligible(data.is_eligible);
      }
      if (data.solution) {
        setSolution(data.solution);
      }

      setHistory((prev) => [
        ...prev,
        { role: 'user', content: userText },
        { role: 'model', content: reply },
      ]);

      // Speak response out loud
      speakTamil(reply);
    } catch (err) {
      console.error('Failed to communicate with Sol backend:', err);
      const fallbackReply = 'இணைப்பில் தாமதம் ஏற்பட்டுள்ளது. மீண்டும் சொல்லுங்கள்.';
      setLastSolResponse(fallbackReply);
      speakTamil(fallbackReply);
    }
  };

  /**
   * Main interaction trigger: toggles listening or starts welcome flow.
   */
  const toggleListening = () => {
    setErrorMessage('');

    if (status === 'speaking') {
      if (synthRef.current) synthRef.current.cancel();
      setStatus('idle');
      return;
    }

    if (!hasStarted) {
      setHasStarted(true);
      setLastSolResponse(INITIAL_TAMIL_GREETING);
      setCurrentStep('age');
      speakTamil(INITIAL_TAMIL_GREETING, () => {
        // Automatically start listening after welcome greeting
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
      setErrorMessage('குரல் ஏற்பி (Microphone) உங்கள் உலாவியில் கிடைக்கவில்லை.');
      return;
    }
    try {
      if (synthRef.current) synthRef.current.cancel();
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

  /**
   * Quick chip manual answer trigger.
   */
  const sendManualAnswer = (answerText) => {
    if (status === 'speaking' && synthRef.current) {
      synthRef.current.cancel();
    }
    sendTranscriptToSol(answerText);
  };

  /**
   * Repeat the last response spoken by Sol.
   */
  const repeatLastResponse = () => {
    if (lastSolResponse) {
      speakTamil(lastSolResponse);
    }
  };

  /**
   * Reset conversation back to clean start.
   */
  const resetConversation = () => {
    if (synthRef.current) synthRef.current.cancel();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // Ignore
      }
    }
    setStatus('idle');
    setTranscript('');
    setLastSolResponse('');
    setHistory([]);
    setPassedCriteria([]);
    setIsEligible(null);
    setSolution(null);
    setCurrentStep('welcome');
    setHasStarted(false);
    setErrorMessage('');
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
    toggleListening,
    sendManualAnswer,
    repeatLastResponse,
    resetConversation,
  };
}
