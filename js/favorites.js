/**
 * js/favorites.js
 * Favorites initialization and helpers
 */

// Synchronize UI state with whatever favorites are already saved in localStorage.
const initializeFavorites = () => {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  updateFavoritesCount();

  // Update buttons for any displayed cards shortly after render
  // Delay allows the main list to finish injecting HTML before we query it.
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

window.initializeFavorites = initializeFavorites;
