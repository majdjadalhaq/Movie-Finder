/**
 * js/ui.js
 * UI building, debounced search, infinite scroll, toasts, and status handling
 */

// Cache key DOM references used across the UI handlers to avoid repeated lookups.
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const movieListContainer = document.getElementById('movieList');
const statusMessageElement = document.getElementById('statusMessage');
const favoritesToggle = document.getElementById('favoritesToggle');
const appTitle = document.getElementById('appTitle');

const toastContainer = document.getElementById('toastContainer');

// Toast helper creates lightweight notifications for success/error/info events.
const showToast = (title, message = '', type = 'info', ttl = 4000) => {
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'toast--error' : type === 'success' ? 'toast--success' : ''}`;

  toast.innerHTML = `
    <div class="toast__icon">${type === 'error' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️'}</div>
    <div class="toast__content">
      <div class="toast__title">${title}</div>
      ${message ? `<div class="toast__message">${message}</div>` : ''}
    </div>
    <button class="toast__close" aria-label="Dismiss">✖</button>
  `;

  const close = () => toast.remove();
  toast.querySelector('.toast__close').addEventListener('click', close);
  toastContainer.appendChild(toast);
  setTimeout(close, ttl);
};

// Back-to-top
// Creates the back-to-top control once and returns the instance so we can toggle visibility.
const createBackToTopButton = () => {
  const button = document.createElement('button');
  button.className = 'back-to-top';
  button.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
  button.setAttribute('aria-label', 'Back to top');
  document.body.appendChild(button);
  return button;
};
const backToTopButton = createBackToTopButton();

// Genre Filter UI
const createGenreFilterContainer = () => {
  const container = document.createElement('div');
  container.className = 'genre-filter-container hidden';
  container.id = 'genreFilter';
  container.setAttribute('aria-label', 'Filter movies by genre and sort options');
  container.setAttribute('role', 'group');
  return container;
};
const createGenreFilterToggle = () => {
  const toggle = document.createElement('button');
  toggle.className = 'genre-filter-toggle collapsed';
  toggle.innerHTML = '<i class="fas fa-chevron-down"></i> Show Filters';
  toggle.setAttribute('aria-label', 'Toggle filter visibility');
  toggle.setAttribute('aria-expanded', 'false');

  toggle.addEventListener('click', () => {
    // Capture scroll position BEFORE layout changes (prevents sticky “jump”)
    const scrollY = window.scrollY;

    // Toggle visibility + sticky state class
    genreFilterContainer.classList.toggle('hidden');
    toggle.classList.toggle('collapsed');

    // Update ARIA + label/icon
    const isExpanded = !genreFilterContainer.classList.contains('hidden');
    toggle.setAttribute('aria-expanded', isExpanded);
    toggle.innerHTML = isExpanded
      ? '<i class="fas fa-chevron-up"></i> Filter & Sort'
      : '<i class="fas fa-chevron-down"></i> Show Filters';

    // Restore scroll position on the next frame (no visual jump)
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY });
    });
  });

  return toggle;
};

const genreFilterContainer = createGenreFilterContainer();
const genreFilterToggle = createGenreFilterToggle();
// --- Create a fixed wrapper for the toggle and filter ---
const genreFilterWrapper = document.createElement('div');
genreFilterWrapper.className = 'genre-filter-wrapper';

// Add toggle and filter container into the wrapper
genreFilterWrapper.appendChild(genreFilterToggle);
genreFilterWrapper.appendChild(genreFilterContainer);

// Insert the wrapper right above the movie list
movieListContainer.parentNode.insertBefore(genreFilterWrapper, movieListContainer);


window.addEventListener('scroll', () => {
  const header = document.querySelector('.main-header');
  if (window.scrollY > 50) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
});

// State
// Track pagination, loading flags, applied filters, and favorite references.
let currentPage = 1;
let isLoading = false;
let currentSearchQuery = '';
let totalPages = 0;
let isFetchingPopularMovies = true;
let isShowingFavorites = false;
let favoriteMovies = [];
let selectedGenreIds = [];
// Status helpers reset the list area and announce outcomes to the user.
let displayStatusMessage = (message, isError = false) => {
  movieListContainer.innerHTML = '';
  statusMessageElement.textContent = message;
  statusMessageElement.className = isError ? 'status-message error' : 'status-message';
  statusMessageElement.style.display = 'block';
  movieListContainer.setAttribute('aria-busy', 'false');
};

// Skeleton loaders give immediate feedback while the API request resolves.
const displaySkeletonCards = (count = 8) => {
  movieListContainer.innerHTML = '';
  const skeletonHTML = Array(count).fill('')
    .map(() => `<div class="movie-card skeleton-card"><div class="skeleton"></div></div>`).join('');
  movieListContainer.innerHTML = skeletonHTML;
  movieListContainer.setAttribute('aria-busy', 'true');
};

const hideStatusMessage = () => {
  statusMessageElement.style.display = 'none';
  statusMessageElement.textContent = '';
};

// Helpers
// Constrain a numeric value inside the provided bounds.
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// Build a single movie card HTML snippet for either list or favorites view.
const createMovieCard = (movie) => {
  const posterPath = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image';
  const title = movie.title || 'Untitled';
  const releaseDate = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
  const rating = typeof movie.vote_average === 'number' ? (Math.round(movie.vote_average * 10) / 10).toFixed(1) : 'N/A';

  const genres = movie.genre_ids
    ? movie.genre_ids.slice(0, 3).map(id => window.genreIdToNameMap[id]).filter(Boolean).join(', ')
    : (movie.genres ? movie.genres.slice(0, 3).map(g => g.name).join(', ') : '');

  return `
    <div class="movie-card" data-movie-id="${movie.id}">
      <div class="movie-card-inner">
        <div class="movie-poster-container">
          <img src="${posterPath}" alt="${title} Poster" class="movie-poster" loading="lazy">
          <div class="movie-overlay">
            <button class="add-to-favorites" title="Add to favorites" aria-label="Add ${title} to favorites">
              <i class="far fa-heart" aria-hidden="true"></i>
            </button>
            <button class="movie-details" title="View details" aria-label="View details for ${title}">
              <i class="fas fa-info-circle" aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div class="movie-info">
          <div>
            <h3 class="movie-title">${title}</h3>
            <p class="movie-release-date">Release: ${releaseDate}</p>
            ${genres ? `<p class="movie-genres">${genres}</p>` : ''}
          </div>
          <div class="movie-rating">
            <i class="fas fa-star" aria-hidden="true"></i>
            <span>${rating}</span>
          </div>
        </div>
      </div>
    </div>
  `;
};

/**
 * fetchAndDisplayMovies
 * Fetches a page of results from TMDB and renders cards.
 * When `append` is true we preserve existing cards and tack results on the end.
 */
const fetchAndDisplayMovies = async (url, append = false) => {
  if (isLoading) return;
  isLoading = true;

  if (!append) {
    currentPage = 1;
    displayStatusMessage('Loading movies...');
    hideStatusMessage();
    displaySkeletonCards();
  } else {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading more movies...';
    movieListContainer.appendChild(loadingIndicator);
  }

  try {
    // Fetch directly (api.js handles TMDB-specific helpers for other flows).
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const movies = data.results || [];
    totalPages = data.total_pages || 1;

    const loadingIndicator = document.querySelector('.loading-indicator');
    if (loadingIndicator) loadingIndicator.remove();

    if (movies.length === 0 && !append) {
      displayStatusMessage('No movies found. Try a different search term.', false);
      isLoading = false;
      return;
    }

    const movieCards = movies.map(createMovieCard).join('');
    if (append) {
      movieListContainer.insertAdjacentHTML('beforeend', movieCards);
    } else {
      movieListContainer.innerHTML = movieCards;
      hideStatusMessage();
    }

    setTimeout(initTiltEffect, 50);
  } catch (error) {
    const loadingIndicator = document.querySelector('.loading-indicator');
    if (loadingIndicator) loadingIndicator.remove();
    if (!append) {
      displayStatusMessage(`Error: ${error.message}. Please try again later.`, true);
    }
    showToast('Network error', error.message, 'error');
  } finally {
    isLoading = false;
    movieListContainer.setAttribute('aria-busy', 'false');
  }
};

// Render favorites by individually fetching each stored TMDB ID.
const fetchAndDisplayFavoriteMovies = async (movieIds) => {
  if (isLoading || !movieIds || movieIds.length === 0) {
    displayStatusMessage('No favorite movies found. Add some movies to your favorites to see them here.', false);
    return;
  }
  isLoading = true;
  displayStatusMessage('Loading favorite movies...');
  hideStatusMessage();
  movieListContainer.innerHTML = '';
  displaySkeletonCards();

  try {
    favoriteMovies = [];
    for (const movieId of movieIds) {
      try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`);
        if (response.ok) favoriteMovies.push(await response.json());
      } catch (err) {
        // continue
      }
    }

    if (favoriteMovies.length === 0) {
      displayStatusMessage('No favorite movies found. Add some movies to your favorites to see them here.', false);
      isLoading = false;
      return;
    }

    movieListContainer.innerHTML = favoriteMovies.map(createMovieCard).join('');
    hideStatusMessage();

    setTimeout(initTiltEffect, 50);

    // Update favorite buttons state
    setTimeout(() => {
      document.querySelectorAll('.movie-card').forEach(card => {
        const movieId = card.dataset.movieId;
        if (movieIds.includes(movieId)) {
          const favoriteBtn = card.querySelector('.add-to-favorites');
          if (favoriteBtn) {
            favoriteBtn.classList.add('favorited');
            const icon = favoriteBtn.querySelector('i');
            icon.classList.remove('far');
            icon.classList.add('fas');
          }
        }
      });
    }, 50);

  } catch (error) {
    displayStatusMessage(`An error occurred while loading your favorites: ${error.message}. Please try again later.`, true);
    showToast('Favorites error', error.message, 'error');
  } finally {
    isLoading = false;
  }
};

