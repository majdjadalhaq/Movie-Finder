/**
 * Movie Finder Application Main Logic
 * Handles app initialization, keyboard shortcuts, and accessibility features
 */



/**
 * Initializes the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

/**
 * Main application initialization function
 * Sets up all core functionality and event listeners
 */
const initializeApp = () => {
    // Load initial movies (popular movies)
    fetchAndDisplayMovies(`${POPULAR_MOVIES_URL}&page=1`);

    // Fetch genres on app start
    fetchGenres();

    // Initialize favorites system
    initializeFavorites();



    // Add accessibility features
    addAccessibilityFeatures();
};





/**
 * Adds accessibility features to improve user experience for screen readers and keyboard navigation
 * Includes ARIA labels, skip links, and live regions for status updates
 */
const addAccessibilityFeatures = () => {
    // Add ARIA labels and roles where needed
    const searchForm = document.getElementById('searchForm');
    searchForm.setAttribute('role', 'search');

    // Add skip link functionality for keyboard navigation
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

    // Add live region for status updates (screen reader announcements)
    const statusRegion = document.createElement('div');
    statusRegion.setAttribute('aria-live', 'polite');
    statusRegion.setAttribute('aria-atomic', 'true');
    statusRegion.className = 'sr-only';
    statusRegion.id = 'status-region';
    document.body.appendChild(statusRegion);

    // Override displayStatusMessage to also update the live region
    const originalDisplayStatusMessage = displayStatusMessage;
    displayStatusMessage = (message, isError = false) => {
        originalDisplayStatusMessage(message, isError);
        statusRegion.textContent = message;
    };
};

/**
 * Utility function to close and remove modal overlays from the DOM
 * @param {HTMLElement} modal - The modal overlay element to close
 */
const closeModal = (modal) => {
    if (modal && modal.parentNode) {
        // Remove from DOM
        modal.remove();

        // Also remove from modal stack if present
        if (window.modalStack && Array.isArray(window.modalStack)) {
            const idx = window.modalStack.indexOf(modal);
            if (idx !== -1) {
                window.modalStack.splice(idx, 1);
            }
        }
    }
};

// Error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // You could show a user-friendly error message here
});

// Error handling for uncaught errors
window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    // You could show a user-friendly error message here
});




