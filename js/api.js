/**
 * js/api.js
 * Centralized API utilities + TMDB/YouTube functions with:
 * - timeouts
 * - retries (limited)
 * - sessionStorage caching with TTL
 * - consistent error shaping
 */

/**
 * Pull the configuration entries into local constants so we can reference
 * them without repeatedly accessing the `CONFIG` object.
 */
const {
  TMDB_API_KEY,
  YOUTUBE_API_KEY,
  BASE_URL,
  IMAGE_BASE_URL,
  BACKDROP_BASE_URL,
  YOUTUBE_SEARCH_URL,
  REQUEST_TIMEOUT_MS,
  CACHE_TTL_MS,
} = CONFIG;

// Expose image base URLs globally so UI helpers can build absolute image paths.
window.IMAGE_BASE_URL = IMAGE_BASE_URL;
window.BACKDROP_BASE_URL = BACKDROP_BASE_URL;

// Static endpoints plus helpers that generate full TMDB request URLs on demand.
const ENDPOINTS = {
  POPULAR: `${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`,
  SEARCH: `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=`,
  GENRES: `${BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`,
  CREDITS: (id) => `${BASE_URL}/movie/${id}/credits?api_key=${TMDB_API_KEY}`,
  PERSON_MOVIES: (personId) => `${BASE_URL}/person/${personId}/movie_credits?api_key=${TMDB_API_KEY}`,
  MOVIE: (id) => `${BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}`,
  TRENDING_DAY: `${BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`,
  TRENDING_WEEK: `${BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`,
  DISCOVER: `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}`,
};

// --- Light session cache ---
// Store lightweight responses in `sessionStorage` with a TTL so we can skip
// duplicate network requests during a browsing session.
const cacheGet = (key) => {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { value, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) {
      sessionStorage.removeItem(key);
      return null;
    }
    return value;
  } catch {
    return null;
  }
};

const cacheSet = (key, value, ttl = CACHE_TTL_MS) => {
  try {
    sessionStorage.setItem(
      key,
      JSON.stringify({ value, expiresAt: Date.now() + ttl })
    );
  } catch {
    // ignore quota errors
  }
};

// --- Timeout + retry fetch wrapper ---
// Adds a fetch timeout plus a simple retry to improve resilience when the API
// has minor hiccups or slow responses.
const apiFetch = async (url, { method = 'GET', retries = 1, context = 'api' } = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, { method, signal: controller.signal });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} (${context}): ${txt || res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    if (retries > 0) {
      // small backoff
      await new Promise(r => setTimeout(r, 300));
      return apiFetch(url, { method, retries: retries - 1, context });
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
};

// Genre map (id -> name)
// Updated whenever we fetch a fresh genre list so UI components can look up
// display names from raw TMDB IDs.
let genreIdToNameMap = {};
window.genreIdToNameMap = genreIdToNameMap;
window.currentSortOption = null;

// --- API functions ---
// Individual helpers encapsulate TMDB / YouTube requests and hide caching,
// transformation, and basic error shaping from the rest of the app.
const fetchMovieCast = async (movieId) => {
  const cacheKey = `credits:${movieId}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const data = await apiFetch(ENDPOINTS.CREDITS(movieId), { context: 'credits' });
  const cast = (data.cast || []).slice(0, 10);
  cacheSet(cacheKey, cast);
  return cast;
};

const fetchMovieDetails = async (movieId) => {
  const cacheKey = `movie:${movieId}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const data = await apiFetch(ENDPOINTS.MOVIE(movieId), { context: 'movie' });
  cacheSet(cacheKey, data);
  return data;
};

const fetchMovieTrailer = async (movieId) => {
  // Try cache per movieId
  const cacheKey = `trailer:${movieId}`;
  const cached = cacheGet(cacheKey);
  if (cached !== null) return cached;

  // Reuse the movie details call so the trailer search can include title + year.
  const movie = await fetchMovieDetails(movieId);
  const year = movie.release_date ? movie.release_date.slice(0, 4) : '';
  const q = `${movie.title} ${year} official trailer`;

  const url =
    `${YOUTUBE_SEARCH_URL}?part=snippet&q=${encodeURIComponent(q)}&maxResults=1&type=video&key=${YOUTUBE_API_KEY}`;

  try {
    const data = await apiFetch(url, { context: 'youtube', retries: 0 });
    const videoId = (data.items && data.items[0] && data.items[0].id && data.items[0].id.videoId) || null;
    cacheSet(cacheKey, videoId, 1000 * 60 * 60); // 1h cache
    return videoId;
  } catch (err) {
    // Shape readable errors for UI
    const msg = String(err.message || '');
    let uiMsg = 'Trailer unavailable.';
    if (msg.includes('HTTP 403')) uiMsg = 'YouTube quota or permissions issue.';
    else if (msg.includes('HTTP 400')) uiMsg = 'Invalid YouTube request.';
    else if (msg.includes('abort')) uiMsg = 'YouTube request timed out.';
    // Store null to avoid hammering
    cacheSet(cacheKey, null, 1000 * 60 * 10); // 10 min
    throw new Error(uiMsg);
  }
};

const fetchActorMovies = async (actorId, actorName) => {
  const cacheKey = `person:${actorId}`;
  const cached = cacheGet(cacheKey);
  const data = cached || await apiFetch(ENDPOINTS.PERSON_MOVIES(actorId), { context: 'person' });
  if (!cached) cacheSet(cacheKey, data);

  // High popularity and a small slice keeps the modal concise and snappy.
  const movies = (data.cast || []).sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 12);
  showActorMoviesModal(actorName, movies);
};

const fetchGenres = async () => {
  const cacheKey = `genres`;
  const cached = cacheGet(cacheKey);
  const data = cached || await apiFetch(ENDPOINTS.GENRES, { context: 'genres' });
  if (!cached) cacheSet(cacheKey, data, 1000 * 60 * 60 * 24); // 24h

  genreIdToNameMap = {};
  (data.genres || []).forEach(g => { genreIdToNameMap[g.id] = g.name; });
  window.genreIdToNameMap = genreIdToNameMap;
  createGenreFilterButtons(data.genres || []);
};

// Expose for other modules
window.ENDPOINTS = ENDPOINTS;
