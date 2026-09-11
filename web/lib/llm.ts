// Cliente LLM minimo para el chat en vivo del panel cliente (web/lib/ceo-chat.ts).
// No usa tools ni el loop de agents/_shared/agent.ts a proposito - ese paquete es
// independiente de web/ (corre como procesos Node aparte). Mismo criterio de
// fallback que agents/_shared/llm-client-factory.ts: 'anthropic' por defecto,
// 'openai-compatible' como shim temporal mientras no haya ANTHROPIC_API_KEY real.
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

export async function chatCompletion(systemPrompt: string, messages: ChatMessage[]): Promise<ChatCompletionResult> {
  const provider = process.env.LLM_PROVIDER ?? 'anthropic';

  if (provider === 'anthropic') {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY no configurada.');
    const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model, max_tokens: 1024, system: systemPrompt, messages }),
    });
    if (!response.ok) throw new Error(`Anthropic respondió ${response.status}: ${await response.text()}`);

    const data = (await response.json()) as {
      content: Array<{ type: string; text?: string }>;
      usage: { input_tokens: number; output_tokens: number };
    };
    const text = data.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text ?? '')
      .join('\n')
      .trim();
    return { text, inputTokens: data.usage.input_tokens, outputTokens: data.usage.output_tokens };
  }

  if (provider === 'openai-compatible') {
    const baseURL = process.env.LLM_BASE_URL;
    const apiKey = process.env.LLM_API_KEY;
    const model = process.env.LLM_MODEL;
    if (!baseURL || !apiKey || !model) {
      throw new Error('LLM_PROVIDER="openai-compatible" requiere LLM_BASE_URL, LLM_API_KEY y LLM_MODEL.');
    }

    const response = await fetch(`${baseURL.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      }),
    });
    if (!response.ok) throw new Error(`LLM respondió ${response.status}: ${await response.text()}`);

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
      usage?: { prompt_tokens: number; completion_tokens: number };
    };
    const text = data.choices[0]?.message?.content?.trim() ?? '';
    return {
      text,
      inputTokens: data.usage?.prompt_tokens ?? 0,
      outputTokens: data.usage?.completion_tokens ?? 0,
    };
  }

  throw new Error(`LLM_PROVIDER="${provider}" no reconocido.`);
}
