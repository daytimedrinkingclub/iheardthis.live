import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";
import WaveLoader from "../components/WaveLoader";

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
          <div className="flex items-center gap-6">
            <motion.img
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              src={
                profile.avatar_url ||
                `https://ui-avatars.com/api/?name=${profile.name}&background=random`
              }
              alt={profile.name}
              className="w-24 h-24 rounded-full border-2 border-neon-pink shadow-lg shadow-neon-pink/20"
            />
            <div>
              <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-white"
              >
                {profile.name}
              </motion.h1>
              <motion.p
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-400"
              >
                @{profile.username}
              </motion.p>
              {profile.country && (
                <motion.p
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-400 mt-1 flex items-center gap-2"
                >
                  <img
                    src={`https://flagcdn.com/24x18/${profile.country.toLowerCase()}.png`}
                    alt={profile.country}
                    className="w-5 rounded"
                  />
                  {new Intl.DisplayNames(["en"], { type: "region" }).of(
                    profile.country
                  )}
                </motion.p>
              )}
            </div>
          </div>

          {/* Social Links */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4 mt-6"
          >
            {profile.twitter_url && (
              <a
                href={profile.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}
            {/* Add other social links similarly */}
          </motion.div>
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
              className="relative aspect-square group"
            >
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <img
                  src={experience.artist.image_url}
                  alt={experience.artist.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent
                              opacity-0 group-hover:opacity-100 transition-opacity duration-300
                              flex flex-col justify-end p-6"
                >
                  <h3 className="font-bold text-xl text-white">
                    {experience.artist.name}
                  </h3>
                  <p className="text-sm text-gray-400 mt-2">
                    {experience.artist.followers?.toLocaleString()} followers
                  </p>
                  {experience.event_name && (
                    <p className="text-neon-pink mt-2">
                      {experience.event_name}
                    </p>
                  )}
                  {experience.city && (
                    <p className="text-gray-400 text-sm mt-1">
                      {experience.city}
                    </p>
                  )}
                  {experience.artist.genres?.slice(0, 3).map((genre) => (
                    <span
                      key={genre}
                      className="inline-block px-2 py-1 text-xs rounded-full 
                               bg-neon-blue/10 text-neon-blue border border-neon-blue/20
                               mt-2 mr-2"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
