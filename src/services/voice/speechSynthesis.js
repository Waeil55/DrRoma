/**
 * MARIAM PRO  ProsodyEngine
 * Rich text-to-speech with intelligent prosody, pauses, and filler words.
 * Uses Web Speech API (SpeechSynthesis)  no external dependency.
 */

/** Medical/educational vocal fillers inserted at natural pause points */
const VOICE_FILLERS = {
  thinking: ['Hmm, let me think about that...', "That's a great question...", "Let's see...", 'Good point, so...', 'Right, okay...'],
  confirming: ['Exactly!', "That's correct!", 'Perfect!', "You've got it!", 'Well done!'],
  correcting: ['Not quite  let me clarify...', "Almost, but here's the key difference...", 'Let me walk you through that again...'],
  transitioning: ['Now, moving on to...', 'Building on that...', "Here's something interesting...", "Let's take this further..."],
};

/** Punctuation  prosody mapping (pause, pitch, rate deltas) */
const PUNCTUATION_PROSODY = {
  '.':   { pauseMs: 350, pitchDelta: -0.08, rateDelta: -0.03 },
  '!':   { pauseMs: 250, pitchDelta: +0.05, rateDelta: +0.04 },
  '?':   { pauseMs: 300, pitchDelta: +0.12, rateDelta: -0.02 },
  ',':   { pauseMs: 150, pitchDelta: 0,     rateDelta: -0.02 },
  ':':   { pauseMs: 200, pitchDelta: -0.04, rateDelta: -0.03 },
  ';':   { pauseMs: 250, pitchDelta: -0.02, rateDelta: -0.02 },
  '':   { pauseMs: 220, pitchDelta: -0.02, rateDelta: -0.04 },
  '\n':  { pauseMs: 300, pitchDelta: 0,     rateDelta: 0 },
};

/** Paragraph/section heading pauses */
const HEADING_PAUSE = 600;

class ProsodyEngine {
  constructor() {
    this._synth     = window.speechSynthesis;
    this._voices    = [];
    this._currentUtterance = null;
    this._queue     = [];
    this._speaking  = false;
    this._rate      = 1.0;
    this._pitch     = 1.0;
    this._volume    = 1.0;
    this._voiceURI  = null;   // preferred voice URI from settings
    this._useFiller = false;  // inject filler words (educational mode)

    this._loadVoices();

    // Chrome fires voiceschanged asynchronously
    if (this._synth.onvoiceschanged !== undefined) {
      this._synth.onvoiceschanged = () => this._loadVoices();
    }
  }

  _loadVoices() {
    this._voices = this._synth.getVoices();
  }

  /** Apply settings from the app's settings object */
  configure({ rate = 1.0, pitch = 1.0, volume = 1.0, voiceURI = null, useFiller = false } = {}) {
    this._rate     = rate;
    this._pitch    = pitch;
    this._volume   = volume;
    this._voiceURI = voiceURI;
    this._useFiller= useFiller;
  }

  /** Select the best available voice for a given language (priority-ordered) */
  _pickVoice(lang = 'en') {
    if (this._voiceURI) {
      const explicit = this._voices.find(v => v.voiceURI === this._voiceURI);
      if (explicit) return explicit;
    }
    // Priority order per spec: Neural > Premium > Enhanced > Google > Apple HQ > non-local > any > fallback
    const langVoices = this._voices.filter(v => v.lang.startsWith(lang));
    return (
      langVoices.find(v => /neural/i.test(v.name)) ||
      langVoices.find(v => /premium/i.test(v.name)) ||
      langVoices.find(v => /enhanced/i.test(v.name)) ||
      langVoices.find(v => /google/i.test(v.name)) ||
      langVoices.find(v => /samantha|karen|moira/i.test(v.name)) ||
      langVoices.find(v => !v.localService) ||
      langVoices[0] ||
      this._voices[0] ||
      null
    );
  }

  /** Load the best voice asynchronously (handles Chrome delayed voice loading) */
  loadBestVoice(lang = 'en') {
    return new Promise((resolve) => {
      const voices = this._synth.getVoices();
      if (voices.length > 0) {
        this._voices = voices;
        resolve(this._pickVoice(lang));
        return;
      }
      const handler = () => {
        this._voices = this._synth.getVoices();
        resolve(this._pickVoice(lang));
      };
      this._synth.addEventListener('voiceschanged', handler, { once: true });
    });
  }

