import { create } from 'zustand';

interface GalaxyState {
    performanceMode: boolean; // false = Galaxy Mode (3D), true = Performance Mode (2D)
    togglePerformanceMode: () => void;
    currentSection: string;
    setSection: (section: string) => void;
}

export const useGalaxyStore = create<GalaxyState>((set) => ({
    performanceMode: true, // Default to 2D (Classic Mode)
    togglePerformanceMode: () => set((state) => ({ performanceMode: !state.performanceMode })),
    currentSection: 'hero',
    setSection: (section) => set({ currentSection: section }),
}));
