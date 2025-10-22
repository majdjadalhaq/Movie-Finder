/**
 * js/modal.js
 * Handles movie detail modals, actor filmography, and cleaned-up favorites modal (Clear only)
 */

// Maintain a stack so Escape closes the most recent modal first
const modalStack = [];
window.modalStack = modalStack;

/* =============================================================
   Focus Trap Utility
   ============================================================= */
const trapFocus = (modalEl) => {
  const focusable = modalEl.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  const handler = (e) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  modalEl.addEventListener('keydown', handler);
  modalEl.__trap = handler;
};

const releaseTrap = (modalEl) => {
  if (modalEl.__trap) modalEl.removeEventListener('keydown', modalEl.__trap);
  delete modalEl.__trap;
};

/* =============================================================
   Movie Details Modal
   ============================================================= */
const showMovieDetailsModal = async (movieId) => {
  try {
    const movie = await fetchMovieDetails(movieId);
    if (!movie) return showToast('Failed to load details', '', 'error');

    const cast = await fetchMovieCast(movieId);
    let trailerData = null;
    let trailerError = null;

    try {
      trailerData = await fetchMovieTrailer(movieId);
    } catch (error) {
      trailerError = error.message;
    }

    const modalHTML = createMovieDetailsModalHTML(movie, cast, trailerData, trailerError);
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = modalHTML;

    document.body.appendChild(modal);
    modalStack.push(modal);

    setupModalEventListeners(modal);
    setupTabEventListeners(modal);
    trapFocus(modal);

    modal.querySelector('.modal-close').focus();
  } catch (error) {
    showToast('Error opening details', error.message || 'Unknown error', 'error');
  }
};

/* =============================================================
   Template for Movie Details Modal
   ============================================================= */