// Update the badge displayed on the favorites toggle button.
const updateFavoritesCount = () => {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  const count = favorites.length;
  const existingCount = favoritesToggle.querySelector('.favorites-count');
  if (existingCount) existingCount.remove();

  if (count > 0) {
    const countBadge = document.createElement('span');
    countBadge.className = 'favorites-count';
    countBadge.textContent = count;
    favoritesToggle.appendChild(countBadge);
  }
};

// Debounce utility prevents rapid-fire handler execution while the user types.
const debounce = (fn, delay = 400) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};

// Validate query input, update state, and kick off a TMDB search request.
const handleSearch = (event) => {
  event && event.preventDefault();
  const query = searchInput.value.trim();
  currentSearchQuery = query;

  const MAX_CHAR_LIMIT = 50;
  clearSearchError();

  if (!query) {
    showSearchError('Please enter a movie name to search.');
    return;
  }
  if (query.length > MAX_CHAR_LIMIT) {
    showSearchError(`Please enter a movie name under ${MAX_CHAR_LIMIT} characters.`);
    return;
  }

  isFetchingPopularMovies = false;
  fetchAndDisplayMovies(`${ENDPOINTS.SEARCH}${encodeURIComponent(query)}&page=1`);
};

// Live validation and character counter keep the search UX friendly.
const showSearchError = (message) => {
  let errorElement = document.querySelector('.search-error');
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.className = 'search-error';
    searchForm.appendChild(errorElement);
  }
  errorElement.textContent = message;
  errorElement.classList.add('show');

  searchInput.classList.add('shake');
  setTimeout(() => searchInput.classList.remove('shake'), 500);
};
const clearSearchError = () => {
  const e = document.querySelector('.search-error');
  if (e) e.classList.remove('show');
};

