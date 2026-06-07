import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Round-robin Gemini API key rotation with automatic model fallback.
 *
 * Set GEMINI_API_KEYS in your environment as a comma-separated list of keys:
 *   GEMINI_API_KEYS=key1,key2,key3,...
 *
 * Falls back to the legacy GEMINI_API_KEY if GEMINI_API_KEYS is not set.
 *
 * If the primary model returns 503 / overloaded, it automatically retries
 * with fallback models before giving up.
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
let currentIndex = 0;

/** Ordered list of fallback models to try when primary model is unavailable. */
const MODEL_FALLBACK_CHAIN = [
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
];

/**
 * Returns the next API key in round-robin rotation.
 */
function getNextKey(): string {
  if (API_KEYS.length === 0) {
    throw new Error('Kredensial Gemini API belum dikonfigurasi.');
  }
  const key = API_KEYS[currentIndex % API_KEYS.length];
  currentIndex = (currentIndex + 1) % API_KEYS.length;
  return key;
}

/**
 * Generates content using the Gemini API with automatic model fallback.
 * If the requested model returns a 503/overloaded error, it tries the next
 * model in the fallback chain automatically.
 *
 * @param prompt - The prompt string to send
 * @param preferredModel - Preferred model (default: 'gemini-2.5-flash')
 */
export async function generateWithFallback(
  prompt: string,
  preferredModel = 'gemini-2.5-flash'
): Promise<string> {
  if (API_KEYS.length === 0) {
    throw new Error('Kredensial Gemini API belum dikonfigurasi.');
  }

  // Build the fallback chain: preferred model first, then remaining fallbacks
  const chain = [
    preferredModel,
    ...MODEL_FALLBACK_CHAIN.filter((m) => m !== preferredModel),
  ];

  let lastError: Error | null = null;

  for (const modelName of chain) {
    const key = getNextKey();
    console.log(`[gemini] Trying model: ${modelName} with key index ${currentIndex}/${API_KEYS.length}`);
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      console.log(`[gemini] Success with model: ${modelName}`);
      return result.response.text();
    } catch (err: any) {
      const message: string = err?.message ?? String(err);
      const isOverloaded =
        message.includes('503') ||
        message.includes('overloaded') ||
        message.includes('Service Unavailable') ||
        message.includes('high demand');

      console.warn(`[gemini] Model ${modelName} failed: ${message}`);
      lastError = err;

      // Only fall back to next model on 503/overload errors
      if (!isOverloaded) {
        throw err;
      }
    }
  }

  throw lastError ?? new Error('Semua model Gemini tidak tersedia. Coba lagi nanti.');
}

/**
 * Returns a GoogleGenerativeAI model using the next key in the rotation.
 * NOTE: Prefer using `generateWithFallback` for resilience against 503 errors.
 *
 * @param modelName - The Gemini model to use (default: 'gemini-2.5-flash')
 */
export function getGeminiModel(modelName = 'gemini-2.5-flash') {
  if (API_KEYS.length === 0) {
    throw new Error('Kredensial Gemini API belum dikonfigurasi.');
  }

  const key = getNextKey();
  console.log(`[gemini] Using key index ${currentIndex}/${API_KEYS.length} model: ${modelName}`);

  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: modelName });
}

/** True if at least one API key is configured. */
export const isGeminiConfigured = API_KEYS.length > 0;
