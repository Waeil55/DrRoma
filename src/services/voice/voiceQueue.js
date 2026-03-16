/**
 * MARIAM PRO — Voice Queue Manager
 * Manages queued utterances for sequential TTS playback.
 */
import { getProsodyEngine } from './speechSynthesis.js';

class VoiceQueue {
  constructor() {
    this._queue   = [];
    this._playing = false;
  }

  /** Add text to the queue and start playback if idle. */
  enqueue(text, callbacks = {}) {
    this._queue.push({ text, callbacks });
    if (!this._playing) this._processNext();
  }

  /** Clear all queued items and stop current speech. */
  clear() {
    this._queue = [];
    this._playing = false;
    const engine = getProsodyEngine();
    if (engine) engine.stop();
  }

  get length() { return this._queue.length; }
  get isPlaying() { return this._playing; }

  async _processNext() {
    if (!this._queue.length) {
      this._playing = false;
      return;
    }

    this._playing = true;
    const { text, callbacks } = this._queue.shift();
    const engine = getProsodyEngine();

    if (!engine) {
      callbacks.onError?.('ProsodyEngine not available');
      this._processNext();
      return;
    }

    try {
      await engine.speak(text, {
        onStart: callbacks.onStart,
        onEnd: () => {
          callbacks.onEnd?.();
          this._processNext();
        },
        onError: (e) => {
          callbacks.onError?.(e);
          this._processNext();
        },
        onBoundary: callbacks.onBoundary,
      });
    } catch {
      this._processNext();
    }
  }
}

let _instance = null;

export function getVoiceQueue() {
  if (!_instance) _instance = new VoiceQueue();
  return _instance;
}

export { VoiceQueue };
