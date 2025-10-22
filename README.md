# Movie Finder

<div align="center">
  <h2>Discover and explore movies with an intuitive, responsive web application</h2>

  ![GitHub repo size](https://img.shields.io/github/repo-size/majdjadalhaq/Movie-Finder)
  ![GitHub language count](https://img.shields.io/github/languages/count/majdjadalhaq/Movie-Finder)
  ![GitHub top language](https://img.shields.io/github/languages/top/majdjadalhaq/Movie-Finder)
  ![GitHub last commit](https://img.shields.io/github/last-commit/majdjadalhaq/Movie-Finder)

</div>

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [API Configuration](#api-configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## 🎬 About

Movie Finder is a modern, responsive web application built with **vanilla JavaScript**, **HTML5**, and **CSS3**. It allows users to effortlessly discover, search, and explore movies from a vast database. By integrating with **The Movie Database (TMDB) API** and **YouTube Data API**, the application provides a rich, interactive experience, enabling users to browse popular films, view detailed information, watch trailers, and manage a personalized list of favorite movies. Its design prioritizes **user experience**, **accessibility**, and **performance**, offering a seamless and engaging interface reminiscent of popular streaming platforms.

## ✨ Features

### Core Functionality
- **🔍 Movie Search**: Real-time, debounced search functionality allows users to find specific movies quickly and efficiently.
- **🎬 Popular & Trending Movies**: Displays popular movies by default on load, with options to view trending movies by day or week.
- **📱 Responsive Design**: Optimized for a consistent and enjoyable experience across all devices, from mobile phones to large desktop screens.
- **❤️ Favorites System**: Users can easily add or remove movies from a persistent favorites list, stored locally for convenience.
- **🎥 Movie Trailers**: Seamless integration with YouTube allows for direct playback of official movie trailers within the application.
- **📊 Detailed Information**: Comprehensive movie details, including synopsis, release date, genre, cast, and TMDB ratings, are presented in an intuitive modal interface.
- **🎭 Cast Exploration**: Clickable cast members within movie details allow users to explore their filmography.
- **🏷️ Genre Filtering**: Filter movies by one or more genres simultaneously to narrow down search results.
- **🔄 Sorting Options**: Advanced sorting capabilities by popularity, release date, and rating enhance movie discovery.
- **♾️ Infinite Scroll**: Automatically loads more movies as the user scrolls, providing a continuous browsing experience.
- **⬆️ Back to Top**: A convenient floating button for quick navigation back to the top of the page.

### User Experience & Performance
- **🎨 Modern UI**: Features a sleek, dark-themed interface with smooth animations and transitions.
- **♿ Accessibility**: Implemented with ARIA attributes, keyboard navigation, and screen reader support to ensure inclusivity.
- **⚡ Performance Optimizations**: Utilizes skeleton loaders, lazy image loading, and API response caching with TTL to deliver a fast and fluid experience.
- **📋 Modal Interface**: Detailed movie information is presented in clean, tabbed modals for organized content display.
- **🔢 Visual Feedback**: Provides clear loading indicators, error messages, and toast notifications for user actions and system status.
- **🎯 Interactive Elements**: Engaging hover effects and subtle 3D tilt animations on movie cards enhance visual appeal.

### Technical Highlights
- **🔐 Secure API Handling**: API keys are managed through a centralized configuration, though for client-side applications, they are publicly visible. Best practices for server-side applications would involve proxying requests.
- **💾 Persistent Storage**: Leverages `sessionStorage` for API response caching and `localStorage` for managing favorite movies.
- **🚀 Progressive Enhancement**: Designed to offer core functionality even if JavaScript is partially disabled, with full interactivity enabled progressively.
- **📁 Modular JavaScript**: The codebase is organized into distinct modules (`api.js`, `ui.js`, `modal.js`, `favorites.js`, `app.js`) for better maintainability and scalability.

## 🎯 Demo

[View Live Demo](https://majdjadalhaq.github.io/Movie-Finder/) *(Please note: API keys embedded in the demo might have usage limits.)*

## 🚀 Installation

To set up and run Movie Finder locally, follow these steps:

### Prerequisites
- A modern web browser (e.g., Chrome, Firefox, Safari, Edge).
- Internet connection for API access.

### Quick Start

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/majdjadalhaq/Movie-Finder.git
    cd Movie-Finder
    ```

2.  **Open the application**:
    Simply open the `index.html` file in your preferred web browser. No local server is strictly required for basic functionality, as it's a client-side application.
    ```bash
    open index.html
    ```
    Alternatively, navigate to `file:///path/to/Movie-Finder/index.html` in your browser.

3.  **Start exploring movies!** The application should load popular movies automatically.

## 🔑 API Configuration

This project relies on external APIs. While default keys are provided for immediate use, it's recommended to obtain your own for consistent performance and to avoid rate limits.

### 1. Obtain API Keys

-   **TMDB API Key**: Register for a developer account at [The Movie Database (TMDB)](https://www.themoviedb.org/documentation/api) to obtain your API key.
-   **YouTube Data API Key**: Create a project in the [Google Cloud Console](https://console.cloud.google.com/) and enable the YouTube Data API v3 to get your API key.

### 2. Configure API Keys

Open the `js/config.js` file and replace the placeholder API keys with your newly obtained keys:

```javascript
// js/config.js
const CONFIG = {
  TMDB_API_KEY: 'YOUR_TMDB_API_KEY_HERE', // Replace with your TMDB API key
  YOUTUBE_API_KEY: 'YOUR_YOUTUBE_API_KEY_HERE', // Replace with your YouTube API key
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500',
  BACKDROP_BASE_URL: 'https://image.tmdb.org/t/p/original',
  YOUTUBE_SEARCH_URL: 'https://www.googleapis.com/youtube/v3/search',
  REQUEST_TIMEOUT_MS: 12000,
  CACHE_TTL_MS: 1000 * 60 * 30,
};
```

## 📖 Usage

### Basic Navigation
1.  **Browse Movies**: Popular movies are displayed upon initial load. Scroll down to load more.
2.  **Search**: Use the search bar in the header to find movies by title. The search is debounced for a smooth experience.
3.  **View Details**: Click the info icon (ⓘ) on any movie card to open a modal displaying detailed information, including synopsis, cast, and genres.
4.  **Watch Trailers**: Within the movie details modal, navigate to the 

trailer tab to watch the official movie trailer.
5.  **Add to Favorites**: Click the heart icon (♡) on a movie card to add it to your personal favorites list. A filled heart (❤️) indicates it's a favorite.
6.  **View Favorites**: Click the "Favorites" button in the header to view all your saved movies.
7.  **Filter & Sort**: Use the "Filter & Sort" toggle to reveal options for filtering movies by genre and sorting them by various criteria.

### Advanced Features
-   **Genre Filtering**: Select one or more genres to refine the movie list. The application will display movies that belong to any of the selected genres.
-   **Sorting**: Sort the displayed movies by popularity, release date, or average vote to discover films based on your preferences.
-   **Cast Exploration**: In the movie details modal, click on an actor's name to see a modal displaying other movies they have starred in.
-   **Infinite Scroll**: The movie list automatically expands with more results as you scroll down, providing a continuous browsing experience.
-   **Keyboard Shortcuts**: Use `Escape` to close modals and `Enter` to initiate a search from the search bar.

### Mobile Usage
-   The application is designed with a mobile-first approach, ensuring a responsive and touch-friendly interface.
-   Layouts are optimized for small screens, and features like lazy image loading contribute to fast performance on mobile devices.

## 📁 Project Structure

```
movie-finder/
├── index.html              # Main HTML document, serving as the entry point.
├── js/
│   ├── app.js             # Core application logic, initialization, and global error handling.
│   ├── api.js             # Handles all interactions with TMDB and YouTube APIs, including caching and error handling.
│   ├── ui.js              # Manages user interface rendering, interactions, and dynamic content updates.
│   ├── modal.js           # Controls the display and functionality of movie detail modals.
│   └── favorites.js       # Manages the adding, removing, and persistence of favorite movies using local storage.
├── css/
│   ├── header.css         # Styles for the application header, search bar, and favorites toggle.
│   ├── movies.css         # Styles for movie cards, lists, and genre filters.
│   ├── modal.css          # Styles for the movie detail modal and its components.
│   ├── footer.css         # Styles for the application footer.
│   └── responsive.css     # Media queries and responsive adjustments for various screen sizes.
├── assets/
│   ├── icon.png           # Application favicon and logo.
│   └── preview.png        # Image used for the README banner.
├── .gitignore             # Specifies intentionally untracked files to ignore by Git.
├── README.md              # This comprehensive guide to the project.
└── TODO.md                # A list of planned features or improvements.
```

## 🛠️ Technologies Used

### Frontend Development
-   **HTML5**: Semantic markup for robust and accessible web content.
-   **CSS3**: Modern styling techniques including Flexbox and CSS Grid for flexible layouts, transitions, and animations.
-   **Vanilla JavaScript (ES6+)**: Powers all interactive functionalities, API calls, and dynamic content manipulation, adhering to a modular architecture.

### APIs & Data Sources
-   **The Movie Database (TMDB) API**: The primary source for movie data, including popular listings, search results, detailed movie information, and cast data.
-   **YouTube Data API**: Utilized for searching and embedding official movie trailers directly within the application.
-   **Local Storage**: Client-side storage mechanism used for persisting user-specific data, such as favorite movies.
-   **Session Storage**: Used for lightweight, session-based caching of API responses to improve performance.

### External Libraries & Tools
-   **Font Awesome**: Provides a comprehensive set of vector icons used throughout the user interface.
-   **Google Fonts**: Integrates the Roboto font family for a clean and modern typography.
-   **Fetch API**: Modern interface for making network requests, used for all API communications.
-   **CSS Variables**: Employed for consistent theming and easy adjustments of styles.

### Development Practices
-   **Modular JavaScript**: Code is logically separated into distinct files, promoting maintainability, reusability, and easier debugging.
-   **Progressive Enhancement**: Ensures a baseline user experience for all, with advanced features layered on top for capable browsers.
-   **Performance Monitoring**: Includes basic mechanisms for monitoring and optimizing application performance.
-   **Robust Error Handling**: Comprehensive error management for API calls and unexpected issues, providing user-friendly feedback via toast notifications.

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute to Movie Finder, please follow these guidelines:

### Development Setup
1.  **Fork the repository** on GitHub.
2.  **Clone your forked repository** to your local machine:
    ```bash
    git clone https://github.com/your-username/Movie-Finder.git
    cd Movie-Finder
    ```
3.  **Create a new feature branch** for your changes:
    ```bash
    git checkout -b feature/your-feature-name
    ```
4.  **Make your modifications** and enhancements.
5.  **Test your changes** thoroughly across different browsers and devices to ensure compatibility and responsiveness.
6.  **Commit your changes** with clear, descriptive commit messages:
    ```bash
    git commit -m 'feat: Add new feature or fix bug'
    ```
7.  **Push your branch** to your forked repository:
    ```bash
    git push origin feature/your-feature-name
    ```
8.  **Open a Pull Request** against the `main` branch of the original repository, describing your changes and their benefits.

### Contribution Guidelines
-   Adhere to the existing code style and modular architecture.
-   Provide comments for complex logic or non-obvious implementations.
-   Ensure cross-browser compatibility and responsiveness.
-   Update relevant documentation (e.g., this README) for any new features or significant changes.
-   Prioritize accessibility in all UI and functional implementations.

### Areas for Contribution
-   Further performance optimizations (e.g., Web Workers for heavy tasks).
-   Integration with additional movie data APIs or streaming services.
-   Development of new UI/UX features (e.g., user authentication, personalized recommendations).
-   Advanced accessibility improvements.
-   Internationalization (i18n) support for multiple languages.
-   Progressive Web App (PWA) implementation for offline capabilities.

## 🙏 Acknowledgments

-   **The Movie Database (TMDB)**: For providing an invaluable and comprehensive movie data API.
-   **YouTube**: For enabling seamless integration of video trailers.
-   **Font Awesome**: For the elegant and functional icon library.
---

<div align="center">
  <p>Made with ❤️ for movie lovers everywhere</p>
  <p>
    <a href="#movie-finder">Back to top</a>
  </p>
</div>


