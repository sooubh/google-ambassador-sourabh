import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { id: 'section-s', label: 'S', name: 'Story' },
  { id: 'section-o', label: 'O', name: 'Objectives' },
  { id: 'section-u', label: 'U', name: 'Universe' },
  { id: 'section-r', label: 'R', name: 'Real Projects' },
  { id: 'section-a', label: 'A', name: 'Achievements' },
  { id: 'section-b', label: 'B', name: 'Building' },
  { id: 'section-h', label: 'H', name: 'Human Connect' },
];

import { useNavigate, useLocation } from 'react-router-dom';

export const FloatingNavbar: React.FC = () => {
  const [activeSection, setActiveSection] = useState('section-s');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Scroll handling (only relevant on Home page for active state)
    if (location.pathname !== '/') {
        setActiveSection(''); // No active section on other pages
        return; 
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Determine active section
      const sections = navItems.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (const section of sections) {
        if (section && section.offsetTop <= scrollPosition && (section.offsetTop + section.offsetHeight) > scrollPosition) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const scrollToSection = (id: string) => {
    if (location.pathname !== '/') {
        // Navigate to Home and pass the target section
        navigate('/', { state: { scrollTo: id } });
    } else {
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({
                top: element.offsetTop,
                behavior: 'smooth',
            });
        }
    }
  };

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="hidden md:block fixed top-6 md:top-8 left-1/2 -translate-x-1/2 z-50 w-auto"
    >
      <div 
        className={`
          flex items-center justify-center gap-1 sm:gap-6 px-3 py-2 md:px-6 md:py-3 rounded-full 
          transition-all duration-500 border border-white/5
          ${scrolled ? 'bg-black/60 backdrop-blur-2xl shadow-2xl shadow-black/50 scale-90' : 'bg-black/20 backdrop-blur-xl shadow-lg'}
        `}
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className="group relative flex flex-col items-center justify-center w-9 h-9 sm:w-12 sm:h-12"
          >
            <span 
              className={`
                relative z-10 font-bold text-xs sm:text-base transition-colors duration-300
                ${activeSection === item.id ? 'text-white' : 'text-white/50 group-hover:text-white/80'}
              `}
            >
              {item.label}
            </span>
            
            {/* Active Indicator */}
            {activeSection === item.id && (
              <motion.div
                layoutId="nav-pill"
                className="absolute inset-0 bg-white/10 rounded-full border border-white/10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}

            {/* Hover Tooltip (Name Reveal) */}
            <span className="hidden md:block absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[10px] uppercase tracking-wider text-white/70 whitespace-nowrap bg-black/80 px-2 py-1 rounded backdrop-blur-sm border border-white/5 pointer-events-none">
                {item.name}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};
