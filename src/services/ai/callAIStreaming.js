/**
 * MARIAM PRO  AI Streaming Call
 * Handles SSE streaming from Anthropic + fallback typing effect for other providers.
 * Includes safe chunk buffer that handles fragmented JSON, code blocks, and tables.
 */
import { callAI } from './callAI.js';

/**
 * Parse an SSE buffer into events, handling fragmented JSON across TCP packets.
 * @param {string} buffer - accumulated raw SSE data
 * @param {string} provider - 'anthropic' | 'openai' etc.
 * @returns {{ events: Array<{type:string, text?:string}>, remaining: string }}
 */
export function parseSSEBuffer(buffer, provider = 'anthropic') {
  const lines = buffer.split('\n');
  const events = [];
  // Last element may be incomplete  carry over
  const remaining = lines.pop() ?? '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data: ')) continue;
    const data = trimmed.slice(6).trim();
    if (data === '[DONE]') { events.push({ type: 'done' }); continue; }

    try {
      const parsed = JSON.parse(data);
      // Anthropic format
      if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
        events.push({ type: 'text', text: parsed.delta.text });
      }
      // OpenAI format
      if (parsed.choices?.[0]?.delta?.content) {
        events.push({ type: 'text', text: parsed.choices[0].delta.content });
      }
    } catch {
      // Malformed JSON  append to remaining for next read
    }
  }

  return { events, remaining };
}

/**
 * Safe streaming buffer: prevents calling onChunk with incomplete
 * markdown structures (code blocks, tables).
 */
class StreamBuffer {
  constructor(onChunk) {
    this._onChunk = onChunk;
    this._buffer = '';
    this._isInsideCodeBlock = false;
    this._isInsideTable = false;
  }

  push(newText) {
    this._buffer += newText;

    // Count code fence markers to detect open code blocks
    const fences = (this._buffer.match(/```/g) || []).length;
    this._isInsideCodeBlock = fences % 2 !== 0;

    // Detect open table by checking if last non-empty line starts with |
    const lines = this._buffer.split('\n');
    const lastNonEmpty = lines.filter(l => l.trim()).pop() || '';
    this._isInsideTable = lastNonEmpty.trim().startsWith('|') && !lastNonEmpty.trim().endsWith('|');

    // If inside a code block or table, wait for the closing marker
    if (this._isInsideCodeBlock || this._isInsideTable) return;

    const lastNewline = this._buffer.lastIndexOf('\n');
    if (lastNewline < 0) return;

    const safeContent = this._buffer.slice(0, lastNewline + 1);
    if (safeContent) this._onChunk(safeContent);
  }

  flush() {
    if (this._buffer) this._onChunk(this._buffer);
    this._buffer = '';
  }
}

/** Simulates streaming by revealing text progressively. */
const streamTextAsTyping = async (fullText, onChunk, speedMs = 12) => {
  const text = String(fullText || '');
  if (!text) { onChunk(''); return ''; }
  let rendered = '';
  let i = 0;
  while (i < text.length) {
    const chunkLen = text[i] === '\n' ? 1 : Math.max(2, Math.min(8, Math.floor(Math.random() * 6) + 2));
    rendered += text.slice(i, i + chunkLen);
    i += chunkLen;
    onChunk(rendered);
    await new Promise(r => setTimeout(r, speedMs));
  }
  return rendered;
};

/**
 * Streaming AI call. Streams text via onChunk callback.
 * @param {string}   prompt
 * @param {Function} onChunk  - called with accumulated text on each delta
 * @param {object}   settings - { provider, apiKey, model }
 * @param {number}   maxTokens
 * @returns {Promise<string>} - final complete text
 */
export const callAIStreaming = async (prompt, onChunk, settings = {}, maxTokens = 4000) => {
  const { provider = 'anthropic', apiKey = '', model = '' } = settings;

  // Non-streaming providers: simulate streaming with typing effect
  if (provider !== 'anthropic') {
    const full = await callAI(prompt, false, false, settings, maxTokens);
    await streamTextAsTyping(full, onChunk, 10);
    return full;
  }

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(apiKey ? { 'x-api-key': apiKey } : {}) },
    body: JSON.stringify({
      model: model || 'claude-sonnet-4-20250514',
      max_tokens: Math.min(maxTokens, 8192),
      stream: true,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error(e.error?.message || r.statusText);
  }

  const reader  = r.body.getReader();
  const decoder = new TextDecoder();
  let text      = '';
  let remainder = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const raw = remainder + decoder.decode(value, { stream: true });
    const { events, remaining } = parseSSEBuffer(raw, 'anthropic');
    remainder = remaining;

    for (const evt of events) {
      if (evt.type === 'text') {
        text += evt.text;
        onChunk(text);
      }
    }
  }

  return text;
};
