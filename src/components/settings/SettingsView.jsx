/**
 * MARIAM PRO — SettingsView Component
 * Full settings page: AI provider, themes, appearance, generation.
 */
import React, { useState } from 'react';
import {
  Settings, Globe, AlertCircle, CheckCircle2, KeyRound, Zap,
  Palette, Sun, CloudSun, Flame, Heart, Leaf, Moon, Layers,
  Layout, Brain, Download, Smartphone
} from 'lucide-react';
import { callAIStreaming } from '../../services/ai/callAIStreaming';

const MARIAM_IMG = 'https://raw.githubusercontent.com/Waeil55/DrMariam/main/M.jpeg';
const APP_VER = 'v6.0';

const PROVIDERS = {
  anthropic: { label: 'Claude (Anthropic)', note: 'Works built-in — no API key needed in Claude artifacts.', needsKey: false, defaultModel: 'claude-sonnet-4-20250514', baseUrl: '' },
  openai: { label: 'OpenAI (GPT)', note: 'Requires an OpenAI API key.', needsKey: true, defaultModel: 'gpt-4o-mini', baseUrl: 'https://api.openai.com' },
  gemini: { label: 'Google Gemini', note: 'Requires a Google AI Studio API key.', needsKey: true, defaultModel: 'gemini-2.0-flash', baseUrl: '' },
  deepseek: { label: 'DeepSeek', note: 'Requires a DeepSeek API key.', needsKey: true, defaultModel: 'deepseek-chat', baseUrl: 'https://api.deepseek.com' },
  groq: { label: 'Groq (Ultra-fast)', note: 'Requires a Groq API key. Blazing fast inference.', needsKey: true, defaultModel: 'llama-3.3-70b-versatile', baseUrl: 'https://api.groq.com/openai' },
  ollama: { label: 'Ollama (Local)', note: 'Local inference — no API key needed.', needsKey: false, defaultModel: 'llama3', baseUrl: 'http://localhost:11434/v1' },
  custom: { label: 'Custom API', note: 'Any OpenAI-compatible endpoint.', needsKey: true, defaultModel: '', baseUrl: '' },
};

export { PROVIDERS };

