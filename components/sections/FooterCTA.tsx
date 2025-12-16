import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SectionReveal } from '../ui/SectionReveal';

export const FooterCTA: React.FC = () => {
  return (
    <section id="join" className="min-h-screen flex flex-col items-center justify-center bg-transparent relative overflow-hidden py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(66,133,244,0.1),transparent_70%)] pointer-events-none" />
      
      <div className="relative z-10 text-center px-4 w-full max-w-4xl mx-auto">
         <SectionReveal>
           <motion.h2 
             className="text-4xl md:text-6xl font-bold mb-6 tracking-tight"
           >
              Ready to <span className="gemini-gradient-text">Innovate?</span>
           </motion.h2>
           
           <p className="text-lg md:text-xl text-gray-300 mb-10">
              Fill out the form below to kickstart your journey with Google AI.
           </p>
           
           <div className="w-full bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 shadow-2xl">
              <iframe 
                src="https://docs.google.com/forms/d/e/1FAIpQLSffT05FZXoT9BcOBtuVRDPpMu_P9CYOFOZASqmUAnkOQHkS4A/viewform?embedded=true" 
                width="640" 
                height="800" 
                className="w-full"
                title="Google Ambassador Program Application"
              >
                Loading…
              </iframe>
           </div>
           
           <div className="mt-12 flex gap-6 text-gray-600 text-sm justify-center items-center">
              <span>© 2024 Google Student Program</span>
              <span>•</span>
              <Link to="/services" className="hover:text-google-blue transition-colors">AI Services</Link>
              <span>•</span>
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms</span>
           </div>
         </SectionReveal>
      </div>
    </section>
  );
};