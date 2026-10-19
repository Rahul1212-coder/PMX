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
  if (process.env.USE_OPENAI === 'true') return false;
  return Boolean(getGeminiApiKey());
}

export function getAiApiKey(): string {
  if (isGeminiActive()) {
    return getGeminiApiKey();
  }
  return (process.env.OPENAI_API_KEY || '').trim();
}

export function getAiModel(defaultFallback?: string): string {
  if (isGeminiActive()) {
    return process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  }
  return process.env.OPENAI_RESUME_MODEL || defaultFallback || 'gpt-4o-mini';
}

export function getAiClient(): OpenAI {
  if (isGeminiActive()) {
    const apiKey = getGeminiApiKey();
    return new OpenAI({
      apiKey,
      baseURL: GEMINI_BASE_URL,
    });
  }

  const apiKey = getAiApiKey();
  return new OpenAI({ apiKey });
}

// Backward-compatible exports for existing codebase callers
export const getOpenAIClient = getAiClient;
export const getOpenAIApiKey = getAiApiKey;
export default getAiClient;
