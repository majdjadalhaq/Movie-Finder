# Movie Finder

<div align="center">
  <h2>Discover and explore movies with an intuitive, responsive web application</h2>

  ![GitHub repo size](https://img.shields.io/github/repo-size/yourusername/movie-finder)
  ![GitHub language count](https://img.shields.io/github/languages/count/yourusername/movie-finder)
  ![GitHub top language](https://img.shields.io/github/languages/top/yourusername/movie-finder)
  ![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/movie-finder)

  <img src="https://via.placeholder.com/800x400/141414/E50914?text=Movie+Finder+Preview" alt="Movie Finder Preview" width="800">
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

Movie Finder is a modern, responsive web application that allows users to discover, search, and explore movies. Built with vanilla JavaScript and powered by TMDB and YouTube APIs, it provides a Netflix-inspired interface for browsing movie catalogs, viewing detailed information, watching trailers, and managing personal favorites.

## ✨ Features

### Core Functionality
- **🔍 Movie Search**: Real-time search functionality with instant results
- **🎬 Popular Movies**: Browse trending and popular movies on initial load
- **📱 Responsive Design**: Optimized for mobile, tablet, and desktop devices
- **❤️ Favorites System**: Save and manage personal favorite movies with local storage
- **🎥 Movie Trailers**: Watch official trailers embedded directly in the app
- **📊 Detailed Information**: Comprehensive movie details including ratings, cast, and synopsis
- **🎭 Cast Exploration**: View cast members and discover their other works
- **🏷️ Genre Filtering**: Filter movies by multiple genres simultaneously
- **🔄 Sorting Options**: Sort by popularity, release date, rating, and trending
- **♾️ Infinite Scroll**: Seamless loading of additional movies as you scroll
- **⬆️ Back to Top**: Convenient navigation button for long lists

### User Experience
- **🎨 Modern UI**: Netflix-inspired dark theme with smooth animations

- **♿ Accessibility**: Screen reader support, keyboard navigation, and ARIA labels
- **⚡ Performance**: Optimized loading with skeleton screens and lazy images
- **📋 Modal Interface**: Clean, tabbed modals for detailed movie information
- **🔢 Visual Feedback**: Loading indicators, error messages, and status updates
- **🎯 Interactive Elements**: Hover effects, 3D tilt animations on movie cards
- **📊 Favorites Counter**: Visual badge showing number of saved favorites

### Technical Features
- **🔐 Secure API Handling**: Environment variable configuration for API keys
- **💾 Persistent Storage**: Local storage for favorites and user preferences
- **🚀 Progressive Enhancement**: Works without JavaScript for basic functionality
- **📱 Mobile-First**: Responsive design with touch-friendly interactions
- **🔍 SEO Friendly**: Semantic HTML and proper meta tags

## 🎯 Demo

[View Live Demo](https://yourusername.github.io/movie-finder) *(Link to be updated)*

## 🚀 Installation

### Prerequisites
- Modern web browser (Chrome 70+, Firefox 65+, Safari 12+, Edge 79+)
- Internet connection for API access
- Local development server (optional but recommended)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/movie-finder.git
   cd movie-finder
   ```

2. **Open the application:**
   ```bash
   # Option 1: Direct file opening (limited functionality)
   open index.html

   # Option 2: Local server (recommended)
   # Using Python
   python -m http.server 8000
   # Using Node.js
   npx serve .
   # Using PHP
   php -S localhost:8000

   # Then navigate to http://localhost:8000
   ```

3. **Start exploring movies!** The app works immediately with default API keys.

## 🔑 API Configuration

This project uses external APIs that require API keys. For production deployment or heavy usage:

### 1. Obtain API Keys

- **TMDB API Key**: Sign up at [TMDB](https://www.themoviedb.org/settings/api) and get your API key
- **YouTube Data API Key**: Create a project at [Google Cloud Console](https://console.cloud.google.com/) and enable the YouTube Data API v3

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
TMDB_API_KEY=your_tmdb_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 3. Update .gitignore

Ensure your `.env` file is not committed to version control:

```gitignore
# Environment variables
.env
.env.local
.env.production

# Dependencies
node_modules/

# Build outputs
dist/
build/

# IDE files
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db
```

### 4. Code Integration

Replace hardcoded API keys in `js/api.js` with environment variables:

```javascript
// Instead of:
const API_KEY = 'your_hardcoded_key';

// Use:
const API_KEY = process.env.TMDB_API_KEY || 'your_fallback_key';
```

## 📖 Usage

### Basic Navigation
1. **Browse Movies**: Popular movies load automatically on page load
2. **Search**: Use the search bar to find specific movies
3. **View Details**: Click the info icon on any movie card
4. **Watch Trailers**: Navigate to the trailer tab in movie details
5. **Add Favorites**: Click the heart icon to save movies
6. **Filter & Sort**: Use the filter toggle to access genre and sorting options

### Advanced Features
- **Genre Filtering**: Select multiple genres to narrow down results
- **Sorting**: Choose from popularity, rating, release date, or trending
- **Cast Exploration**: Click on cast members to see their filmography
- **Infinite Scroll**: Scroll down to load more movies automatically
- **Keyboard Shortcuts**: Use Escape to close modals, Enter to search

### Mobile Usage
- Touch-friendly interface with swipe gestures
- Optimized layouts for small screens
- Fast loading with lazy image loading

## 📁 Project Structure

```
movie-finder/
├── index.html              # Main HTML structure
├── js/
│   ├── app.js             # Application initialization and main logic
│   ├── api.js             # TMDB and YouTube API interactions
│   ├── ui.js              # User interface and DOM manipulation
│   ├── modal.js           # Modal windows and overlays
│   └── favorites.js       # Favorites management and persistence
├── css/
│   ├── header.css         # Header and navigation styles
│   ├── movies.css         # Movie cards and grid layouts
│   ├── modal.css          # Modal and overlay styles
│   ├── footer.css         # Footer styles
│   └── responsive.css     # Media queries and responsive design
├── assets/
│   └── icon.png           # Application favicon and logo
├── .gitignore             # Git ignore rules
├── README.md              # This file
└── TODO.md                # Development task list
```

## 🛠️ Technologies Used

### Frontend
- **HTML5**: Semantic markup and accessibility features
- **CSS3**: Modern styling with CSS Grid, Flexbox, and animations
- **Vanilla JavaScript**: ES6+ features, modular architecture

### APIs & Data
- **TMDB API**: Movie database and metadata
- **YouTube Data API**: Video trailer integration
- **Local Storage**: Client-side data persistence

### Tools & Libraries
- **Font Awesome**: Icon library for UI elements
- **Google Fonts**: Roboto font family
- **Fetch API**: Modern HTTP requests
- **CSS Variables**: Dynamic theming support

### Development
- **Modular JavaScript**: Separation of concerns
- **Progressive Enhancement**: Graceful degradation
- **Performance Monitoring**: Built-in performance tracking
- **Error Handling**: Comprehensive error management

## 🤝 Contributing

Contributions are welcome! This project follows a standard open-source workflow:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test thoroughly across different devices and browsers
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature-name`
7. Open a Pull Request

### Guidelines
- Follow the existing code style and modular structure
- Add comments for complex logic
- Test on multiple browsers and devices
- Update documentation for new features
- Ensure accessibility compliance

### Areas for Contribution
- Performance optimizations
- Additional API integrations
- New UI/UX features
- Accessibility improvements
- Internationalization support
- PWA implementation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TMDB**: For providing comprehensive movie data through their API
- **YouTube**: For trailer video hosting and API access
- **Font Awesome**: For the beautiful icon set
- **Open Source Community**: For inspiration and support

---

<div align="center">
  <p>Made with ❤️ for movie lovers everywhere</p>
  <p>
    <a href="#movie-finder">Back to top</a>
  </p>
</div>
