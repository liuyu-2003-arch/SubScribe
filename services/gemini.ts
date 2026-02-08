import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratedContent } from "../types";

const MODEL_NAME = "gemini-3-flash-preview";

export const generateBlogPost = async (srtText: string): Promise<GeneratedContent> => {
  // 直接使用注入的环境变量初始化
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const responseSchema: Schema = {
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
  };

  const prompt = `
    You are a professional blog editor.
    Convert the following raw transcript from an SRT file into a polished, structured blog article.
    
    CRITICAL:
    1. Output ONLY the article in prose.
    2. Do not truncate the content.
    3. Use <h2> for section titles and <p> for paragraphs.
    4. Fix grammar and remove filler words.

    Transcript:
    ${srtText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        maxOutputTokens: 8192, 
      },
    });

    const text = response.text;
    if (!text) {
        throw new Error("Gemini returned an empty response.");
    }
    
    return JSON.parse(text) as GeneratedContent;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};