import { useState, useEffect, useCallback, useRef } from 'react';

interface UseVoiceInputReturn {
    isListening: boolean;
    transcript: string;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
    error: string | null;
}

export const useVoiceInput = (): UseVoiceInputReturn => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // @ts-ignore - webkitSpeechRecognition is not in standard types
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false; // Stop after one sentence/phrase
                recognitionRef.current.interimResults = true; // Show results as they are spoken
                recognitionRef.current.lang = 'en-US';

                recognitionRef.current.onstart = () => {
                    console.log("useVoiceInput: Speech recognition started.");
                    setIsListening(true);
                    setError(null);
                };

                recognitionRef.current.onend = () => {
                    console.log("useVoiceInput: Speech recognition ended.");
                    setIsListening(false);
                };

                recognitionRef.current.onresult = (event: any) => {
                    let currentTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        currentTranscript += event.results[i][0].transcript;
                    }
                    console.log("useVoiceInput: Transcript received:", currentTranscript);
                    setTranscript(currentTranscript);
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.error("useVoiceInput: Speech recognition error", event.error);
                    setError(event.error);
                    setIsListening(false);
                };
            } else {
                console.warn("useVoiceInput: Browser does not support SpeechRecognition.");
                setError('Speech recognition not supported in this browser.');
            }
        }
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                console.log("useVoiceInput: requested startListening.");
                setTranscript('');
                recognitionRef.current.start();
            } catch (e) {
                console.error("Error starting speech recognition:", e);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
        error,
    };
};
