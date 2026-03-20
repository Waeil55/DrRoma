/**
 * MARIAM PRO  useVoice Hook
 * Wraps ProsodyEngine for React components.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { getProsodyEngine, speakText } from '../services/voice/speechSynthesis.js';

export function useVoice() {
  const [speaking, setSpeaking] = useState(false);
  const engineRef = useRef(null);

  useEffect(() => {
    engineRef.current = getProsodyEngine();
  }, []);

  const speak = useCallback((text, opts = {}) => {
    const engine = engineRef.current || getProsodyEngine();
    if (engine) {
      if (opts.rate || opts.pitch || opts.voiceURI) engine.configure(opts);
      setSpeaking(true);
      engine.speak(text, {
        onEnd: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    } else {
      speakText(text);
    }
  }, []);

  const stop = useCallback(() => {
    const engine = engineRef.current || getProsodyEngine();
    if (engine) engine.stop();
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking };
}
