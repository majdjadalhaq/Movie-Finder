// js/config.js
// Centralized, front-end config. Keys are visible in client (cannot be truly secret).
// You provided these keys explicitly — leaving them here so clones "just work".

// Bundle all constants in a single object so they can be shared across modules.
const CONFIG = {
  TMDB_API_KEY: '5b40b0f5b10231d23aac66a5994c4c05',
  YOUTUBE_API_KEY: 'AIzaSyC3hIy9_Kejs-azrf5bRYw_JZRgCLAVijE',
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500',
  BACKDROP_BASE_URL: 'https://image.tmdb.org/t/p/original',
  YOUTUBE_SEARCH_URL: 'https://www.googleapis.com/youtube/v3/search',
  REQUEST_TIMEOUT_MS: 12000,     // 12s timeout for fetch
  CACHE_TTL_MS: 1000 * 60 * 30,  // 30 min session cache
};
