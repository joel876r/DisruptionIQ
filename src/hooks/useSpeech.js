import { useState, useEffect, useRef, useCallback } from 'react';
import { audioCue } from '../utils/audioCue';

const FIRST_INTERVIEW_PROMPT = 'வணக்கம் அம்மா! நான் சொல். கலைஞர் மகளிர் உரிமைத் திட்டத்திற்கு விண்ணப்பிக்க, உங்கள் முழு பெயர் என்னவென்று சொல்லுங்கள் அம்மா?';

/**
 * Enhanced Web Speech API coordinator for real government scheme application interview.
 * Supports dual input: voice speech recognition AND text messaging input.
 */
export function useSpeech() {
  const [status, setStatus] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'speaking' | 'error'
  const [transcript, setTranscript] = useState('');
  const [lastSolResponse, setLastSolResponse] = useState(FIRST_INTERVIEW_PROMPT);
  const [history, setHistory] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Scheme Application Data
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

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
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
            setErrorMessage('குரல் கேட்கவில்லை. மீண்டும் பொத்தானை அழுத்தி பேசவும் அல்லது கீழே தட்டச்சு செய்யவும்.');
          } else if (event.error === 'not-allowed') {
            setErrorMessage('மைக்ரோஃபோன் அனுமதியை இயக்கவும் (Allow Microphone).');
          } else {
            setErrorMessage('மன்னிக்கவும், உங்கள் பதிலை மீண்டும் சொல்லுங்கள்.');
          }
          setStatus('idle');
        };

        recognition.onend = () => {
          setStatus((prev) => (prev === 'listening' ? 'idle' : prev));
        };

        recognitionRef.current = recognition;
      } else {
        setErrorMessage('உங்கள் உலாவியில் குரல் வசதி இல்லை. கீழே உள்ள தட்டச்சு பெட்டியைப் பயன்படுத்தலாம்.');
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
   * Speak out loud in Tamil using browser SpeechSynthesis.
   */
  const speakTamil = useCallback((textToSpeak, onFinished) => {
    if (!synthRef.current || typeof window === 'undefined') {
      if (onFinished) onFinished();
      return;
    }

    try {
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'ta-IN';
      utterance.rate = 0.95;
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

      synthRef.current.speak(utterance);
    } catch (err) {
      console.warn('speakTamil error:', err);
      setStatus('idle');
      if (onFinished) onFinished();
    }
  }, []);

  /**
   * Send speech transcript or typed message to backend government interviewer.
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
          application_data: applicationData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || 'சரிங்க அம்மா, அடுத்த விவரத்தை சொல்லுங்கள்.';

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
      if (data.application) {
        setApplicationData(data.application);
      }

      setHistory((prev) => [
        ...prev,
        { role: 'user', content: userText },
        { role: 'model', content: reply },
      ]);

      // Speak response out loud and then listen for next answer
      speakTamil(reply, () => {
        if (data.current_step !== 'submitted') {
          // Automatically start listening for the next field
          setTimeout(() => startListening(), 300);
        }
      });
    } catch (err) {
      console.error('Failed to communicate with Sol backend:', err);
      const fallbackReply = 'இணைப்பில் தாமதம் ஏற்பட்டுள்ளது. மீண்டும் சொல்லுங்கள் அம்மா.';
      setLastSolResponse(fallbackReply);
      speakTamil(fallbackReply);
    }
  };

  /**
   * Main interaction trigger: starts interview or toggles listening.
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
      speakTamil(FIRST_INTERVIEW_PROMPT, () => {
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

  const sendManualAnswer = (answerText) => {
    if (status === 'speaking' && synthRef.current) {
      synthRef.current.cancel();
    }
    setHasStarted(true);
    sendTranscriptToSol(answerText);
  };

  const repeatLastResponse = () => {
    if (lastSolResponse) {
      speakTamil(lastSolResponse);
    }
  };

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
    setLastSolResponse(FIRST_INTERVIEW_PROMPT);
    setHistory([]);
    setPassedCriteria([]);
    setIsEligible(null);
    setSolution(null);
    setCurrentStep('name');
    setHasStarted(false);
    setErrorMessage('');
    setApplicationData({
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
