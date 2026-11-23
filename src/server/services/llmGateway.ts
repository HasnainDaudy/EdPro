/**
 * Multi-Provider LLM Gateway
 * Provides unified streaming and testing support for:
 * - Google Gemini (v1beta REST API with SSE)
 * - OpenAI (Chat Completions API with SSE)
 * - Anthropic Claude (Messages API with SSE)
 * - Ollama (Local LLM via OpenAI-compatible endpoint or native API)
 * - Custom OpenAI-Compatible endpoints (Groq, DeepSeek, OpenRouter, Together, etc.)
 */

export type LLMProvider = 'offline' | 'gemini' | 'openai' | 'anthropic' | 'ollama' | 'custom';

export interface LLMProviderConfig {
  provider: LLMProvider;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  temperature?: number;
}

export class LLMGateway {
  /**
   * Determine default model based on provider
   */
  static getDefaultModel(provider: LLMProvider): string {
    switch (provider) {
      case 'gemini':
        return 'gemini-1.5-flash';
      case 'openai':
        return 'gpt-4o-mini';
      case 'anthropic':
        return 'claude-3-5-haiku-20241022';
      case 'ollama':
        return 'llama3';
      case 'custom':
        return 'gpt-4o-mini';
      default:
        return 'offline';
    }
  }

  /**
   * Test connection to provider with a lightweight prompt
   */
  static async testConnection(config: LLMProviderConfig): Promise<{ success: boolean; message: string }> {
    if (config.provider === 'offline') {
      return { success: true, message: 'Offline Socratic Engine is active and ready (no API key required).' };
    }

    const model = config.model || this.getDefaultModel(config.provider);

    try {
      if (config.provider === 'gemini') {
        const apiKey = config.apiKey?.trim();
        if (!apiKey) {
          return { success: false, message: 'Google Gemini API key is missing. Please enter your API key.' };
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Respond with "Ready"' }] }],
            generationConfig: { maxOutputTokens: 10, temperature: 0.1 }
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.error?.message || `HTTP ${res.status}: ${res.statusText}`;
          return { success: false, message: `Google Gemini error: ${errMsg}` };
        }

        return { success: true, message: `Connected to Google Gemini (${model}) successfully!` };
      }

      if (config.provider === 'openai' || config.provider === 'custom') {
        const apiKey = config.apiKey?.trim();
        if (config.provider === 'openai' && !apiKey) {
          return { success: false, message: 'OpenAI API key is missing. Please enter your API key.' };
        }

        let baseUrl = (config.baseUrl || 'https://api.openai.com/v1').trim();
        baseUrl = baseUrl.replace(/\/+$/, '');
        const endpoint = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (apiKey) {
          headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: 'Respond with "Ready"' }],
            max_tokens: 10,
            temperature: 0.1
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.error?.message || `HTTP ${res.status}: ${res.statusText}`;
          return { success: false, message: `${config.provider === 'custom' ? 'Custom Provider' : 'OpenAI'} error: ${errMsg}` };
        }

        return {
          success: true,
          message: `Connected to ${config.provider === 'custom' ? 'Custom Provider' : 'OpenAI'} (${model}) successfully!`
        };
      }

