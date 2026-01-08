import { GoogleGenAI } from "@google/genai";

/**
 * Service to handle communication with Google Gemini API for recruitment assistance.
 */
export class GeminiService {
  /**
   * Sends a user prompt to the Gemini model and returns the generated response text.
   */
  async sendMessage(prompt: string): Promise<string | undefined> {
    // Correctly initialize the client right before the API call to ensure fresh configuration.
    // MUST use a named parameter for the apiKey.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      // Use ai.models.generateContent to query the model with prompt and system instructions.
      // Selected 'gemini-3-flash-preview' for efficient text-based support tasks.
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: `You are the Evolv Clothing Recruitment Assistant. 
          Your goal is to help candidates check their interview status.
          HR Contact: Vigneshwaran, 9344117877, Careers@evolv clothing.
          If a user asks for status, politely ask for the phone number they used during application. 
          If they provide a phone number, acknowledge you are checking the database.
          Maintain a professional, helpful, and concise tone.`
        }
      });

      // Directly access the .text property from the GenerateContentResponse object.
      return response.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
}
