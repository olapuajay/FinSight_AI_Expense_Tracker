import "./env.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const initializeGeminiAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY is not defined in environment variables");
    console.error("Please make sure your .env file contains GEMINI_API_KEY");
    return null;
  }
  
  console.log("Gemini API Key loaded successfully");
  return new GoogleGenerativeAI(apiKey);
};

const genAI = initializeGeminiAI();

export async function testGeminiConnection() {
  if (!genAI) {
    throw new Error("Gemini AI not properly initialized - check your API key");
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Hello from Gemini!");
    console.log("Gemini test successful:", result.response.text());
    return true;
  } catch (err) {
    console.error("Gemini connection test failed:", err);
    throw err;
  }
}

export default genAI;