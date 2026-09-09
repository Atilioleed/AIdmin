import OpenAI from 'openai';
import type Anthropic from '@anthropic-ai/sdk';

export interface OpenAICompatibleConfig {
  baseURL: string;
  apiKey: string;
  model: string;
}

/**
 * Shim TEMPORAL (ver LLM_PROVIDER en .env): expone la misma forma que Agent usa de
 * `anthropic.messages.create()`, pero habla con cualquier endpoint compatible con la
 * API de chat completions de OpenAI (Groq, OpenRouter, Gemini via su endpoint
 * /openai/). Sirve solo para probar el flujo completo del agente mientras no hay una
 * ANTHROPIC_API_KEY real - "la oficial" (SDK de Anthropic, sin este shim) sigue siendo
 * el default en Agent y no requiere ningun cambio cuando se retire esto.
 */
export class OpenAICompatibleClient {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(config: OpenAICompatibleConfig) {
    this.client = new OpenAI({ baseURL: config.baseURL, apiKey: config.apiKey });
    this.model = config.model;
  }

  messages = {
    create: async (
      params: Anthropic.MessageCreateParamsNonStreaming,
    ): Promise<Anthropic.Message> => {
      const openAiMessages = toOpenAIMessages(params.system, params.messages);
      const openAiTools = ((params.tools ?? []) as Anthropic.Tool[]).map(toOpenAITool);

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: openAiMessages,
        ...(openAiTools.length > 0 ? { tools: openAiTools } : {}),
      });

      return toAnthropicMessage(completion, this.model);
    },
  };
}

function toOpenAIMessages(
  system: Anthropic.MessageCreateParamsNonStreaming['system'],
  messages: Anthropic.MessageParam[],
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  const result: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

  if (typeof system === 'string' && system.length > 0) {
    result.push({ role: 'system', content: system });
  }

  for (const message of messages) {
    if (typeof message.content === 'string') {
      result.push({ role: message.role, content: message.content });
      continue;
    }

    if (message.role === 'assistant') {
      result.push(toOpenAIAssistantMessage(message.content));
      continue;
    }

    const toolResultBlocks = message.content.filter(
      (block): block is Anthropic.ToolResultBlockParam => block.type === 'tool_result',
    );
    if (toolResultBlocks.length > 0) {
      result.push(...toolResultBlocks.map(toOpenAIToolMessage));
      continue;
    }

    const textParts = message.content
      .filter((block): block is Anthropic.TextBlockParam => block.type === 'text')
      .map((block) => block.text)
      .join('\n');
    result.push({ role: 'user', content: textParts });
  }

  return result;
}

function toOpenAIAssistantMessage(
  content: unknown[],
): OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam {
  const textParts = content
    .filter((block): block is Anthropic.TextBlockParam =>
      Boolean(block && typeof block === 'object' && (block as { type?: string }).type === 'text'),
    )
    .map((block) => block.text)
    .join('\n');
  const toolUseBlocks = content.filter((block): block is Anthropic.ToolUseBlockParam =>
    Boolean(block && typeof block === 'object' && (block as { type?: string }).type === 'tool_use'),
  );

  return {
    role: 'assistant',
    content: textParts.length > 0 ? textParts : null,
    ...(toolUseBlocks.length > 0
      ? {
          tool_calls: toolUseBlocks.map((block) => ({
            id: block.id,
            type: 'function' as const,
            function: { name: block.name, arguments: JSON.stringify(block.input ?? {}) },
          })),
        }
      : {}),
  };
}

function toOpenAIToolMessage(
  block: Anthropic.ToolResultBlockParam,
): OpenAI.Chat.Completions.ChatCompletionToolMessageParam {
  return {
    role: 'tool',
    tool_call_id: block.tool_use_id,
    content:
      typeof block.content === 'string' ? block.content : JSON.stringify(block.content ?? ''),
  };
}

function toOpenAITool(tool: Anthropic.Tool): OpenAI.Chat.Completions.ChatCompletionTool {
  return {
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description ?? '',
      parameters: tool.input_schema,
    },
  };
}

function toAnthropicMessage(
  completion: OpenAI.Chat.Completions.ChatCompletion,
  model: string,
): Anthropic.Message {
  const choice = completion.choices[0];
  const content: Array<Record<string, unknown>> = [];

  if (choice?.message.content) {
    content.push({ type: 'text', text: choice.message.content, citations: null });
  }

  const toolCalls = choice?.message.tool_calls ?? [];
  for (const toolCall of toolCalls) {
    if (toolCall.type !== 'function') continue;
    let input: unknown;
    try {
      input = JSON.parse(toolCall.function.arguments) as unknown;
    } catch {
      input = {};
    }
    content.push({
      type: 'tool_use',
      id: toolCall.id,
      name: toolCall.function.name,
      input,
      caller: { type: 'direct' },
    });
  }

  const stopReason = toolCalls.length > 0 ? 'tool_use' : 'end_turn';

  const shim = {
    id: completion.id,
    container: null,
    content,
    model,
    role: 'assistant' as const,
    stop_details: null,
    stop_reason: stopReason,
    stop_sequence: null,
    type: 'message' as const,
    usage: {
      input_tokens: completion.usage?.prompt_tokens ?? 0,
      output_tokens: completion.usage?.completion_tokens ?? 0,
      cache_creation_input_tokens: null,
      cache_read_input_tokens: null,
      cache_creation: null,
      server_tool_use: null,
      service_tier: null,
    },
  };

  return shim as unknown as Anthropic.Message;
}
