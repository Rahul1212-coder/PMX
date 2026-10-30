import OpenAI from 'openai';

// Google Gemini API Configuration (Default Provider)
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/';
export const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

export function getGeminiApiKey(): string {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GEMINI_API_KEY ||
    ''
  ).trim();
}

export function isGeminiActive(): boolean {
  return Boolean(getGeminiApiKey());
}

export function getAiApiKey(): string {
  return getGeminiApiKey();
}

export function getAiModel(defaultFallback?: string): string {
  return process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL || defaultFallback || 'gemini-3.5-flash';
}

export function getAiClient(): OpenAI {
  const apiKey = getGeminiApiKey();
  return new OpenAI({
    apiKey,
    baseURL: GEMINI_BASE_URL,
  });
}

// Backward-compatible exports for existing codebase callers
export const getOpenAIClient = getAiClient;
export const getOpenAIApiKey = getAiApiKey;
export default getAiClient;
