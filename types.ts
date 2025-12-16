import React from 'react';
import { ThreeElements } from '@react-three/fiber';

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  bgGradient: string;
}

export interface CarouselItem {
  id: string;
  title: string;
  role: string;
  description: string;
  image: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {
      group: any;
      meshStandardMaterial: any;
      pointLight: any;
      ambientLight: any;
    }
  }
}