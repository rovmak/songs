import { useState, useEffect } from 'react';
import './App.css';

interface Song {
  id: string;
  title: string;
  img: string;
}

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
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

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

  const toggleFavorite = (id: string) => {
    const newFavorites = {...favorites, [id]: !favorites[id]};
    setFavorites(newFavorites);
    localStorage.setItem('songFavorites', JSON.stringify(newFavorites));
  };

  const filteredSongs = songs.filter((song: Song) => {
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFavorite = showFavorites ? favorites[song.id] : true;
    return matchesSearch && matchesFavorite;
  });

  const handleSongClick = (song: Song) => {
    setSelectedSong(song);
    window.history.pushState({}, '', `/song/${song.id}`);
    console.log('Loading image:', `${import.meta.env.BASE_URL || ''}chord-pages/${song.img}`);
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
        
        <label className="favorites-switch">
          <input
            type="checkbox"
            checked={showFavorites}
            onChange={() => setShowFavorites(!showFavorites)}
          />
          Show Favorites Only
        </label>
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
                toggleFavorite(song.id);
              }}
            >
              {favorites[song.id] ? '★' : '☆'}
            </button>
          </div>
        ))}
      </div>

      {selectedSong && (
        <div className="song-viewer">
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
