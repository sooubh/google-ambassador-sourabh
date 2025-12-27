import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  isActive?: boolean;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ isActive = false }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated Gradient Layer 1 */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: isActive
            ? [
                'radial-gradient(circle at 20% 30%, rgba(66, 133, 244, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 70%, rgba(155, 114, 203, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 30%, rgba(66, 133, 244, 0.15) 0%, transparent 50%)',
              ]
            : 'radial-gradient(circle at 50% 50%, rgba(66, 133, 244, 0.05) 0%, transparent 50%)',
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Animated Gradient Layer 2 */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: isActive
            ? [
                'radial-gradient(circle at 80% 20%, rgba(219, 68, 55, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 80%, rgba(244, 180, 0, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 20%, rgba(219, 68, 55, 0.1) 0%, transparent 50%)',
              ]
            : 'radial-gradient(circle at 50% 50%, rgba(155, 114, 203, 0.05) 0%, transparent 50%)',
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />

      {/* Mesh Grid Effect */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
        animate={{
          opacity: isActive ? [0.3, 0.5, 0.3] : 0.2,
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};
