/**
 * Movie Finder Favorites Module
 * Handles favorite movies functionality including storage, import/export, and UI updates
 */

// Favorites functionality

/**
 * Initializes the favorites system on page load
 * Loads favorites from localStorage and updates the UI accordingly
 */
const initializeFavorites = () => {
    // Load favorites from localStorage
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    // Update favorites count in the UI
    updateFavoritesCount();

    // Update favorite buttons state for currently displayed movies
    setTimeout(() => {
        document.querySelectorAll('.movie-card').forEach(card => {
            const movieId = card.dataset.movieId;
            if (favorites.includes(movieId)) {
                const favoriteBtn = card.querySelector('.add-to-favorites');
                if (favoriteBtn) {
                    favoriteBtn.classList.add('favorited');
                    const icon = favoriteBtn.querySelector('i');
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                }
            }
        });
    }, 100);
};

/**
 * Clears the current search and returns to displaying popular movies
 * Resets search input and related state variables
 */
const clearSearch = () => {
    searchInput.value = '';
    currentSearchQuery = '';
    isFetchingPopularMovies = true;
    fetchAndDisplayMovies(`${POPULAR_MOVIES_URL}&page=1`);
    clearSearchError();
};


