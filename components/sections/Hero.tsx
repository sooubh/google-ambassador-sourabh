import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowDown, Sparkles, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Hero: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  
  // Motion values for the text hover effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Smooth spring animation for the movement
  const xSpring = useSpring(x, { stiffness: 100, damping: 10 });
  const ySpring = useSpring(y, { stiffness: 100, damping: 10 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to the center of the element
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;
    
    // Move text by up to 20px (subtler than before)
    x.set(xPct * 20);
    y.set(yPct * 20);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-transparent"
    >
      {/* Background Gradients - Subtle & Premium */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(66,133,244,0.08),transparent_70%)] pointer-events-none" />
      
      {/* Content Container - Centered & Text Focused */}
      <div className="relative z-20 w-full max-w-5xl mx-auto px-4 text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 hover:bg-white/10 transition-colors">
            <Sparkles className="w-4 h-4 text-google-yellow" />
            <span className="text-sm font-medium tracking-wide uppercase text-gray-300">Google Ambassador & Partner</span>
          </div>
          
          {/* Main Headline */}
          <motion.h1 
            style={{ x: xSpring, y: ySpring }}
            className="text-6xl md:text-9xl font-bold tracking-tighter mb-8 text-white cursor-default leading-[0.9]"
          >
            Sourabh <br />
            <span className="gemini-gradient-text">Singh</span>
          </motion.h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Bridging the gap between students and the future of AI.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full max-w-lg mx-auto">
            <Link to="/services" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-10 py-5 rounded-full bg-white text-black font-bold text-lg hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Explore My Work
                </motion.button>
            </Link>
            
            <motion.a
              href="mailto:sourabh@example.com"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-10 py-5 rounded-full border border-white/20 text-white font-medium text-lg hover:bg-white/5 transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2"
            >
              Get in Touch
            </motion.a>
          </div>

        </motion.div>

      </div>

      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 z-20 hidden md:flex flex-col items-center gap-2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-[10px] uppercase tracking-[0.2em]">Scroll to Discover</span>
        <ArrowDown className="w-4 h-4" />
      </motion.div>
    </section>
  );
};
