/**
 * MARIAM PRO — FullDuplexVoiceManager
 * Speech recognition + live transcription using Web Speech API.
 * Supports continuous/interruptible capture and silence detection.
 */

const SILENCE_TIMEOUT_MS = 2500;   // stop after 2.5s of silence
const MAX_RECORD_MS      = 120000; // hard cap: 2 minutes

class FullDuplexVoiceManager {
  constructor() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this._supported = false;
      return;
    }

    this._supported   = true;
    this._recognition = new SpeechRecognition();
    this._recognition.continuous    = true;
    this._recognition.interimResults= true;
    this._recognition.lang          = 'en-US';
    this._recognition.maxAlternatives = 1;

    this._listening     = false;
    this._finalText     = '';
    this._interimText   = '';
    this._silenceTimer  = null;
    this._hardCapTimer  = null;

    this._onInterim  = null;  // (text) => void
    this._onFinal    = null;  // (text) => void
    this._onError    = null;  // (err)  => void
    this._onStart    = null;
    this._onEnd      = null;
    this._onSilence  = null;

    this._bindEvents();
  }

  get isSupported() { return this._supported; }
  get isListening()  { return this._listening; }

  _bindEvents() {
    const rec = this._recognition;

    rec.onstart = () => {
      this._listening = true;
      this._finalText   = '';
      this._interimText = '';
      this._onStart?.();
    };

    rec.onresult = (event) => {
      let interim = '';
      let final   = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }

      if (final) {
        this._finalText  += final + ' ';
        this._onFinal?.(this._finalText.trim());
      }

      if (interim) {
        this._interimText = interim;
        this._onInterim?.(this._finalText + interim);
      }

      // Reset silence timer on any speech activity
      this._resetSilenceTimer();
    };

    rec.onerror = (event) => {
      if (event.error === 'no-speech') {
        // Treat as silence rather than an error
        this._silenceTriggered();
        return;
      }
      this._onError?.(event.error);
      this._cleanup();
    };

    rec.onend = () => {
      if (this._listening) {
        // Browser stopped unexpectedly — restart if still supposed to listen
        try { rec.start(); } catch (_) { this._cleanup(); }
      }
    };
  }

  _resetSilenceTimer() {
    clearTimeout(this._silenceTimer);
    this._silenceTimer = setTimeout(() => this._silenceTriggered(), SILENCE_TIMEOUT_MS);
  }

  _silenceTriggered() {
    this._onSilence?.();
    this.stop();
  }

  _cleanup() {
    clearTimeout(this._silenceTimer);
    clearTimeout(this._hardCapTimer);
    this._listening = false;
    this._onEnd?.();
  }

  /**
   * Start listening.
   * @param {object} callbacks - { onInterim, onFinal, onError, onStart, onEnd, onSilence }
   * @param {object} [opts]    - { lang, silenceTimeout, continuous }
   */
  start(callbacks = {}, opts = {}) {
    if (!this._supported) {
      callbacks.onError?.('speech_recognition_unsupported');
      return;
    }
    if (this._listening) this.stop();

    this._onInterim = callbacks.onInterim || null;
    this._onFinal   = callbacks.onFinal   || null;
    this._onError   = callbacks.onError   || null;
    this._onStart   = callbacks.onStart   || null;
    this._onEnd     = callbacks.onEnd     || null;
    this._onSilence = callbacks.onSilence || null;

    if (opts.lang)        this._recognition.lang       = opts.lang;
    if (opts.continuous !== undefined)
      this._recognition.continuous = opts.continuous;

    this._finalText   = '';
    this._interimText = '';

    try {
      this._recognition.start();
    } catch (e) {
      callbacks.onError?.(e.message);
      return;
    }

    const silenceMs = opts.silenceTimeout ?? SILENCE_TIMEOUT_MS;
    this._silenceTimer = setTimeout(() => this._silenceTriggered(), silenceMs);

    this._hardCapTimer = setTimeout(() => {
      if (this._listening) { this._onSilence?.(); this.stop(); }
    }, MAX_RECORD_MS);
  }

  /** Stop listening and fire onEnd */
  stop() {
    if (!this._listening) return;
    this._listening = false;
    try { this._recognition.stop(); } catch (_) {}
    this._cleanup();
  }

  /** Get the accumulated final transcript */
  get transcript() {
    return this._finalText.trim();
  }
}

// ── Singleton export ──────────────────────────────────────────────────
let _instance = null;

export function getVoiceManager() {
  if (!_instance && typeof window !== 'undefined') {
    _instance = new FullDuplexVoiceManager();
  }
  return _instance;
}

export default FullDuplexVoiceManager;
