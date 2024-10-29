import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import Spinner from './Spinner';
import { useAuth } from '../contexts/AuthContext';

export default function AddExperienceModal({ artist, onClose, onSuccess }) {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    eventName: '',
    city: '',
    eventDate: new Date().toISOString().split('T')[0],
    rating: 5,
    notes: '',
    attendedWith: []
  });
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Search users when typing
  useEffect(() => {
    const searchUsers = async () => {
      if (!userSearch.trim()) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, name, avatar_url')
          .or(`username.ilike.%${userSearch}%,name.ilike.%${userSearch}%`)
          .limit(5);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setSearching(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [userSearch]);

  const addAttendee = (user) => {
    if (!formData.attendedWith.find(u => u.id === user.id)) {
      setFormData({
        ...formData,
        attendedWith: [...formData.attendedWith, user]
      });
    }
    setUserSearch('');
  };

  const removeAttendee = (userId) => {
    setFormData({
      ...formData,
      attendedWith: formData.attendedWith.filter(u => u.id !== userId)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from('user_artist_experiences')
        .insert({
          user_id: session.user.id,
          artist_id: artist.id,
          event_name: formData.eventName,
          city: formData.city,
          event_date: formData.eventDate,
          rating: formData.rating,
          notes: formData.notes,
          attended_with: formData.attendedWith.map(u => u.id)
        });

      if (error) throw error;
      toast.success('Experience added successfully!');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!profile?.username) {
      toast.error('Please set your username in profile settings first');
      return;
    }

    const inviteMessage = `Hey, create your iheardthis.live profile! Checkout mine at iheardthis.live/${profile.username}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on IHeardThis.live',
          text: inviteMessage,
          url: `https://iheardthis.live/${profile.username}`
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyToClipboard(inviteMessage);
        }
      }
    } else {
      copyToClipboard(inviteMessage);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Invite link copied to clipboard!'))
      .catch(() => toast.error('Failed to copy invite link'));
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-card w-full max-w-md rounded-2xl border border-gray-800 p-6 m-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Add "{artist.name}" to your profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 flex-1 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Event Name
            </label>
            <input
              type="text"
              required
              value={formData.eventName}
              onChange={(e) => setFormData({...formData, eventName: e.target.value})}
              placeholder="e.g., DGTL Bangalore 2024"
              className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg 
                       text-white focus:outline-none focus:border-neon-pink"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              City
            </label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              placeholder="e.g., Bangalore"
              className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg 
                       text-white focus:outline-none focus:border-neon-pink"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              When did you see them?
            </label>
            <input
              type="date"
              required
              value={formData.eventDate}
              onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
              className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg 
                       text-white focus:outline-none focus:border-neon-pink"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Who did you go with?
              </label>
              <button
                type="button"
                onClick={handleInvite}
                className="flex items-center gap-2 px-3 py-1 text-sm text-neon-pink 
                         hover:bg-neon-pink/10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 4v16m8-8H4" />
                </svg>
                <span>Invite friends</span>
              </button>
            </div>

            <div className="space-y-2 relative">
              {/* Selected users */}
              {formData.attendedWith.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.attendedWith.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 px-2 py-1 bg-dark rounded-full
                               border border-gray-700"
                    >
                      <img
                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                        alt={user.username}
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="text-sm text-gray-300">@{user.username}</span>
                      <button
                        type="button"
                        onClick={() => removeAttendee(user.id)}
                        className="text-gray-500 hover:text-gray-300"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* User search input */}
              <div className="relative">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users..."
                  className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg 
                           text-white focus:outline-none focus:border-neon-pink"
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Spinner className="w-5 h-5" />
                  </div>
                )}

                {/* Search results dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-dark border border-gray-700 rounded-lg 
                                shadow-lg max-h-48 overflow-y-auto z-10">
                    {searchResults.map(user => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => addAttendee(user)}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-800"
                      >
                        <img
                          src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                          alt={user.username}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="text-left">
                          <p className="text-gray-300">@{user.username}</p>
                          <p className="text-sm text-gray-500">{user.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rating and Notes fields remain the same */}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-neon-pink/20 border border-neon-pink 
                       text-neon-pink rounded-lg hover:bg-neon-pink/30 
                       focus:outline-none focus:ring-2 focus:ring-neon-pink/50
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Spinner className="w-5 h-5" />
                  <span>Adding...</span>
                </>
              ) : (
                'Add to Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 