export default function SettingsView({ settings, setSettings, installPrompt, onInstall }) {
  const pr = PROVIDERS[settings.provider] || PROVIDERS.anthropic;
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [editingKey, setEditingKey] = useState(false);
  const [keyDraft, setKeyDraft] = useState('');

  const testConnection = async () => {
    setTesting(true); setTestResult(null);
    const t0 = Date.now();
    try {
      let text = '';
      await callAIStreaming('Reply with exactly one word: OK', chunk => { text += chunk; }, settings, 200);
      setTestResult({ ok: true, ms: Date.now() - t0, text: text.trim().slice(0, 40) });
    } catch (e) {
      setTestResult({ ok: false, ms: Date.now() - t0, err: e.message });
    }
    setTesting(false);
  };

  const themes = [
    { id: 'pure-white', label: 'White', icon: Sun, desc: 'Clean & bright' },
    { id: 'light', label: 'Soft Blue', icon: CloudSun, desc: 'Gentle blue tint' },
    { id: 'warm', label: 'Warm', icon: Flame, desc: 'Cozy amber tone' },
    { id: 'rose', label: 'Rose', icon: Heart, desc: 'Soft pink glow' },
    { id: 'forest', label: 'Forest', icon: Leaf, desc: 'Natural greens' },
    { id: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on eyes' },
    { id: 'slate', label: 'Slate', icon: Layers, desc: 'Modern grey' },
    { id: 'oled', label: 'OLED', icon: Zap, desc: 'Pure black' },
  ];
  const accents = [
    { id: 'indigo', hex: '#5046e5', label: 'Indigo' },
    { id: 'purple', hex: '#9333ea', label: 'Purple' },
    { id: 'blue', hex: '#2563eb', label: 'Blue' },
    { id: 'emerald', hex: '#059669', label: 'Emerald' },
    { id: 'rose', hex: '#e11d48', label: 'Rose' },
    { id: 'amber', hex: '#d97706', label: 'Amber' },
    { id: 'cyan', hex: '#0891b2', label: 'Cyan' },
    { id: 'teal', hex: '#0d9488', label: 'Teal' },
  ];
  const sizes = [
    { id: 'small', label: 'S', px: 14 }, { id: 'medium', label: 'M', px: 16 },
    { id: 'large', label: 'L', px: 20 }, { id: 'xl', label: 'XL', px: 23 },
    { id: 'xxl', label: 'XXL', px: 26 },
  ];

  const changeProvider = p => {
    const provInfo = PROVIDERS[p];
    setSettings(s => ({ ...s, provider: p, baseUrl: provInfo.baseUrl, model: provInfo.defaultModel }));
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-content"
      style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}>
      <div className="w-full p-6 lg:p-8 space-y-6">
        <h1 className="text-3xl font-black flex items-center gap-3 mb-6">
          <Settings size={28} className="opacity-40" /> Settings
        </h1>

        {/* Install PWA */}
        {installPrompt && (
          <section className="glass rounded-2xl p-5 border border-[var(--accent)]/30 bg-[var(--accent)]/5">
            <h2 className="font-black text-sm mb-2 flex items-center gap-2 text-[var(--accent)]"><Smartphone size={16} /> Install as App</h2>
            <p className="text-xs opacity-60 mb-4">Install MARIAM PRO on your device for offline access, faster loading, and a native app experience.</p>
            <button onClick={onInstall} className="btn-accent px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg">
              <Download size={18} /> Install Now
            </button>
          </section>
        )}

        {/* AI Provider */}
        <section className="glass rounded-2xl p-5">
          <h2 className="font-black text-sm mb-4 flex items-center gap-2 opacity-70"><Globe size={16} /> AI Provider</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {Object.entries(PROVIDERS).map(([id, { label }]) => (
              <button key={id} onClick={() => changeProvider(id)}
                className={`py-2.5 px-2 rounded-xl text-xs font-black leading-tight transition-all border
                  ${settings.provider === id ? 'bg-[var(--accent)] text-white border-transparent shadow-md scale-105' : 'glass opacity-60 hover:opacity-100 border-[color:var(--border2,var(--border))]'}`}>
                {label.split(' ')[0]}<br /><span className="opacity-70 font-normal normal-case text-xs">{label.split(' ').slice(1).join(' ')}</span>
              </button>
            ))}
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl mb-4 text-xs font-medium"
            style={pr.needsKey
              ? { background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', color: 'var(--warning)' }
              : { background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success)' }}>
            {pr.needsKey ? <AlertCircle size={18} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={14} className="shrink-0 mt-0.5" />}
            {pr.note}
          </div>
          {pr.needsKey && (
            <div className="mb-3">
              <label className="text-xs font-black uppercase tracking-widest opacity-40 block mb-1.5 flex items-center gap-1">
                <KeyRound size={10} />API Key
              </label>
              {settings.apiKey && !editingKey ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 glass rounded-xl px-4 py-3 font-mono text-xs border border-[color:var(--border2,var(--border))] text-[var(--text)] flex items-center gap-2">
                    <span className="opacity-50">sk-…</span>
                    <span>{settings.apiKey.slice(-8)}</span>
                  </div>
                  <button onClick={() => { setEditingKey(true); setKeyDraft(''); }}
                    className="glass px-3 py-2.5 rounded-xl text-xs font-black border border-[color:var(--border2,var(--border))] opacity-70 hover:opacity-100">Edit</button>
                  <button onClick={() => { setSettings(s => ({ ...s, apiKey: '' })); setTestResult(null); }}
                    className="glass px-3 py-2.5 rounded-xl text-xs font-black border border-[color:var(--border2,var(--border))] opacity-70 hover:opacity-100 text-[var(--danger)]">Clear</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input type={showKey ? 'text' : 'password'}
                    placeholder="Paste your API key…"
                    value={editingKey ? keyDraft : (settings.apiKey || '')}
                    onChange={e => editingKey ? setKeyDraft(e.target.value) : setSettings(s => ({ ...s, apiKey: e.target.value }))}
                    className="flex-1 glass rounded-xl px-4 py-3 font-mono text-xs outline-none focus:border-[var(--accent)] border border-[color:var(--border2,var(--border))] text-[var(--text)]"
                    autoComplete="off" />
                  <button onClick={() => setShowKey(v => !v)}
                    className="glass px-3 py-2.5 rounded-xl text-xs font-black border border-[color:var(--border2,var(--border))] opacity-70 hover:opacity-100">
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                  {editingKey && (
                    <button onClick={() => { if (keyDraft.trim()) setSettings(s => ({ ...s, apiKey: keyDraft.trim() })); setEditingKey(false); setTestResult(null); }}
                      className="glass px-3 py-2.5 rounded-xl text-xs font-black border border-[var(--accent)] text-[var(--accent)]">Save</button>
                  )}
                </div>
              )}
              <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                <button onClick={testConnection} disabled={testing || !settings.apiKey}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all border border-[color:var(--border2,var(--border))] glass opacity-80 hover:opacity-100 disabled:opacity-40">
                  {testing ? <div className="w-3 h-3 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" /> : <Zap size={11} />}
                  {testing ? 'Testing…' : 'Test Connection'}
                </button>
                {testResult && (
                  <span className={`text-xs font-bold flex items-center gap-1 ${testResult.ok ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                    {testResult.ok ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {testResult.ok ? `OK · ${testResult.ms}ms` : testResult.err?.slice(0, 60)}
                  </span>
                )}
              </div>
            </div>
          )}
          {(settings.provider === 'custom' || settings.provider === 'ollama') && (
            <div className="mb-3">
              <label className="text-xs font-black uppercase tracking-widest opacity-40 block mb-1.5">Base URL</label>
              <input type="text" placeholder="https://your-api.com" value={settings.baseUrl || ''}
                onChange={e => setSettings(s => ({ ...s, baseUrl: e.target.value }))}
                className="w-full glass rounded-xl px-4 py-3 font-mono text-xs outline-none focus:border-[var(--accent)] border border-[color:var(--border2,var(--border))] text-[var(--text)]" />
            </div>
          )}
          <div>
            <label className="text-xs font-black uppercase tracking-widest opacity-40 block mb-1.5">Model (optional)</label>
            <input type="text" placeholder={pr.defaultModel || 'e.g. gpt-4o'} value={settings.model || ''}
              onChange={e => setSettings(s => ({ ...s, model: e.target.value }))}
              className="w-full glass rounded-xl px-4 py-3 font-mono text-xs outline-none focus:border-[var(--accent)] border border-[color:var(--border2,var(--border))] text-[var(--text)]" />
          </div>
        </section>

        {/* Theme */}
        <section className="glass rounded-2xl p-5">
          <h2 className="font-black text-sm mb-4 flex items-center gap-2 opacity-70"><Palette size={16} /> Appearance</h2>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {themes.map(t => (
              <button key={t.id} onClick={() => setSettings({ ...settings, theme: t.id })}
                className="py-3 px-2 flex flex-col items-center gap-1.5 rounded-xl text-xs font-black border transition-all"
                style={settings.theme === t.id
                  ? { background: 'linear-gradient(135deg,rgba(var(--acc-rgb,99,102,241),.18),rgba(var(--acc-rgb,99,102,241),.08))', borderColor: 'rgba(var(--acc-rgb,99,102,241),.4)', color: 'var(--accent)', boxShadow: '0 4px 16px rgba(var(--acc-rgb,99,102,241),.18)' }
                  : { background: 'var(--surface2,var(--card))', borderColor: 'var(--border)', opacity: .7 }}>
                <t.icon size={18} /><span>{t.label}</span>
                {t.desc && <span style={{ fontSize: 9, fontWeight: 500, opacity: .6 }}>{t.desc}</span>}
              </button>
            ))}
          </div>
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text3)', opacity: .7 }}>Accent Color</p>
            <div className="flex flex-wrap gap-2">
              {accents.map(a => (
                <button key={a.id} onClick={() => setSettings({ ...settings, accentColor: a.id })} title={a.label} className="flex flex-col items-center gap-1 transition-all">
                  <div className="w-8 h-8 rounded-xl transition-all flex items-center justify-center"
                    style={{ background: a.hex, boxShadow: settings.accentColor === a.id ? `0 0 0 3px rgba(255,255,255,.5), 0 0 0 5px ${a.hex}` : undefined, transform: settings.accentColor === a.id ? 'scale(1.2)' : 'scale(1)' }}>
                    {settings.accentColor === a.id && <CheckCircle2 size={14} className="text-white" />}
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text3)', opacity: .7 }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-widest block mb-2" style={{ color: 'var(--text3)', opacity: .7 }}>Font Size</span>
            <div className="flex gap-1.5 glass rounded-xl p-1.5 mb-3">
              {sizes.map(sz => (
                <button key={sz.id} onClick={() => setSettings({ ...settings, fontSize: sz.id })}
                  className="flex-1 py-2 rounded-lg font-black transition-all text-sm"
                  style={settings.fontSize === sz.id ? { background: 'var(--accent)', color: '#fff' } : { opacity: .6 }}>
                  {sz.label}<span style={{ fontSize: 9, display: 'block', opacity: .7 }}>{sz.px}px</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs opacity-40 font-black w-5 text-right shrink-0">A</span>
              <input type="range" min="0.75" max="1.4" step="0.05"
                value={settings.fontScale || 1}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  document.documentElement.style.setProperty('--font-scale', String(val));
                  setSettings(s => ({ ...s, fontScale: val }));
                }}
                className="flex-1 accent-[var(--accent)] h-1.5 rounded-full" />
              <span className="text-base opacity-40 font-black w-5 shrink-0">A</span>
              <span className="text-xs font-mono opacity-50 w-8 shrink-0">{Math.round((settings.fontScale || 1) * 100)}%</span>
            </div>
          </div>
        </section>

        {/* Display */}
        <section className="glass rounded-2xl p-5">
          <h2 className="font-black text-sm mb-4 flex items-center gap-2 opacity-70"><Layout size={16} /> Display &amp; Layout</h2>
          <div className="mb-5">
            <span className="text-xs font-black uppercase tracking-widest block mb-2" style={{ color: 'var(--text3)', opacity: .7 }}>Line Spacing</span>
            <div className="flex gap-1.5 glass rounded-xl p-1.5">
              {[['compact', 'Compact', 1.4], ['normal', 'Normal', 1.7], ['relaxed', 'Relaxed', 2.0], ['loose', 'Loose', 2.4]].map(([id, label, lh]) => (
                <button key={id} onClick={() => setSettings(s => ({ ...s, lineSpacing: id }))}
                  className="flex-1 py-2 rounded-lg font-black transition-all text-xs"
                  style={(settings.lineSpacing || 'normal') === id ? { background: 'var(--accent)', color: '#fff' } : { opacity: .6 }}>
                  {label}<span style={{ fontSize: 8, display: 'block', opacity: .7 }}>×{lh}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mb-5">
            <span className="text-xs font-black uppercase tracking-widest block mb-2" style={{ color: 'var(--text3)', opacity: .7 }}>Card / Panel Density</span>
            <div className="flex gap-1.5 glass rounded-xl p-1.5">
              {[['compact', 'Compact'], ['comfortable', 'Comfortable'], ['spacious', 'Spacious']].map(([id, label]) => (
                <button key={id} onClick={() => setSettings(s => ({ ...s, cardStyle: id }))}
                  className="flex-1 py-2.5 rounded-lg font-black transition-all text-xs"
                  style={(settings.cardStyle || 'comfortable') === id ? { background: 'var(--accent)', color: '#fff' } : { opacity: .6 }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center justify-between cursor-pointer mb-5">
            <div>
              <p className="text-xs font-black">Animations &amp; Transitions</p>
              <p className="text-xs opacity-40 mt-0.5">Smooth motion effects throughout the app</p>
            </div>
            <div onClick={() => setSettings(s => ({ ...s, animations: !s.animations }))}
              className="w-12 h-6 rounded-full transition-all cursor-pointer relative flex items-center px-1"
              style={{ background: settings.animations !== false ? 'var(--accent)' : 'var(--border)' }}>
              <div className="w-4 h-4 bg-white rounded-full shadow transition-all"
                style={{ transform: settings.animations !== false ? 'translateX(24px)' : 'translateX(0)' }} />
            </div>
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-xs font-black">Compact Sidebar</p>
              <p className="text-xs opacity-40 mt-0.5">Show icons only, hide labels</p>
            </div>
            <div onClick={() => setSettings(s => ({ ...s, compactSidebar: !s.compactSidebar }))}
              className="w-12 h-6 rounded-full transition-all cursor-pointer relative flex items-center px-1"
              style={{ background: settings.compactSidebar ? 'var(--accent)' : 'var(--border)' }}>
              <div className="w-4 h-4 bg-white rounded-full shadow transition-all"
                style={{ transform: settings.compactSidebar ? 'translateX(24px)' : 'translateX(0)' }} />
            </div>
          </label>
        </section>

        {/* Generation */}
        <section className="glass rounded-2xl p-5">
          <h2 className="font-black text-sm mb-4 flex items-center gap-2 opacity-70"><Brain size={16} /> Generation</h2>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-xs font-bold">Strict Mode</span>
              <p className="text-xs opacity-50 mt-0.5">Use ONLY document text, no outside knowledge</p>
            </div>
            <div onClick={() => setSettings(s => ({ ...s, strictMode: !s.strictMode }))}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${settings.strictMode ? 'bg-[var(--accent)]' : 'bg-gray-300 dark:bg-zinc-600'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.strictMode ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
          </label>
        </section>

        {/* About */}
        <section className="glass rounded-2xl p-5 text-center">
          <img src={MARIAM_IMG} className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3 shadow-lg" alt="MARIAM" />
          <h3 className="font-black text-sm">MARIAM PRO {APP_VER}</h3>
          <p className="text-xs opacity-40 mt-1">Universal AI Document Intelligence</p>
          <div className="flex justify-center gap-3 mt-3 text-xs font-black uppercase tracking-widest opacity-30">
            <span>PDF · Word · Excel · Images · Code</span>
          </div>
        </section>
      </div>
    </div>
  );
}
