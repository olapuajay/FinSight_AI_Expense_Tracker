import "../config/env.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function askGemini(prompt, model = "gemini-1.5-flash") {
  if (!genAI) {
    throw new Error("Gemini AI not properly initialized - check your API key");
  }

  try {
    const aiModel = genAI.getGenerativeModel({ model });
    const result = await aiModel.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("Gemini API error: ", err);
    throw new Error("Gemini API request failed");
  }
}

export async function extractTransactionFromReceipt(receiptBase64, mimeType) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

  const image = {
    inlineData: {
      data: receiptBase64,
      mimeType
    },
  };
  
  const result = await model.generateContent([prompt, image]);
  let response = result.response.text().trim();

  response = response
    .replace(/^```json\s*/, "")
    .replace(/^```\s*/, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(response);
  } catch (err) {
    console.error("Gemini JSON parse error:", response);
    return null;
  }
}

export async function autoCategorizeTransaction(note) {
  const prompt = `
    Based on the note: "${note}", suggest the most relevant category
    from: [groceries, food, shopping, travel, utilities, bills, entertainment, other].
    Return only the category string.
  `;

  return await askGemini(prompt);
}

export async function budgetInsights(transaction, budget) {
  const prompt = `
    You are analyzing personal finance data.
    Given these transactions: ${JSON.stringify(transaction)},
    and monthly budget: ${JSON.stringify(budget)},

    Respond with ONLY a raw JSON object. 
    Do NOT include markdown, code fences, or any explanation. 
    Output must be directly parsable with JSON.parse().

    {
      "totalsByCategory": { "category1": number, "category2": number, ... },
      "warnings": [ "warning1", "warning2", ... ],
      "tips": [ "tip1", "tip2", ... ],
    }

    Rules:
    - "totalsByCategory" should be numeric totals for each category.
    - "warnings" should contain any budget alerts (e.g., overspending, nearing limit).
    - "tips" should be practical saving tips.
    - If nothing to report, return empty arrays/objects.
  `;

  const response = await askGemini(prompt);

  try {
    const cleaned = response
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.log("Gemini budgetInsights parse error: ", response);
    return {
      totalsByCategory: {},
      warnings: [],
      tips: [],
    };
  }
}

export default genAI;
