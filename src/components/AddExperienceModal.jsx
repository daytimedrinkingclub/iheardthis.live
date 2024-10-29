import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import Spinner from "./Spinner";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AddExperienceModal({
  artist,
  existingExperience,
  onClose,
  onSuccess,
}) {
  const { user, profile, refreshExperiences } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    eventName: existingExperience?.event_name || "",
    city: existingExperience?.city || "",
    attendedWith: [],
  });
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Load attended_with users data
  useEffect(() => {
    const loadAttendedWithUsers = async () => {
      if (existingExperience?.attended_with?.length) {
        try {
          const { data: users, error } = await supabase
            .from("profiles")
            .select("id, username, name, avatar_url")
            .in("id", existingExperience.attended_with);

          if (error) throw error;

          setFormData((prev) => ({
            ...prev,
            attendedWith: users || [],
          }));
        } catch (error) {
          console.error("Error loading attended with users:", error);
        }
      }
    };

    loadAttendedWithUsers();
  }, [existingExperience]);

  // Check authentication
  useEffect(() => {
    if (!user) {
      toast.error("Please login to add experiences");
      onClose();
      navigate("/");
    }
  }, [user, navigate, onClose]);

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
          .from("profiles")
          .select("id, username, name, avatar_url")
          .or(`username.ilike.%${userSearch}%,name.ilike.%${userSearch}%`)
          .neq("id", user?.id) // Exclude current user
          .limit(5);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setSearching(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [userSearch, user?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to add experiences");
      return;
    }
    setLoading(true);

    try {
      if (existingExperience) {
        // Update existing experience
        const { error } = await supabase
          .from("user_artist_experiences")
          .update({
            event_name: formData.eventName || null,
            city: formData.city || null,
            attended_with: formData.attendedWith.map((u) => u.id),
          })
          .eq("id", existingExperience.id);

        if (error) throw error;
        toast.success("Experience updated successfully!");
      } else {
        // Add new experience
        const { error } = await supabase
          .from("user_artist_experiences")
          .insert({
            user_id: user.id,
            artist_id: artist.id,
            event_name: formData.eventName || null,
            city: formData.city || null,
            attended_with: formData.attendedWith.map((u) => u.id),
          });

        if (error) throw error;
        toast.success("Experience added successfully!");
      }

      await refreshExperiences();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving experience:", error);
      toast.error("Failed to save experience. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!profile?.username) {
      toast.error("Please set your username in profile settings first");
      return;
    }

    const inviteMessage = `Hey, create your iheardthis.live profile! Checkout mine at iheardthis.live/${profile.username}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on IHeardThis.live",
          text: inviteMessage,
          url: `https://iheardthis.live/${profile.username}`,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          copyToClipboard(inviteMessage);
        }
      }
    } else {
      copyToClipboard(inviteMessage);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Invite link copied to clipboard!"))
      .catch(() => toast.error("Failed to copy invite link"));
  };

  const addAttendee = (searchedUser) => {
    if (!formData.attendedWith.find((u) => u.id === searchedUser.id)) {
      setFormData({
        ...formData,
        attendedWith: [
          ...formData.attendedWith,
          {
            id: searchedUser.id,
            username: searchedUser.username,
            name: searchedUser.name,
            avatar_url: searchedUser.avatar_url,
          },
        ],
      });
    }
    setUserSearch("");
    setSearchResults([]); // Clear search results after adding
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 max-h-screen overflow-hidden">
      <div className="bg-dark-card w-full max-w-md rounded-2xl border border-gray-800 p-6 m-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {existingExperience
              ? `Edit "${artist.name}" experience`
              : `Add "${artist.name}" to your profile`}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 flex-1 overflow-y-auto"
        >
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Event Name
            </label>
            <input
              type="text"
              value={formData.eventName}
              onChange={(e) =>
                setFormData({ ...formData, eventName: e.target.value })
              }
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
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              placeholder="e.g., Bangalore"
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
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Invite friends</span>
              </button>
            </div>

            <div className="space-y-2 relative">
              {/* Selected users */}
              {formData.attendedWith.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.attendedWith.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 px-2 py-1 bg-dark rounded-full
                               border border-gray-700"
                    >
                      <img
                        src={
                          user.avatar_url ||
                          `https://ui-avatars.com/api/?name=${user.username}&background=random`
                        }
                        alt={user.username}
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="text-sm text-gray-300">
                        @{user.username}
                      </span>
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
                {userSearch && (
                  <div
                    className="absolute left-0 right-0 mt-1 bg-dark border border-gray-700 rounded-lg 
                                shadow-lg max-h-48 overflow-y-auto z-10"
                  >
                    {!searching ? (
                      searchResults.length > 0 ? (
                        searchResults.map((searchedUser) => (
                          <button
                            key={searchedUser.id}
                            type="button"
                            onClick={() => addAttendee(searchedUser)}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-800"
                          >
                            <img
                              src={
                                searchedUser.avatar_url ||
                                `https://ui-avatars.com/api/?name=${searchedUser.username}&background=random`
                              }
                              alt={searchedUser.username}
                              className="w-8 h-8 rounded-full"
                            />
                            <div className="text-left">
                              <p className="text-gray-300">
                                @{searchedUser.username}
                              </p>
                              <p className="text-sm text-gray-500">
                                {searchedUser.name}
                              </p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 flex items-center justify-between">
                          <p className="text-gray-400 text-sm">
                            No "{userSearch}" found :(
                          </p>
                          <button
                            type="button"
                            onClick={handleInvite}
                            className="flex items-center gap-2 px-3 py-1 text-sm text-neon-pink 
                                     hover:bg-neon-pink/10 rounded-lg transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            <span>Invite them?</span>
                          </button>
                        </div>
                      )
                    ) : null}
                  </div>
                )}
              </div>
            </div>
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
                  <span>{existingExperience ? "Saving..." : "Adding..."}</span>
                </>
              ) : existingExperience ? (
                "Save Changes"
              ) : (
                "Add to Profile"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
