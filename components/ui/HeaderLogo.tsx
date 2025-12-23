import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const HeaderLogo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed top-6 left-6 md:top-8 md:left-8 z-50 cursor-pointer flex items-center gap-2 group"
        onClick={() => {
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
    >
        <div className="relative w-10 h-10 flex items-center justify-center">
            {/* Logo Icon */}
            <div className="absolute inset-0 bg-google-blue/20 rounded-xl rotate-3 group-hover:rotate-0 transition-transform duration-300 backdrop-blur-sm border border-google-blue/30" />
            <Sparkles className="w-5 h-5 text-google-blue relative z-10" />
        </div>
        <div className="flex flex-col">
            <span className="text-sm font-bold text-white tracking-wider uppercase leading-none">Sourabh</span>
            <span className="text-[10px] text-gray-400 font-mono tracking-widest leading-none mt-1">Singh</span>
        </div>
    </motion.div>
  );
};
