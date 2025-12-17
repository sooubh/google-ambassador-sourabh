import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Mic, MicOff, Sparkles, Volume2, VolumeX, Radio } from 'lucide-react';
import { GeminiService } from '../../services/GeminiService';
import { GeminiLiveService, LiveCallbacks } from '../../services/GeminiLiveService';
import { ChatMessage } from '../../types';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { VoiceVisualizer } from './VoiceVisualizer';

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false); 
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const liveServiceRef = useRef<GeminiLiveService | null>(null);

  // Standard Hooks
  const { isListening, transcript, startListening, stopListening, resetTranscript } = useVoiceInput();
  const { speak, stop: stopSpeaking, isSpeaking: isTtsSpeaking, supported: ttsSupported } = useTextToSpeech();

  // Initialize Live Service
  useEffect(() => {
    liveServiceRef.current = new GeminiLiveService();
    return () => {
        liveServiceRef.current?.stopSession();
    };
  }, []);

  const connectLive = async () => {
      try {
        const callbacks: LiveCallbacks = {
            onOpen: () => {
                console.log("Live Session Open");
                setIsLiveConnected(true);
            },
            onMessage: (message) => {
                // Handle text capabilities? The model mainly streams audio.
                // We could visualize audio levels here if the message has serverContent.modelTurn
                if (message.serverContent?.modelTurn?.parts) {
                    for (const part of message.serverContent.modelTurn.parts) {
                        if (part.inlineData && part.inlineData.mimeType.startsWith('audio/pcm')) {
                            liveServiceRef.current?.playAudio(part.inlineData.data);
                        }
                    }
                }
            },
            onError: (e) => {
                console.error("Live Session Error", e);
                setIsLiveConnected(false);
                setIsLiveMode(false);
            },
            onClose: () => {
                console.log("Live Session Closed");
                setIsLiveConnected(false);
                setIsLiveMode(false); 
            }
        };
        
        await liveServiceRef.current?.startSession(
            "You are Gem, a helpful AI assistant for the Google Student Ambassador website.", 
            callbacks
        );
      } catch (e) {
          console.error("Failed to connect live", e);
      }
  };

  const disconnectLive = () => {
      liveServiceRef.current?.stopSession();
      setIsLiveConnected(false);
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle voice transcript (Standard Mode)
  useEffect(() => {
    if (transcript && !isLiveMode) {
      setInputValue(transcript);
    }
  }, [transcript, isLiveMode]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg = inputValue.trim();
    console.log("ChatBot: Sending user message:", userMsg);
    setInputValue('');
    resetTranscript();
    
    // Stop listening if sending
    if (isListening) stopListening();

    // Add user message
    const newMessages = [...messages, { role: 'user', text: userMsg } as ChatMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const stream = await GeminiService.streamResponse(messages, userMsg);
      
      let fullResponse = '';
      setMessages(prev => [...prev, { role: 'assistant', text: '' }]);

      for await (const chunk of stream) {
        console.log("ChatBot: Chunk received", chunk);
        // Handle Text
        try {
          let chunkText = '';

          // 1. Try candidates array (Most reliable for @google/genai)
          if ((chunk as any).candidates?.[0]?.content?.parts?.[0]?.text) {
             chunkText = (chunk as any).candidates[0].content.parts[0].text;
          } 
          // 2. Try chunk.text() if it's a function
          else if (typeof (chunk as any).text === 'function') {
            chunkText = (chunk as any).text();
          }
          // 3. Try chunk.text if it's a string property
          else if (typeof (chunk as any).text === 'string') {
             chunkText = (chunk as any).text;
          }

          if (chunkText) {
            fullResponse += chunkText;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              const updated = [...prev];
              updated[updated.length - 1] = { ...last, text: fullResponse };
              return updated;
            });
          }
        } catch (e) {
          console.error("ChatBot: Error parsing chunk text", e);
        }

        // Handle Function Calls (Navigation)
        let functionCalls: any[] = [];
        try {
           // 1. Try candidates array
           if ((chunk as any).candidates?.[0]?.content?.parts) {
             const parts = (chunk as any).candidates[0].content.parts;
             for(const part of parts) {
               if (part.functionCall) {
                 functionCalls.push(part.functionCall);
               }
             }
           }
           // 2. Try standard SDK method
           else if (typeof (chunk as any).functionCalls === 'function') {
             // @ts-ignore
             const calls = chunk.functionCalls();
             if (calls) functionCalls = calls;
           }
        } catch (e) {
            console.error("ChatBot: Error parsing function calls", e);
        }

        if (functionCalls && functionCalls.length > 0) {
          console.log("ChatBot: Received function calls", functionCalls);
          for (const call of functionCalls) {
            if (call.name === 'scrollToSection' && call.args) {
              const sectionId = call.args.sectionId;
              const element = document.getElementById(sectionId);
              if (element) {
                console.log(`ChatBot: Executing searchToSection for id: ${sectionId}`);
                element.scrollIntoView({ behavior: 'smooth' });
                element.classList.add('ring', 'ring-google-blue', 'ring-offset-4');
                setTimeout(() => element.classList.remove('ring', 'ring-google-blue', 'ring-offset-4'), 2000);
              } else {
                  console.warn(`ChatBot: SectionID ${sectionId} not found in DOM.`);
              }
            }
          }
        }
      }
      console.log("ChatBot: AI Response:", fullResponse);

      // Voice Output if enabled (Standard Mode)
      if (isVoiceEnabled && fullResponse && !isLiveMode) {
        console.log("ChatBot: Speaking response (Standard Mode)");
        speak(fullResponse);
      }

    } catch (error) {
      console.error("ChatBot: Error sending message:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoiceMode = () => {
    if (isVoiceEnabled) {
      console.log("ChatBot: Disabling Standard Voice Mode");
      setIsVoiceEnabled(false);
      stopListening();
      stopSpeaking();
    } else {
      console.log("ChatBot: Enabling Standard Voice Mode");
      setIsVoiceEnabled(true);
      setIsLiveMode(false); // Ensure Live mode is off if just TTS
      if (isLiveConnected) disconnectLive();
    }
  };

  const toggleLiveMode = () => {
    if (isLiveMode) {
      console.log("ChatBot: Disabling Live Mode");
      setIsLiveMode(false);
      disconnectLive();
    } else {
      console.log("ChatBot: Enabling Live Mode");
      setIsLiveMode(true);
      setIsVoiceEnabled(false); // Disable standard voice
      stopListening();
      stopSpeaking();
      connectLive();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      stopSpeaking(); 
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setIsOpen(true)}
              className="bg-gradient-to-r from-google-blue to-purple-600 p-4 rounded-full shadow-lg text-white hover:shadow-xl transition-shadow"
            >
              <MessageCircle size={28} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-48px)] h-[600px] max-h-[80vh] bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="text-yellow-400" size={20} />
                <h3 className="font-bold text-white">Gemini {isLiveMode ? 'Live' : 'Assistant'}</h3>
              </div>
              <div className="flex items-center gap-2">
                 {/* Live Mode Toggle */}
                 <button 
                    onClick={toggleLiveMode}
                    className={`p-2 rounded-full transition-colors ${
                        isLiveMode 
                        ? 'bg-red-500/20 text-red-500 animate-pulse' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title="Toggle Gemini Live (Native Audio)"
                  >
                    <Radio size={18} />
                  </button>

                {/* Standard TTS Toggle (Only if not in Live Mode) */}
                {!isLiveMode && ttsSupported && (
                  <button 
                    onClick={toggleVoiceMode}
                    className={`p-2 rounded-full transition-colors ${isVoiceEnabled ? 'bg-white/20 text-green-400' : 'text-gray-400 hover:text-white'}`}
                    title="Toggle Text-to-Speech"
                  >
                    {isVoiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </button>
                )}
                
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area (Standard) OR Live Visualizer (Live API) */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex flex-col ${isLiveMode ? 'justify-center items-center' : ''}`}>
              
              {isLiveMode ? (
                  <div className="text-center space-y-6">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-google-blue to-purple-600 flex items-center justify-center relative">
                          <div className={`absolute inset-0 rounded-full bg-google-blue blur-xl opacity-50 ${isLiveConnected ? 'animate-pulse' : ''}`}></div>
                          <Sparkles size={48} className="text-white relative z-10" />
                      </div>
                      <div>
                          <h4 className="text-xl font-bold text-white mb-2">Gemini Live</h4>
                          <p className="text-gray-400 text-sm max-w-[200px] mx-auto">
                              {isLiveConnected 
                                ? "Listening & Speaking naturally..." 
                                : "Connecting to Google Native Audio..."}
                          </p>
                      </div>
                      <VoiceVisualizer isActive={true} mode={isLiveConnected ? 'speaking' : 'idle'} />
                  </div>
              ) : (
                  <>
                    {messages.length === 0 && (
                        <div className="text-center text-gray-400 mt-10">
                        <div className="inline-block p-4 rounded-full bg-white/5 mb-4">
                            <Sparkles size={32} className="text-google-blue" />
                        </div>
                        <p className="text-sm">Hi! I'm Gem. Ask me anything about the Ambassador Program, features, or say "Take me to the offer".</p>
                        </div>
                    )}
                    
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                            msg.role === 'user' 
                            ? 'bg-google-blue text-white rounded-tr-sm' 
                            : 'bg-white/10 text-gray-200 rounded-tl-sm'
                        }`}>
                            {msg.text}
                        </div>
                        </div>
                    ))}
                    
                    {isLoading && (
                        <div className="flex justify-start">
                        <div className="bg-white/10 px-4 py-2 rounded-full rounded-tl-sm flex gap-1 items-center">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
              )}
            </div>

            {/* Input Area (Only for Standard Mode) */}
            {!isLiveMode && (
                <div className="p-4 bg-white/5 border-t border-white/10 relative">
                {isVoiceEnabled && (
                    <div className="absolute top-0 left-0 w-full -translate-y-full bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent p-2 flex justify-center pointer-events-none">
                        <VoiceVisualizer 
                        isActive={isListening || isTtsSpeaking} 
                        mode={isListening ? 'listening' : isTtsSpeaking ? 'speaking' : 'idle'} 
                        />
                    </div>
                )}
                
                <div className="flex items-center gap-2 bg-black/40 rounded-full p-1 pl-4 border border-white/10 focus-within:border-google-blue/50 transition-colors">
                    <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? "Listening..." : "Ask me anything..."}
                    className="bg-transparent flex-1 text-white text-sm focus:outline-none placeholder:text-gray-500"
                    disabled={isLoading}
                    />
                    
                    <button
                    onClick={toggleListening}
                    className={`p-2 rounded-full transition-all ${
                        isListening 
                        ? 'bg-red-500/20 text-red-500 animate-pulse' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                    >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>

                    <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    className="p-2 bg-google-blue rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                    >
                    <Send size={18} />
                    </button>
                </div>
                </div>
            )}
            
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
