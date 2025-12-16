import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Sparkles, Stars, Icosahedron, Octahedron, Torus } from '@react-three/drei';
import * as THREE from 'three';
import '../types';

const GeometricBackground = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
      if(groupRef.current) {
          // Slow rotation of the entire background cluster
          groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      }
  });

  return (
      <group ref={groupRef}>
          {/* Blue Icosahedron - Tech feel */}
          <Float speed={2} rotationIntensity={2} floatIntensity={2}>
              <Icosahedron args={[1, 0]} position={[-10, 8, -15]} scale={2}>
                  <meshStandardMaterial color="#4285F4" wireframe opacity={0.1} transparent />
              </Icosahedron>
          </Float>

          {/* Red Octahedron - Tech feel */}
          <Float speed={1.5} rotationIntensity={1.5} floatIntensity={1.5}>
              <Octahedron args={[1, 0]} position={[12, -5, -20]} scale={3}>
                  <meshStandardMaterial color="#DB4437" wireframe opacity={0.1} transparent />
              </Octahedron>
          </Float>

          {/* Yellow Torus - Tech feel */}
          <Float speed={1.8} rotationIntensity={1} floatIntensity={1}>
              <Torus args={[3, 0.1, 16, 100]} position={[-8, -10, -25]} rotation={[Math.PI / 3, 0, 0]}>
                   <meshStandardMaterial color="#F4B400" wireframe opacity={0.08} transparent />
              </Torus>
          </Float>
          
           {/* Green Icosahedron - Tech feel */}
          <Float speed={2.2} rotationIntensity={1.8} floatIntensity={1.2}>
              <Icosahedron args={[1, 0]} position={[10, 10, -18]} scale={1.5}>
                  <meshStandardMaterial color="#0F9D58" wireframe opacity={0.1} transparent />
              </Icosahedron>
          </Float>
      </group>
  );
};

const PulsingLights = () => {
    const light1 = useRef<THREE.PointLight>(null);
    const light2 = useRef<THREE.PointLight>(null);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if(light1.current) light1.current.intensity = 2 + Math.sin(t * 1.5) * 1;
        if(light2.current) light2.current.intensity = 2 + Math.cos(t * 1.2) * 1;
    });

    return (
        <>
            <pointLight ref={light1} position={[-8, 5, -5]} color="#4285F4" distance={20} decay={2} />
            <pointLight ref={light2} position={[8, -5, -5]} color="#DB4437" distance={20} decay={2} />
        </>
    );
};

