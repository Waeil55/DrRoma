/**
 * MARIAM PRO — useFSRS Hook
 * React wrapper for FSRS-5 spaced repetition engine.
 */
import { useState, useCallback } from 'react';
import { initCard, scheduleCard, retrievability, getDueCards } from '../services/analytics/fsrsEngine.js';

export function useFSRS(initialCards = []) {
  const [cards, setCards] = useState(() => initialCards.map(c => c.stability ? c : initCard(c)));

  const review = useCallback((cardId, grade) => {
    setCards(prev => prev.map(c => {
      if ((c.id || c.front) !== cardId) return c;
      return scheduleCard(c, grade);
    }));
  }, []);

  const getDue = useCallback(() => {
    return getDueCards(cards);
  }, [cards]);

  const getRetention = useCallback((card) => {
    return retrievability(card);
  }, []);

  const addCards = useCallback((newCards) => {
    setCards(prev => [...prev, ...newCards.map(c => c.stability ? c : initCard(c))]);
  }, []);

  const resetCard = useCallback((cardId) => {
    setCards(prev => prev.map(c => {
      if ((c.id || c.front) !== cardId) return c;
      return initCard({ ...c, stability: undefined, difficulty: undefined, reps: undefined, lapses: undefined, lastReview: undefined, nextReview: undefined });
    }));
  }, []);

  return { cards, review, getDue, getRetention, addCards, resetCard, setCards };
}
