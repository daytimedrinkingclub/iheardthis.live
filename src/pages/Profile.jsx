import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import WaveLoader from '../components/WaveLoader';
import Spinner from '../components/Spinner';

export default function Profile() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    country: '',
    twitter_url: '',
    spotify_url: '',
    soundcloud_url: '',
    youtube_url: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) setProfile(data);
    } catch (error) {
      toast.error('Error loading profile');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updateData = {
        name: profile.name,
        country: profile.country,
        twitter_url: profile.twitter_url,
        spotify_url: profile.spotify_url,
        soundcloud_url: profile.soundcloud_url,
        youtube_url: profile.youtube_url
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return <WaveLoader text="Loading profile" />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Profile Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Name
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg 
                     text-white focus:outline-none focus:border-neon-pink"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Country
          </label>
          <input
            type="text"
            value={profile.country}
            onChange={(e) => setProfile({ ...profile, country: e.target.value })}
            className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg 
                     text-white focus:outline-none focus:border-neon-pink"
          />
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Social Links</h3>
          
          {['twitter', 'spotify', 'soundcloud', 'youtube'].map((platform) => (
            <div key={platform}>
              <label className="block text-sm font-medium text-gray-300 mb-1 capitalize">
                {platform} URL
              </label>
              <input
                type="url"
                value={profile[`${platform}_url`]}
                onChange={(e) => setProfile({ 
                  ...profile, 
                  [`${platform}_url`]: e.target.value 
                })}
                className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg 
                         text-white focus:outline-none focus:border-neon-pink"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full px-4 py-2 bg-neon-pink/20 border border-neon-pink 
                   text-neon-pink rounded-lg hover:bg-neon-pink/30 
                   focus:outline-none focus:ring-2 focus:ring-neon-pink/50
                   disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center space-x-2"
        >
          {saving ? (
            <>
              <Spinner className="w-5 h-5" />
              <span>Saving...</span>
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </form>
    </div>
  );
} 