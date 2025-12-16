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
    
    // Move text by up to 30px in the direction of the mouse
    x.set(xPct * 30);
    y.set(yPct * 30);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-transparent"
    >
      {/* Background Gradients - Adjusted for blending */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(66,133,244,0.1),transparent_60%)] pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-20 md:mt-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 hover:bg-white/10 transition-colors">
            <Sparkles className="w-4 h-4 text-google-yellow" />
            <span className="text-sm font-medium tracking-wide uppercase">Partner: Sourabh Singh</span>
          </div>
          
          <motion.h1 
            style={{ x: xSpring, y: ySpring }}
            className="text-5xl md:text-8xl font-bold tracking-tighter mb-10 text-white cursor-default"
          >
            Google <span className="gemini-gradient-text">Gemini</span> <br />
            for Students
          </motion.h1>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <motion.a
              href="https://docs.google.com/forms/d/e/1FAIpQLSffT05FZXoT9BcOBtuVRDPpMu_P9CYOFOZASqmUAnkOQHkS4A/viewform"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative overflow-hidden bg-white text-black px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(66,133,244,0.6)] transition-all cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-2">
                Join via Google Form
                <ExternalLink className="w-5 h-5 text-google-blue transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </span>
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </motion.a>
            
            <Link to="/services">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-8 py-4 rounded-full border border-white/20 hover:bg-white/10 backdrop-blur-sm font-medium transition-colors cursor-pointer text-white"
                >
                  Try AI Services
                </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ArrowDown className="w-5 h-5" />
        </div>
      </motion.div>
    </section>
  );
};