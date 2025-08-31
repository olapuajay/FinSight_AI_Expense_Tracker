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

  console.log(`Processing receipt at path: ${imagePath}`);
  
  const fileExtension = path.extname(imagePath);
  console.log(`File extension: ${fileExtension || 'No extension detected'}`);
  
  let mimeType = mime.lookup(imagePath);
  console.log(`MIME type from lookup: ${mimeType}`);
  
  if (!mimeType || mimeType === false) {
    console.log("MIME type lookup failed, trying file extension fallback");
    
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
        console.log("No file extension, attempting to detect from file content");
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
          console.log(`File magic bytes: ${firstBytes}`);
          throw new Error(`Unsupported file type. Unable to detect image format. Please upload JPG, PNG, WEBP, or GIF images.`);
        }
        
        console.log(`Detected MIME type from file content: ${mimeType}`);
        break;
    }
  }

  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!supportedTypes.includes(mimeType)) {
    throw new Error(`Unsupported MIME type: ${mimeType}. Gemini supports: ${supportedTypes.join(', ')}`);
  }

  console.log(`Processing image with MIME type: ${mimeType}`);

  const image = {
    inlineData: {
      data: fs.readFileSync(imagePath).toString("base64"),
      mimeType,
    },
  };

  const result = await model.generateContent([prompt, image]);
  const response = result.response.text();

  console.log("Raw Gemini response:", response);

  try {
    let cleanResponse = response.trim();
    
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\s*/, '').replace(/\s*```$/, '');
    }
    
    cleanResponse = cleanResponse.trim();
    console.log("Cleaned response for parsing:", cleanResponse);
    
    const parsedData = JSON.parse(cleanResponse);
    console.log("Successfully parsed data:", parsedData);
    
    return parsedData;
  } catch (error) {
    console.error("Error parsing Gemini response:", error.message);
    console.error("Raw response:", response);
    return null;
  }
}