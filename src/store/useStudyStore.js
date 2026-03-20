/**
 * MARIAM PRO  Study Store
 * Flashcards, exams, cases study state.
 */
import { createStore } from './createStore.js';

export const useStudyStore = createStore({
  // Active study session
  activeFlashcardSet: null,
  activeExam: null,
  activeCase: null,
  studyMode: null, // 'flashcards' | 'exam' | 'case' | 'tinder' | 'match'

  // FSRS review state
  reviewQueue: [],
  currentReviewIndex: 0,

  // Session stats
  sessionStats: {
    cardsReviewed: 0,
    correctCount: 0,
    startTime: null,
  },

  // Actions
  startFlashcardStudy: (set) => useStudyStore.setState({
    activeFlashcardSet: set,
    studyMode: 'flashcards',
    sessionStats: { cardsReviewed: 0, correctCount: 0, startTime: Date.now() },
  }),
  startExam: (exam) => useStudyStore.setState({
    activeExam: exam,
    studyMode: 'exam',
    sessionStats: { cardsReviewed: 0, correctCount: 0, startTime: Date.now() },
  }),
  endSession: () => useStudyStore.setState({
    activeFlashcardSet: null,
    activeExam: null,
    activeCase: null,
    studyMode: null,
  }),
  incrementReview: (correct) => {
    const s = useStudyStore.getState();
    useStudyStore.setState({
      sessionStats: {
        ...s.sessionStats,
        cardsReviewed: s.sessionStats.cardsReviewed + 1,
        correctCount: s.sessionStats.correctCount + (correct ? 1 : 0),
      },
    });
  },
});
