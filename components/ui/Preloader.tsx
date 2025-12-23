import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [text, setText] = useState('');
  const fullName = "SOURABH SINGH";

  useEffect(() => {
    // Typing effect logic
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      if (currentIndex <= fullName.length) {
        setText(fullName.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(intervalId);
        // Delay before completing to allow full text to be seen
        setTimeout(() => {
             onComplete();
        }, 800);
      }
    }, 150); // Typing speed

    return () => clearInterval(intervalId);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-default"
      exit={{ opacity: 0, y: -20, transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      <div className="relative">
        <motion.h1 
            className="text-2xl sm:text-4xl md:text-6xl lg:text-8xl font-bold text-white tracking-widest font-mono text-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {text}
            <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-1.5 h-6 sm:w-2 sm:h-8 md:h-12 lg:h-16 bg-google-blue align-middle ml-1 md:ml-2"
            />
        </motion.h1>
        
        {/* Sub-text / Buffering indicator */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -bottom-12 left-0 w-full text-center"
        >
            <p className="text-xs md:text-sm text-gray-500 font-mono uppercase tracking-[0.5em]">
                Initializing System...
            </p>
        </motion.div>
      </div>
    </motion.div>
  );
};
