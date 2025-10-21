/**
 * Movie Finder Modal Module
 * Handles movie details modals, actor movies modals, and modal interactions
 */

// Modal stack to ensure Escape closes only the most recently opened modal
const modalStack = [];
// Expose for other modules (e.g., closeModal in app.js)
window.modalStack = modalStack;

/**
 * Displays a detailed modal for a specific movie
 * Fetches movie details, cast, and trailer data, then creates and shows the modal
 * @param {number} movieId - The TMDB movie ID to display details for
 */
const showMovieDetailsModal = async (movieId) => {
    try {
        // Fetch movie details from TMDB API
        const movie = await fetchMovieDetails(movieId);
        if (!movie) {
            alert('Failed to load movie details. Please try again.');
            return;
        }

        // Fetch cast information
        const cast = await fetchMovieCast(movieId);

        // Fetch trailer data (with error handling)
        let trailerData = null;
        let trailerError = null;
        try {
            trailerData = await fetchMovieTrailer(movieId);
        } catch (error) {
            console.error('Trailer fetch error:', error);
            trailerError = error.message;
        }

        // Generate modal HTML content
        const modalHTML = createMovieDetailsModalHTML(movie, cast, trailerData, trailerError);

        // Create and configure modal element
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = modalHTML;

        // Add modal to DOM
        document.body.appendChild(modal);

        // Track modal in stack (top-most last)
        modalStack.push(modal);

        // Set up event listeners for modal interactions
        setupModalEventListeners(modal);
        setupTabEventListeners(modal);

        // Set focus to close button for accessibility
        const closeButton = modal.querySelector('.modal-close');
        closeButton.focus();

    } catch (error) {
        console.error('Error showing movie details modal:', error);
        alert('An error occurred while loading movie details.');
    }
};

/**
 * Generates the HTML content for a movie details modal
 * @param {Object} movie - Movie data object from TMDB API
 * @param {Array} cast - Array of cast members
 * @param {string|null} trailerData - YouTube trailer ID or null
 * @param {string|null} trailerError - Error message if trailer failed to load
 * @returns {string} Complete HTML string for the modal
 */
const createMovieDetailsModalHTML = (movie, cast, trailerData, trailerError = null) => {
    // Extract and format movie data with fallbacks
    const backdropUrl = movie.backdrop_path ? `${BACKDROP_BASE_URL}${movie.backdrop_path}` : '';
    const posterUrl = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image';
    const title = movie.title || 'Untitled';
    const tagline = movie.tagline || '';
    const overview = movie.overview || 'No description available.';
    const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'N/A';
    const runtime = movie.runtime ? `${movie.runtime} min` : 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const voteCount = movie.vote_count ? movie.vote_count.toLocaleString() : 'N/A';


    // Generate genres HTML with fallback
    const genresHTML = movie.genres && movie.genres.length > 0
        ? movie.genres.map(genre => `<span class="genre-tag">${genre.name}</span>`).join('')
        : '';

    // Generate cast HTML with fallback
    const castHTML = cast && cast.length > 0
        ? cast.map(actor => `
            <button class="cast-member" onclick="fetchActorMovies(${actor.id}, '${actor.name.replace(/'/g, "\\'")}')">
                ${actor.name}
            </button>
        `).join('')
        : '<p>No cast information available.</p>';

    // Generate trailer HTML with error handling
    const trailerHTML = trailerError
        ? `<div class="movie-trailer"><p class="error-message">Trailer unavailable. ${trailerError}</p></div>`
        : trailerData
        ? `
            <div class="movie-trailer">
                <iframe width="100%" height="315" src="https://www.youtube-nocookie.com/embed/${trailerData}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
        `
        : '<div class="movie-trailer"><p>Trailer unavailable</p></div>';

    return `
        <div class="modal-content movie-details-modal">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close" onclick="closeModal(this.closest('.modal-overlay'))">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${backdropUrl ? `
                    <div class="movie-details-backdrop">
                        <img src="${backdropUrl}" alt="${title} backdrop">
                    </div>
                ` : ''}
                <div class="movie-details-container">
                    <div class="movie-details-poster">
                        <img src="${posterUrl}" alt="${title} poster">
                    </div>
                    <div class="movie-details-info">
                        ${tagline ? `<p class="movie-details-tagline">"${tagline}"</p>` : ''}
                        <div class="movie-details-meta">
                            <span><i class="fas fa-calendar"></i> ${releaseDate}</span>
                            <span><i class="fas fa-clock"></i> ${runtime}</span>
                            <span><i class="fas fa-star"></i> ${rating} (${voteCount} votes)</span>
                        </div>
                        ${genresHTML ? `<div class="movie-details-genres">${genresHTML}</div>` : ''}

                        <div class="movie-details-tabs">
                            <div class="tab-buttons">
                                <button class="tab-button active" data-tab="overview">Overview</button>
                                <button class="tab-button" data-tab="cast">Cast</button>
                                <button class="tab-button" data-tab="trailer">Trailer</button>
                            </div>
                            <div class="tab-content">
                                <div class="tab-pane active" id="overview">
                                    <div class="movie-details-overview">
                                        <p>${overview}</p>
                                    </div>
                                </div>
                                <div class="tab-pane" id="cast">
                                    <div class="movie-cast">
                                        <div class="cast-list">
                                            ${castHTML}
                                        </div>
                                    </div>
                                </div>
                                <div class="tab-pane" id="trailer">
                                    ${trailerHTML}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

/**
 * Displays a modal showing all movies for a specific actor
 * @param {string} actorName - The name of the actor
 * @param {Array} movies - Array of movie objects starring the actor
 */
const showActorMoviesModal = (actorName, movies) => {
    // Generate HTML for each movie card
    const moviesHTML = movies.map(movie => `
        <div class="actor-movie-card" onclick="showMovieDetailsModal(${movie.id})">
            <img src="${movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : 'https://via.placeholder.com/150x225?text=No+Image'}" alt="${movie.title}" class="actor-movie-poster">
            <div class="actor-movie-info">
                <div class="actor-movie-title">${movie.title}</div>
                <div class="actor-movie-year">${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</div>
            </div>
        </div>
    `).join('');

    // Create modal HTML structure
    const modalHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Movies starring ${actorName}</h2>
                <button class="modal-close" onclick="closeModal(this.closest('.modal-overlay'))">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="actor-movies-grid">
                    ${moviesHTML}
                </div>
            </div>
        </div>
    `;

    // Create and configure modal element
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);

    // Track modal in stack
    modalStack.push(modal);

    // Set up event listeners
    setupModalEventListeners(modal);

    // Set focus for accessibility
    const closeButton = modal.querySelector('.modal-close');
    closeButton.focus();
};

