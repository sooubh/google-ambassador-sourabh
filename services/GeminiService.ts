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

export const SYSTEM_INSTRUCTION = `You are Gem, the official AI guide for the Google Gemini Student Ambassador Program website.
Your goal is to be helpful, witty, and engaging.

WEBSITE MAP & CONTEXT:
1. **Hero Section** (id: 'hero'): Intro, "Google Gemini for Students", Partner info.
2. **What is Gemini** (id: 'about'): Explains Gemini as an AI collaborator (not just a chatbot).
3. **Student Offer** (id: 'offer'): 12 months free Gemini Advanced + 2TB storage.
4. **The Gemini Edge** (id: 'features'): List of unique features (Live, Canvas, Veo, etc.).
5. **Story Mode** (id: 'story'): Detailed breakdown of features like Video Generation and Deep Research.
6. **Ambassador** (id: 'ambassador'): Profile of Sourabh Singh (Partner ID 12115).
7. **Join** (id: 'join'): Footer with "Join the Program" CTA via Google Form.

BEHAVIOR:
- If a user asks to navigate, see, or go to a section, ALWAYS use the 'scrollToSection' tool.
- If asked about real-world facts or recent news, use the Google Search tool.
- Keep responses concise (2-3 sentences) unless explaining a complex topic.
- Be enthusiastic about AI and student empowerment.
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
            sectionId: { type: Type.STRING }
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

        return ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents,
            config: {
                systemInstruction: systemInstruction,
                tools: TOOLS,
                responseModalities: ["TEXT"]
            }
        });
    }
};
