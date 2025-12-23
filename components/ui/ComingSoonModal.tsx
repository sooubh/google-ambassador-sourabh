import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, X, Construction } from 'lucide-react';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] cursor-pointer"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90%] max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl shadow-google-blue/10 overflow-hidden"
          >
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-google-blue/10 rounded-full blur-[50px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] pointer-events-none" />

            {/* Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
            >
                <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-google-blue/20 to-purple-500/20 flex items-center justify-center mb-6 border border-white/10 shadow-inner">
                    <Rocket className="w-8 h-8 text-google-blue" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">
                    Coming Soon!
                </h3>
                
                <p className="text-gray-400 leading-relaxed mb-8">
                    I'm currently putting the finishing touches on this project. Check back soon for the live demo and case study!
                </p>

                <button 
                    onClick={onClose}
                    className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors active:scale-[0.98]"
                >
                    Got it
                </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
