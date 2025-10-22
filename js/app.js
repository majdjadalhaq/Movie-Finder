/**
 * js/app.js
 * App bootstrap + global error hooks + a11y live region
 */

// Kick off the application once static assets and markup are parsed.
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

// Primary bootstrap routine that loads initial data + UI scaffolding.
const initializeApp = () => {
  fetchAndDisplayMovies(`${ENDPOINTS.POPULAR}&page=1`);
  fetchGenres();
  initializeFavorites();
  addAccessibilityFeatures();
};

// Progressive enhancement: wire skip link focus management and create a polite live region.
const addAccessibilityFeatures = () => {
  const skipLink = document.querySelector('.skip-to-main');
  if (skipLink) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const mainContent = document.getElementById('movieList');
      if (mainContent) {
        mainContent.focus();
        mainContent.scrollIntoView();
      }
    });
  }

  // Live region that mirrors status messages
  const statusRegion = document.createElement('div');
  statusRegion.setAttribute('aria-live', 'polite');
  statusRegion.setAttribute('aria-atomic', 'true');
  statusRegion.className = 'sr-only';
  statusRegion.id = 'status-region';
  document.body.appendChild(statusRegion);

  const originalDisplayStatusMessage = window.displayStatusMessage;
  window.displayStatusMessage = (message, isError = false) => {
    originalDisplayStatusMessage(message, isError);
    statusRegion.textContent = message;
  };
};

// Global error hooks -> toast (non-blocking)
// Surface unexpected errors so users know something went wrong without opening dev tools.
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  window.showToast('Unexpected error', String(event.reason && event.reason.message || event.reason || 'Unknown'), 'error');
});

window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
  if (!event.message) return;
  window.showToast('Error', String(event.message), 'error');
});