export const GeminiOrb: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const starsRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  
  useFrame((state) => {
    // ---------------- ORB LOGIC ----------------
    if (meshRef.current) {
        const t = state.clock.getElapsedTime();
        const { x: mouseX, y: mouseY } = state.pointer;

        // --- SCROLL LOGIC ---
        // We calculate "scroll progress" relative to viewport height (vh)
        const scrollY = window.scrollY;
        const vh = window.innerHeight;
        const scrollPos = scrollY / vh; // Current scroll position in "screens"
        
        // Define target positions based on scroll amount (approximate sections)
        
        let targetPos = new THREE.Vector3(0, 0, 0);
        let targetScale = 2.2;

        if (scrollPos < 0.8) {
        // SECTION 1: HERO - Center, Big
        targetPos.set(0, 0, 0);
        targetScale = 2.2;
        } else if (scrollPos < 1.8) {
        // SECTION 2: WHAT IS GEMINI - Move to Right
        targetPos.set(viewport.width / 3.5, 0, 0);
        targetScale = 1.8;
        } else if (scrollPos < 3.0) {
        // SECTION 3: STUDENT OFFER - Move to Left
        targetPos.set(-viewport.width / 3.5, 0, 0);
        targetScale = 1.5;
        } else if (scrollPos < 6.0) {
        // SECTION 4: WHY DIFFERENT (Sticky) - Center Deep
        // It's a long scroll section, so we keep it there for a while
        targetPos.set(0, 1, -2);
        targetScale = 1.2;
        } else if (scrollPos < 16.0) {
        // SECTION 5-13: STORY MODE (Long List)
        // We gently float it on the side to accompany the content
        // We can even oscillate it slightly based on scroll to make it feel alive
        const side = (scrollPos % 4 < 2) ? 1 : -1; // Switch sides every few screens
        targetPos.set((viewport.width / 3) * side, 0, -1);
        targetScale = 1.0;
        } else if (scrollPos < 17.5) {
            // SECTION 14: AMBASSADOR - Center behind card
            targetPos.set(0, 0.5, -1);
            targetScale = 1.8;
        } else {
        // SECTION 15: FOOTER - Center, Large, Engaging
        targetPos.set(0, 0, 0.5);
        targetScale = 2.4;
        }

        // --- ANIMATION ---
        
        // 1. Base Rotation (Constant)
        meshRef.current.rotation.x = t * 0.2;
        meshRef.current.rotation.y = t * 0.3;

        // 2. Mouse Parallax (Subtle influence)
        const parallaxX = mouseX * 0.5;
        const parallaxY = mouseY * 0.5;

        // 3. Smooth Lerp to Target Position (Scroll + Parallax)
        // We use a lower lerp factor (0.04) for a heavy, cinematic drift
        meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetPos.x + parallaxX, 0.04);
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetPos.y + parallaxY, 0.04);
        meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetPos.z, 0.04);

        // 4. Smooth Scale
        const currentScale = meshRef.current.scale.x;
        const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.04);
        meshRef.current.scale.set(newScale, newScale, newScale);
    }

    // ---------------- STARS LOGIC ----------------
    if (starsRef.current) {
        const { x: mouseX, y: mouseY } = state.pointer;
        const t = state.clock.getElapsedTime();
        
        // Enhanced Parallax:
        // 1. Rotation based on time + mouse
        const targetRotX = mouseY * 0.15;
        const targetRotY = (t * 0.03) + (mouseX * 0.15);
        starsRef.current.rotation.x = THREE.MathUtils.lerp(starsRef.current.rotation.x, targetRotX, 0.03);
        starsRef.current.rotation.y = THREE.MathUtils.lerp(starsRef.current.rotation.y, targetRotY, 0.03);

        // 2. Position shift for depth (stars move slightly opposite to mouse)
        const targetPosX = mouseX * -2.0;
        const targetPosY = mouseY * -2.0;
        starsRef.current.position.x = THREE.MathUtils.lerp(starsRef.current.position.x, targetPosX, 0.03);
        starsRef.current.position.y = THREE.MathUtils.lerp(starsRef.current.position.y, targetPosY, 0.03);
    }
  });

  return (
    <>
      {/* New Atmospheric Elements */}
      <GeometricBackground />
      <PulsingLights />

      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <Sphere args={[1, 64, 64]} ref={meshRef}>
          <MeshDistortMaterial
            color="#4E75F6"
            attach="material"
            distort={0.5}
            speed={2}
            roughness={0.2}
            metalness={0.8}
            emissive="#2a1a5e"
            emissiveIntensity={0.5}
          />
        </Sphere>
        
        {/* Layer 1: Core Blue - Dense, energetic (Google Blue) */}
        <Sparkles count={60} scale={6} size={4} speed={0.4} opacity={1} color="#4285F4" noise={0.2} />
        
        {/* Layer 2: Gemini Purple - Mystical, wider range */}
        <Sparkles count={50} scale={9} size={6} speed={0.3} opacity={0.7} color="#9B72CB" noise={0.3} />

        {/* Layer 3: Red Accents - Fast particles (Google Red) */}
        <Sparkles count={30} scale={7} size={5} speed={0.6} opacity={0.8} color="#DB4437" noise={0.1} />

        {/* Layer 4: Yellow Sparks - Bright pops (Google Yellow) */}
        <Sparkles count={25} scale={8} size={4} speed={0.5} opacity={0.8} color="#F4B400" noise={0.2} />

        {/* Layer 5: Green Flow - Steady background (Google Green) */}
        <Sparkles count={25} scale={10} size={3} speed={0.2} opacity={0.6} color="#0F9D58" noise={0.1} />

        {/* Layer 6: Distant White Star Dust - Very wide field */}
        <Sparkles count={100} scale={25} size={1} speed={0.1} opacity={0.4} color="#ffffff" />

        <pointLight position={[10, 10, 10]} intensity={1.5} color="#fff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#DB4437" />
        <ambientLight intensity={0.5} />
      </Float>
      
      {/* Background Starfield with Parallax Group */}
      <group ref={starsRef}>
         <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </group>
    </>
  );
};