  /**
   * Pre-process text to add natural prosody cues.
   * Returns an array of { text, pauseAfter } segments.
   */
  _buildSegments(rawText) {
    if (!rawText) return [];

    // Strip markdown bold/italic/code markers
    let text = rawText
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g,     '$1')
      .replace(/`([^`]+)`/g,     '$1')
      .replace(/#{1,6}\s/g,      '')
      .trim();

    const segments = [];
    let buffer = '';

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      buffer += ch;

      const prosody = PUNCTUATION_PROSODY[ch];
      if (prosody) {
        segments.push({ text: buffer.trim(), pauseAfter: prosody.pauseMs, pitchDelta: prosody.pitchDelta, rateDelta: prosody.rateDelta });
        buffer = '';
      }
    }
    if (buffer.trim()) {
      segments.push({ text: buffer.trim(), pauseAfter: 0, pitchDelta: 0, rateDelta: 0 });
    }

    // Optionally inject filler words at paragraph boundaries
    if (this._useFiller && segments.length > 3) {
      const insertAt = Math.floor(segments.length / 3);
      const fillers = VOICE_FILLERS.transitioning;
      const filler = fillers[Math.floor(Math.random() * fillers.length)];
      segments[insertAt].text = filler + ' ' + segments[insertAt].text;
    }

    return segments;
  }

  /** Create a SpeechSynthesisUtterance from a segment with prosody deltas */
  _makeUtterance(text, pitchDelta = 0, rateDelta = 0) {
    const utt    = new SpeechSynthesisUtterance(text);
    utt.rate     = Math.max(0.5, Math.min(1.8, this._rate + rateDelta + (Math.random() * 0.04 - 0.02)));
    utt.pitch    = Math.max(0.5, Math.min(2.0, this._pitch + pitchDelta));
    utt.volume   = Math.max(0, Math.min(1, this._volume));
    const voice  = this._pickVoice();
    if (voice) utt.voice = voice;
    return utt;
  }

  /**
   * Speak text with full prosody processing.
   * @param {string}   text
   * @param {object}  [callbacks] - { onStart, onEnd, onError, onBoundary }
   * @returns {Promise<void>}
   */
  speak(text, callbacks = {}) {
    this.stop();

    return new Promise((resolve, reject) => {
      const segments = this._buildSegments(text);
      if (!segments.length) { resolve(); return; }

      let idx = 0;

      const next = () => {
        if (idx >= segments.length) {
          this._speaking = false;
          callbacks.onEnd?.();
          resolve();
          return;
        }

        const { text: segText, pauseAfter, pitchDelta = 0, rateDelta = 0 } = segments[idx++];
        if (!segText) { next(); return; }

        const utt = this._makeUtterance(segText, pitchDelta, rateDelta);
        utt.onstart     = idx === 1 ? () => { this._speaking = true; callbacks.onStart?.(); } : null;
        utt.onboundary  = callbacks.onBoundary || null;
        utt.onerror     = (e) => { this._speaking = false; callbacks.onError?.(e); reject(e); };
        utt.onend       = () => {
          if (pauseAfter > 0) {
            setTimeout(next, pauseAfter);
          } else {
            next();
          }
        };

        this._currentUtterance = utt;
        this._synth.speak(utt);
      };

      next();
    });
  }

  /** Stop speaking immediately */
  stop() {
    if (this._synth.speaking || this._synth.pending) {
      this._synth.cancel();
    }
    this._speaking = false;
    this._currentUtterance = null;
  }

  /** Interrupt immediately (called when user starts speaking) */
  interrupt() {
    this._speaking = false;
    this._synth.cancel();
    this._currentUtterance = null;
    this._onInterruptCallback?.();
  }

  /** Register an interrupt callback */
  set onInterrupt(fn) { this._onInterruptCallback = fn; }

  /** Alias for speak()  matches Phase 4 spec naming */
  speakWithProsody(text, callbacks) {
    return this.speak(text, callbacks);
  }

  /** Pause speech */
  pause() {
    if (this._synth.speaking) this._synth.pause();
  }

  /** Resume speech */
  resume() {
    if (this._synth.paused) this._synth.resume();
  }

  get isSpeaking() { return this._synth.speaking; }
  get isPaused()   { return this._synth.paused;   }

  /** Get available voice list for settings UI */
  getVoices(lang = 'en') {
    return this._voices.filter(v => !lang || v.lang.startsWith(lang));
  }
}

//  Singleton export 
let _instance = null;

export function getProsodyEngine() {
  if (!_instance && typeof window !== 'undefined' && window.speechSynthesis) {
    _instance = new ProsodyEngine();
  }
  return _instance;
}

/** Legacy shim  drop-in replacement for the old speakText(text) function */
export function speakText(text) {
  const engine = getProsodyEngine();
  if (!engine) return;
  engine.speak(text);
}

export default ProsodyEngine;
