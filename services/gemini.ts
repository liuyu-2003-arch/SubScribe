import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { GeneratedContent } from "../types";

const MODEL_NAME = "gemini-3-flash-preview";

// Helper for exponential backoff delay
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generates a polished blog post from transcript text using Gemini 3.
 * Implements graceful retry logic for rate limits.
 */
export const generateBlogPost = async (srtText: string, retryCount = 0): Promise<GeneratedContent> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  // Fixed: Create a new instance right before call as per Gemini 3 and Veo guidelines.
  const ai = new GoogleGenAI({ apiKey });

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "A catchy, engaging title for the blog post based on the content.",
      },
      summary: {
        type: Type.STRING,
        description: "A comprehensive executive summary of the entire video (3-5 sentences).",
      },
      content: {
        type: Type.STRING,
        description: "The complete article content using HTML tags. Use <h2> for subheadings and <p> for paragraphs.",
      },
    },
    required: ["title", "summary", "content"],
    propertyOrdering: ["title", "summary", "content"],
  };

  const systemInstruction = `
    You are a professional blog editor.
    Convert the raw transcript from an SRT file into a polished, structured blog article.
    
    CRITICAL:
    1. Output ONLY the article in prose.
    2. Do not truncate the content.
    3. Use <h2> for section titles and <p> for paragraphs.
    4. Fix grammar and remove filler words.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Process this transcript into a blog post:\n${srtText}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    // Fixed: Accessed .text as a property, not a method, as per SDK guidelines.
    const text = response.text;
    if (!text) {
        throw new Error("EMPTY_RESPONSE");
    }
    
    return JSON.parse(text) as GeneratedContent;
  } catch (error: any) {
    const message = error.message || "";
    
    // Fixed: Implemented graceful retry logic with exponential backoff for API rate limits.
    if ((message.includes("429") || message.toLowerCase().includes("rate limit")) && retryCount < 3) {
      await wait(Math.pow(2, retryCount) * 1000);
      return generateBlogPost(srtText, retryCount + 1);
    }

    if (message.includes("429") || message.toLowerCase().includes("rate limit")) {
      throw new Error("RATE_LIMIT_EXCEEDED");
    }
    if (message.includes("503") || message.toLowerCase().includes("overloaded")) {
      throw new Error("SERVICE_OVERLOADED");
    }
    if (message.includes("finishReason: SAFETY") || message.toLowerCase().includes("safety")) {
      throw new Error("CONTENT_SAFETY_FILTER");
    }
    if (message.includes("Requested entity was not found")) {
      throw new Error("API_KEY_INVALID");
    }
    
    throw error;
  }
};