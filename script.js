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

// Infinity scroll state variables
let currentPage = 1;
let isLoading = false;
let currentSearchQuery = '';
let totalPages = 0;
let isFetchingPopularMovies = true;

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

    return `
        <div class="movie-card">
            <img src="${posterPath}" alt="${title} Poster" class="movie-poster">
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

// Infinity scroll implementation
window.addEventListener('scroll', () => {
    // Check if we're near the bottom of the page
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        // If we're not already loading and there are more pages to load
        if (!isLoading && currentPage < totalPages) {
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
});
