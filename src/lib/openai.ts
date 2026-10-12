import OpenAI from 'openai';

// Decode key if not present in process.env
const DEFAULT_KEY_B64 =
  'c2stcHJvai15SXRWN29fX1JQRE5QazZJaW9rbW1PUXZJend5QzMxNHctbll3WGhaWTZYQnJqaUE5N0pEbGhqR0NuaWYwNWVuUUd3Vm1wdzNnV1QzQmxia0ZKd0tvMEp0Z2ZxMEFLbVFhYlJ3NnFNckRqTV91YU5VSHJqZWMyOUZkaEdCajUxNGlTdzAtUm1OUDNZT2w3TTBpSVhMVHJmSHZnQQ==';

export function getOpenAIApiKey(): string {
  if (process.env.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY;
  }
  try {
    return Buffer.from(DEFAULT_KEY_B64, 'base64').toString('utf-8');
  } catch {
    return '';
  }
}

export function getOpenAIClient(): OpenAI {
  const apiKey = getOpenAIApiKey();
  return new OpenAI({ apiKey });
}
