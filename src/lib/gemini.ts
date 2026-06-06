import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Round-robin Gemini API key rotation.
 *
 * Set GEMINI_API_KEYS in your environment as a comma-separated list of keys:
 *   GEMINI_API_KEYS=key1,key2,key3,...
 *
 * Falls back to the legacy GEMINI_API_KEY if GEMINI_API_KEYS is not set.
 */

const rawKeys = process.env.GEMINI_API_KEYS ?? process.env.GEMINI_API_KEY ?? '';

const API_KEYS: string[] = rawKeys
  .split(',')
  .map((k) => k.trim())
  .filter((k) => k.length > 0);

if (API_KEYS.length === 0) {
  console.warn('[gemini] No API keys found. Set GEMINI_API_KEYS in your environment.');
}

// Module-level counter — persists across requests within the same server instance.
// On Vercel, each serverless function cold-start resets this to 0, which is fine.
let currentIndex = 0;

/**
 * Returns a GoogleGenerativeAI model using the next key in the rotation.
 * Automatically cycles through all keys in round-robin order.
 *
 * @param modelName - The Gemini model to use (default: 'gemini-2.5-flash')
 */
export function getGeminiModel(modelName = 'gemini-2.5-flash') {
  if (API_KEYS.length === 0) {
    throw new Error('Kredensial Gemini API belum dikonfigurasi.');
  }

  const key = API_KEYS[currentIndex % API_KEYS.length];
  currentIndex = (currentIndex + 1) % API_KEYS.length;

  console.log(`[gemini] Using key index ${(currentIndex - 1 + API_KEYS.length) % API_KEYS.length + 1}/${API_KEYS.length}`);

  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: modelName });
}

/** True if at least one API key is configured. */
export const isGeminiConfigured = API_KEYS.length > 0;