// Keep the small counter in sync and warn when nearing the hard limit.
const updateCharacterCounter = () => {
  const len = searchInput.value.length;
  const MAX_CHAR_LIMIT = 50;
  let counter = document.querySelector('.char-counter');
  if (!counter) {
    counter = document.createElement('div');
    counter.className = 'char-counter';
    searchForm.appendChild(counter);
  }
  counter.textContent = `${len}/${MAX_CHAR_LIMIT}`;
  if (len > MAX_CHAR_LIMIT * 0.8) counter.classList.add('warning');
  else counter.classList.remove('warning');
};
searchInput.addEventListener('input', debounce(updateCharacterCounter, 50));
updateCharacterCounter();

// Hook up core UI events: form submit, favorites drawer, and title click reset.
searchForm.addEventListener('submit', handleSearch);
favoritesToggle.addEventListener('click', () => { if (typeof showFavoritesModal === 'function') showFavoritesModal(); });
appTitle.addEventListener('click', (e) => { e.preventDefault(); location.reload(); });

const initTiltEffect = () => {
  const movieCards = document.querySelectorAll('.movie-card');
  movieCards.forEach(card => {
    const cardInner = card.querySelector('.movie-card-inner');
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const rotateY = clamp(((mouseX / rect.width) - 0.5) * 20, -20, 20);
      const rotateX = clamp(-((mouseY / rect.height) - 0.5) * 20, -20, 20);
      cardInner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    });
    card.addEventListener('mouseleave', () => {
      cardInner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
  });
};

