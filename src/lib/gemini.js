import { GoogleGenerativeAI } from '@google/generative-ai';
import Constants from 'expo-constants';

const apiKey = Constants.expoConfig?.extra?.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const SYSTEM_PROMPT = "You are an acoustic analyst. Listen to this audio sample and respond ONLY with a JSON object containing: source (short category string), disruption_score (integer 1-10, where 1 is silent and 10 is deafening), and description (one sentence describing the dominant sound). Do not include any text outside the JSON object.";

function validateSchema(data) {
  return data && typeof data === 'object' && typeof data.source === 'string' &&
    typeof data.disruption_score === 'number' && data.disruption_score >= 1 && data.disruption_score <= 10 &&
    typeof data.description === 'string';
}

export async function classifyAudio(base64Audio, mimeType = 'audio/mp4', retries = 1) {
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  try {
    const result = await Promise.race([
      genAI.getGenerativeModel({ model: "gemini-3.5-flash" }).generateContent([SYSTEM_PROMPT, { inlineData: { data: base64Audio, mimeType } }]),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
    ]);
    
    const data = JSON.parse(result.response.text().replace(/```(json)?/g, '').trim());
    if (!validateSchema(data)) throw new Error("Invalid schema");
    return data;
  } catch (error) {
    if (retries > 0 && !error.message.includes('Timeout')) return classifyAudio(base64Audio, mimeType, retries - 1);
    throw error;
  }
}
