import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AddExperienceModal({ artist, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    eventName: '',
    venue: '',
    city: '',
    country: '',
    eventDate: new Date().toISOString().split('T')[0],
    rating: 5,
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.user) {
        // TODO: Handle not logged in state
        return;
      }

      const { error } = await supabase
        .from('user_artist_experiences')
        .insert({
          user_id: session.user.id,
          artist_id: artist.id,
          event_name: formData.eventName || null,
          venue: formData.venue || null,
          city: formData.city || null,
          country: formData.country || null,
          event_date: formData.eventDate,
          rating: formData.rating,
          notes: formData.notes || null
        });

      if (error) throw error;
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving experience:', error);
      // TODO: Show error message to user
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-card w-full max-w-md rounded-2xl border border-gray-800 p-6 m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Add "{artist.name}" to your profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              When did you see them? *
            </label>
            <input
              type="date"
              required
              value={formData.eventDate}
              onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
              className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg 
                       text-white focus:outline-none focus:border-neon-pink"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Event Name
            </label>
            <input
              type="text"
              placeholder="e.g., Tomorrowland 2023"
              value={formData.eventName}
              onChange={(e) => setFormData({...formData, eventName: e.target.value})}
              className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg 
                       text-white focus:outline-none focus:border-neon-pink"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Venue
              </label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({...formData, venue: e.target.value})}
                className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg 
                         text-white focus:outline-none focus:border-neon-pink"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg 
                         text-white focus:outline-none focus:border-neon-pink"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({...formData, rating: star})}
                  className={`text-2xl ${
                    star <= formData.rating ? 'text-neon-pink' : 'text-gray-600'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Any memorable moments?"
              rows={3}
              className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg 
                       text-white focus:outline-none focus:border-neon-pink"
            />
          </div>

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
              className="px-4 py-2 bg-neon-pink/20 border border-neon-pink 
                       text-neon-pink rounded-lg hover:bg-neon-pink/30 
                       focus:outline-none focus:ring-2 focus:ring-neon-pink/50"
            >
              Add to Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 