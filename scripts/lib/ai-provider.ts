import { z } from 'zod';
import { SWARM_CONFIG } from './config';

export interface AIProvider {
  generateText(prompt: string, systemPrompt?: string): Promise<string>;
  generateJSON<T>(prompt: string, schema: z.ZodSchema<T>, systemPrompt?: string): Promise<T>;
}

export class NvidiaProvider implements AIProvider {
  private apiKey: string;
  private model: string;
  private baseUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';

  constructor() {
    this.apiKey = SWARM_CONFIG.nvidiaApiKey;
    this.model = SWARM_CONFIG.models.nvidia;
    if (!this.apiKey) {
      console.warn('⚠️ NVIDIA_API_KEY is missing. NVIDIA provider will fail.');
    }
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      })
    });

    if (!response.ok) {
      throw new Error(`NVIDIA API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async generateJSON<T>(prompt: string, schema: z.ZodSchema<T>, systemPrompt?: string): Promise<T> {
    const jsonPrompt = `${prompt}\n\nIMPORTANT: You must respond ONLY with valid JSON. Do not include markdown code blocks or any other text.`;
    const text = await this.generateText(jsonPrompt, systemPrompt);
    
    try {
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanText);
      return schema.parse(parsed);
    } catch (e) {
      console.error('Failed to parse NVIDIA JSON response:', text);
      throw e;
    }
  }
}

export class FakerProvider implements AIProvider {
  // A simple fallback provider that doesn't use real AI, useful for fast stress testing
  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    return "This is a fallback generated text because Faker provider is being used.";
  }

  async generateJSON<T>(prompt: string, schema: z.ZodSchema<T>, systemPrompt?: string): Promise<T> {
    throw new Error('FakerProvider does not support arbitrary JSON generation. Use specific generator methods instead.');
  }
}

export function getAIProvider(providerName: 'nvidia' | 'openai' | 'faker'): AIProvider {
  switch (providerName) {
    case 'nvidia':
      return new NvidiaProvider();
    case 'faker':
    default:
      return new FakerProvider();
  }
}
