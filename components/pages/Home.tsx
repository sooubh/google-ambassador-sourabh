import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ChatBot } from '../ui/ChatBot';
import { GeminiOrb } from '../GeminiOrb';
import { Particles } from '../ui/Particles';

// Sections
import { Hero } from '../sections/Hero';
import { AboutMe } from '../sections/AboutMe';
import { StudentOffer } from '../sections/StudentOffer';
import { WhyDifferent } from '../sections/WhyDifferent';
import { StoryMode } from '../sections/StoryMode';
import { Ambassador } from '../sections/Ambassador';
import { FooterCTA } from '../sections/FooterCTA';
import { Footer } from '../sections/Footer';

export const Home: React.FC = () => {
  return (
    <main className="bg-black text-white selection:bg-google-blue selection:text-white relative w-full overflow-x-hidden min-h-screen">
      
      {/* 2D CONTENT LAYER */}
      <div className="relative z-10">
        {/* Background - Original Ambience */}
        <div className="fixed inset-0 z-0 w-full h-full pointer-events-none">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#fff" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#DB4437" />
                <Suspense fallback={null}>
                    <GeminiOrb />
                </Suspense>
            </Canvas>
        </div>
        
        <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
            <Particles />
        </div>

        <div id="hero"><Hero /></div>
        <div id="about"><AboutMe /></div>
        <div id="offer"><StudentOffer /></div>
        <div id="join"><FooterCTA /></div>
        <div id="features"><WhyDifferent /></div>
        <div id="story"><StoryMode /></div>
        <div id="ambassador"><Ambassador /></div>
        <Footer />
      </div>

      <ChatBot />
    </main>
  );
};
