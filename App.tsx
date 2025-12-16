import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Hero } from './components/sections/Hero';
import { WhatIsGemini } from './components/sections/WhatIsGemini';
import { StudentOffer } from './components/sections/StudentOffer';
import { WhyDifferent } from './components/sections/WhyDifferent';
import { StoryMode } from './components/sections/StoryMode';
import { Ambassador } from './components/sections/Ambassador';
import { FooterCTA } from './components/sections/FooterCTA';
import { GeminiOrb } from './components/GeminiOrb';
import { Particles } from './components/ui/Particles';
import { AIAssistant } from './components/ui/AIAssistant';
import './types';

function App() {
  return (
    <main className="bg-black text-white selection:bg-google-blue selection:text-white relative w-full overflow-x-hidden">
      
      {/* 
        GLOBAL 3D LAYER 
        Fixed position, behind everything (z-0).
        Pointer events none so clicks pass through to HTML.
      */}
      <div className="fixed inset-0 z-0 w-full h-full pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          {/* Ambient Lighting for the scene */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#fff" />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#DB4437" />
          
          <Suspense fallback={null}>
            <GeminiOrb />
          </Suspense>
        </Canvas>
      </div>

      {/* 
        DOM PARTICLES LAYER 
        Optional: Keeps the previous particle effect mixed in for depth 
      */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
        <Particles />
      </div>

      {/* 
        AI ASSISTANT
        Fixed floating element
      */}
      <AIAssistant />
      
      {/* 
        SCROLLABLE CONTENT LAYER 
        z-10 ensures it sits above the canvas.
        Backgrounds must be transparent to see the orb.
        Added IDs for AI Navigation.
      */}
      <div className="relative z-10">
        <div id="hero">
          <Hero />
        </div>
        <div id="about">
          <WhatIsGemini />
        </div>
        <div id="offer">
          <StudentOffer />
        </div>
        <div id="join">
          <FooterCTA />
        </div>
        <div id="features">
          <WhyDifferent />
        </div>
        <div id="story">
          <StoryMode />
        </div>
        <div id="ambassador">
          <Ambassador />
        </div>
      </div>
    </main>
  );
}

export default App;