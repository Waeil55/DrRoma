/**
 * MARIAM PRO — AI Vision Call
 * Supports Anthropic vision models and falls back for non-vision providers.
 */
import { callAI } from './callAI.js';

/**
 * AI call with image input.
 * @param {string} prompt
 * @param {string} imageBase64 - base64-encoded image data
 * @param {string} imageType   - MIME type (e.g. 'image/jpeg')
 * @param {object} settings
 * @param {number} maxTokens
 * @returns {Promise<string>}
 */
export const callAIWithVision = async (prompt, imageBase64, imageType, settings = {}, maxTokens = 4000) => {
  const { provider = 'anthropic', apiKey = '', model = '' } = settings;

  if (provider === 'anthropic') {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(apiKey ? { 'x-api-key': apiKey } : {}) },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-20250514',
        max_tokens: Math.min(maxTokens, 8192),
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: imageType, data: imageBase64 } },
            { type: 'text', text: prompt },
          ],
        }],
      }),
    });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error?.message || r.statusText); }
    const d = await r.json();
    return d.content[0].text.trim();
  }

  // Fallback for non-vision providers
  return callAI(`[Image file provided. Describe based on filename context]\n${prompt}`, false, false, settings, maxTokens);
};
