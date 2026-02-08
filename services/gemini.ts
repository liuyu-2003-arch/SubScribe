import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratedContent } from "../types";

const MODEL_NAME = "gemini-3-flash-preview";

export const generateBlogPost = async (srtText: string): Promise<GeneratedContent> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey });

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
        description: "The complete article content. Must use HTML tags. Use <h2> tags for section headings to break up the text. Use <p> tags for paragraphs. content must be the FULL transcript converted to prose.",
      },
    },
    required: ["title", "summary", "content"],
  };

  const prompt = `
    You are a professional blog editor and ghostwriter.
    I have a raw transcript from a video subtitle file (SRT). 
    
    YOUR GOAL: Turn this raw spoken text into a polished, structured blog article.
    
    CRITICAL INSTRUCTIONS:
    1. **NO DELETIONS**: You must process the ENTIRE transcript. Do not summarize the body text. Do not cut off the end. Do not say "Here is the rest...". Output the full content.
    2. **STRUCTURE**: Divide the long text into logical sections based on the topic being discussed.
       - Insert a descriptive Subheading (using <h2> tags) for every major topic shift.
       - Use these subheadings to act as "Summary Titles" for the sections below them.
    3. **READABILITY**:
       - Fix spoken grammar, stuttering, and typos.
       - Group sentences into clean, semantic paragraphs (<p>).
       - Maintain the original tone and voice of the speaker.
    4. **SUMMARY**: Write a solid abstract/summary at the start that covers the key takeaways.

    Output JSON matching the schema provided.

    Here is the raw transcript:
    ${srtText}
  `;

  try {
    // We use a high token limit to ensure full articles are generated for longer videos
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        // Increase output tokens for longer articles (default is often 8k, this is a safety measure)
        maxOutputTokens: 8192, 
      },
    });

    const text = response.text;
    if (!text) {
        throw new Error("No response from Gemini.");
    }
    
    return JSON.parse(text) as GeneratedContent;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};