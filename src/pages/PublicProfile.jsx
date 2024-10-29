import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";
import WaveLoader from "../components/WaveLoader";
import { toast } from 'sonner';

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileAndExperiences();
  }, [username]);

  const loadProfileAndExperiences = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      const { data: experiencesData, error: experiencesError } = await supabase
        .from("user_artist_experiences")
        .select(
          `
          *,
          artist:artists(*)
        `
        )
        .eq("user_id", profileData.id);

      if (experiencesError) throw experiencesError;

      // Sort experiences by artist followers
      const sortedExperiences = experiencesData.sort(
        (a, b) => (b.artist.followers || 0) - (a.artist.followers || 0)
      );
      setExperiences(sortedExperiences);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyProfileLink = () => {
    const url = `${window.location.origin}/${profile.username}`;
    navigator.clipboard.writeText(url)
      .then(() => toast.success('Profile link copied to clipboard!'))
      .catch(() => toast.error('Failed to copy link'));
  };

  if (loading) return <WaveLoader text="Loading artist wall" />;
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      {/* Profile Header */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-dark/30 border-b border-gray-800/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <motion.img
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              src={
                profile.avatar_url ||
                `https://ui-avatars.com/api/?name=${profile.name}`
              }
              alt={profile.name}
              className="w-24 h-24 rounded-full object-cover"
            />

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              {/* Name and Username Row */}
              <div className="flex items-center gap-3 flex-wrap">
                <motion.h1
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-white"
                >
                  {profile.name}
                </motion.h1>
                <motion.button
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={handleCopyProfileLink}
                  className="px-3 py-1 rounded-full bg-dark-card border border-gray-700
                           hover:border-neon-pink hover:text-neon-pink
                           transition-colors duration-200 text-gray-300 text-sm
                           flex items-center gap-2"
                >
                  <span>@{profile.username}</span>
                </motion.button>
              </div>

              {/* Country Row */}
              {profile.country && (
                <motion.p
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-2 text-gray-400"
                >
                  <img
                    src={`https://flagcdn.com/24x18/${profile.country.toLowerCase()}.png`}
                    alt={profile.country}
                    className="w-5 rounded"
                  />
                  <span>
                    {new Intl.DisplayNames(["en"], { type: "region" }).of(profile.country)}
                  </span>
                </motion.p>
              )}

              {/* Social Links Row */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                {profile.spotify_url && (
                  <a
                    href={profile.spotify_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-dark-card border border-gray-700 
                             hover:border-[#1DB954] hover:text-[#1DB954] text-gray-400 
                             transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                  </a>
                )}

                {profile.soundcloud_url && (
                  <a
                    href={profile.soundcloud_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-dark-card border border-gray-700 
                             hover:border-[#ff5500] hover:text-[#ff5500] text-gray-400 
                             transition-colors duration-200"
                  >
                     <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm7.17 12.89c-.06 1.07-.95 1.9-2.02 1.9h-4.86c-.22 0-.4-.18-.4-.4V9.1c0-.2.12-.37.27-.43 0 0 .45-.31 1.39-.31.57 0 1.12.15 1.64.45.75.44 1.3 1.15 1.52 2.11.16-.03.33-.07.52-.07.6 0 1.16.25 1.4.59.55.58.58 1.4.54 1.45zm-7.89-3.42c.15 1.77.25 3.39 0 5.16a.16.16 0 01-.31 0c-.24-1.75-.14-3.4 0-5.16a.16.16 0 01.31 0zm-.98 5.16a.17.17 0 01-.33 0 19.71 19.71 0 010-4.55.17.17 0 01.33 0v4.55zm-.98-4.7c.16 1.62.23 3.08 0 4.7a.16.16 0 01-.32 0c-.22-1.6-.15-3.1 0-4.7a.16.16 0 01.32 0zm-.99 4.7a.16.16 0 01-.32 0 16.65 16.65 0 010-4.25.16.16 0 01.32 0v4.25zm-.98-3.19c.25 1.1.14 2.08-.01 3.2a.15.15 0 01-.3 0c-.14-1.11-.25-2.1-.01-3.2a.16.16 0 01.32 0zm-.98-.17c.23 1.13.15 2.09-.01 3.22a.16.16 0 01-.32 0c-.14-1.12-.21-2.1-.01-3.22a.17.17 0 01.34 0zm-.99.55c.24.75.16 1.36-.01 2.13a.16.16 0 01-.31 0c-.14-.76-.2-1.38-.01-2.13a.17.17 0 01.33 0z"/>
                </svg>
                  </a>
                )}

                {profile.twitter_url && (
                  <a
                    href={profile.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-dark-card border border-gray-700 
                             hover:border-[#1DA1F2] hover:text-[#1DA1F2] text-gray-400 
                             transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                )}

                {profile.youtube_url && (
                  <a
                    href={profile.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-dark-card border border-gray-700 
                             hover:border-[#FF0000] hover:text-[#FF0000] text-gray-400 
                             transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Artist Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {experiences.map((experience, index) => (
            <motion.div
              key={experience.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative aspect-square group rounded-xl overflow-hidden 
                        border border-gray-800/50 hover:border-neon-pink/50
                        transition-all duration-500 hover:shadow-lg hover:shadow-neon-pink/20
                        cursor-pointer"
              onClick={() => window.open(experience.artist.spotify_url, '_blank')}
            >
              {/* Background Image with Gradient */}
              <div className="absolute inset-0">
                <img
                  src={experience.artist.image_url}
                  alt={experience.artist.name}
                  className="w-full h-full object-cover transition-transform duration-700 
                           group-hover:scale-110 brightness-90"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t 
                              from-black via-black/50 to-transparent
                              opacity-60 group-hover:opacity-90
                              transition-opacity duration-500"
                />
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                {/* Artist Info Container - Moves up on hover */}
                <div className="transform translate-y-0 group-hover:-translate-y-4 
                              transition-all duration-500 ease-out">
                  {/* Artist Name - Always visible */}
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-xl text-white 
                                 group-hover:text-neon-pink transition-colors">
                      {experience.artist.name}
                    </h3>
                    <svg 
                      className="w-4 h-4 text-gray-400 group-hover:text-neon-pink 
                               opacity-0 group-hover:opacity-100 transition-all duration-500 
                               transform translate-x-2 group-hover:translate-x-0" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>

                  {/* Additional Info - Hidden initially, shows on hover */}
                  <div className="h-0 group-hover:h-auto overflow-hidden opacity-0 
                                group-hover:opacity-100 transition-all duration-500
                                transform translate-y-4 group-hover:translate-y-0
                                ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-300 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {experience.artist.followers?.toLocaleString()} followers
                      </p>

                      {experience.event_name && (
                        <p className="text-neon-pink flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18 10.5V8.75C18 8.06 17.44 7.5 16.75 7.5H16.5V6.25C16.5 5.56 15.94 5 15.25 5H4.75C4.06 5 3.5 5.56 3.5 6.25V10.5L2.25 12V13H3.5V17.75C3.5 18.44 4.06 19 4.75 19H15.25C15.94 19 16.5 18.44 16.5 17.75V13H17.75V12L16.5 10.5H18ZM15 17.5H5V6.5H15V17.5ZM7.5 8.5H12.5V10H7.5V8.5ZM7.5 11.5H12.5V13H7.5V11.5ZM7.5 14.5H12.5V16H7.5V14.5Z" />
                          </svg>
                          {experience.event_name}
                        </p>
                      )}

                      {experience.city && (
                        <p className="text-gray-400 text-sm flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                          </svg>
                          {experience.city}
                        </p>
                      )}

                      {/* Genres */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {experience.artist.genres?.slice(0, 2).map((genre) => (
                          <span
                            key={genre}
                            className="inline-block px-2 py-1 text-xs rounded-full 
                                     bg-neon-blue/10 text-neon-blue border border-neon-blue/20
                                     backdrop-blur-sm"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
