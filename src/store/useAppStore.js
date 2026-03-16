/**
 * MARIAM PRO — Global App Store
 * Replaces ALL prop drilling for core app state.
 */
import { createStore } from './createStore.js';

export const useAppStore = createStore({
  // Documents
  docs: [],
  openDocs: [],
  activeId: null,
  docPages: {},

  // Study content
  flashcards: [],
  exams: [],
  cases: [],
  notes: [],
  chatSessions: [],
  mindMaps: [],
  timelines: [],

  // UI state
  loaded: false,
  uploading: false,
  uploadPct: 0,
  view: 'library',
  rpTab: 'generate',
  rpOpen: false,
  rpW: 420,
  bgTask: null,
  installPrompt: null,
  showGlobalSearch: false,
  isMobile: typeof window !== 'undefined' ? window.innerWidth < 1024 : false,
  isKeyboardOpen: false,
  deepFocus: false,
  showVoiceTutor: false,
  moreOpen: false,
  showOnboarding: false,
  showShortcutsHelp: false,
  showQuickReview: false,
  headerScrolled: false,

  // Actions
  setDocs: (docs) => useAppStore.setState({ docs }),
  setFlashcards: (flashcards) => useAppStore.setState({ flashcards }),
  setExams: (exams) => useAppStore.setState({ exams }),
  setCases: (cases) => useAppStore.setState({ cases }),
  setNotes: (notes) => useAppStore.setState({ notes }),
  setView: (view) => useAppStore.setState({ view }),
  setActiveId: (activeId) => useAppStore.setState({ activeId }),
  setUploading: (uploading) => useAppStore.setState({ uploading }),
  setIsMobile: (isMobile) => useAppStore.setState({ isMobile }),
  setShowVoiceTutor: (showVoiceTutor) => useAppStore.setState({ showVoiceTutor }),
  setMoreOpen: (moreOpen) => useAppStore.setState({ moreOpen }),
  setDeepFocus: (deepFocus) => useAppStore.setState({ deepFocus }),
});
