// TMDB API Configuration
const API_KEY = '5b40b0f5b10231d23aac66a5994c4c05';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';
const YOUTUBE_API_KEY = 'AIzaSyC3hIy9_Kejs-azrf5bRYw_JZRgCLAVijE';

// API Endpoints
const POPULAR_MOVIES_URL = `${BASE_URL}/movie/popular?api_key=${API_KEY}`;
const SEARCH_MOVIES_URL = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=`;
const GENRES_URL = `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`;
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search?part=snippet';
const MOVIE_CREDITS_URL = (movieId) => `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`;
const PERSON_MOVIES_URL = (personId) => `${BASE_URL}/person/${personId}/movie_credits?api_key=${API_KEY}`;

// Genre Mapping
let genreMap = {};

// Fetch and display movie cast
const fetchMovieCast = async (movieId) => {
    try {
        const response = await fetch(MOVIE_CREDITS_URL(movieId));
        const data = await response.json();
        return data.cast.slice(0, 10); // Return first 10 cast members
    } catch (error) {
        console.error('Error fetching cast:', error);
        return [];
    }
};

// Fetch and display actor movies
const fetchActorMovies = async (actorId, actorName) => {
    try {
        const response = await fetch(PERSON_MOVIES_URL(actorId));
        const data = await response.json();
        
        // Sort movies by popularity and get first 12
        const movies = data.cast
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 12);
            
        showActorMoviesModal(actorName, movies);
    } catch (error) {
        console.error('Error fetching actor movies:', error);
    }
};

// Display actor movies in a modal
const showActorMoviesModal = (actorName, movies) => {
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

    // Create movies grid
    const moviesGrid = document.createElement('div');
    moviesGrid.className = 'actor-movies-grid';
    
    // Add movies to grid
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'actor-movie-card';
        movieCard.setAttribute('data-movie-id', movie.id);
        
        const posterPath = movie.poster_path 
            ? `${IMAGE_BASE_URL}${movie.poster_path}` 
            : 'https://via.placeholder.com/300x450?text=No+Image';
            
        const releaseYear = movie.release_date 
            ? movie.release_date.substring(0, 4) 
            : 'N/A';
            
        movieCard.innerHTML = `
            <img src="${posterPath}" alt="${movie.title} Poster" class="actor-movie-poster" loading="lazy">
            <div class="actor-movie-info">
                <h4 class="actor-movie-title">${movie.title}</h4>
                <p class="actor-movie-year">${releaseYear}</p>
            </div>
        `;
        
        // Add click event to show movie details
        movieCard.addEventListener('click', () => {
            closeModal(modalOverlay);
            showMovieDetailsModal(movie.id);
        });
        
        moviesGrid.appendChild(movieCard);
    });

    // Add content to modal
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>Movies starring ${actorName}</h2>
            <button class="modal-close" aria-label="Close modal">&times;</button>
        </div>
        <div class="modal-body">
            ${moviesGrid.outerHTML}
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

    // Set up close button
    const closeButton = modalContent.querySelector('.modal-close');
    closeButton.addEventListener('click', () => closeModal(modalOverlay));
    
    // Close on overlay click
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            closeModal(modalOverlay);
        }
    });
};
let selectedGenres = [];

// DOM Elements (using camelCase)
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const movieListContainer = document.getElementById('movieList');
const statusMessageElement = document.getElementById('statusMessage');
const favoritesToggle = document.getElementById('favoritesToggle');
const appTitle = document.getElementById('appTitle');

// Create UI elements
const createBackToTopButton = () => {
    const button = document.createElement('button');
    button.className = 'back-to-top';
    button.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
    button.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(button);
    return button;
};

const backToTopButton = createBackToTopButton();

// Create genre filter container
const createGenreFilterContainer = () => {
    const container = document.createElement('div');
    container.className = 'genre-filter-container';
    container.id = 'genreFilter';
    container.setAttribute('aria-label', 'Filter movies by genre');
    container.setAttribute('role', 'group');
    return container;
};

// Create genre filter toggle button
const createGenreFilterToggle = () => {
    const toggle = document.createElement('button');
    toggle.className = 'genre-filter-toggle';
    toggle.innerHTML = '<i class="fas fa-chevron-up"></i> Filter by Genre';
    toggle.setAttribute('aria-label', 'Toggle genre filter visibility');
    toggle.setAttribute('aria-expanded', 'true');

    toggle.addEventListener('click', () => {
        genreFilterContainer.classList.toggle('hidden');
        toggle.classList.toggle('collapsed');

        // Update aria-expanded attribute
        const isExpanded = !genreFilterContainer.classList.contains('hidden');
        toggle.setAttribute('aria-expanded', isExpanded);

        // Update button text
        if (isExpanded) {
            toggle.innerHTML = '<i class="fas fa-chevron-up"></i> Filter by Genre';
        } else {
            toggle.innerHTML = '<i class="fas fa-chevron-down"></i> Show Genre Filter';
        }
    });

    return toggle;
};

const genreFilterContainer = createGenreFilterContainer();
const genreFilterToggle = createGenreFilterToggle();

// Insert toggle and container before movie list
movieListContainer.parentNode.insertBefore(genreFilterToggle, movieListContainer);
movieListContainer.parentNode.insertBefore(genreFilterContainer, movieListContainer);

// Add scroll listener to header
window.addEventListener('scroll', () => {
    const header = document.querySelector('.main-header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Infinity scroll state variables
let currentPage = 1;
let isLoading = false;
let currentSearchQuery = '';
let totalPages = 0;
let isFetchingPopularMovies = true;

// Favorites state variables
let isShowingFavorites = false;
let favoriteMovies = [];

const displayStatusMessage = (message, isError = false) => {
    movieListContainer.innerHTML = '';
    statusMessageElement.textContent = message;
    statusMessageElement.className = isError ? 'status-message error' : 'status-message';
    statusMessageElement.style.display = 'block';
};

const displaySkeletonCards = (count = 8) => {
    movieListContainer.innerHTML = '';
    const skeletonHTML = Array(count).fill('').map(() => 
        `<div class="movie-card skeleton-card"><div class="skeleton"></div></div>`
    ).join('');
    movieListContainer.innerHTML = skeletonHTML;
};

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

    // Get genre names from genre IDs
    const genres = movie.genre_ids 
        ? movie.genre_ids.slice(0, 3).map(id => genreMap[id]).filter(Boolean).join(', ')
        : (movie.genres ? movie.genres.slice(0, 3).map(g => g.name).join(', ') : '');

    return `
        <div class="movie-card" data-movie-id="${movie.id}">
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
    `;
};

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
        console.error('Fetch error:', error);
        const loadingIndicator = document.querySelector('.loading-indicator');
        if (loadingIndicator) loadingIndicator.remove();
        if (!append) {
            displayStatusMessage(`Error: ${error.message}. Please try again later.`, true);
        }
        isLoading = false;
    }
};

const fetchAndDisplayFavoriteMovies = async (movieIds) => {
    if (isLoading || !movieIds || movieIds.length === 0) return;
    isLoading = true;
    displayStatusMessage('Loading favorite movies...');
    hideStatusMessage();
    movieListContainer.innerHTML = '';
    displaySkeletonCards();

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

const handleSearch = (event) => {
    event.preventDefault();
    const query = searchInput.value.trim();
    currentSearchQuery = query;

    if (query) {
        isFetchingPopularMovies = false;
        fetchAndDisplayMovies(`${SEARCH_MOVIES_URL}${encodeURIComponent(query)}&page=1`);
    } else {
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

// App title click event listener
appTitle.addEventListener('click', (e) => {
    e.preventDefault();
    location.reload();
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
            setTimeout(() => button.style.transform = '', 300);

            // Store in favorites
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            if (!favorites.includes(movieId)) {
                favorites.push(movieId);
                localStorage.setItem('favorites', JSON.stringify(favorites));
            }

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

const showMovieDetailsModal = (movieId) => {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.opacity = '0';
    modalOverlay.style.transition = 'opacity var(--transition-medium)';

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content movie-details-modal';
    modalContent.style.transform = 'scale(0.8)';
    modalContent.style.transition = 'transform var(--transition-medium)';

    // Add content to modal
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>Movie Details</h2>
            <button class="modal-close" aria-label="Close modal">&times;</button>
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

const closeModal = (modalOverlay) => {
    const modalContent = modalOverlay.querySelector('.modal-content');
    modalOverlay.style.opacity = '0';
    modalContent.style.transform = 'scale(0.8)';

    setTimeout(() => document.body.removeChild(modalOverlay), 300);
};

const fetchMovieDetails = async (movieId, modalContent) => {
    const modalBody = modalContent.querySelector('.modal-body');

    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const movie = await response.json();

        // Extract release year for YouTube search
        const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : '';

        // Fetch YouTube trailer
        let trailerHtml = '';
        try {
            // Search for official trailer on YouTube
            const searchQuery = `${movie.title} ${releaseYear} official trailer`;
            console.log('Searching for trailer with query:', searchQuery);
            const youtubeResponse = await fetch(`${YOUTUBE_SEARCH_URL}&q=${encodeURIComponent(searchQuery)}&maxResults=1&type=video&key=${YOUTUBE_API_KEY}`);

            if (youtubeResponse.ok) {
                const youtubeData = await youtubeResponse.json();
                console.log('YouTube API response:', youtubeData);

                if (youtubeData.items && youtubeData.items.length > 0) {
                    const videoId = youtubeData.items[0].id.videoId;
                    console.log('Found video ID:', videoId);
                    trailerHtml = `
                        <div class="movie-trailer">
                            <h3>Official Trailer</h3>
                            <div class="video-container">
                                <iframe 
                                    src="https://www.youtube.com/embed/${videoId}" 
                                    title="${movie.title} Official Trailer" 
                                    frameborder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowfullscreen>
                                </iframe>
                            </div>
                        </div>
                    `;
                } else {
                    console.log('No trailer found for:', searchQuery);
                    trailerHtml = `
                        <div class="movie-trailer">
                            <h3>Official Trailer</h3>
                            <p>Trailer unavailable</p>
                        </div>
                    `;
                }
            } else {
                console.log('YouTube API error status:', youtubeResponse.status);
                const errorText = await youtubeResponse.text();
                console.log('YouTube API error response:', errorText);
                throw new Error(`YouTube API error: ${youtubeResponse.status}`);
            }
        } catch (error) {
            console.error('Error fetching YouTube trailer:', error);
            trailerHtml = `
                <div class="movie-trailer">
                    <h3>Official Trailer</h3>
                    <p>Trailer unavailable</p>
                </div>
            `;
        }

        // Create backdrop image HTML
        const backdropHtml = movie.backdrop_path 
            ? `<div class="movie-details-backdrop">
                 <img src="${BACKDROP_BASE_URL}${movie.backdrop_path}" alt="${movie.title} Backdrop">
               </div>`
            : '';

        // Fetch movie cast
        const cast = await fetchMovieCast(movieId);
        
        // Create cast HTML
        let castHtml = '';
        if (cast.length > 0) {
            const castListHtml = cast.map(actor => 
                `<span class="cast-member" data-actor-id="${actor.id}" data-actor-name="${actor.name}" role="button" tabindex="0">${actor.name}</span>`
            ).join('');
            
            castHtml = `
                <div class="movie-cast">
                    <h4 class="cast-title">Cast</h4>
                    <div class="cast-list">
                        ${castListHtml}
                    </div>
                </div>
            `;
        }
        
        // Update modal content with movie details
        modalBody.innerHTML = `
            ${backdropHtml}
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
                    ${castHtml}
                </div>
            </div>
            ${trailerHtml}
        `;
        
        // Set up cast member click events
        const castMembers = modalBody.querySelectorAll('.cast-member');
        castMembers.forEach(member => {
            member.addEventListener('click', () => {
                const actorId = member.dataset.actorId;
                const actorName = member.dataset.actorName;
                fetchActorMovies(actorId, actorName);
            });
            
            // Add keyboard support
            member.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    const actorId = member.dataset.actorId;
                    const actorName = member.dataset.actorName;
                    fetchActorMovies(actorId, actorName);
                }
            });
        });

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

// Fetch genres from TMDB API
const fetchGenres = async () => {
    try {
        const response = await fetch(GENRES_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        // Create genre map for easy lookup
        data.genres.forEach(genre => {
            genreMap[genre.id] = genre.name;
        });

        // Create genre filter buttons
        createGenreFilterButtons(data.genres);
    } catch (error) {
        console.error('Error fetching genres:', error);
    }
};

// Create genre filter buttons
const createGenreFilterButtons = (genres) => {
    genreFilterContainer.innerHTML = '';

    // Create header section
    const headerElement = document.createElement('div');
    headerElement.className = 'genre-filter-header';

    // Create title element
    const titleElement = document.createElement('div');
    titleElement.className = 'genre-filter-title';
    titleElement.innerHTML = '<i class="fas fa-filter"></i> Filter by Genre';

    // Create clear filters button
    const clearFiltersButton = document.createElement('button');
    clearFiltersButton.className = 'clear-filters';
    clearFiltersButton.textContent = 'Clear All';
    clearFiltersButton.setAttribute('aria-label', 'Clear all genre filters');
    clearFiltersButton.addEventListener('click', () => {
        selectedGenres = [];
        document.querySelectorAll('.genre-filter-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('[data-genre-id="all"]').classList.add('active');

        // Update the count badge
        updateGenreCountBadge();

        if (currentSearchQuery) {
            const searchUrl = `${SEARCH_MOVIES_URL}${encodeURIComponent(currentSearchQuery)}&page=1`;
            fetchAndDisplayMovies(searchUrl);
        } else {
            fetchAndDisplayMovies(`${POPULAR_MOVIES_URL}&page=1`);
        }
    });

    headerElement.appendChild(titleElement);
    headerElement.appendChild(clearFiltersButton);
    genreFilterContainer.appendChild(headerElement);

    // Create list container for genre buttons
    const listContainer = document.createElement('div');
    listContainer.className = 'genre-filter-list';

    // Add "All" button
    const allButton = document.createElement('button');
    allButton.className = 'genre-filter-button active';
    allButton.textContent = 'All';
    allButton.setAttribute('data-genre-id', 'all');
    allButton.setAttribute('aria-label', 'Show all movies');
    allButton.addEventListener('click', () => {
        selectedGenres = [];
        document.querySelectorAll('.genre-filter-button').forEach(btn => {
            btn.classList.remove('active');
        });
        allButton.classList.add('active');

        // Update the count badge
        updateGenreCountBadge();

        if (currentSearchQuery) {
            const searchUrl = `${SEARCH_MOVIES_URL}${encodeURIComponent(currentSearchQuery)}&page=1`;
            fetchAndDisplayMovies(searchUrl);
        } else {
            fetchAndDisplayMovies(`${POPULAR_MOVIES_URL}&page=1`);
        }
    });
    listContainer.appendChild(allButton);

    // Add genre buttons
    genres.forEach(genre => {
        const button = document.createElement('button');
        button.className = 'genre-filter-button';
        button.textContent = genre.name;
        button.setAttribute('data-genre-id', genre.id);
        button.setAttribute('aria-label', `Filter by ${genre.name}`);

        button.addEventListener('click', () => {
            // Toggle genre selection
            const genreId = genre.id.toString();
            const index = selectedGenres.indexOf(genreId);

            if (index > -1) {
                selectedGenres.splice(index, 1);
                button.classList.remove('active');

                // If no genres selected, select "All"
                if (selectedGenres.length === 0) {
                    allButton.classList.add('active');
                }
            } else {
                selectedGenres.push(genreId);
                button.classList.add('active');
                allButton.classList.remove('active');
            }

            // Update the genre count badge
            updateGenreCountBadge();

            // Filter movies based on selected genres
            filterMoviesByGenres();
        });

        listContainer.appendChild(button);
    });

    genreFilterContainer.appendChild(listContainer);
};

// Update genre filter count badge
const updateGenreCountBadge = () => {
    const countElement = document.querySelector('.genre-filter-count');
    if (countElement) {
        countElement.remove();
    }

    if (selectedGenres.length > 0) {
        const countBadge = document.createElement('span');
        countBadge.className = 'genre-filter-count';
        countBadge.textContent = selectedGenres.length;
        countBadge.setAttribute('aria-label', `${selectedGenres.length} genres selected`);
        document.querySelector('.genre-filter-title').appendChild(countBadge);
    }
};

// Filter movies by selected genres
const filterMoviesByGenres = () => {
    // Update the count badge
    updateGenreCountBadge();

    if (selectedGenres.length === 0) {
        // If no genres selected, show all movies
        if (currentSearchQuery) {
            const searchUrl = `${SEARCH_MOVIES_URL}${encodeURIComponent(currentSearchQuery)}&page=1`;
            fetchAndDisplayMovies(searchUrl);
        } else {
            fetchAndDisplayMovies(`${POPULAR_MOVIES_URL}&page=1`);
        }
        return;
    }

    displayStatusMessage('Filtering movies by genre...');
    hideStatusMessage();

    // Fetch movies with selected genres
    const genreQuery = selectedGenres.join(',');
    let filterUrl;

    if (currentSearchQuery) {
        filterUrl = `${SEARCH_MOVIES_URL}${encodeURIComponent(currentSearchQuery)}&with_genres=${genreQuery}&page=1`;
    } else {
        filterUrl = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreQuery}&page=1`;
    }

    fetchAndDisplayMovies(filterUrl);
};

// Show/hide back to top button based on scroll position
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.classList.add('visible');
    } else {
        backToTopButton.classList.remove('visible');
    }
});

// Scroll to top when button is clicked
backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Initial load: Fetch and display popular movies
document.addEventListener('DOMContentLoaded', () => {
    isFetchingPopularMovies = true;
    fetchAndDisplayMovies(`${POPULAR_MOVIES_URL}&page=1`);

    // Fetch genres
    fetchGenres();

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
