import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface VoiceVisualizerProps {
  isActive: boolean;
  mode: 'listening' | 'speaking' | 'idle';
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ isActive, mode }) => {
  if (!isActive && mode === 'idle') return null;

  const barCount = 20;
  
  // Color schemes for different modes
  const getBarColor = (index: number) => {
    if (mode === 'listening') {
      return `hsl(${0 + index * 5}, 100%, ${50 + index * 2}%)`;
    } else if (mode === 'speaking') {
      return `hsl(${217 + index * 3}, 100%, ${50 + index * 1.5}%)`;
    }
    return `hsl(0, 0%, ${40 + index * 2}%)`;
  };

  return (
    <div className="flex items-center justify-center gap-0.5 h-12 px-4">
      {[...Array(barCount)].map((_, i) => {
        const waveDelay = Math.sin(i / barCount * Math.PI) * 0.2;
        const centerDistance = Math.abs(barCount / 2 - i) / (barCount / 2);
        const heightMultiplier = 1 - centerDistance * 0.3;

        return (
          <motion.div
            key={i}
            className="w-1 rounded-full relative"
            style={{
              background: getBarColor(i),
              boxShadow: isActive 
                ? `0 0 ${8 + i * 0.3}px ${getBarColor(i)}, 0 0 ${4 + i * 0.2}px ${getBarColor(i)}`
                : 'none',
            }}
            animate={{
              height: isActive 
                ? [
                    4, 
                    (8 + Math.random() * 32) * heightMultiplier, 
                    4
                  ]
                : 4,
              opacity: isActive ? [0.6, 1, 0.6] : 0.3,
              scaleY: isActive ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 0.6 + Math.random() * 0.4,
              repeat: Infinity,
              delay: waveDelay,
              ease: [0.43, 0.13, 0.23, 0.96],
            }}
          />
        );
      })}
    </div>
  );
};