// Event delegation lets us handle clicks for dynamically generated card buttons.
movieListContainer.addEventListener('click', (event) => {
  const target = event.target;

  if (target.closest('.add-to-favorites')) {
    event.preventDefault();
    const button = target.closest('.add-to-favorites');
    const movieCard = button.closest('.movie-card');
    const movieId = movieCard.dataset.movieId;
    const icon = button.querySelector('i');

    button.classList.toggle('favorited');
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    if (button.classList.contains('favorited')) {
      icon.classList.remove('far'); icon.classList.add('fas');
      button.style.transform = 'scale(1.3)';
      setTimeout(() => button.style.transform = '', 300);
      if (!favorites.includes(movieId)) {
        favorites.push(movieId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        showToast('Added to favorites', 'Saved locally', 'success');
      }
      updateFavoritesCount();
      if (isShowingFavorites) fetchAndDisplayFavoriteMovies(favorites);
    } else {
      icon.classList.remove('fas'); icon.classList.add('far');
      const idx = favorites.indexOf(movieId);
      if (idx > -1) favorites.splice(idx, 1);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      updateFavoritesCount();
      if (isShowingFavorites) fetchAndDisplayFavoriteMovies(favorites);
      showToast('Removed from favorites', '', 'info');
    }
  }

  if (target.closest('.movie-details')) {
    event.preventDefault();
    const movieCard = target.closest('.movie-card');
    const movieId = movieCard.dataset.movieId;
    showMovieDetailsModal(movieId);
  }
});

// Infinite scroll loads the next page when the user nears the bottom of the list.
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
    if (!isLoading && !isShowingFavorites && currentPage < totalPages) {
      currentPage++;
      let nextPageUrl;
      if (isFetchingPopularMovies) {
        nextPageUrl = `${ENDPOINTS.POPULAR}&page=${currentPage}`;
      } else {
        nextPageUrl = `${ENDPOINTS.SEARCH}${encodeURIComponent(currentSearchQuery)}&page=${currentPage}`;
      }
      fetchAndDisplayMovies(nextPageUrl, true);
    }
  }
});

