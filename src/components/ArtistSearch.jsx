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

  const addArtistToProfile = (artist) => {
    console.log('Adding artist to profile:', artist.name);
    // TODO: Implement actual functionality
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      {/* Decorative gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/20 via-transparent to-neon-blue/20 opacity-50"></div>
      </div>

      {/* Sticky search container */}
      <div className="sticky top-0 py-4 z-10">
        <div className="bg-dark/80 backdrop-blur-md px-4 py-4 rounded-2xl border border-gray-800/50">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for an artist"
              className="w-full px-6 py-3 text-white bg-dark-card/50 border border-gray-700 rounded-xl 
                       focus:outline-none focus:border-neon-pink focus:ring-2 focus:ring-neon-pink/50
                       shadow-lg pr-12"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2
                          w-8 h-8 flex items-center justify-center
                          rounded-full hover:bg-gray-700/50
                          transition-colors duration-200"
                aria-label="Clear search"
              >
                <span className="text-gray-400 hover:text-white text-xl leading-none">×</span>
              </button>
            )}
          </div>
          
          {loading && (
            <div className="mt-4 text-center text-neon-blue animate-pulse">
              Searching...
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {!loading && !artists.length && (
        <div className="mt-20 flex flex-col items-center justify-center text-center">
          <div className="w-64 h-64 mb-8 relative">
            {/* Subtle pulsing circles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="absolute w-32 h-32 rounded-full border border-neon-pink/20 animate-pulse" />
              <span className="absolute w-40 h-40 rounded-full border border-neon-blue/20 animate-pulse [animation-delay:0.5s]" />
              <span className="absolute w-48 h-48 rounded-full border border-neon-pink/20 animate-pulse [animation-delay:1s]" />
            </div>
            {/* Music note icon with subtle float animation */}
            <div className="absolute inset-0 flex items-center justify-center animate-float">
              <svg 
                className="w-20 h-20 text-gray-600/50"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-neon-pink to-neon-blue 
                       text-transparent bg-clip-text">
            Start Your Music Journey
          </h2>
          <p className="mt-4 text-gray-400 max-w-sm">
            Search for your favorite artists and create your personal live music history
          </p>
        </div>
      )}

      {/* Results section */}
      {artists.length > 0 && (
        <div className="mt-2 space-y-4">
          {artists.map((artist) => (
            <div 
              key={artist.id}
              className="group flex items-center p-6 rounded-xl
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
              {/* Add to Profile Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addArtistToProfile(artist);
                }}
                className="relative ml-4 w-12 h-12 rounded-full flex items-center justify-center
                          bg-neon-pink/10 border-2 border-neon-pink/30 
                          hover:border-neon-pink group/btn
                          focus:outline-none focus:ring-2 focus:ring-neon-pink/50"
                aria-label="Add artist to profile"
              >
                {/* Ripple effect */}
                <span className="absolute inset-0 rounded-full opacity-0 group-hover/btn:opacity-100
                               before:absolute before:inset-0 before:rounded-full
                               before:border-2 before:border-neon-pink/50
                               before:animate-ping" />
                {/* Plus icon */}
                <span className="text-4xl leading-none text-neon-pink -mt-1">
                  +
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 