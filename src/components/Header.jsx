import { Menu } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

export default function Header({ onAuthClick }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast.success("Signed out successfully");
  };

  return (
    <header
      className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl 
                       backdrop-blur-md bg-white/10 dark:bg-gray-900/50
                       rounded-2xl shadow-lg border border-white/20
                       px-2 py-1 z-50
                       transition-all duration-300 ease-in-out"
    >
      <div className="mx-auto px-4 h-16 flex items-center justify-between">
        <h1
          onClick={() => {
            const currentPath = window.location.pathname;
            const profilePath = `/${profile?.username || user.id}`;
            if (currentPath === profilePath) {
              navigate("/");
            } else {
              navigate(user ? profilePath : "/");
            }
          }}
          className="cursor-pointer"
        >
          <span
            className="hidden sm:block text-2xl font-bold font-display
                       bg-gradient-to-r from-neon-pink to-neon-blue bg-clip-text text-transparent
                       hover:from-neon-blue hover:to-neon-pink transition-all duration-500
                       animate-gradient-x"
          >
            I heard this live
          </span>
          <span className="block sm:hidden leading-tight">
            <span
              className="text-lg font-bold font-display
                         bg-gradient-to-r from-neon-pink to-neon-blue bg-clip-text text-transparent
                         hover:from-neon-blue hover:to-neon-pink transition-all duration-500
                         animate-gradient-x"
            >
              I heard this live
            </span>
          </span>
        </h1>

        {user ? (
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => navigate("/")}
              className="px-2 sm:px-4 py-2 border border-neon-blue text-neon-blue rounded-lg
                       hover:bg-neon-blue/10 transition-colors duration-200
                       flex items-center gap-2"
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
              <span className="hidden sm:inline">Add concert</span>
            </button>

            <Menu as="div" className="relative">
              <Menu.Button
                className="flex items-center gap-2 
                                    hover:bg-dark-card/80 rounded-lg 
                                    transition-colors duration-200"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-700">
                  <img
                    src={
                      profile?.avatar_url ||
                      `https://ui-avatars.com/api/?name=${profile?.name}`
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden items-center gap-2 px-3">
                  <span className="text-sm text-gray-300">
                    {profile?.username
                      ? `@${profile.username}`
                      : user.email.split("@")[0]}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </Menu.Button>

              <Menu.Items
                className="absolute right-0 mt-2 w-56 bg-dark border border-gray-800 
                                  rounded-lg shadow-lg overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-gray-800">
                  <p className="text-sm text-gray-300 font-medium truncate">
                    {profile?.username
                      ? `@${profile.username}`
                      : user.email.split("@")[0]}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>

                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() =>
                        navigate(`/${profile?.username || user.id}`)
                      }
                      className={`${
                        active ? "bg-gray-800" : ""
                      } w-full text-left px-4 py-3 text-sm text-gray-300 flex items-center space-x-2`}
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
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      <span>View My Wall</span>
                    </button>
                  )}
                </Menu.Item>

                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => navigate("/profile")}
                      className={`${
                        active ? "bg-gray-800" : ""
                      } w-full text-left px-4 py-3 text-sm text-gray-300 flex items-center space-x-2`}
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>My Profile</span>
                    </button>
                  )}
                </Menu.Item>

                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="https://github.com/daytimedrinkingclub/iheardthis.live"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${
                        active ? "bg-gray-800" : ""
                      } w-full text-left px-4 py-3 text-sm text-gray-300 flex items-center space-x-2`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"
                        />
                      </svg>
                      <span>Star this project</span>
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleSignOut}
                      className={`${
                        active ? "bg-gray-800" : ""
                      } w-full text-left px-4 py-3 text-sm text-gray-300 flex items-center space-x-2`}
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
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>Log Out</span>
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          </div>
        ) : (
          <button
            onClick={() => {
              if (window.location.pathname !== "/") {
                navigate("/");
              } else {
                onAuthClick();
              }
            }}
            className="px-4 py-2 bg-neon-pink/20 border border-neon-pink 
                     text-neon-pink rounded-lg hover:bg-neon-pink/30
                     text-sm sm:text-base"
          >
            Create My Wall
          </button>
        )}
      </div>
    </header>
  );
}