/**
 * Sets up event listeners for modal interactions
 * Handles escape key and backdrop click for closing modals
 * @param {HTMLElement} modal - The modal overlay element
 */
const setupModalEventListeners = (modal) => {
    // Handle backdrop click to close modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
};

/**
 * Global Escape handler: close only the most recently opened modal
 */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && window.modalStack && window.modalStack.length > 0) {
        const topModal = window.modalStack[window.modalStack.length - 1];
        closeModal(topModal);
    }
});

/**
 * Show Favorites modal using existing modal styles
 * Displays user's saved favorite movies in a grid and allows closing via Esc or close button
 */
const showFavoritesModal = async () => {
    try {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

        const movies = [];
        for (const movieId of favorites) {
            try {
                const res = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
                if (res.ok) {
                    movies.push(await res.json());
                }
            } catch (err) {
                console.error('Error fetching favorite movie', movieId, err);
            }
        }

        const moviesHTML = movies.map(movie => `
            <div class="actor-movie-card" onclick="showMovieDetailsModal(${movie.id})">
                <img src="${movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : 'https://via.placeholder.com/150x225?text=No+Image'}" alt="${movie.title}" class="actor-movie-poster">
                <div class="actor-movie-info">
                    <div class="actor-movie-title">${movie.title}</div>
                    <div class="actor-movie-year">${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</div>
                </div>
            </div>
        `).join('');

        const emptyHTML = `<p class="status-message">No favorite movies found. Add some movies to your favorites to see them here.</p>`;

        const modalHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Your Favorites</h2>
                    <button class="modal-close" aria-label="Close favorites" onclick="closeModal(this.closest('.modal-overlay'))">
                        <i class="fas fa-times" aria-hidden="true"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="actor-movies-grid">
                        ${movies.length ? moviesHTML : emptyHTML}
                    </div>
                </div>
            </div>
        `;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.innerHTML = modalHTML;
        document.body.appendChild(modal);

        // Track in stack and wire interactions
        window.modalStack.push(modal);
        setupModalEventListeners(modal);

        const closeButton = modal.querySelector('.modal-close');
        closeButton.focus();
    } catch (error) {
        console.error('Error showing favorites modal:', error);
        alert('Failed to open favorites. Please try again.');
    }
};

/**
 * Sets up event listeners for tab navigation within modals
 * Handles switching between overview, cast, and trailer tabs
 * @param {HTMLElement} modal - The modal element containing tabs
 */
const setupTabEventListeners = (modal) => {
    const tabButtons = modal.querySelectorAll('.tab-button');
    const tabPanes = modal.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Add active class to clicked button and corresponding pane
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            const targetPane = modal.querySelector(`#${tabId}`);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
};
