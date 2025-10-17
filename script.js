// TMDB API Configuration
const API_KEY = '5b40b0f5b10231d23aac66a5994c4c05';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// API Endpoints
const POPULAR_MOVIES_URL = `${BASE_URL}/movie/popular?api_key=${API_KEY}`;
const SEARCH_MOVIES_URL = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=`;

// DOM Elements (using camelCase)
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const movieListContainer = document.getElementById('movieList');
const statusMessageElement = document.getElementById('statusMessage');
const favoritesToggle = document.getElementById('favoritesToggle');

// Infinity scroll state variables
let currentPage = 1;
let isLoading = false;
let currentSearchQuery = '';
let totalPages = 0;
let isFetchingPopularMovies = true;

// Favorites state variables
let isShowingFavorites = false;
let favoriteMovies = [];

/**
 * Displays a status message (loading, error, or no results).
 * @param {string} message - The message to display.
 * @param {boolean} isError - Whether the message is an error.
 */
const displayStatusMessage = (message, isError = false) => {
    movieListContainer.innerHTML = ''; // Clear movie list
    statusMessageElement.textContent = message;
    statusMessageElement.className = 'status-message'; // Reset class
    if (isError) {
        statusMessageElement.classList.add('error');
    }
    statusMessageElement.style.display = 'block';
};

/**
 * Hides the status message.
 */
const hideStatusMessage = () => {
    statusMessageElement.style.display = 'none';
    statusMessageElement.textContent = '';
};

/**
 * Creates and returns an HTML string for a single movie card.
 * @param {object} movie - The movie object from the TMDB API.
 * @returns {string} The HTML string for the movie card.
 */
const createMovieCard = (movie) => {
    const posterPath = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image';
    const title = movie.title || 'Untitled';
    const releaseDate = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const genreIds = movie.genre_ids ? movie.genre_ids.slice(0, 3).join(', ') : '';

    return `
        <div class="movie-card" data-movie-id="${movie.id}">
            <div class="movie-poster-container">
                <img src="${posterPath}" alt="${title} Poster" class="movie-poster" loading="lazy">
                <div class="movie-overlay">
                    <button class="add-to-favorites" title="Add to favorites">
                        <i class="far fa-heart"></i>
                    </button>
                    <button class="movie-details" title="View details">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </div>
            </div>
            <div class="movie-info">
                <div>
                    <h3 class="movie-title">${title}</h3>
                    <p class="movie-release-date">Release: ${releaseDate}</p>
                </div>
                <div class="movie-rating">
                    <i class="fas fa-star"></i>
                    <span>${rating}</span>
                </div>
            </div>
        </div>
    `;
};

/**
 * Fetches movies from the TMDB API and displays them.
 * @param {string} url - The API endpoint URL to fetch from.
 * @param {boolean} append - Whether to append movies to existing list or replace them.
 */
const fetchAndDisplayMovies = async (url, append = false) => {
    if (isLoading) return;

    isLoading = true;

    if (!append) {
        currentPage = 1;
        displayStatusMessage('Loading movies...');
        hideStatusMessage(); // Hide loading message initially to prevent flicker
    } else {
        // Show loading indicator at the bottom when appending
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading more movies...';
        movieListContainer.appendChild(loadingIndicator);
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            // Error handling for non-200 status codes
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const movies = data.results;
        totalPages = data.total_pages;

        // Remove loading indicator if it exists
        const loadingIndicator = document.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }

        if (movies.length === 0 && !append) {
            displayStatusMessage('No movies found. Try a different search term.', false);
            isLoading = false;
            return;
        }

        if (append) {
            // Append new movies to existing list
            const movieCards = movies.map(createMovieCard).join('');
            movieListContainer.insertAdjacentHTML('beforeend', movieCards);
        } else {
            // Clear previous movies and display new ones
            movieListContainer.innerHTML = movies.map(createMovieCard).join('');
            hideStatusMessage();
        }

        isLoading = false;

    } catch (error) {
        // Error handling for network or unexpected errors
        console.error('Fetch error:', error);

        // Remove loading indicator if it exists
        const loadingIndicator = document.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }

        if (!append) {
            displayStatusMessage(`An error occurred while fetching data: ${error.message}. Please try again later.`, true);
        }

        isLoading = false;
    }
};

/**
 * Fetches favorite movies from the TMDB API and displays them.
 * @param {Array} movieIds - Array of movie IDs to fetch.
 */
const fetchAndDisplayFavoriteMovies = async (movieIds) => {
    if (isLoading || !movieIds || movieIds.length === 0) return;

    isLoading = true;
    displayStatusMessage('Loading favorite movies...');
    hideStatusMessage(); // Hide loading message initially to prevent flicker

    // Clear previous movies
    movieListContainer.innerHTML = '';

    try {
        favoriteMovies = [];

        // Fetch each movie by ID
        for (const movieId of movieIds) {
            try {
                const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);

                if (response.ok) {
                    const movie = await response.json();
                    favoriteMovies.push(movie);
                }
            } catch (error) {
                console.error(`Error fetching movie with ID ${movieId}:`, error);
            }
        }

        if (favoriteMovies.length === 0) {
            displayStatusMessage('No favorite movies found. Add some movies to your favorites to see them here.', false);
            isLoading = false;
            return;
        }

        // Display favorite movies
        movieListContainer.innerHTML = favoriteMovies.map(createMovieCard).join('');
        hideStatusMessage();
        isLoading = false;

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
        }, 100);

    } catch (error) {
        console.error('Error fetching favorite movies:', error);
        displayStatusMessage(`An error occurred while loading your favorites: ${error.message}. Please try again later.`, true);
        isLoading = false;
    }
};

/**
 * Updates the favorites count badge on the favorites toggle button.
 */
const updateFavoritesCount = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const count = favorites.length;

    // Remove existing count badge if present
    const existingCount = favoritesToggle.querySelector('.favorites-count');
    if (existingCount) {
        existingCount.remove();
    }

    // Add count badge if there are favorites
    if (count > 0) {
        const countBadge = document.createElement('span');
        countBadge.className = 'favorites-count';
        countBadge.textContent = count;
        favoritesToggle.appendChild(countBadge);
    }
};

/**
 * Handles the search form submission.
 * @param {Event} event - The form submission event.
 */
const handleSearch = (event) => {
    event.preventDefault(); // Prevent default form submission

    const query = searchInput.value.trim();
    currentSearchQuery = query;

    if (query) {
        // Grab different data from the API (user interaction)
        isFetchingPopularMovies = false;
        const searchUrl = `${SEARCH_MOVIES_URL}${encodeURIComponent(query)}&page=1`;
        fetchAndDisplayMovies(searchUrl);
    } else {
        // If search is empty, show popular movies again
        isFetchingPopularMovies = true;
        fetchAndDisplayMovies(`${POPULAR_MOVIES_URL}&page=1`);
    }
};

// Event Listeners
searchForm.addEventListener('submit', handleSearch);

// Favorites toggle event listener
favoritesToggle.addEventListener('click', () => {
    isShowingFavorites = !isShowingFavorites;
    favoritesToggle.classList.toggle('active');

    if (isShowingFavorites) {
        // Show favorites
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        fetchAndDisplayFavoriteMovies(favorites);
    } else {
        // Show popular movies
        isFetchingPopularMovies = true;
        fetchAndDisplayMovies(`${POPULAR_MOVIES_URL}&page=1`);
    }
});

// Event delegation for movie card buttons
movieListContainer.addEventListener('click', (event) => {
    const target = event.target;

    // Handle favorite button click
    if (target.closest('.add-to-favorites')) {
        event.preventDefault();
        const button = target.closest('.add-to-favorites');
        const movieCard = button.closest('.movie-card');
        const movieId = movieCard.dataset.movieId;
        const icon = button.querySelector('i');

        // Toggle favorite state
        button.classList.toggle('favorited');

        // Update icon
        if (button.classList.contains('favorited')) {
            icon.classList.remove('far');
            icon.classList.add('fas');

            // Show success animation
            button.style.transform = 'scale(1.3)';
            setTimeout(() => {
                button.style.transform = '';
            }, 300);

            // Store in favorites
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            if (!favorites.includes(movieId)) {
                favorites.push(movieId);
                localStorage.setItem('favorites', JSON.stringify(favorites));
            }

            // Update favorites count
            updateFavoritesCount();

            // If currently viewing favorites, refresh the list
            if (isShowingFavorites) {
                fetchAndDisplayFavoriteMovies(favorites);
            }
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');

            // Remove from favorites
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            const index = favorites.indexOf(movieId);
            if (index > -1) {
                favorites.splice(index, 1);
                localStorage.setItem('favorites', JSON.stringify(favorites));
            }

            // Update favorites count
            updateFavoritesCount();

            // If currently viewing favorites, refresh the list
            if (isShowingFavorites) {
                fetchAndDisplayFavoriteMovies(favorites);
            }
        }
    }

    // Handle details button click
    if (target.closest('.movie-details')) {
        event.preventDefault();
        const button = target.closest('.movie-details');
        const movieCard = button.closest('.movie-card');
        const movieId = movieCard.dataset.movieId;

        // For demo purposes, we'll just show an alert
        // In a real app, this would open a modal or navigate to a details page
        showMovieDetailsModal(movieId);
    }
});

/**
 * Shows a modal with movie details
 * @param {string} movieId - The ID of the movie to show details for
 */
const showMovieDetailsModal = (movieId) => {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.opacity = '0';
    modalOverlay.style.transition = 'opacity var(--transition-medium)';

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.transform = 'scale(0.8)';
    modalContent.style.transition = 'transform var(--transition-medium)';

    // Add content to modal
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>Movie Details</h2>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <p>Loading details for movie ID: ${movieId}...</p>
        </div>
    `;

    // Add modal to page
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // Animate in
    setTimeout(() => {
        modalOverlay.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
    }, 10);

    // Handle close button
    const closeButton = modalContent.querySelector('.modal-close');
    closeButton.addEventListener('click', () => {
        closeModal(modalOverlay);
    });

    // Close on overlay click
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            closeModal(modalOverlay);
        }
    });

    // Fetch movie details
    fetchMovieDetails(movieId, modalContent);
};

