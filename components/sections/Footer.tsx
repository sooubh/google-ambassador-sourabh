import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 py-8 bg-black/80 backdrop-blur-md border-t border-white/5">
      <div className="flex gap-6 text-gray-600 text-sm justify-center items-center">
          <span>© 2024 Google Student Program</span>
          <span>•</span>
          <Link to="/services" className="hover:text-google-blue transition-colors">AI Services</Link>
          <span>•</span>
          <span>Privacy Policy</span>
          <span>•</span>
          <span>Terms</span>
      </div>
    </footer>
  );
};
