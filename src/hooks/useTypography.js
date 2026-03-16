/**
 * MARIAM PRO — useTypography Hook
 * Font-scale management synced to document root.
 */
import { useCallback } from 'react';
import { useSettingsStore } from '../store/useSettingsStore.js';

export function useTypography() {
  const fontScale = useSettingsStore(s => s.fontScale);
  const setFontScale = useSettingsStore(s => s.setFontScale);

  const increase = useCallback(() => {
    const next = Math.min((fontScale || 1) + 0.05, 1.5);
    setFontScale(next);
  }, [fontScale, setFontScale]);

  const decrease = useCallback(() => {
    const next = Math.max((fontScale || 1) - 0.05, 0.7);
    setFontScale(next);
  }, [fontScale, setFontScale]);

  const reset = useCallback(() => {
    setFontScale(1);
  }, [setFontScale]);

  return { fontScale, increase, decrease, reset, setFontScale };
}
