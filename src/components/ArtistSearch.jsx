import { useState, useEffect } from 'react';
import axios from 'axios';

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

  return (
    <div className="w-full max-w-2xl mx-auto">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search for an artist"
        className="w-full px-4 py-2 text-gray-700 bg-white border rounded-lg focus:outline-none focus:border-blue-500"
      />
      
      {loading && (
        <div className="mt-4 text-center text-gray-600">
          Searching...
        </div>
      )}

      {artists.length > 0 && (
        <div className="mt-4 space-y-4">
          {artists.map((artist) => (
            <div 
              key={artist.id}
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <img 
                src={artist.images[0]?.url || '/placeholder-artist.png'} 
                alt={artist.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="ml-4">
                <h3 className="font-semibold text-lg">{artist.name}</h3>
                <p className="text-sm text-gray-600">
                  {artist.followers.total.toLocaleString()} followers
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 