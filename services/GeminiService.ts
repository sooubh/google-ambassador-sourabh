import {
    GoogleGenAI,
    Type,
    Content,
    FunctionDeclaration,
    Tool,
    Part
} from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY!;
const ai = new GoogleGenAI({ apiKey });

import { content } from '../lib/content';

export const SYSTEM_INSTRUCTION = `You are Gem, the official AI guide for Sourabh Singh's Galaxy Portfolio.
Your goal is to be helpful, witty, and engaging.

SITE CONTENT CONTEXT:
${JSON.stringify(content, null, 2)}

NAVIGATION MAP:
- Hero (z=0): Intro
- About (z=-10): Bio & Skills
- Projects (z=-20): Project Showcase
- Contact (z=-30): Form & Email

BEHAVIOR:
- If a user asks to navigate, see, or go to a section, ALWAYS use the 'scrollToSection' tool with the section name (hero, about, projects, contact).
- Use the provided SITE CONTENT CONTEXT to answer questions about Sourabh.
- Keep responses concise (2-3 sentences).
- Be enthusiastic about AI and space!
`;

// ---------------- SYSTEM INSTRUCTION ----------------
const systemInstruction: Content = {
    role: "system",
    parts: [{ text: SYSTEM_INSTRUCTION }]
};

// ---------------- TOOL ----------------
const scrollToSectionTool: FunctionDeclaration = {
    name: "scrollToSection",
    description: "Scrolls the page to a specific section",
    parameters: {
        type: Type.OBJECT,
        properties: {
            sectionId: { type: Type.STRING, description: "The section to scroll to (hero, about, projects, contact)" }
        },
        required: ["sectionId"]
    }
};

export const TOOLS: Tool[] = [
    { functionDeclarations: [scrollToSectionTool] }
];

// ---------------- TYPES ----------------
import { ChatMessage } from "../types";

// ---------------- SERVICE ----------------
export const GeminiService = {
    async streamResponse(history: ChatMessage[], userMsg: string) {
        // Construct content from history and new user message
        const contents: Content[] = [
            ...history.map(m => ({
                role: m.role === 'assistant' ? 'model' : m.role,
                parts: [{ text: m.text }]
            })),
            {
                role: "user",
                parts: [{ text: userMsg }]
            }
        ];

        try {
            const streamResult = await ai.models.generateContentStream({
                model: "gemini-1.5-flash",
                contents,
                config: {
                    systemInstruction: systemInstruction,
                    tools: TOOLS,
                    responseModalities: ["TEXT"],
                    candidateCount: 1,
                    temperature: 0.7, // Add temperature for consistent but creative output
                }
            });

            return streamResult;

        } catch (error) {
            console.error("GeminiService: Error starting stream", error);
            throw new Error("Failed to connect to AI service.");
        }
    }
};
