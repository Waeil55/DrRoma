/**
 * MARIAM PRO — Settings Store
 */
import { createStore } from './createStore.js';

export const DEFAULT_SETTINGS = {
  provider: 'anthropic',
  apiKey: '',
  baseUrl: '',
  model: '',
  strictMode: false,
  theme: 'dark',
  fontSize: 'medium',
  accentColor: 'blue',
  lineSpacing: 'normal',
  cardStyle: 'comfortable',
  animations: true,
  compactSidebar: false,
  fontScale: 1,
  voiceRate: 1.0,
  voicePitch: 1.0,
  voiceURI: null,
  notificationsEnabled: false,
  dailyGoalCards: 20,
  dailyGoalChapters: 1,
};

export const useSettingsStore = createStore({
  ...DEFAULT_SETTINGS,

  updateSettings: (partial) => useSettingsStore.setState(partial),

  setTheme: (theme) => useSettingsStore.setState({ theme }),
  setProvider: (provider) => useSettingsStore.setState({ provider }),
  setFontScale: (fontScale) => {
    useSettingsStore.setState({ fontScale });
    document.documentElement.style.setProperty('--font-scale', String(fontScale));
  },
});
