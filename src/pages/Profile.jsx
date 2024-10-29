import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import WaveLoader from '../components/WaveLoader';
import Spinner from '../components/Spinner';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { v4 as uuidv4 } from 'uuid';

export default function Profile() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    username: '',
    name: '',
    country: '',
    twitter_url: '',
    spotify_url: '',
    soundcloud_url: '',
    youtube_url: ''
  });
  const [usernameError, setUsernameError] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Get countries list
  const countries = useMemo(() => {
    return countryList().getData().map(country => ({
      value: country.value,
      label: (
        <div className="flex items-center gap-2">
          <img
            src={`https://flagcdn.com/24x18/${country.value.toLowerCase()}.png`}
            alt={country.label}
            className="w-6 rounded"
          />
          <span>{country.label}</span>
        </div>
      ),
      searchLabel: country.label // For search functionality
    }));
  }, []);

  // Custom styles for react-select
  const selectStyles = {
    control: (base) => ({
      ...base,
      background: '#121212',
      borderColor: '#374151',
      '&:hover': {
        borderColor: '#ff2d55'
      }
    }),
    menu: (base) => ({
      ...base,
      background: '#121212',
      border: '1px solid #374151'
    }),
    option: (base, state) => ({
      ...base,
      background: state.isFocused ? '#1f2937' : '#121212',
      '&:hover': {
        background: '#1f2937'
      }
    }),
    singleValue: (base) => ({
      ...base,
      color: 'white'
    }),
    input: (base) => ({
      ...base,
      color: 'white'
    })
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      setUser(user);

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
    if (usernameError) {
      toast.error('Username already taken');
      return;
    }
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updateData = {
        username: profile.username,
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

      if (error) {
        if (error.code === '23505') {  // Unique constraint violation
          toast.error('This username is already taken.');
        } else if (error.code === '23514') {  // Check constraint violation
          toast.error('Please check your input values and try again.');
        } else {
          toast.error('Unable to update profile. Please try again later.');
        }
        console.error('Backend error:', error);
        return;
      }

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Unable to update profile. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to update profile picture');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (initialLoading) {
    return <WaveLoader text="Loading profile" />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Profile Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-700 
                          group-hover:border-neon-pink transition-colors duration-200">
              <img
                src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.name}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                  <Spinner className="w-8 h-8" />
                </div>
              )}
            </div>
            
            <label className="absolute inset-0 flex items-center justify-center 
                            bg-black/50 opacity-0 group-hover:opacity-100 
                            cursor-pointer transition-opacity duration-200
                            text-white text-sm rounded-full">
              <div className="flex flex-col items-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-xs text-gray-400">
            Click to upload a new profile picture
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Username *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
            <input
              type="text"
              required
              value={profile.username}
              onChange={(e) => {
                const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                setProfile({ ...profile, username: value });
                setUsernameError('');
              }}
              onBlur={async (e) => {
                if (!e.target.value) return;
                const { data, error } = await supabase
                  .from('profiles')
                  .select('username')
                  .eq('username', e.target.value)
                  .neq('id', user.id)
                  .single();
                
                if (data) {
                  setUsernameError('Username already taken');
                  toast.error('Username already taken');
                }
              }}
              className={`w-full px-4 py-2 pl-8 bg-dark border ${
                usernameError ? 'border-red-500' : 'border-gray-700'
              } rounded-lg text-white focus:outline-none focus:border-neon-pink`}
              placeholder="username"
            />
          </div>
        </div>

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
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Country
          </label>
          <Select
            options={countries}
            value={countries.find(country => country.value === profile.country)}
            onChange={(option) => setProfile({ ...profile, country: option.value })}
            styles={selectStyles}
            className="text-white"
            placeholder="Select your country"
            filterOption={(option, input) => 
              option.data.searchLabel.toLowerCase().includes(input.toLowerCase())
            }
          />
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Social Links</h3>
          
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <input
                type="url"
                value={profile.twitter_url}
                onChange={(e) => setProfile({ ...profile, twitter_url: e.target.value })}
                className="w-full pl-12 pr-4 py-2 bg-dark border border-gray-700 rounded-lg 
                         text-white focus:outline-none focus:border-neon-pink"
                placeholder="https://x.com/username"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </div>
              <input
                type="url"
                value={profile.spotify_url}
                onChange={(e) => setProfile({ ...profile, spotify_url: e.target.value })}
                className="w-full pl-12 pr-4 py-2 bg-dark border border-gray-700 rounded-lg 
                         text-white focus:outline-none focus:border-neon-pink"
                placeholder="https://open.spotify.com/user/username"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm7.17 12.89c-.06 1.07-.95 1.9-2.02 1.9h-4.86c-.22 0-.4-.18-.4-.4V9.1c0-.2.12-.37.27-.43 0 0 .45-.31 1.39-.31.57 0 1.12.15 1.64.45.75.44 1.3 1.15 1.52 2.11.16-.03.33-.07.52-.07.6 0 1.16.25 1.4.59.55.58.58 1.4.54 1.45zm-7.89-3.42c.15 1.77.25 3.39 0 5.16a.16.16 0 01-.31 0c-.24-1.75-.14-3.4 0-5.16a.16.16 0 01.31 0zm-.98 5.16a.17.17 0 01-.33 0 19.71 19.71 0 010-4.55.17.17 0 01.33 0v4.55zm-.98-4.7c.16 1.62.23 3.08 0 4.7a.16.16 0 01-.32 0c-.22-1.6-.15-3.1 0-4.7a.16.16 0 01.32 0zm-.99 4.7a.16.16 0 01-.32 0 16.65 16.65 0 010-4.25.16.16 0 01.32 0v4.25zm-.98-3.19c.25 1.1.14 2.08-.01 3.2a.15.15 0 01-.3 0c-.14-1.11-.25-2.1-.01-3.2a.16.16 0 01.32 0zm-.98-.17c.23 1.13.15 2.09-.01 3.22a.16.16 0 01-.32 0c-.14-1.12-.21-2.1-.01-3.22a.17.17 0 01.34 0zm-.99.55c.24.75.16 1.36-.01 2.13a.16.16 0 01-.31 0c-.14-.76-.2-1.38-.01-2.13a.17.17 0 01.33 0z"/>
                </svg>
              </div>
              <input
                type="url"
                value={profile.soundcloud_url}
                onChange={(e) => setProfile({ ...profile, soundcloud_url: e.target.value })}
                className="w-full pl-12 pr-4 py-2 bg-dark border border-gray-700 rounded-lg 
                         text-white focus:outline-none focus:border-neon-pink"
                placeholder="https://soundcloud.com/username"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <input
                type="url"
                value={profile.youtube_url}
                onChange={(e) => setProfile({ ...profile, youtube_url: e.target.value })}
                className="w-full pl-12 pr-4 py-2 bg-dark border border-gray-700 rounded-lg 
                         text-white focus:outline-none focus:border-neon-pink"
                placeholder="https://youtube.com/@username"
              />
            </div>
          </div>
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