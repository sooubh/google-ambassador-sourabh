export const content = {
    hero: {
        title: "Sourabh Singh",
        tagline: "Google Ambassador • Computer Engineering Student • AI & Web Innovator",
        badge: "Official Partner ID: 12115",
        buttons: [
            { text: "Explore My Universe", action: "explore" },
            { text: "Fill Google Form", action: "form", link: "https://docs.google.com/forms/d/e/1FAIpQLSffT05FZXoT9BcOBtuVRDPpMu_P9CYOFOZASqmUAnkOQHkS4A/viewform" }
        ]
    },
    about: {
        title: "About Me",
        bio: "I am a Computer Engineering undergraduate with a strong interest in Artificial Intelligence and modern web development. I enjoy building user-centric, high-performance applications and learning through hands-on projects, hackathons, and experimentation. As a Google Ambassador, I empower students to leverage AI tools like Gemini to boost their productivity and creativity.",
        highlights: [
            "Represent Google technologies on campus",
            "Promote Google AI, Gemini, and developer tools",
            "Conduct tech sessions and mentor students"
        ],
        skills: ["React", "Three.js", "TypeScript", "Google Cloud", "Gemini AI", "Tailwind CSS"]
    },
    projects: [
        {
            id: "project-1",
            title: "Google Gemini Integration",
            description: "A deep integration of Google's Gemini AI into web applications, enabling voice interaction and multimodal capabilities.",
            tech: ["Gemini API", "React", "WebSocket"],
            link: "#"
        },
        {
            id: "project-2",
            title: "AI Voice Assistant",
            description: "Real-time voice-to-text and text-to-speech assistant using modern browser APIs and AI inference.",
            tech: ["Web Speech API", "OpenAI/Gemini", "React"],
            link: "#"
        },
        {
            id: "project-3",
            title: "3D Portfolio",
            description: "An immersive 3D portfolio website built with React Three Fiber, featuring scroll-driven animations and interactive elements.",
            tech: ["R3F", "Three.js", "GSAP"],
            link: "#"
        }
    ],
    contact: {
        title: "Contact",
        text: "Ready to collaborate or have questions about the Google Ambassador program?",
        email: "sourabh@example.com",
        formLink: "https://docs.google.com/forms/d/e/1FAIpQLSffT05FZXoT9BcOBtuVRDPpMu_P9CYOFOZASqmUAnkOQHkS4A/viewform"
    }
};

export type Content = typeof content;
