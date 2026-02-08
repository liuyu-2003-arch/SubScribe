
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedContent } from "../types";

const MODEL_NAME = "gemini-3-flash-preview";

export const generateBlogPost = async (srtText: string): Promise<GeneratedContent> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  // Create a new GoogleGenAI instance for each request to ensure it uses the latest configured API key
  const ai = new GoogleGenAI({ apiKey });

  // Use the recommended schema definition approach without deprecated wrappers
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

  // Move persona and core instructions to systemInstruction for better model performance
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
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Process this transcript into a blog post:\n${srtText}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        // Removed maxOutputTokens to avoid empty responses caused by missing thinkingBudget; the model manages limits automatically.
      },
    });

    const text = response.text;
    if (!text) {
        throw new Error("Gemini returned an empty response.");
    }
    
    return JSON.parse(text) as GeneratedContent;
  } catch (error: any) {
    // Gracefully handle specific API errors like project or key not found
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("API_KEY_INVALID");
    }
    throw error;
  }
};
