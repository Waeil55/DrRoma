/**
 * MARIAM PRO — AppProviders
 * All context providers and global initializations wrapped in one component.
 * Keeps the root App.jsx clean (~80 lines).
 */
import React, { useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore.js';

export default function AppProviders({ children }) {
  const fontScale = useSettingsStore(s => s.fontScale);
  const theme = useSettingsStore(s => s.theme);

  // Apply font-scale to :root whenever it changes
  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', String(fontScale));
  }, [fontScale]);

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <>{children}</>;
}
