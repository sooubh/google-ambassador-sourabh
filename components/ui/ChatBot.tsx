import React, { useState, useEffect, useRef, useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Mic, MicOff, Sparkles, Volume2, VolumeX, Radio, RotateCcw } from 'lucide-react';
import { GeminiService } from '../../services/GeminiService';
import { GeminiLiveService, LiveCallbacks } from '../../services/GeminiLiveService';
import { ChatMessage } from '../../types';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { VoiceVisualizer } from './VoiceVisualizer';

// Reducer for complex state management
type ChatState = {
  isOpen: boolean;
  messages: ChatMessage[];
  inputValue: string;
  isLoading: boolean;
  isVoiceEnabled: boolean;
  isLiveMode: boolean;
  isLiveConnected: boolean;
  error: string | null;
};

type ChatAction = 
  | { type: 'TOGGLE_OPEN' }
  | { type: 'SET_INPUT', payload: string }
  | { type: 'ADD_MESSAGE', payload: ChatMessage }
  | { type: 'UPDATE_LAST_MESSAGE', payload: string }
  | { type: 'SET_LOADING', payload: boolean }
  | { type: 'SET_ERROR', payload: string | null }
  | { type: 'TOGGLE_VOICE' }
  | { type: 'TOGGLE_LIVE', payload?: boolean }
  | { type: 'SET_LIVE_CONNECTED', payload: boolean }
  | { type: 'CLEAR_MESSAGES' };

const initialState: ChatState = {
  isOpen: false,
  messages: [],
  inputValue: '',
  isLoading: false,
  isVoiceEnabled: false,
  isLiveMode: false,
  isLiveConnected: false,
  error: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'TOGGLE_OPEN':
      return { ...state, isOpen: !state.isOpen, error: null };
    case 'SET_INPUT':
      return { ...state, inputValue: action.payload, error: null };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload], error: null };
    case 'UPDATE_LAST_MESSAGE':
      const newMessages = [...state.messages];
      if (newMessages.length > 0) {
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg.role === 'assistant' || lastMsg.role === 'model') {
              newMessages[newMessages.length - 1] = { ...lastMsg, text: action.payload };
          }
      }
      return { ...state, messages: newMessages };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'TOGGLE_VOICE':
      return { ...state, isVoiceEnabled: !state.isVoiceEnabled, isLiveMode: false, isLiveConnected: false, error: null };
    case 'TOGGLE_LIVE':
      const newLiveMode = action.payload !== undefined ? action.payload : !state.isLiveMode;
      return { 
        ...state, 
        isLiveMode: newLiveMode, 
        isVoiceEnabled: false, // Mutual exclusion
        isLiveConnected: false,
        error: null 
      };
    case 'SET_LIVE_CONNECTED':
      return { ...state, isLiveConnected: action.payload };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [], error: null };
    default:
      return state;
  }
}

