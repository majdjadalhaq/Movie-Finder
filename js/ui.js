/**
 * Movie Finder UI Module
 * Handles all user interface interactions, DOM manipulation, and visual feedback
 */

// DOM Elements (using camelCase for consistency)
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

// Create filter container (includes both genre and sort options)
const createGenreFilterContainer = () => {
    const container = document.createElement('div');
    container.className = 'genre-filter-container hidden';
    container.id = 'genreFilter';
    container.setAttribute('aria-label', 'Filter movies by genre and sort options');
    container.setAttribute('role', 'group');
    return container;
};

// Create filter toggle button
const createGenreFilterToggle = () => {
    const toggle = document.createElement('button');
    toggle.className = 'genre-filter-toggle collapsed';
    toggle.innerHTML = '<i class="fas fa-chevron-down"></i> Show Filters';
    toggle.setAttribute('aria-label', 'Toggle filter visibility');
    toggle.setAttribute('aria-expanded', 'false');

    toggle.addEventListener('click', () => {
        genreFilterContainer.classList.toggle('hidden');
        toggle.classList.toggle('collapsed');

        // Update aria-expanded attribute
        const isExpanded = !genreFilterContainer.classList.contains('hidden');
        toggle.setAttribute('aria-expanded', isExpanded);

        // Update button text
        if (isExpanded) {
            toggle.innerHTML = '<i class="fas fa-chevron-up"></i> Filter & Sort';
        } else {
            toggle.innerHTML = '<i class="fas fa-chevron-down"></i> Show Filters';
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

// Selected genres for filtering (renamed for clarity)
let selectedGenreIds = [];

let displayStatusMessage = (message, isError = false) => {
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

    // Get genre names from genre IDs using the renamed map
    const genres = movie.genre_ids
        ? movie.genre_ids.slice(0, 3).map(id => genreIdToNameMap[id]).filter(Boolean).join(', ')
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
            // Initialize 3D tilt effect on new movie cards
            setTimeout(initTiltEffect, 100);
        } else {
            // Clear previous movies and display new ones
            movieListContainer.innerHTML = movies.map(createMovieCard).join('');
            hideStatusMessage();
            // Initialize 3D tilt effect on movie cards
            setTimeout(initTiltEffect, 100);
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

        // Initialize 3D tilt effect on movie cards
        setTimeout(initTiltEffect, 100);

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

    // Define maximum character limit
    const MAX_CHAR_LIMIT = 50;

    // Clear any existing error message
    clearSearchError();

    // Validate search input
    if (!query) {
        showSearchError('Please enter a movie name to search.');
        return;
    }

    if (query.length > MAX_CHAR_LIMIT) {
        showSearchError(`Please enter a movie name under ${MAX_CHAR_LIMIT} characters.`);
        return;
    }

    // If validation passes, perform search
    isFetchingPopularMovies = false;
    fetchAndDisplayMovies(`${SEARCH_MOVIES_URL}${encodeURIComponent(query)}&page=1`);
};

// Function to display search error message
const showSearchError = (message) => {
    // Check if error message element already exists
    let errorElement = document.querySelector('.search-error');

    // Create error element if it doesn't exist
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'search-error';
        searchForm.appendChild(errorElement);
    }

    // Set error message and display it
    errorElement.textContent = message;
    errorElement.classList.add('show');

    // Auto-hide error after 3 seconds
    setTimeout(() => {
        errorElement.classList.remove('show');
    }, 3000);

    // Shake animation for the search input
    searchInput.classList.add('shake');
    setTimeout(() => {
        searchInput.classList.remove('shake');
    }, 500);
};

// Function to clear search error message
const clearSearchError = () => {
    const errorElement = document.querySelector('.search-error');
    if (errorElement) {
        errorElement.classList.remove('show');
    }
};

// Add character counter display
const updateCharacterCounter = () => {
    const currentLength = searchInput.value.length;
    const MAX_CHAR_LIMIT = 50;

    // Find or create character counter element
    let counterElement = document.querySelector('.char-counter');

    if (!counterElement) {
        counterElement = document.createElement('div');
        counterElement.className = 'char-counter';
        searchForm.appendChild(counterElement);
    }

    // Update counter text
    counterElement.textContent = `${currentLength}/${MAX_CHAR_LIMIT}`;

    // Add warning class when approaching limit
    if (currentLength > MAX_CHAR_LIMIT * 0.8) {
        counterElement.classList.add('warning');
    } else {
        counterElement.classList.remove('warning');
    }
};

// Add input event listener to update character counter
searchInput.addEventListener('input', updateCharacterCounter);

// Initialize character counter
updateCharacterCounter();

// Event Listeners
searchForm.addEventListener('submit', handleSearch);

// Favorites button opens Favorites modal instead of switching views
favoritesToggle.addEventListener('click', () => {
    // Do not toggle active state to avoid implying sticky state
    // Open favorites modal (defined in modal.js)
    if (typeof showFavoritesModal === 'function') {
        showFavoritesModal();
    }
});

// App title click event listener
appTitle.addEventListener('click', (e) => {
    e.preventDefault();
    location.reload();
});

// 3D Tilt Effect for Movie Cards
const initTiltEffect = () => {
    const movieCards = document.querySelectorAll('.movie-card');

    movieCards.forEach(card => {
        const cardInner = card.querySelector('.movie-card-inner');

        // Mouse move event for tilt effect
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const cardWidth = rect.width;
            const cardHeight = rect.height;

            // Calculate mouse position relative to card center
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Calculate rotation values (max 10 degrees)
            const rotateY = ((mouseX / cardWidth) - 0.5) * 20;
            const rotateX = -((mouseY / cardHeight) - 0.5) * 20;

            // Apply transformation
            cardInner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
        });

        // Reset on mouse leave
        card.addEventListener('mouseleave', () => {
            cardInner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
};

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

        showMovieDetailsModal(movieId);
    }
});

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

// Create filter buttons (genre and sort)
const createGenreFilterButtons = (genres) => {
    genreFilterContainer.innerHTML = '';

    // Create header section
    const headerElement = document.createElement('div');
    headerElement.className = 'genre-filter-header';

    // Create title element
    const titleElement = document.createElement('div');
    titleElement.className = 'genre-filter-title';
    titleElement.innerHTML = '<i class="fas fa-filter"></i> Filter & Sort';

    // Create clear filters button
    const clearFiltersButton = document.createElement('button');
    clearFiltersButton.className = 'clear-filters';
    clearFiltersButton.textContent = 'Clear All';
    clearFiltersButton.setAttribute('aria-label', 'Clear all filters');
    clearFiltersButton.addEventListener('click', () => {
        selectedGenreIds = [];
        currentSortOption = null;
        document.querySelectorAll('.genre-filter-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.sort-filter-button').forEach(btn => {
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
            selectedGenreIds = [];
            document.querySelectorAll('.genre-filter-button').forEach(btn => {
                btn.classList.remove('active');
            });
            allButton.classList.add('active');

            // Update the count badge
            updateGenreCountBadge();

            // Apply filters and sort
            applyFiltersAndSort();
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
            const index = selectedGenreIds.indexOf(genreId);

            if (index > -1) {
                selectedGenreIds.splice(index, 1);
                button.classList.remove('active');

                // If no genres selected, select "All"
                if (selectedGenreIds.length === 0) {
                    allButton.classList.add('active');
                }
            } else {
                selectedGenreIds.push(genreId);
                button.classList.add('active');
                allButton.classList.remove('active');
            }

            // Update the genre count badge
            updateGenreCountBadge();

            // Apply filters and sort
            applyFiltersAndSort();
        });

        listContainer.appendChild(button);
    });

    genreFilterContainer.appendChild(listContainer);

    // Create sorting options container
    const sortContainer = document.createElement('div');
    sortContainer.className = 'filter-section';

    // Create sorting title
    const sortTitle = document.createElement('div');
    sortTitle.className = 'filter-section-title';
    sortTitle.innerHTML = '<i class="fas fa-sort"></i> Sort By';

    sortContainer.appendChild(sortTitle);

    // Create sorting options list
    const sortListContainer = document.createElement('div');
    sortListContainer.className = 'sort-filter-list';

    // Define sorting options
    const sortOptions = [
        { id: 'popularity-desc', name: 'popularity', apiParam: 'popularity.desc' },
        { id: 'release-date-desc', name: 'release', apiParam: 'release_date.desc' },
        { id: 'rating-desc', name: 'rating', apiParam: 'vote_average.desc' },
        { id: 'trending-week', name: 'Trending (This Week)', apiParam: 'trending.week' },
        { id: 'trending-day', name: 'Trending (Today)', apiParam: 'trending.day' }
    ];

    // Create sort option buttons
    sortOptions.forEach(option => {
        const button = document.createElement('button');
        button.className = 'sort-filter-button';
        button.textContent = option.name;
        button.setAttribute('data-sort-id', option.id);
        button.setAttribute('data-sort-param', option.apiParam);
        button.setAttribute('aria-label', `Sort movies by ${option.name}`);

        button.addEventListener('click', () => {
            // Toggle sort selection
            document.querySelectorAll('.sort-filter-button').forEach(btn => {
                btn.classList.remove('active');
            });

            if (currentSortOption === option.id) {
                // If clicking the already selected option, deselect it
                currentSortOption = null;
            } else {
                // Select the new sort option
                currentSortOption = option.id;
                button.classList.add('active');
            }

            // Apply filters and sort
            applyFiltersAndSort();
        });

        sortListContainer.appendChild(button);
    });

    sortContainer.appendChild(sortListContainer);
    genreFilterContainer.appendChild(sortContainer);
};

/**
 * Updates the genre filter count badge to show how many genres are selected
 * Provides visual feedback for active filters
 */
const updateGenreCountBadge = () => {
    const countElement = document.querySelector('.genre-filter-count');
    if (countElement) {
        countElement.remove();
    }

    if (selectedGenreIds.length > 0) {
        const countBadge = document.createElement('span');
        countBadge.className = 'genre-filter-count';
        countBadge.textContent = selectedGenreIds.length;
        countBadge.setAttribute('aria-label', `${selectedGenreIds.length} genres selected`);
        document.querySelector('.genre-filter-title').appendChild(countBadge);
    }
};

// Apply filters and sort options
/**
 * Applies the current genre and sort filters to update the movie display
 * Handles different combinations of search, genre filters, and sort options
 */
const applyFiltersAndSort = () => {
    // Update the count badge
    updateGenreCountBadge();

    // Determine what URL to use based on selection
    let filterUrl;

    // Handle trending sort options (use dedicated endpoints)
    if (currentSortOption === 'trending-week') {
        filterUrl = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=1`;
        if (selectedGenreIds.length > 0) {
            // Add genre filter to trending results
            filterUrl += `&with_genres=${selectedGenreIds.join(',')}`;
        }
    } else if (currentSortOption === 'trending-day') {
        filterUrl = `${BASE_URL}/trending/movie/day?api_key=${API_KEY}&page=1`;
        if (selectedGenreIds.length > 0) {
            // Add genre filter to trending results
            filterUrl += `&with_genres=${selectedGenreIds.join(',')}`;
        }
    } else {
        // Handle all other cases
        if (selectedGenreIds.length === 0 && !currentSortOption) {
            // If no filters selected, show default movies
            if (currentSearchQuery) {
                filterUrl = `${SEARCH_MOVIES_URL}${encodeURIComponent(currentSearchQuery)}&page=1`;
            } else {
                filterUrl = `${POPULAR_MOVIES_URL}&page=1`;
            }
        } else {
            // Use discover endpoint for filtering and sorting
            filterUrl = `${BASE_URL}/discover/movie?api_key=${API_KEY}`;

            // Add genre filter if selected
            if (selectedGenreIds.length > 0) {
                filterUrl += `&with_genres=${selectedGenreIds.join(',')}`;
            }

            // Add sort parameter if selected
            if (currentSortOption) {
                const sortButton = document.querySelector(`[data-sort-id="${currentSortOption}"]`);
                if (sortButton) {
                    const sortParam = sortButton.getAttribute('data-sort-param');
                    filterUrl += `&sort_by=${sortParam}`;
                }
            }

            // Add page parameter
            filterUrl += '&page=1';
        }
    }

    // Special handling for search with sort options
    if (currentSearchQuery && currentSortOption && !currentSortOption.includes('trending')) {
        // Search with sort parameters
        filterUrl = `${SEARCH_MOVIES_URL}${encodeURIComponent(currentSearchQuery)}`;

        // Add genre filter if selected
        if (selectedGenreIds.length > 0) {
            filterUrl += `&with_genres=${selectedGenreIds.join(',')}`;
        }

        // Add sort parameter if selected
        if (currentSortOption) {
            const sortButton = document.querySelector(`[data-sort-id="${currentSortOption}"]`);
            if (sortButton) {
                const sortParam = sortButton.getAttribute('data-sort-param');
                filterUrl += `&sort_by=${sortParam}`;
            }
        }

        filterUrl += '&page=1';
    }

    displayStatusMessage('Applying filters...');
    hideStatusMessage();

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

// Esc key: Let modal.js handle modal closing via stack.
// When no modals are open, Esc clears current search to return to popular movies.
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        const hasOpenModals = (window.modalStack && window.modalStack.length > 0);
        if (!hasOpenModals && currentSearchQuery) {
            clearSearch();
        }
    }
});

// Submit search on Enter key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        // Check if search input is focused
        if (document.activeElement === searchInput) {
            // Trigger search
            event.preventDefault();
            handleSearch(event);
        }
    }
});
