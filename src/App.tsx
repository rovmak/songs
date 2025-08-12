import { useState, useEffect } from 'react';
import './App.css';

interface Song {
  id: string;
  title: string;
  img: string;
}

type FavoriteCategory = string; // Now supports any string as category

import songsData from './songs.json';
const songs: Song[] = songsData.map(song => ({
  ...song,
  id: String(song.id),
  img: song.img.replace(/^\//, '') // Remove leading slash if present
}));

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [favorites, setFavorites] = useState<Record<string, FavoriteCategory>>({});
  const [activeCategory, setActiveCategory] = useState<FavoriteCategory>('favorites');

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('songFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    // Check URL for song ID (supports both /song/1 and ?id=1 formats)
    const pathMatch = window.location.pathname.match(/\/song\/(\d+)/);
    const params = new URLSearchParams(window.location.search);
    const songId = pathMatch?.[1] || params.get('id');
    if (songId) {
      const song = songs.find(s => s.id === songId);
      if (song) {
        setSelectedSong(song);
        // Ensure image path is correct
        console.log('Loading image:', `${import.meta.env.BASE_URL || ''}chord-pages/${song.img}`);
      }
    }
  }, []);

  const toggleFavorite = (id: string, category: FavoriteCategory = 'favorites') => {
    const newFavorites = {...favorites};
    if (favorites[id]) {
      delete newFavorites[id];
    } else {
      newFavorites[id] = category;
    }
    setFavorites(newFavorites);
    localStorage.setItem('songFavorites', JSON.stringify(newFavorites));
  };

  const filteredSongs = songs.filter((song: Song) => {
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFavorite = showFavorites 
      ? favorites[song.id] && 
        (activeCategory === 'favorites' || favorites[song.id] === activeCategory)
      : true;
    return matchesSearch && matchesFavorite;
  });

  const handleSongClick = (song: Song) => {
    const imageUrl = `${import.meta.env.BASE_URL || ''}chord-pages/${song.img}`;
    window.open(imageUrl, '_self');
  };

  return (
    <div className="app">
      <h1>Chord Book</h1>
      
      <div className="controls">
        <input
          type="text"
          placeholder="Search songs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <div className="favorites-controls">
          <label className="favorites-switch">
            <input
              type="checkbox"
              checked={showFavorites}
              onChange={() => setShowFavorites(!showFavorites)}
            />
            Show Favorites Only
          </label>
          {showFavorites && (
            <select
              className="category-select"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value as FavoriteCategory)}
            >
              <option value="favorites">All Favorites</option>
              {Array.from(new Set(Object.values(favorites)))
                .filter(category => category && category.trim() !== '')
                .map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
            </select>
          )}
        </div>
      </div>

      <div className="song-list">
        {filteredSongs.map(song => (
          <div 
            key={song.id} 
            className={`song-item ${selectedSong?.id === song.id ? 'selected' : ''}`}
            onClick={() => handleSongClick(song)}
          >
            <span className="song-title">{song.title}</span>
            <button 
              className={`favorite-btn ${favorites[song.id] ? 'favorited' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (favorites[song.id]) {
                  toggleFavorite(song.id);
                } else {
                  const category = prompt(
                    'Choose category:', 
                    'favorites'
                  ) as FavoriteCategory;
                  if (category) toggleFavorite(song.id, category);
                }
              }}
              data-category={favorites[song.id] || ''}
            >
              {favorites[song.id] ? '★' : '☆'}
            </button>
          </div>
        ))}
      </div>

      {selectedSong && (
        <div className="song-viewer">
          <div className="viewer-controls">
            <button 
              className="back-button"
              onClick={() => window.history.back()}
            >
              ← Back to Songs
            </button>
          </div>
          <img 
            src={`${import.meta.env.BASE_URL || ''}chord-pages/${selectedSong.img}`}
            alt={selectedSong.title}
            className="song-image"
            onError={(e) => console.error('Image failed to load:', e.currentTarget.src)}
          />
        </div>
      )}
    </div>
  );
}

export default App;