export const ChatBot: React.FC = () => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
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

  // Connect/Disconnect Live Service based on mode
  useEffect(() => {
    if (state.isLiveMode && !state.isLiveConnected && state.isOpen) {
        connectLive();
    } else if ((!state.isLiveMode || !state.isOpen) && state.isLiveConnected) {
        disconnectLive();
    }
  }, [state.isLiveMode, state.isOpen]);

  const connectLive = async () => {
      try {
        const callbacks: LiveCallbacks = {
            onOpen: () => {
                dispatch({ type: 'SET_LIVE_CONNECTED', payload: true });
            },
            onMessage: (message) => {
                // Handle Native Audio
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
                dispatch({ type: 'SET_ERROR', payload: "Connection to Gemini Live lost. Retrying..." });
                dispatch({ type: 'SET_LIVE_CONNECTED', payload: false });
            },
            onClose: () => {
                dispatch({ type: 'SET_LIVE_CONNECTED', payload: false });
            }
        };
        
        await liveServiceRef.current?.startSession(
            "You are Gem, a helpful AI assistant.", 
            callbacks
        );
      } catch (e) {
          console.error("Failed to connect live", e);
          dispatch({ type: 'SET_ERROR', payload: "Failed to connect to Live Service." });
          dispatch({ type: 'TOGGLE_LIVE', payload: false });
      }
  };

  const disconnectLive = () => {
      liveServiceRef.current?.stopSession();
      dispatch({ type: 'SET_LIVE_CONNECTED', payload: false });
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, state.isLoading, state.error]);

  // Handle voice transcript (Standard Mode)
  useEffect(() => {
    if (transcript && !state.isLiveMode && state.isOpen) {
      dispatch({ type: 'SET_INPUT', payload: transcript });
    }
  }, [transcript, state.isLiveMode, state.isOpen]);

  // Send Message Logic
  const handleSend = async () => {
    if (!state.inputValue.trim() || state.isLoading) return;

    const userMsg = state.inputValue.trim();
    dispatch({ type: 'SET_INPUT', payload: '' });
    resetTranscript();
    if (isListening) stopListening();

    dispatch({ type: 'ADD_MESSAGE', payload: { role: 'user', text: userMsg } });
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const stream = await GeminiService.streamResponse(state.messages, userMsg);
      
      let fullResponse = '';
      dispatch({ type: 'ADD_MESSAGE', payload: { role: 'assistant', text: '' } });

      for await (const chunk of stream) {
        // Robust Chunk Parsing
        let chunkText = '';
        const candidate = (chunk as any).candidates?.[0];
        
        if (candidate?.content?.parts?.[0]?.text) {
             chunkText = candidate.content.parts[0].text;
        }

        if (chunkText) {
            fullResponse += chunkText;
            dispatch({ type: 'UPDATE_LAST_MESSAGE', payload: fullResponse });
        }

        // Function Calls
        // (Simplified for robustness, can re-add if needed but checking for nulls)
        const parts = candidate?.content?.parts;
        if (parts) {
            for(const part of parts) {
                if (part.functionCall && part.functionCall.name === 'scrollToSection') {
                    const sectionId = part.functionCall.args?.sectionId;
                    if (sectionId) {
                        const el = document.getElementById(sectionId);
                        if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            console.log(`🚀 Navigating to section: ${sectionId}`);
                        }
                    }
                }
            }
        }
      }

      // TTS if enabled
      if (state.isVoiceEnabled && fullResponse) {
        speak(fullResponse);
      }

    } catch (error) {
      console.error("ChatBot Error:", error);
      dispatch({ type: 'SET_ERROR', payload: "Failed to get response. Please try again." });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // UI Handlers
  const toggleListeningHandler = () => {
      if (isListening) {
          stopListening();
      } else {
          stopSpeaking(); // Stop TTS before listening
          startListening();
      }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!state.isOpen && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => dispatch({ type: 'TOGGLE_OPEN' })}
              className="bg-gradient-to-r from-google-blue to-purple-600 p-4 rounded-full shadow-lg text-white hover:shadow-xl transition-shadow"
            >
              <MessageCircle size={28} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {state.isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-48px)] h-[600px] max-h-[80vh] bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="text-yellow-400" size={20} />
                <h3 className="font-bold text-white">Gemini {state.isLiveMode ? 'Live' : 'Assistant'}</h3>
              </div>
              <div className="flex items-center gap-2">
                 <button 
                    onClick={() => dispatch({ type: 'TOGGLE_LIVE' })}
                    className={`p-2 rounded-full transition-colors ${state.isLiveMode ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-gray-400 hover:text-white'}`}
                    title="Toggle Gemini Live"
                  >
                    <Radio size={18} />
                  </button>

                {!state.isLiveMode && ttsSupported && (
                  <button 
                    onClick={() => dispatch({ type: 'TOGGLE_VOICE' })}
                    className={`p-2 rounded-full transition-colors ${state.isVoiceEnabled ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-white'}`}
                    title="Toggle Text-to-Speech"
                  >
                    {state.isVoiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </button>
                )}
                
                <button 
                  onClick={() => dispatch({ type: 'TOGGLE_OPEN' })}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {state.error && (
                <div className="bg-red-500/20 border-l-4 border-red-500 p-2 text-red-200 text-xs text-center shrink-0">
                    {state.error}
                </div>
            )}

            {/* Content Area */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex flex-col ${state.isLiveMode ? 'justify-center items-center' : ''}`}>
              
              {state.isLiveMode ? (
                  <div className="text-center space-y-6">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-google-blue to-purple-600 flex items-center justify-center relative">
                          <div className={`absolute inset-0 rounded-full bg-google-blue blur-xl opacity-50 ${state.isLiveConnected ? 'animate-pulse' : ''}`}></div>
                          <Sparkles size={48} className="text-white relative z-10" />
                      </div>
                      <div>
                          <h4 className="text-xl font-bold text-white mb-2">Gemini Live</h4>
                          <p className="text-gray-400 text-sm max-w-[200px] mx-auto">
                              {state.isLiveConnected ? "Listening..." : "Connecting..."}
                          </p>
                      </div>
                      <VoiceVisualizer isActive={true} mode={state.isLiveConnected ? 'speaking' : 'idle'} />
                  </div>
              ) : (
                  <>
                    {state.messages.length === 0 && (
                        <div className="text-center text-gray-400 mt-10">
                        <div className="inline-block p-4 rounded-full bg-white/5 mb-4">
                            <Sparkles size={32} className="text-google-blue" />
                        </div>
                        <p className="text-sm">Hi! I'm Gem. Ask me anything!</p>
                        </div>
                    )}
                    
                    {state.messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm break-words ${
                            msg.role === 'user' 
                            ? 'bg-google-blue text-white rounded-tr-sm' 
                            : 'bg-white/10 text-gray-200 rounded-tl-sm'
                        }`}>
                            {msg.text}
                        </div>
                        </div>
                    ))}
                    
                    {state.isLoading && (
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

            {/* Input Area */}
            {!state.isLiveMode && (
                <div className="p-4 bg-white/5 border-t border-white/10 relative shrink-0">
                {state.isVoiceEnabled && (
                    <div className="absolute top-0 left-0 w-full -translate-y-full bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent p-2 flex justify-center pointer-events-none">
                        <VoiceVisualizer 
                          isActive={isListening || isTtsSpeaking} 
                          mode={isListening ? 'listening' : isTtsSpeaking ? 'speaking' : 'idle'} 
                        />
                    </div>
                )}
                
                {/* Transcript Preview if listening */}
                {isListening && (
                    <div className="text-xs text-google-blue mb-2 ml-2 animate-pulse truncate">
                         Listening: {transcript || "..."}
                    </div>
                )}

                <div className="flex items-center gap-2 bg-black/40 rounded-full p-1 pl-4 border border-white/10 focus-within:border-google-blue/50 transition-colors">
                    <input
                      type="text"
                      value={state.inputValue}
                      onChange={(e) => dispatch({ type: 'SET_INPUT', payload: e.target.value })}
                      onKeyDown={handleKeyDown}
                      placeholder={isListening ? "Listening..." : "Ask me anything..."}
                      className="bg-transparent flex-1 text-white text-sm focus:outline-none placeholder:text-gray-500 min-w-0"
                      disabled={state.isLoading}
                    />
                    
                    <button
                      onClick={toggleListeningHandler}
                      className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-gray-400 hover:text-white'}`}
                      title="Toggle Microphone"
                    >
                      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>

                    <button
                      onClick={handleSend}
                      disabled={!state.inputValue.trim() || state.isLoading}
                      className="p-2 bg-google-blue rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                      title="Send Message"
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
