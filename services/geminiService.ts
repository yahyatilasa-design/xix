import { GoogleGenAI } from "@google/genai";
import { Wallet, Transaction } from "../types";

// Di Next.js Client Component, gunakan NEXT_PUBLIC_API_KEY.
// Untuk keamanan lebih baik, idealnya logika ini dipindah ke Server Action / API Route.
const API_KEY = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY;

let ai: GoogleGenAI | null = null;

export const initGemini = () => {
  if (!API_KEY) {
    console.error("Gemini API Key is missing! Set NEXT_PUBLIC_API_KEY in .env.local");
    return null;
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
  return ai;
};

export const createChatSession = async (
  wallet: Wallet,
  transactions: Readonly<Transaction[]>
) => {
  const gemini = initGemini();
  if (!gemini) throw new Error("AI not initialized");

  const contextPrompt = `
    You are XIX AI, a helpful assistant for the XIX Digital Marketplace.
    
    User Context:
    - Current Balance: IDR ${wallet.balance.toLocaleString('id-ID')}
    - Recent Transactions: ${JSON.stringify(transactions.slice(0, 3))}
    
    Your Role:
    - Help users check their balance and transaction history.
    - Explain product details (PPOB services like Data, PLN, etc.).
    - Be concise, professional, and friendly.
    
    Style:
    - Use "IDR" for currency.
    - Keep answers short (under 50 words usually).
  `;

  return gemini.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: contextPrompt,
    },
  });
};