      if (config.provider === 'anthropic') {
        const apiKey = config.apiKey?.trim();
        if (!apiKey) {
          return { success: false, message: 'Anthropic Claude API key is missing. Please enter your API key.' };
        }

        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: 'Respond with "Ready"' }],
            max_tokens: 10,
            temperature: 0.1
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.error?.message || `HTTP ${res.status}: ${res.statusText}`;
          return { success: false, message: `Anthropic Claude error: ${errMsg}` };
        }

        return { success: true, message: `Connected to Anthropic Claude (${model}) successfully!` };
      }

      if (config.provider === 'ollama') {
        let baseUrl = (config.baseUrl || 'http://localhost:11434').trim().replace(/\/+$/, '');
        // Check Ollama tags or chat
        const tagsRes = await fetch(`${baseUrl}/api/tags`).catch(() => null);
        if (!tagsRes || !tagsRes.ok) {
          return {
            success: false,
            message: `Could not reach Ollama server at ${baseUrl}. Ensure Ollama is running ('ollama serve').`
          };
        }

        const tagsData: any = await tagsRes.json().catch(() => ({ models: [] }));
        const availableModels = (tagsData.models || []).map((m: any) => m.name || m.model);

        return {
          success: true,
          message: `Connected to Ollama! Available local models: ${availableModels.length > 0 ? availableModels.slice(0, 3).join(', ') : 'Ready'}`
        };
      }

      return { success: false, message: 'Unknown provider specified.' };
    } catch (err: any) {
      return { success: false, message: `Connection failed: ${err.message || 'Network error'}` };
    }
  }

  /**
   * Stream tokens from selected LLM provider
   */
  static async *streamChat(
    config: LLMProviderConfig,
    systemPrompt: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    userPrompt: string
  ): AsyncGenerator<string, void, unknown> {
    const provider = config.provider;
    const model = config.model || this.getDefaultModel(provider);

    if (provider === 'gemini') {
      yield* this.streamGemini(config, model, systemPrompt, history, userPrompt);
    } else if (provider === 'anthropic') {
      yield* this.streamAnthropic(config, model, systemPrompt, history, userPrompt);
    } else if (provider === 'openai' || provider === 'custom' || provider === 'ollama') {
      yield* this.streamOpenAICompatible(config, model, systemPrompt, history, userPrompt);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Google Gemini SSE Stream
   */
  private static async *streamGemini(
    config: LLMProviderConfig,
    model: string,
    systemPrompt: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    userPrompt: string
  ): AsyncGenerator<string, void, unknown> {
    const apiKey = config.apiKey?.trim();
    if (!apiKey) throw new Error('Gemini API key is required');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?key=${encodeURIComponent(apiKey)}&alt=sse`;

    // Map conversation history into Gemini format
    const contents: any[] = [];
    for (const h of history) {
      contents.push({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: userPrompt }]
    });

    const bodyPayload: any = {
      contents,
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        temperature: config.temperature ?? 0.7,
        maxOutputTokens: 1000
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Gemini API error ${res.status}`);
    }

    if (!res.body) return;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.substring(6);
          try {
            const data = JSON.parse(jsonStr);
            const textPart = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textPart) {
              yield textPart;
            }
          } catch {}
        }
      }
    }
  }

  /**
   * Anthropic Claude SSE Stream
   */
  private static async *streamAnthropic(
    config: LLMProviderConfig,
    model: string,
    systemPrompt: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    userPrompt: string
  ): AsyncGenerator<string, void, unknown> {
    const apiKey = config.apiKey?.trim();
    if (!apiKey) throw new Error('Anthropic API key is required');

    const messages = [
      ...history.map((h) => ({
        role: h.role === 'assistant' ? 'assistant' : 'user',
        content: h.content
      })),
      { role: 'user', content: userPrompt }
    ];

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model,
        system: systemPrompt,
        messages,
        max_tokens: 1000,
        temperature: config.temperature ?? 0.7,
        stream: true
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Anthropic API error ${res.status}`);
    }

    if (!res.body) return;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.substring(6);
          try {
            const data = JSON.parse(jsonStr);
            if (data.type === 'content_block_delta' && data.delta?.type === 'text_delta') {
              yield data.delta.text;
            }
          } catch {}
        }
      }
    }
  }

  /**
   * OpenAI & OpenAI-Compatible (Ollama, Groq, DeepSeek, OpenRouter) SSE Stream
   */
  private static async *streamOpenAICompatible(
    config: LLMProviderConfig,
    model: string,
    systemPrompt: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    userPrompt: string
  ): AsyncGenerator<string, void, unknown> {
    let baseUrl = (
      config.baseUrl ||
      (config.provider === 'ollama' ? 'http://localhost:11434/v1' : 'https://api.openai.com/v1')
    ).trim();

    baseUrl = baseUrl.replace(/\/+$/, '');
    const endpoint = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey.trim()}`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((h) => ({
        role: h.role === 'assistant' ? 'assistant' : 'user',
        content: h.content
      })),
      { role: 'user', content: userPrompt }
    ];

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages,
        temperature: config.temperature ?? 0.7,
        stream: true
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || `${config.provider} error ${res.status}`);
    }

    if (!res.body) return;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.substring(6);
          if (jsonStr === '[DONE]') break;
          try {
            const data = JSON.parse(jsonStr);
            const delta = data.choices?.[0]?.delta?.content;
            if (delta) {
              yield delta;
            }
          } catch {}
        }
      }
    }
  }
}
