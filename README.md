# Movie Finder

<div align="center">
  <h2>A responsive web application for discovering and exploring movies, inspired by Netflix's design</h2>

  ![GitHub repo size](https://img.shields.io/github/repo-size/yourusername/movie-finder)
  ![GitHub language count](https://img.shields.io/github/languages/count/yourusername/movie-finder)
  ![GitHub top language](https://img.shields.io/github/languages/top/yourusername/movie-finder)
  ![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/movie-finder)

  <img src="https://via.placeholder.com/800x400/141414/E50914?text=Movie+Finder+Preview" alt="Movie Finder Preview">
</div>

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Setup Instructions](#setup-instructions)
- [API Configuration](#api-configuration)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Functionality
- 🔍 **Search**: Search for movies by title with real-time results
- 🎬 **Browse**: Display popular movies on initial load with infinite scrolling
- 📊 **Details**: View comprehensive movie information including ratings, release date, and overview
- 🎥 **Trailers**: Watch official trailers (when available) in an embedded player
- ❤️ **Favorites**: Save movies to a personal favorites list with persistent storage
- 📱 **Responsive**: Optimized for mobile, tablet, and desktop devices
- 🌙 **Dark Mode**: Netflix-inspired dark theme with red highlights
- ☀️ **Light Mode**: Clean light theme option with smooth transitions

### Enhanced User Experience
- ✨ **Animations**: Smooth movie card animations with hover effects
- 🎭 **Cast Information**: View cast members and explore their other works
- 🏷️ **Genre Filtering**: Filter movies by genre with an intuitive UI
- 🔢 **Favorites Counter**: Visual badge showing the number of saved favorites
- 📋 **Modal Interface**: Clean modal design for movie details
- ⏳ **Loading States**: Professional loading indicators and error handling
- 🎯 **Tab Navigation**: Organized movie details with tabbed interface

## Demo

[Link to deployed version - TBD]

## Setup Instructions

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for API access

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/movie-finder.git
   cd movie-finder
   ```

2. Open the application:
   ```bash
   # Option 1: Simply open index.html in your browser
   # Option 2: Use a local server
   python -m http.server 8000
   # Then navigate to http://localhost:8000
   ```

3. The application will be ready to use immediately.

## API Configuration

This project uses the TMDB (The Movie Database) API and YouTube API. For production use:

1. Obtain API keys:
   - [TMDB API Key](https://www.themoviedb.org/settings/api)
   - [YouTube API Key](https://console.developers.google.com/)

2. Create a `.env` file in the root directory:
   ```
   TMDB_API_KEY=your_tmdb_api_key
   YOUTUBE_API_KEY=your_youtube_api_key
   ```

3. Replace the hardcoded API keys in the script with environment variables.

## Project Structure

```
movie-finder/
├── index.html          # Main HTML file
├── style.css           # Styles for the application
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Technologies Used

- **Frontend**: HTML5, CSS3 (with CSS variables), Vanilla JavaScript
- **APIs**: TMDB API (for movie data), YouTube API (for trailers)
- **Icons**: Font Awesome
- **Styling**: CSS Grid, Flexbox, CSS Animations
- **Storage**: LocalStorage for favorites and theme preferences

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Acknowledgments

- [TMDB](https://www.themoviedb.org/) for providing the movie database API
- [Font Awesome](https://fontawesome.com/) for the icons
- The open-source community for inspiration and support
