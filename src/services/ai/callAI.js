/**
 * MARIAM PRO  AI Call (one-shot, non-streaming)
 * Provider-agnostic: Anthropic, Gemini, OpenAI-compatible.
 */
import { buildGenerationSystemPrompt } from './generationPrompts.js';

/**
 * One-shot AI call. Returns the model's text response.
 * @param {string}  prompt
 * @param {boolean} expectJson   appends strict JSON instruction
 * @param {boolean} strictMode   tells the model to cite only document text
 * @param {object}  settings     { provider, apiKey, baseUrl, model }
 * @param {number}  maxTokens
 * @returns {Promise<string>}
 */
export const callAI = async (prompt, expectJson, strictMode, settings = {}, maxTokens = 5120) => {
  const { provider = 'anthropic', apiKey = '', baseUrl = '', model = '' } = settings;
  const sys = buildGenerationSystemPrompt(strictMode);
  const jsonSuffix = expectJson ? '\n\nRETURN ONLY RAW JSON. No markdown. No explanation. No backticks.' : '';
  const finalPrompt = prompt + jsonSuffix;

  if (provider === 'anthropic') {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(apiKey ? { 'x-api-key': apiKey } : {}) },
      body: JSON.stringify({
        model: model || 'claude-haiku-4-20250514',
        max_tokens: Math.min(maxTokens, 8192),
        system: sys,
        messages: [{ role: 'user', content: finalPrompt }],
      }),
    });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error?.message || r.statusText); }
    const d = await r.json();
    return d.content[0].text.trim();
  }

  if (provider === 'gemini') {
    if (!apiKey) throw new Error('Gemini API key required.');
    const mdl = model || 'gemini-2.0-flash-lite';
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(mdl)}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: sys }] },
        contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
        generationConfig: { maxOutputTokens: Math.min(maxTokens, 8192), temperature: strictMode ? 0 : 0.4 },
      }),
    });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error?.message || r.statusText); }
    const d = await r.json();
    return d.candidates[0].content.parts[0].text.trim();
  }

  // OpenAI-compatible (OpenAI, DeepSeek, Groq, Ollama, etc.)
  if (!apiKey) throw new Error('API key required  add it in Settings.');
  const base = (baseUrl || 'https://api.openai.com').replace(/\/$/, '');
  const r = await fetch(`${base}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: model || 'gpt-4o-mini',
      messages: [{ role: 'system', content: sys }, { role: 'user', content: finalPrompt }],
      max_tokens: Math.min(maxTokens, 8192),
      temperature: strictMode ? 0 : 0.4,
      ...(expectJson && provider === 'openai' ? { response_format: { type: 'json_object' } } : {}),
    }),
  });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error?.message || r.statusText); }
  const d = await r.json();
  return d.choices[0].message.content.trim();
};