const createMovieDetailsModalHTML = (movie, cast, trailerData, trailerError = null) => {
  const backdropUrl = movie.backdrop_path ? `${BACKDROP_BASE_URL}${movie.backdrop_path}` : '';
  const posterUrl = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Image';

  const title = movie.title || 'Untitled';
  const tagline = movie.tagline || '';
  const overview = movie.overview || 'No description available.';
  const releaseDate = movie.release_date
    ? new Date(movie.release_date).toLocaleDateString()
    : 'N/A';
  const runtime = movie.runtime ? `${movie.runtime} min` : 'N/A';
  const rating =
    typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : 'N/A';
  const voteCount =
    typeof movie.vote_count === 'number' ? movie.vote_count.toLocaleString() : 'N/A';

  const genresHTML =
    movie.genres && movie.genres.length > 0
      ? movie.genres.map((g) => `<span class="genre-tag">${g.name}</span>`).join('')
      : '';

  const castHTML =
    cast && cast.length > 0
      ? cast
          .map(
            (a) => `
        <button class="cast-member" onclick="fetchActorMovies(${a.id}, '${String(a.name).replace(/'/g, "\\'")}')">
          ${a.name}
        </button>
      `
          )
          .join('')
      : '<p>No cast information available.</p>';

  const trailerHTML = trailerError
    ? `<div class="movie-trailer"><p class="error-message">Trailer unavailable. ${trailerError}</p></div>`
    : trailerData
    ? `<div class="movie-trailer"><iframe width="100%" height="315" src="https://www.youtube-nocookie.com/embed/${trailerData}" frameborder="0" allowfullscreen title="Trailer"></iframe></div>`
    : '<div class="movie-trailer"><p>Trailer unavailable</p></div>';

  return `
    <div class="modal-content movie-details-modal">
      <div class="modal-header">
        <h2>${title}</h2>
        <button class="modal-close" onclick="closeModal(this.closest('.modal-overlay'))" aria-label="Close details">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>
      <div class="modal-body">
        ${
          backdropUrl
            ? `<div class="movie-details-backdrop"><img src="${backdropUrl}" alt="${title} backdrop"></div>`
            : ''
        }
        <div class="movie-details-container">
          <div class="movie-details-poster"><img src="${posterUrl}" alt="${title} poster"></div>
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
                <div class="tab-pane active" id="overview"><div class="movie-details-overview"><p>${overview}</p></div></div>
                <div class="tab-pane" id="cast"><div class="movie-cast"><div class="cast-list">${castHTML}</div></div></div>
                <div class="tab-pane" id="trailer">${trailerHTML}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
};

/* =============================================================
   Favorites Modal (Cleaned – Clear Only)
   ============================================================= */
const showFavoritesModal = async () => {
  try {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const movies = [];

    for (const movieId of favorites) {
      try {
        const res = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`);
        if (res.ok) movies.push(await res.json());
      } catch {
        /* skip failed items */
      }
    }

    const moviesHTML = movies
      .map(
        (movie) => `
        <div class="actor-movie-card" onclick="showMovieDetailsModal(${movie.id})">
          <img src="${
            movie.poster_path
              ? IMAGE_BASE_URL + movie.poster_path
              : 'https://via.placeholder.com/150x225?text=No+Image'
          }" alt="${movie.title}" class="actor-movie-poster">
          <div class="actor-movie-info">
            <div class="actor-movie-title">${movie.title}</div>
            <div class="actor-movie-year">${
              movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'
            }</div>
          </div>
        </div>`
      )
      .join('');

    const emptyHTML = `<p class="status-message">No favorite movies found.</p>`;

    const modalHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Your Favorites</h2>
          <button class="modal-close" aria-label="Close favorites" onclick="closeModal(this.closest('.modal-overlay'))">
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
        <div class="modal-body">
          <div style="display:flex; justify-content:flex-end; margin-bottom:8px">
            <button id="clearFavsBtn" class="clear-filters" aria-label="Clear favorites">Clear All</button>
          </div>
          <div class="actor-movies-grid">
            ${movies.length ? moviesHTML : emptyHTML}
          </div>
        </div>
      </div>`;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);

    modalStack.push(modal);
    setupModalEventListeners(modal);
    trapFocus(modal);

    modal.querySelector('.modal-close').focus();

    // ✅ Clear favorites only (export/import removed)
    const clearBtn = modal.querySelector('#clearFavsBtn');
    clearBtn.addEventListener('click', () => {
      localStorage.setItem('favorites', '[]');
      updateFavoritesCount();
      showToast('Favorites cleared', '', 'success');

      // Refresh modal content
      const grid = modal.querySelector('.actor-movies-grid');
      grid.innerHTML = `<p class="status-message">No favorite movies found..</p>`;
    });
  } catch (error) {
    showToast('Failed to open favorites', error.message || '', 'error');
  }
};

/* =============================================================
   Actor Movies Modal
   ============================================================= */
const showActorMoviesModal = (actorName, movies) => {
  const moviesHTML = movies
    .map(
      (m) => `
      <div class="actor-movie-card" onclick="showMovieDetailsModal(${m.id})" tabindex="0" role="button" aria-label="Open ${m.title}">
        <img src="${
          m.poster_path
            ? IMAGE_BASE_URL + m.poster_path
            : 'https://via.placeholder.com/150x225?text=No+Image'
        }" alt="${m.title}" class="actor-movie-poster">
        <div class="actor-movie-info">
          <div class="actor-movie-title">${m.title}</div>
          <div class="actor-movie-year">${
            m.release_date ? new Date(m.release_date).getFullYear() : 'N/A'
          }</div>
        </div>
      </div>`
    )
    .join('');

  const modalHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Movies starring ${actorName}</h2>
        <button class="modal-close" onclick="closeModal(this.closest('.modal-overlay'))" aria-label="Close">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>
      <div class="modal-body"><div class="actor-movies-grid">${moviesHTML}</div></div>
    </div>`;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = modalHTML;
  document.body.appendChild(modal);

  modalStack.push(modal);
  setupModalEventListeners(modal);
  trapFocus(modal);
  modal.querySelector('.modal-close').focus();
};

/* =============================================================
   Helpers
   ============================================================= */
const setupModalEventListeners = (modal) => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
  });
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalStack.length > 0) {
    const topModal = modalStack[modalStack.length - 1];
    closeModal(topModal);
  }
});

const setupTabEventListeners = (modal) => {
  const tabButtons = modal.querySelectorAll('.tab-button');
  const tabPanes = modal.querySelectorAll('.tab-pane');
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      tabButtons.forEach((b) => b.classList.remove('active'));
      tabPanes.forEach((p) => p.classList.remove('active'));
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      const pane = modal.querySelector(`#${tabId}`);
      if (pane) pane.classList.add('active');
    });
  });
};

const closeModal = (modal) => {
  if (!modal) return;
  releaseTrap(modal);
  modal.remove();
  const idx = modalStack.indexOf(modal);
  if (idx !== -1) modalStack.splice(idx, 1);
};

/* =============================================================
   Exports
   ============================================================= */
window.showMovieDetailsModal = showMovieDetailsModal;
window.showFavoritesModal = showFavoritesModal;
window.closeModal = closeModal;
window.fetchActorMovies = fetchActorMovies;
