import Anthropic from '@anthropic-ai/sdk';
import { OpenAICompatibleClient } from './openai-compatible-client.js';

/**
 * Selecciona el cliente LLM segun LLM_PROVIDER (.env). Default: 'anthropic' (el SDK
 * oficial, sin shim - lo que pide el stack del proyecto). 'openai-compatible' es un
 * swap TEMPORAL para poder probar el agente contra Groq/OpenRouter/Gemini mientras no
 * hay una ANTHROPIC_API_KEY real; ver README. Cuando se retire, ningun agente cambia -
 * solo se borra este archivo, openai-compatible-client.ts, y las variables LLM_* del
 * .env.
 */
export function createLlmClient(): Anthropic {
  const provider = process.env.LLM_PROVIDER ?? 'anthropic';

  if (provider === 'anthropic') {
    return new Anthropic();
  }

  if (provider !== 'openai-compatible') {
    throw new Error(
      `LLM_PROVIDER="${provider}" no reconocido (usa "anthropic" u "openai-compatible").`,
    );
  }

  const baseURL = process.env.LLM_BASE_URL;
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL;
  if (!baseURL || !apiKey || !model) {
    throw new Error(
      'LLM_PROVIDER="openai-compatible" requiere LLM_BASE_URL, LLM_API_KEY y LLM_MODEL en .env.',
    );
  }

  const shim = new OpenAICompatibleClient({ baseURL, apiKey, model });
  return shim as unknown as Anthropic;
}
