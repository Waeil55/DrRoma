/**
 * MARIAM PRO  Safe Area Utilities
 * Helpers for managing mobile safe areas and viewport height.
 */

/**
 * Sets --app-h CSS variable to the real visual viewport height.
 * Avoids the iOS address-bar bounce issue.
 */
export const syncViewportHeight = () => {
  const setH = () => {
    const vh = window.visualViewport?.height || window.innerHeight;
    document.documentElement.style.setProperty('--app-h', `${vh}px`);
  };
  setH();
  window.visualViewport?.addEventListener('resize', setH);
  window.addEventListener('resize', setH);
  return () => {
    window.visualViewport?.removeEventListener('resize', setH);
    window.removeEventListener('resize', setH);
  };
};

/**
 * Ensures the viewport meta tag has viewport-fit=cover for safe areas.
 */
export const ensureViewportFit = () => {
  let vp = document.querySelector('meta[name="viewport"]');
  if (!vp) {
    vp = document.createElement('meta');
    vp.name = 'viewport';
    document.head.appendChild(vp);
  }
  if (!vp.content?.includes('viewport-fit=cover')) {
    vp.content = (vp.content || 'width=device-width, initial-scale=1') + ', viewport-fit=cover';
  }
};

/**
 * Gets the numeric safe area inset values.
 */
export const getSafeAreaInsets = () => {
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0', 10),
    right: parseInt(style.getPropertyValue('--sar') || '0', 10),
    bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
    left: parseInt(style.getPropertyValue('--sal') || '0', 10),
  };
};
