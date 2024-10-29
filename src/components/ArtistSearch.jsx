import { useState, useEffect } from 'react';
import axios from 'axios';

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x400/1a1a1a/ffffff?text=Artist';

export default function ArtistSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [artists, setArtists] = useState([]);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  // Get Spotify access token on component mount
  useEffect(() => {
    const getSpotifyToken = async () => {
      const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
      
      try {
        const response = await axios.post('https://accounts.spotify.com/api/token', 
          new URLSearchParams({
            'grant_type': 'client_credentials',
          }), {
            headers: {
              'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret),
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
        setToken(response.data.access_token);
      } catch (error) {
        console.error('Error getting Spotify token:', error);
      }
    };

    getSpotifyToken();
  }, []);

  // Search artists when user types
  const searchArtists = async (value) => {
    if (!value.trim() || !token) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`https://api.spotify.com/v1/search`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          q: value,
          type: 'artist',
          limit: 10
        }
      });
      
      setArtists(response.data.artists.items);
    } catch (error) {
      console.error('Error searching artists:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        searchArtists(searchTerm);
      } else {
        setArtists([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, token]);

  const handleImageError = (e) => {
    e.target.src = PLACEHOLDER_IMAGE;
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      {/* Decorative gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/20 via-transparent to-neon-blue/20 opacity-50"></div>
      </div>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search for an artist"
        className="w-full px-6 py-3 text-white bg-dark-card border border-gray-700 rounded-xl 
                 focus:outline-none focus:border-neon-pink focus:ring-2 focus:ring-neon-pink/50
                 backdrop-blur-xl shadow-lg"
      />
      
      {loading && (
        <div className="mt-4 text-center text-neon-blue animate-pulse">
          Searching...
        </div>
      )}

      {artists.length > 0 && (
        <div className="mt-6 space-y-4">
          {artists.map((artist) => (
            <div 
              key={artist.id}
              className="group flex items-center p-6 rounded-xl cursor-pointer
                       bg-dark-card backdrop-blur-xl border border-gray-800/50
                       hover:bg-dark-card/80 hover:border-neon-pink/50 
                       transition-all duration-300 ease-out
                       hover:shadow-lg hover:shadow-neon-pink/10"
            >
              <img 
                src={artist.images[0]?.url || PLACEHOLDER_IMAGE}
                onError={handleImageError}
                alt={artist.name}
                className="w-20 h-20 rounded-xl object-cover 
                         group-hover:scale-105 transition-transform duration-300
                         shadow-lg"
              />
              <div className="ml-6 flex-1">
                <h3 className="font-bold text-xl text-white group-hover:text-neon-pink transition-colors">
                  {artist.name}
                </h3>
                <p className="text-sm text-gray-400">
                  {artist.followers.total.toLocaleString()} followers
                </p>
                {artist.genres && artist.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {artist.genres.slice(0, 3).map((genre) => (
                      <span 
                        key={genre}
                        className="px-2 py-1 text-xs rounded-full 
                                 bg-neon-blue/10 text-neon-blue border border-neon-blue/20"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {/* Popularity indicator */}
              <div className="ml-4 w-12 h-12 rounded-full flex items-center justify-center
                            border-2 border-neon-blue/30 group-hover:border-neon-blue
                            transition-colors">
                <span className="text-sm font-medium text-neon-blue">
                  {artist.popularity}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 