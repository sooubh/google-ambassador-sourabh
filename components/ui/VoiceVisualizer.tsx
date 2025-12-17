import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface VoiceVisualizerProps {
  isActive: boolean;
  mode: 'listening' | 'speaking' | 'idle';
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ isActive, mode }) => {
  if (!isActive && mode === 'idle') return null;

  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${
            mode === 'listening' ? 'bg-red-500' : 
            mode === 'speaking' ? 'bg-google-blue' : 'bg-gray-400'
          }`}
          animate={{
            height: isActive ? [4, 16, 4] : 4,
            opacity: isActive ? 1 : 0.5,
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};
