import "./env.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function testGeminiConnection() {
  if (!genAI) {
    throw new Error("Gemini AI not properly initialized - check your API key");
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Hello from Gemini!");
    return result.response.text();
  } catch (err) {
    console.error("Gemini connection test failed:", err);
    throw err;
  }
}

export default genAI;