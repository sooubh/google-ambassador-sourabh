import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

// Initialize the Google GenAI Client
// We assume the API key is available in the environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
    console.error("VITE_GEMINI_API_KEY is missing!");
}
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

// --- Configuration & Constants ---

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

export const TOOLS = [
    {
        functionDeclarations: [
            {
                name: "scrollToSection",
                description: "Scrolls the page to a specific section and highlights it. Use this when the user wants to see, go to, or navigate to a specific part of the page.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        sectionId: {
                            type: Type.STRING,
                            description: "The ID of the section. Options: 'hero' (Intro), 'about' (What is Gemini), 'offer' (Student Offer), 'features' (Why Gemini/Edge), 'story' (Detailed Features), 'ambassador' (Sourabh Singh Profile), 'join' (Footer CTA).",
                        },
                    },
                    required: ["sectionId"],
                },
            },
        ],
    },
    { googleSearch: {} } // Enable Search Grounding
];

// --- Types ---

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

// --- Service Methods ---

export const GeminiService = {
    /**
     * Streams a response from Gemini, handling model fallback automatically.
     * @param history The conversation history.
     * @param userMsg The current user message.
     * @returns An AsyncIterable of GenerateContentResponse
     */
    async streamResponse(history: ChatMessage[], userMsg: string) {
        if (!apiKey) throw new Error("API Key not found");

        const formattedHistory = history.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        const contents = [...formattedHistory, { role: 'user', parts: [{ text: userMsg }] }];
        const config = {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: TOOLS,
        };

        // Try Primary Model (Gemini 1.5 Flash - Free Tier Friendly)
        try {
            console.log("GeminiService: Attempting with gemini-1.5-flash...");
            const response = await ai.models.generateContentStream({
                model: 'gemini-1.5-flash',
                contents,
                config
            });
            // @ts-ignore
            return response.stream || response;
        } catch (error) {
            console.warn("GeminiService: 1.5 Flash model failed, switching to fallback (1.5 Pro)...", error);

            // Try Fallback Model (Gemini 1.5 Pro)
            try {
                const response = await ai.models.generateContentStream({
                    model: 'gemini-1.5-pro',
                    contents,
                    config
                });
                // @ts-ignore
                return response.stream || response;
            } catch (fallbackError) {
                console.error("GeminiService: All models failed", fallbackError);
                throw fallbackError;
            }
        }
    }
};
