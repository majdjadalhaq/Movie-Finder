/**
 * Movie Finder API Configuration and Functions
 * Handles all external API calls to TMDB and YouTube Data API
 */

// TMDB API Configuration
const API_KEY = '5b40b0f5b10231d23aac66a5994c4c05';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

// YouTube API Configuration
const YOUTUBE_API_KEY = 'AIzaSyC3hIy9_Kejs-azrf5bRYw_JZRgCLAVijE'; // Note: This should be secured in production
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

// API Endpoints
const POPULAR_MOVIES_URL = `${BASE_URL}/movie/popular?api_key=${API_KEY}`;
const SEARCH_MOVIES_URL = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=`;
const GENRES_URL = `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`;
const MOVIE_CREDITS_URL = (movieId) => `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`;
const PERSON_MOVIES_URL = (personId) => `${BASE_URL}/person/${personId}/movie_credits?api_key=${API_KEY}`;

// Genre Mapping - Maps genre IDs to genre names for easy lookup
let genreIdToNameMap = {};

// Current sorting option selected by user
let currentSortOption = null;

/**
 * Handles API errors consistently across all API calls
 * @param {Error} error - The error object
 * @param {string} context - Description of where the error occurred
 * @returns {null} Always returns null to indicate failure
 */
const handleApiError = (error, context) => {
    console.error(`API Error in ${context}:`, error);
    return null;
};

/**
 * Fetches the cast information for a specific movie
 * @param {number|string} movieId - The TMDB movie ID
 * @returns {Array} Array of cast members (max 10), or empty array on error
 */
const fetchMovieCast = async (movieId) => {
    try {
        const response = await fetch(MOVIE_CREDITS_URL(movieId));
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data.cast.slice(0, 10); // Return first 10 cast members
    } catch (error) {
        return handleApiError(error, 'fetchMovieCast');
    }
};

/**
 * Fetches detailed information for a specific movie
 * @param {number|string} movieId - The TMDB movie ID
 * @returns {Object|null} Movie details object, or null on error
 */
const fetchMovieDetails = async (movieId) => {
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const movie = await response.json();
        return movie;
    } catch (error) {
        return handleApiError(error, 'fetchMovieDetails');
    }
};

/**
 * Fetches the official trailer video ID for a movie from YouTube
 * @param {number|string} movieId - The TMDB movie ID
 * @returns {string|null} YouTube video ID, or null if no trailer found
 * @throws {Error} Throws specific YouTube API errors (quota, forbidden, etc.)
 */
const fetchMovieTrailer = async (movieId) => {
    try {
        // First get movie details to get title and release year
        const movieResponse = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
        if (!movieResponse.ok) {
            throw new Error(`Failed to fetch movie details: ${movieResponse.status}`);
        }
        const movie = await movieResponse.json();

        // Extract release year for YouTube search
        const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : '';

        // Search for official trailer on YouTube
        const searchQuery = `${movie.title} ${releaseYear} official trailer`;

        const youtubeResponse = await fetch(`${YOUTUBE_SEARCH_URL}?part=snippet&q=${encodeURIComponent(searchQuery)}&maxResults=1&type=video&key=${YOUTUBE_API_KEY}`);

        if (!youtubeResponse.ok) {
            const errorData = await youtubeResponse.json().catch(() => ({}));
            console.error('YouTube API error:', youtubeResponse.status, errorData);

            // Handle specific YouTube API errors
            if (youtubeResponse.status === 403) {
                if (errorData.error?.errors?.[0]?.reason === 'quotaExceeded') {
                    throw new Error('YouTube API quota exceeded. Please try again later.');
                } else if (errorData.error?.errors?.[0]?.reason === 'forbidden') {
                    throw new Error('YouTube API access forbidden. Please check API key permissions.');
                }
            } else if (youtubeResponse.status === 400) {
                throw new Error('Invalid YouTube API request. Please check API key.');
            } else if (youtubeResponse.status === 404) {
                throw new Error('YouTube API endpoint not found.');
            } else {
                throw new Error(`YouTube API error: ${youtubeResponse.status}`);
            }
        }

        const youtubeData = await youtubeResponse.json();

        if (youtubeData.items && youtubeData.items.length > 0) {
            const videoId = youtubeData.items[0].id.videoId;
            return videoId;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching movie trailer:', error);

        // Re-throw specific errors, return null for generic errors
        if (error.message.includes('YouTube API') ||
            error.message.includes('quota') ||
            error.message.includes('forbidden') ||
            error.message.includes('Invalid YouTube API')) {
            throw error;
        }

        return null;
    }
};

/**
 * Fetches movies for a specific actor and displays them in a modal
 * @param {number|string} actorId - The TMDB person ID
 * @param {string} actorName - The actor's name for display purposes
 */
const fetchActorMovies = async (actorId, actorName) => {
    try {
        const response = await fetch(PERSON_MOVIES_URL(actorId));
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        // Sort movies by popularity and get first 12
        const movies = data.cast
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 12);

        showActorMoviesModal(actorName, movies);
    } catch (error) {
        console.error('Error fetching actor movies:', error);
        // Show user-friendly error message
        alert('Failed to load actor movies. Please try again.');
    }
};

/**
 * Fetches available movie genres from TMDB and creates filter buttons
 * Populates the global genreIdToNameMap for genre name lookups
 */
const fetchGenres = async () => {
    try {
        const response = await fetch(GENRES_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        // Create genre map for easy lookup - maps genre IDs to names
        data.genres.forEach(genre => {
            genreIdToNameMap[genre.id] = genre.name;
        });

        // Create genre filter buttons in the UI
        createGenreFilterButtons(data.genres);
    } catch (error) {
        console.error('Error fetching genres:', error);
        // Show user-friendly error message
        alert('Failed to load genre filters. Some features may not work properly.');
    }
};