/**
 * Closes a modal with animation
 * @param {HTMLElement} modalOverlay - The modal overlay element
 */
const closeModal = (modalOverlay) => {
    const modalContent = modalOverlay.querySelector('.modal-content');
    modalOverlay.style.opacity = '0';
    modalContent.style.transform = 'scale(0.8)';

    setTimeout(() => {
        document.body.removeChild(modalOverlay);
    }, 300);
};

/**
 * Fetches movie details from the API
 * @param {string} movieId - The ID of the movie to fetch details for
 * @param {HTMLElement} modalContent - The modal content element to update
 */
const fetchMovieDetails = async (movieId, modalContent) => {
    const modalBody = modalContent.querySelector('.modal-body');

    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const movie = await response.json();

        // Update modal content with movie details
        modalBody.innerHTML = `
            <div class="movie-details-container">
                <div class="movie-details-poster">
                    <img src="${movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Image'}" alt="${movie.title} Poster">
                </div>
                <div class="movie-details-info">
                    <h3>${movie.title}</h3>
                    <p class="movie-details-tagline">${movie.tagline || ''}</p>
                    <div class="movie-details-meta">
                        <span><i class="fas fa-calendar"></i> ${movie.release_date || 'N/A'}</span>
                        <span><i class="fas fa-clock"></i> ${movie.runtime ? `${movie.runtime} min` : 'N/A'}</span>
                        <span><i class="fas fa-star"></i> ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                    </div>
                    <div class="movie-details-genres">
                        ${movie.genres ? movie.genres.map(genre => `<span class="genre-tag">${genre.name}</span>`).join('') : ''}
                    </div>
                    <div class="movie-details-overview">
                        <h4>Overview</h4>
                        <p>${movie.overview || 'No overview available.'}</p>
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error fetching movie details:', error);
        modalBody.innerHTML = `<p class="error-message">Error loading movie details: ${error.message}</p>`;
    }
};

// Infinity scroll implementation
window.addEventListener('scroll', () => {
    // Check if we're near the bottom of the page
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        // If we're not already loading and there are more pages to load
        // Only enable infinity scroll when not viewing favorites
        if (!isLoading && !isShowingFavorites && currentPage < totalPages) {
            currentPage++;

            let nextPageUrl;
            if (isFetchingPopularMovies) {
                nextPageUrl = `${POPULAR_MOVIES_URL}&page=${currentPage}`;
            } else {
                nextPageUrl = `${SEARCH_MOVIES_URL}${encodeURIComponent(currentSearchQuery)}&page=${currentPage}`;
            }

            fetchAndDisplayMovies(nextPageUrl, true);
        }
    }
});

// Initial load: Fetch and display popular movies
document.addEventListener('DOMContentLoaded', () => {
    isFetchingPopularMovies = true;
    fetchAndDisplayMovies(`${POPULAR_MOVIES_URL}&page=1`);

    // Update favorites count badge
    updateFavoritesCount();

    // Check for favorited movies and update their state
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
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
    }, 1000);
});
