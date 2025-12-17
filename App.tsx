import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './components/pages/Home';
import { Services } from './components/pages/Services';
import { ChatBot } from './components/ui/ChatBot';
import './types';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
      </Routes>
      <ChatBot />
    </Router>
  );
}

export default App;