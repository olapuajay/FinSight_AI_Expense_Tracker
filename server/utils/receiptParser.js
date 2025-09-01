import genAI from "../config/gemini.js";
import fs from "fs";
import path from "path";
import mime from "mime-types";

export async function parseReceipt(imagePath) {
  if (!genAI) {
    throw new Error("Gemini AI is not properly initialized. Please check your GEMINI_API_KEY in the .env file.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const prompt = `
  You are an expense tracker assistant.
  Extract structured data from the receipt.
  Return ONLY a valid JSON object in this exact format (no markdown, no code blocks, no extra text):
  {
    "amount": <number>,
    "date": "<yyyy-mm-dd>",
    "category": "<category>",
    "payment": "<cash|card|upi>",
    "note": "<short description>"
  }
  If any field is missing, leave it null.
  Return only the JSON object, nothing else.
  `;

  
  const fileExtension = path.extname(imagePath);
  
  let mimeType = mime.lookup(imagePath);
  
  if (!mimeType || mimeType === false) {    
    const ext = fileExtension.toLowerCase();
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg';
        break;
      case '.png':
        mimeType = 'image/png';
        break;
      case '.webp':
        mimeType = 'image/webp';
        break;
      case '.gif':
        mimeType = 'image/gif';
        break;
      default:
        const buffer = fs.readFileSync(imagePath);
        const firstBytes = buffer.toString('hex', 0, 4);
        
        if (firstBytes.startsWith('ffd8')) {
          mimeType = 'image/jpeg';
        } else if (firstBytes.startsWith('8950')) {
          mimeType = 'image/png';
        } else if (firstBytes.startsWith('5249')) {
          mimeType = 'image/webp';
        } else if (firstBytes.startsWith('4749')) {
          mimeType = 'image/gif';
        } else {
          throw new Error(`Unsupported file type. Unable to detect image format. Please upload JPG, PNG, WEBP, or GIF images.`);
        }
    }
  }

  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!supportedTypes.includes(mimeType)) {
    throw new Error(`Unsupported MIME type: ${mimeType}. Gemini supports: ${supportedTypes.join(', ')}`);
  }

  const image = {
    inlineData: {
      data: fs.readFileSync(imagePath).toString("base64"),
      mimeType,
    },
  };

  const result = await model.generateContent([prompt, image]);
  const response = result.response.text().trim();


  try {
    let cleanResponse = response
      .replace(/^```json\s*/, "")
      .replace(/^```\s*/, "")
      .replace(/\s*```$/, "")
      .trim();
        
    return JSON.parse(cleanResponse);
  } catch (error) {
    console.error("Error parsing Gemini response:", error.message);
    return null;
  }
}