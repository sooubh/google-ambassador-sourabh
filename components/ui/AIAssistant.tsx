import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Mic, Send, X, Sparkles, ChevronDown, User, Bot, Loader2, ExternalLink, MapPin } from 'lucide-react';
import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse } from "@google/genai";

// Types for chat messages
interface Message {
  role: 'user' | 'model';
  text: string;
  groundingSources?: { title: string; uri: string }[];
}

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! I'm Gem, your guide. Ask me about the Ambassador program, features, or I can take you anywhere on the page!" }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isThinking]);

  // Handle Scroll Tool with Highlight
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Add temporary highlight
      element.classList.add('transition-all', 'duration-500', 'ring-4', 'ring-google-blue', 'rounded-xl', 'bg-white/5');
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-google-blue', 'bg-white/5');
      }, 2500);

      return `Scrolled to section: ${sectionId}`;
    }
    return `Could not find section: ${sectionId}`;
  };

  // Define Tools
  const tools = [
    {
      functionDeclarations: [
        {
          name: "scrollToSection",
          description: "Scrolls the page to a specific section and highlights it. Use this when the user wants to see, go to, or navigate to a specific part of the page.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              sectionId: {
                type: Type.STRING,
                description: "The ID of the section. Options: 'hero' (Intro), 'about' (What is Gemini), 'offer' (Student Offer), 'features' (Why Gemini/Edge), 'story' (Detailed Features), 'ambassador' (Sourabh Singh Profile), 'join' (Footer CTA).",
              },
            },
            required: ["sectionId"],
          },
        },
      ],
    },
    { googleSearch: {} } // Enable Search Grounding
  ];

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsThinking(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key not found");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `You are Gem, the official AI guide for the Google Gemini Student Ambassador Program website.
      Your goal is to be helpful, witty, and engaging.

      WEBSITE MAP & CONTEXT:
      1. **Hero Section** (id: 'hero'): Intro, "Google Gemini for Students", Partner info.
      2. **What is Gemini** (id: 'about'): Explains Gemini as an AI collaborator (not just a chatbot).
      3. **Student Offer** (id: 'offer'): 12 months free Gemini Advanced + 2TB storage.
      4. **The Gemini Edge** (id: 'features'): List of unique features (Live, Canvas, Veo, etc.).
      5. **Story Mode** (id: 'story'): Detailed breakdown of features like Video Generation and Deep Research.
      6. **Ambassador** (id: 'ambassador'): Profile of Sourabh Singh (Partner ID 12115).
      7. **Join** (id: 'join'): Footer with "Join the Program" CTA via Google Form.

      BEHAVIOR:
      - If a user asks to navigate, see, or go to a section, ALWAYS use the 'scrollToSection' tool.
      - If asked about real-world facts or recent news, use the Google Search tool.
      - Keep responses concise (2-3 sentences) unless explaining a complex topic.
      - Be enthusiastic about AI and student empowerment.
      `;

      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Use generateContentStream for real-time feedback
      let responseStream;
      try {
        console.log("Attempting with gemini-1.5-pro...");
        responseStream = await ai.models.generateContentStream({
          model: 'gemini-1.5-pro',
          contents: [...history, { role: 'user', parts: [{ text: userMsg }] }],
          config: {
            systemInstruction: systemInstruction,
            tools: tools,
          }
        });
      } catch (error) {
        console.warn("Pro model failed, switching to fallback (Flash)...", error);
        try {
           responseStream = await ai.models.generateContentStream({
            model: 'gemini-1.5-flash',
            contents: [...history, { role: 'user', parts: [{ text: userMsg }] }],
            config: {
              systemInstruction: systemInstruction,
              tools: tools,
            }
          });
        } catch (flashError) {
           console.error("All models failed", flashError);
           throw flashError; // Re-throw to be caught by the outer catch block
        }
      }

      let fullText = "";
      let functionCalls: any[] = [];
      let groundingSources: { title: string; uri: string }[] = [];
      
      // Initialize a new empty message for the model
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of responseStream) {
        // Collect Text
        if (chunk.text) {
          fullText += chunk.text;
          // Update the last message with the current accumulated text
          setMessages(prev => {
            const newArr = [...prev];
            newArr[newArr.length - 1] = { ...newArr[newArr.length - 1], text: fullText };
            return newArr;
          });
        }

        // Collect Function Calls (usually in the last chunk or distinct chunks)
        if (chunk.functionCalls) {
           functionCalls = [...functionCalls, ...chunk.functionCalls];
        }

        // Collect Grounding Metadata
        if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
          const chunks = chunk.candidates[0].groundingMetadata.groundingChunks;
          chunks.forEach((c: any) => {
            if (c.web?.uri && c.web?.title) {
              groundingSources.push({ title: c.web.title, uri: c.web.uri });
            }
          });
        }
      }

      // Handle Function Calls (Executed after stream to prevent UI jumping)
      if (functionCalls.length > 0) {
        let toolResponseText = "";
        for (const call of functionCalls) {
          if (call.name === 'scrollToSection') {
            // @ts-ignore
            scrollToSection(call.args.sectionId);
            if (!fullText) toolResponseText = `Taking you to the ${call.args.sectionId} section...`;
          }
        }
        
        // If there was no text from the model (only tool use), show a confirmation
        if (!fullText && toolResponseText) {
           setMessages(prev => {
              const newArr = [...prev];
              newArr[newArr.length - 1] = { ...newArr[newArr.length - 1], text: toolResponseText };
              return newArr;
           });
        }
      }

      // Update sources if found
      if (groundingSources.length > 0) {
        setMessages(prev => {
          const newArr = [...prev];
          // Deduplicate sources
          const uniqueSources = Array.from(new Set(groundingSources.map(s => s.uri)))
             .map(uri => groundingSources.find(s => s.uri === uri)!);
          
          newArr[newArr.length - 1] = { 
            ...newArr[newArr.length - 1], 
            groundingSources: uniqueSources 
          };
          return newArr;
        });
      }

    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => {
         // If the last message was the empty loading one, replace it. Otherwise append.
         const lastMsg = prev[prev.length - 1];
         if (lastMsg.role === 'model' && lastMsg.text === '') {
             const newArr = [...prev];
             newArr[newArr.length - 1] = { role: 'model', text: "I'm having trouble connecting right now. Please try again." };
             return newArr;
         } else {
             return [...prev, { role: 'model', text: "I'm having trouble connecting right now. Please try again." }];
         }
      });
    } finally {
      setIsThinking(false);
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        // Small delay to allow user to see text before sending
        setTimeout(() => {
            // Check if input was updated (a bit hacky in React state, but sufficient for simple voice command)
            // Ideally we'd call handleSendMessage directly but input state might not be updated yet in closure.
            // For now, we just set input. User can hit send.
        }, 500);
      };
      recognition.onerror = (event: any) => {
         console.error("Speech recognition error", event.error);
         setIsListening(false);
      };
      
      recognition.start();
    } else {
      alert("Voice input is not supported in this browser.");
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-google-blue via-purple-500 to-google-red shadow-[0_0_30px_rgba(66,133,244,0.5)] border border-white/20 text-white flex items-center justify-center overflow-hidden group"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <ChevronDown /> : <Sparkles className="animate-pulse" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-[90vw] md:w-[400px] h-[500px] bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-google-blue to-google-red flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                   <Bot size={18} className="text-white relative z-10" />
                </div>
                <div>
                   <h3 className="font-bold text-white text-sm">Gemini Guide</h3>
                   <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-gray-400">Gemini 1.5 Pro</span>
                   </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-google-blue text-white rounded-tr-none' 
                      : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/5'
                  }`}>
                    {msg.text}
                  </div>
                  
                  {/* Grounding Sources Display */}
                  {msg.groundingSources && msg.groundingSources.length > 0 && (
                     <div className="mt-2 flex flex-wrap gap-2 max-w-[85%]">
                        {msg.groundingSources.map((source, idx) => (
                           <a 
                             key={idx} 
                             href={source.uri} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="text-[10px] flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-gray-400 hover:text-google-blue"
                           >
                              <ExternalLink size={10} />
                              <span className="truncate max-w-[100px]">{source.title}</span>
                           </a>
                        ))}
                     </div>
                  )}
                </div>
              ))}
              {isThinking && messages[messages.length - 1]?.role === 'user' && (
                 <div className="flex justify-start">
                    <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                       <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                       <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100" />
                       <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-black/20">
               <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 focus-within:border-google-blue/50 transition-colors">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about Gemini..."
                    className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-gray-500"
                  />
                  <button 
                    onClick={startListening}
                    className={`p-2 rounded-full transition-colors ${isListening ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Mic size={18} />
                  </button>
                  <button 
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isThinking}
                    className="p-2 bg-white/10 rounded-full text-google-blue hover:bg-white/20 transition-colors disabled:opacity-50"
                  >
                    <Send size={18} />
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};