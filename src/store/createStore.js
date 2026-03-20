/**
 * MARIAM PRO  Lightweight Store (Zustand-like, zero dependencies)
 * Uses useSyncExternalStore for tear-free reads.
 * Usage: const useAppStore = createStore(initialState)
 *        const value = useAppStore(state => state.flashcards)
 */
import { useSyncExternalStore, useCallback } from 'react';

export function createStore(initialState) {
  let state = typeof initialState === 'function' ? initialState(() => state, (fn) => {
    state = typeof fn === 'function' ? { ...state, ...fn(state) } : { ...state, ...fn };
    listeners.forEach(l => l());
  }) : initialState;

  const listeners = new Set();

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function getState() { return state; }

  function setState(partial) {
    const next = typeof partial === 'function' ? partial(state) : partial;
    const merged = { ...state, ...next };
    if (Object.is(state, merged)) return;
    state = merged;
    listeners.forEach(l => l());
  }

  function useStore(selector) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const sel = useCallback(selector || ((s) => s), []);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSyncExternalStore(
      subscribe,
      () => sel(state),
      () => sel(state),
    );
  }

  useStore.getState = getState;
  useStore.setState = setState;
  useStore.subscribe = subscribe;

  return useStore;
}
