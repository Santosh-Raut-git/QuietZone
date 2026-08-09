import { GoogleGenerativeAI } from '@google/generative-ai';
import Constants from 'expo-constants';

const apiKey = Constants.expoConfig?.extra?.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);

const SYSTEM_PROMPT = 
  "You are an acoustic analyst. Listen to this audio sample and respond ONLY with a JSON object containing: source (short category string), disruption_score (integer 1-10, where 1 is silent and 10 is deafening), and description (one sentence describing the dominant sound). Do not include any text outside the JSON object.";

/**
 * Validates the parsed JSON against our required schema.
 */
function validateSchema(data) {
  if (!data || typeof data !== 'object') return false;
  if (typeof data.source !== 'string') return false;
  if (typeof data.disruption_score !== 'number' || data.disruption_score < 1 || data.disruption_score > 10) return false;
  if (typeof data.description !== 'string') return false;
  return true;
}

/**
 * Classifies an audio file using Gemini.
 * @param {string} base64Audio 
 * @param {string} mimeType (e.g. 'audio/mp4' or 'audio/m4a')
 * @returns {Promise<Object>} { source, disruption_score, description }
 */
export async function classifyAudio(base64Audio, mimeType = 'audio/mp4', retries = 1) {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in app.config.js');
  }

  // Use gemini-3.5-flash as the standard multimodal model
  const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

  try {
    const generatePromise = model.generateContent([
      SYSTEM_PROMPT,
      {
        inlineData: {
          data: base64Audio,
          mimeType: mimeType,
        },
      },
    ]);

    // 15 second timeout to prevent infinite hangs
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Analysis Timeout: The AI took too long to respond.')), 15000)
    );

    const result = await Promise.race([generatePromise, timeoutPromise]);

    const text = result.response.text();
    
    // Clean up potential markdown formatting like ```json ... ```
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const data = JSON.parse(cleanedText);
    
    if (!validateSchema(data)) {
      throw new Error("Invalid response schema from Gemini");
    }

    return data;
  } catch (error) {
    if (retries > 0 && !error.message.includes('Timeout')) {
      console.warn(`Gemini classification failed, retrying... (${retries} left)`, error.message);
      return classifyAudio(base64Audio, mimeType, retries - 1);
    }
    throw error;
  }
}