// Create genre & sort panel
// Builds the interactive filter drawer (rendered once after genres load).
const createGenreFilterButtons = (genres) => {
  genreFilterContainer.innerHTML = '';

  const headerElement = document.createElement('div');
  headerElement.className = 'genre-filter-header';

  const titleElement = document.createElement('div');
  titleElement.className = 'genre-filter-title';
  titleElement.innerHTML = '<i class="fas fa-filter"></i> Filter & Sort';

  const clearFiltersButton = document.createElement('button');
  clearFiltersButton.className = 'clear-filters';
  clearFiltersButton.textContent = 'Clear All';
  clearFiltersButton.setAttribute('aria-label', 'Clear all filters');
  clearFiltersButton.addEventListener('click', () => {
    selectedGenreIds = [];
    window.currentSortOption = null;
    document.querySelectorAll('.genre-filter-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.sort-filter-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-genre-id="all"]').classList.add('active');
    updateGenreCountBadge();
    if (currentSearchQuery) fetchAndDisplayMovies(`${ENDPOINTS.SEARCH}${encodeURIComponent(currentSearchQuery)}&page=1`);
    else fetchAndDisplayMovies(`${ENDPOINTS.POPULAR}&page=1`);
  });

  headerElement.appendChild(titleElement);
  headerElement.appendChild(clearFiltersButton);
  genreFilterContainer.appendChild(headerElement);

  const listContainer = document.createElement('div');
  listContainer.className = 'genre-filter-list';

  const allButton = document.createElement('button');
  allButton.className = 'genre-filter-button active';
  allButton.textContent = 'All';
  allButton.setAttribute('data-genre-id', 'all');
  allButton.setAttribute('aria-label', 'Show all movies');
  allButton.addEventListener('click', () => {
    selectedGenreIds = [];
    document.querySelectorAll('.genre-filter-button').forEach(btn => btn.classList.remove('active'));
    allButton.classList.add('active');
    updateGenreCountBadge();
    applyFiltersAndSort();
  });
  listContainer.appendChild(allButton);

  genres.forEach(genre => {
    const button = document.createElement('button');
    button.className = 'genre-filter-button';
    button.textContent = genre.name;
    button.setAttribute('data-genre-id', genre.id);
    button.setAttribute('aria-label', `Filter by ${genre.name}`);

    button.addEventListener('click', () => {
      const genreId = String(genre.id);
      const index = selectedGenreIds.indexOf(genreId);

      if (index > -1) {
        selectedGenreIds.splice(index, 1);
        button.classList.remove('active');
        if (selectedGenreIds.length === 0) allButton.classList.add('active');
      } else {
        selectedGenreIds.push(genreId);
        button.classList.add('active');
        allButton.classList.remove('active');
      }

      updateGenreCountBadge();
      applyFiltersAndSort();
    });

    listContainer.appendChild(button);
  });

  genreFilterContainer.appendChild(listContainer);

  // Sort options
  const sortContainer = document.createElement('div');
  sortContainer.className = 'filter-section';

  const sortTitle = document.createElement('div');
  sortTitle.className = 'filter-section-title';
  sortTitle.innerHTML = '<i class="fas fa-sort"></i> Sort By';
  sortContainer.appendChild(sortTitle);

  const sortListContainer = document.createElement('div');
  sortListContainer.className = 'sort-filter-list';

  const sortOptions = [
    { id: 'popularity-desc', name: 'popularity', apiParam: 'popularity.desc' },
    { id: 'release-date-desc', name: 'release', apiParam: 'release_date.desc' },
    { id: 'rating-desc', name: 'rating', apiParam: 'vote_average.desc' },
    { id: 'trending-week', name: 'Trending (This Week)', apiParam: 'trending.week' },
    { id: 'trending-day', name: 'Trending (Today)', apiParam: 'trending.day' }
  ];

  sortOptions.forEach(option => {
    const button = document.createElement('button');
    button.className = 'sort-filter-button';
    button.textContent = option.name;
    button.setAttribute('data-sort-id', option.id);
    button.setAttribute('data-sort-param', option.apiParam);
    button.setAttribute('aria-label', `Sort movies by ${option.name}`);

    button.addEventListener('click', () => {
      document.querySelectorAll('.sort-filter-button').forEach(btn => btn.classList.remove('active'));
      if (window.currentSortOption === option.id) {
        window.currentSortOption = null;
      } else {
        window.currentSortOption = option.id;
        button.classList.add('active');
      }
      applyFiltersAndSort();
    });

    sortListContainer.appendChild(button);
  });

  sortContainer.appendChild(sortListContainer);
  genreFilterContainer.appendChild(sortContainer);
};

