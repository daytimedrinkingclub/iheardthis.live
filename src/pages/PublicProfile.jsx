import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import WaveLoader from "../components/WaveLoader";
import { toast } from "sonner";

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("recent");

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
        .eq("user_id", profileData.id)
        .order("created_at", { ascending: false });

      if (experiencesError) throw experiencesError;

      setExperiences(experiencesData);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const sortedExperiences = useMemo(() => {
    const sorted = [...experiences];
    if (sortBy === "popular") {
      sorted.sort(
        (a, b) => (b.artist.followers || 0) - (a.artist.followers || 0)
      );
    }
    // "recent" is already the default order from the query
    return sorted;
  }, [experiences, sortBy]);

  const stats = useMemo(() => {
    const uniqueGenres = new Set();
    const uniqueEvents = new Set();
    experiences.forEach((exp) => {
      if (exp.event_name) uniqueEvents.add(exp.event_name);
      exp.artist.genres?.forEach((g) => uniqueGenres.add(g));
    });
    return {
      artists: experiences.length,
      events: uniqueEvents.size,
      genres: uniqueGenres.size,
    };
  }, [experiences]);

  const handleCopyProfileLink = () => {
    const url = `${window.location.origin}/${profile.username}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Profile link copied to clipboard!"))
      .catch(() => toast.error("Failed to copy link"));
  };

  if (loading) return <WaveLoader text="Loading artist wall" />;
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 font-sans">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient">
      <div className="noise" />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] z-0" />

      <div className="relative z-10">
        {/* ── Profile Header ── */}
        <div className="sticky top-0 pt-20 z-20 backdrop-blur-xl bg-dark/60 border-b border-white/[0.06]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-7">
              {/* Avatar with glow ring */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative shrink-0"
              >
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-neon-pink via-neon-pink/40 to-neon-blue opacity-60 blur-md" />
                <img
                  src={
                    profile.avatar_url ||
                    `https://ui-avatars.com/api/?name=${profile.name}`
                  }
                  alt={profile.name}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-2 ring-white/10"
                />
              </motion.div>

              {/* Info block */}
              <div className="flex-1 min-w-0 text-center sm:text-left space-y-3">
                {/* Name row */}
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3">
                  <motion.h1
                    initial={{ y: -16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="text-2xl sm:text-3xl font-display font-800 text-white tracking-tight"
                  >
                    {profile.name}
                  </motion.h1>

                  <motion.button
                    initial={{ y: -16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    onClick={handleCopyProfileLink}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                               bg-white/[0.04] border border-white/[0.08]
                               hover:border-neon-pink/50 hover:bg-neon-pink/[0.06]
                               text-gray-400 hover:text-neon-pink
                               transition-all duration-300 text-sm font-sans"
                  >
                    <span>@{profile.username}</span>
                    <svg className="w-3.5 h-3.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </motion.button>

                  {profile.country && (
                    <motion.span
                      initial={{ y: -16, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-1.5 text-gray-500 text-sm"
                    >
                      <img
                        src={`https://flagcdn.com/24x18/${profile.country.toLowerCase()}.png`}
                        alt={profile.country}
                        className="w-4 rounded-sm"
                      />
                      {new Intl.DisplayNames(["en"], { type: "region" }).of(
                        profile.country
                      )}
                    </motion.span>
                  )}
                </div>

                {/* Stats row */}
                <motion.div
                  initial={{ y: -12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="flex items-center justify-center sm:justify-start gap-5 text-sm"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-700 text-white">{stats.artists}</span>
                    <span className="text-gray-500">artists</span>
                  </div>
                  <div className="w-px h-3 bg-white/10" />
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-700 text-white">{stats.events}</span>
                    <span className="text-gray-500">events</span>
                  </div>
                  <div className="w-px h-3 bg-white/10" />
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-700 text-white">{stats.genres}</span>
                    <span className="text-gray-500">genres</span>
                  </div>
                </motion.div>

                {/* Social links */}
                <motion.div
                  initial={{ y: -12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center sm:justify-start gap-2"
                >
                  {profile.spotify_url && (
                    <SocialLink href={profile.spotify_url} hoverColor="hover:border-[#1DB954] hover:text-[#1DB954] hover:bg-[#1DB954]/[0.08]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                      </svg>
                    </SocialLink>
                  )}
                  {profile.soundcloud_url && (
                    <SocialLink href={profile.soundcloud_url} hoverColor="hover:border-[#ff5500] hover:text-[#ff5500] hover:bg-[#ff5500]/[0.08]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm7.17 12.89c-.06 1.07-.95 1.9-2.02 1.9h-4.86c-.22 0-.4-.18-.4-.4V9.1c0-.2.12-.37.27-.43 0 0 .45-.31 1.39-.31.57 0 1.12.15 1.64.45.75.44 1.3 1.15 1.52 2.11.16-.03.33-.07.52-.07.6 0 1.16.25 1.4.59.55.58.58 1.4.54 1.45zm-7.89-3.42c.15 1.77.25 3.39 0 5.16a.16.16 0 01-.31 0c-.24-1.75-.14-3.4 0-5.16a.16.16 0 01.31 0zm-.98 5.16a.17.17 0 01-.33 0 19.71 19.71 0 010-4.55.17.17 0 01.33 0v4.55zm-.98-4.7c.16 1.62.23 3.08 0 4.7a.16.16 0 01-.32 0c-.22-1.6-.15-3.1 0-4.7a.16.16 0 01.32 0zm-.99 4.7a.16.16 0 01-.32 0 16.65 16.65 0 010-4.25.16.16 0 01.32 0v4.25zm-.98-3.19c.25 1.1.14 2.08-.01 3.2a.15.15 0 01-.3 0c-.14-1.11-.25-2.1-.01-3.2a.16.16 0 01.32 0zm-.98-.17c.23 1.13.15 2.09-.01 3.22a.16.16 0 01-.32 0c-.14-1.12-.21-2.1-.01-3.22a.17.17 0 01.34 0zm-.99.55c.24.75.16 1.36-.01 2.13a.16.16 0 01-.31 0c-.14-.76-.2-1.38-.01-2.13a.17.17 0 01.33 0z" />
                      </svg>
                    </SocialLink>
                  )}
                  {profile.twitter_url && (
                    <SocialLink href={profile.twitter_url} hoverColor="hover:border-white/30 hover:text-white hover:bg-white/[0.06]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </SocialLink>
                  )}
                  {profile.youtube_url && (
                    <SocialLink href={profile.youtube_url} hoverColor="hover:border-[#FF0000] hover:text-[#FF0000] hover:bg-[#FF0000]/[0.08]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </SocialLink>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sort Bar ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-2">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-between"
          >
            <h2 className="text-xs font-sans font-500 uppercase tracking-[0.15em] text-gray-500">
              Artist Wall
            </h2>
            <div className="flex items-center bg-white/[0.04] rounded-full p-0.5 border border-white/[0.06]">
              <SortButton active={sortBy === "recent"} onClick={() => setSortBy("recent")}>
                Recent
              </SortButton>
              <SortButton active={sortBy === "popular"} onClick={() => setSortBy("popular")}>
                Popular
              </SortButton>
            </div>
          </motion.div>
        </div>

        {/* ── Artist Grid ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 pb-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            <AnimatePresence mode="popLayout">
              {sortedExperiences.map((experience, index) => (
                <ArtistCard
                  key={experience.id}
                  experience={experience}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function SocialLink({ href, hoverColor, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]
                 text-gray-500 transition-all duration-300 ${hoverColor}`}
    >
      {children}
    </a>
  );
}

function SortButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-sans font-500 transition-all duration-300
        ${
          active
            ? "bg-neon-pink/15 text-neon-pink shadow-[inset_0_0_0_1px_rgba(255,45,85,0.25)]"
            : "text-gray-500 hover:text-gray-300"
        }`}
    >
      {children}
    </button>
  );
}

function ArtistCard({ experience, index }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: Math.min(index * 0.04, 0.8), duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative aspect-square group rounded-xl overflow-hidden
                 border border-white/[0.06] hover:border-neon-pink/40
                 transition-all duration-500 hover:shadow-[0_8px_40px_-12px_rgba(255,45,85,0.25)]
                 cursor-pointer"
      onClick={() => window.open(experience.artist.spotify_url, "_blank")}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={experience.artist.image_url}
          alt={experience.artist.name}
          className="w-full h-full object-cover transition-transform duration-700
                     group-hover:scale-110 brightness-[0.85] group-hover:brightness-100"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t
                      from-black/80 via-black/20 via-50% to-transparent
                      transition-opacity duration-500"
        />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end">
        {/* Smooth gradient backdrop that intensifies on hover */}
        <div className="absolute inset-x-0 bottom-0 h-full
                        bg-gradient-to-t from-black via-black/60 via-40% to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-xl" />
        <div className="relative transform translate-y-0 group-hover:-translate-y-2 transition-all duration-500 ease-out">
          {/* Artist Name */}
          <div className="flex items-center gap-1.5 mb-1">
            <h3
              className="font-display font-700 text-base sm:text-lg text-white leading-tight
                         group-hover:text-neon-pink transition-colors duration-300"
            >
              {experience.artist.name}
            </h3>
            <svg
              className="w-3.5 h-3.5 text-gray-400 group-hover:text-neon-pink
                       opacity-0 group-hover:opacity-100 transition-all duration-500
                       transform translate-x-1 group-hover:translate-x-0 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>

          {/* Hover details */}
          <div
            className="h-0 group-hover:h-auto overflow-hidden opacity-0
                        group-hover:opacity-100 transition-all duration-500
                        transform translate-y-3 group-hover:translate-y-0"
          >
            <div className="space-y-1.5 pt-1">
              {experience.artist.followers > 0 && (
                <p className="text-xs text-gray-400 flex items-center gap-1.5 font-sans">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {experience.artist.followers?.toLocaleString()} followers
                </p>
              )}

              {experience.event_name && (
                <p className="text-xs text-neon-pink font-sans font-500 flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  {experience.event_name}
                </p>
              )}

              {experience.city && (
                <p className="text-xs text-gray-500 flex items-center gap-1.5 font-sans">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  {experience.city}
                </p>
              )}

              {experience.artist.genres?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {experience.artist.genres.slice(0, 2).map((genre) => (
                    <span
                      key={genre}
                      className="inline-block px-2 py-0.5 text-[10px] rounded-full font-sans
                               bg-neon-blue/[0.08] text-neon-blue/80 border border-neon-blue/[0.12]"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
