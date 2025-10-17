# Movie Finder

A responsive web application for discovering and exploring movies, inspired by Netflix's design. The app allows users to search for movies, view details, watch trailers, and save their favorites.

## Features

### Must-Have Features
- Search for movies by title
- Display popular movies on initial load
- View detailed movie information including ratings, release date, and overview
- Watch official trailers (when available)
- Save movies to favorites list
- Responsive design for mobile, tablet, and desktop
- Infinite scrolling for movie results
- Netflix-inspired dark theme with red highlights

### Nice-to-Have Features
- Animated movie cards with hover effects
- Smooth transitions and micro-interactions
- Movie genre filtering
- Favorites count badge
- Modal for movie details
- Loading states and error handling

## Demo

[Link to deployed version - TBD]

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/movie-finder.git
   cd movie-finder
   ```

2. Open the `index.html` file in your browser or start a local development server:
   ```
   # Option 1: Simply open index.html in your browser
   # Option 2: Use a local server
   python -m http.server 8000
   # Then navigate to http://localhost:8000
   ```

3. The application will be ready to use immediately.

## Environment Variables

This project uses the TMDB (The Movie Database) API and YouTube API. The API keys are currently hardcoded in the `script.js` file for demonstration purposes. For production, you should:

1. Create a `.env` file in the root directory with:
   ```
   TMDB_API_KEY=your_tmdb_api_key
   YOUTUBE_API_KEY=your_youtube_api_key
   ```

2. Replace the hardcoded API keys in the script with environment variables.

## Folder Structure

```
movie-finder/
├── index.html          # Main HTML file
├── style.css           # Styles for the application
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Technologies Used

- HTML5
- CSS3 (with CSS variables)
- Vanilla JavaScript
- TMDB API (for movie data)
- YouTube API (for trailers)
- Font Awesome (for icons)

## License

This project is licensed under the MIT License.