// Reflect the number of active genre filters with a small badge.
const updateGenreCountBadge = () => {
  const c = document.querySelector('.genre-filter-count');
  if (c) c.remove();
  if (selectedGenreIds.length > 0) {
    const countBadge = document.createElement('span');
    countBadge.className = 'genre-filter-count';
    countBadge.textContent = selectedGenreIds.length;
    countBadge.setAttribute('aria-label', `${selectedGenreIds.length} genres selected`);
    document.querySelector('.genre-filter-title').appendChild(countBadge);
  }
};

// Compose the final TMDB URL based on selected genres, sort preference, and search query.
const applyFiltersAndSort = () => {
  updateGenreCountBadge();
  let filterUrl;

  if (window.currentSortOption === 'trending-week') {
    filterUrl = `${ENDPOINTS.TRENDING_WEEK}&page=1`;
    if (selectedGenreIds.length > 0) filterUrl += `&with_genres=${selectedGenreIds.join(',')}`;
  } else if (window.currentSortOption === 'trending-day') {
    filterUrl = `${ENDPOINTS.TRENDING_DAY}&page=1`;
    if (selectedGenreIds.length > 0) filterUrl += `&with_genres=${selectedGenreIds.join(',')}`;
  } else {
    if (selectedGenreIds.length === 0 && !window.currentSortOption) {
      filterUrl = currentSearchQuery ? `${ENDPOINTS.SEARCH}${encodeURIComponent(currentSearchQuery)}&page=1` : `${ENDPOINTS.POPULAR}&page=1`;
    } else {
      filterUrl = `${ENDPOINTS.DISCOVER}`;
      if (selectedGenreIds.length > 0) filterUrl += `&with_genres=${selectedGenreIds.join(',')}`;
      if (window.currentSortOption) {
        const sortButton = document.querySelector(`[data-sort-id="${window.currentSortOption}"]`);
        if (sortButton) {
          const sortParam = sortButton.getAttribute('data-sort-param');
          filterUrl += `&sort_by=${sortParam}`;
        }
      }
      filterUrl += '&page=1';
    }
  }

  if (currentSearchQuery && window.currentSortOption && !String(window.currentSortOption).includes('trending')) {
    filterUrl = `${ENDPOINTS.SEARCH}${encodeURIComponent(currentSearchQuery)}`;
    if (selectedGenreIds.length > 0) filterUrl += `&with_genres=${selectedGenreIds.join(',')}`;
    const sortButton = document.querySelector(`[data-sort-id="${window.currentSortOption}"]`);
    if (sortButton) filterUrl += `&sort_by=${sortButton.getAttribute('data-sort-param')}`;
    filterUrl += '&page=1';
  }

  displayStatusMessage('Applying filters...');
  hideStatusMessage();
  fetchAndDisplayMovies(filterUrl);
};

// Back to top
window.addEventListener('scroll', () => {
  if (window.pageYOffset > 300) backToTopButton.classList.add('visible');
  else backToTopButton.classList.remove('visible');
});
backToTopButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Esc behavior: modal handles closing; otherwise clear search
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    const hasOpenModals = (window.modalStack && window.modalStack.length > 0);
    if (!hasOpenModals && currentSearchQuery) {
      clearSearch();
    }
  }
});

// Submit search on Enter if input focused (and debounce)
const debouncedSearch = debounce(() => handleSearch(null), 350);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && document.activeElement === searchInput) {
    event.preventDefault();
    debouncedSearch();
  }
});

// Expose functions used elsewhere
window.displayStatusMessage = displayStatusMessage;
window.fetchAndDisplayMovies = fetchAndDisplayMovies;
window.updateFavoritesCount = updateFavoritesCount;
window.clearSearch = () => {
  searchInput.value = '';
  currentSearchQuery = '';
  isFetchingPopularMovies = true;
  fetchAndDisplayMovies(`${ENDPOINTS.POPULAR}&page=1`);
  clearSearchError();
};
window.showToast = showToast;
