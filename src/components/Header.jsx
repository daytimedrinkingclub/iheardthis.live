import { Menu } from "@headlessui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

export default function Header({ onAuthClick }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast.success("Signed out successfully");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="backdrop-blur-xl bg-dark/40 border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <h1
            onClick={() => {
              const currentPath = window.location.pathname;
              const profilePath = `/${profile?.username || user?.id}`;
              if (currentPath === profilePath) {
                navigate("/");
              } else {
                navigate(user ? profilePath : "/");
              }
            }}
            className="cursor-pointer select-none"
          >
            <span className="text-sm font-display font-700 tracking-wide text-white/70 hover:text-white transition-colors duration-300">
              iheardthis<span className="text-neon-pink/80">.live</span>
            </span>
          </h1>

          {/* Right side */}
          {user ? (
            <div className="flex items-center gap-1">
              {isHomePage ? (
                <button
                  onClick={() => navigate(`/${profile?.username || user.id}`)}
                  className="px-3 py-1.5 text-xs font-sans font-500 text-gray-400
                           hover:text-white transition-colors duration-200
                           flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  My Wall
                </button>
              ) : (
                <button
                  onClick={() => navigate("/")}
                  className="px-3 py-1.5 text-xs font-sans font-500 text-gray-400
                           hover:text-white transition-colors duration-200
                           flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Add concert
                </button>
              )}

              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center rounded-full transition-colors duration-200 hover:ring-1 hover:ring-white/10">
                  <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-white/[0.08]">
                    <img
                      src={
                        profile?.avatar_url ||
                        `https://ui-avatars.com/api/?name=${profile?.name}`
                      }
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Menu.Button>

                <Menu.Items
                  className="absolute right-0 mt-2 w-52 bg-dark-elevated backdrop-blur-2xl
                            border border-white/[0.08] rounded-xl shadow-2xl shadow-black/40
                            overflow-hidden z-50"
                >
                  <div className="px-3 py-2.5 border-b border-white/[0.06]">
                    <p className="text-xs font-sans font-500 text-gray-300 truncate">
                      {profile?.username
                        ? `@${profile.username}`
                        : user.email.split("@")[0]}
                    </p>
                    <p className="text-[10px] text-gray-600 truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <MenuItem
                      onClick={() => navigate(`/${profile?.username || user.id}`)}
                      icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />}
                    >
                      View My Wall
                    </MenuItem>

                    <MenuItem
                      onClick={() => navigate("/profile")}
                      icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
                    >
                      My Profile
                    </MenuItem>

                    <MenuItemLink
                      href="https://github.com/daytimedrinkingclub/iheardthis.live"
                      icon={<path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />}
                      filled
                    >
                      Star this project
                    </MenuItemLink>

                    <div className="border-t border-white/[0.04] mt-1 pt-1">
                      <MenuItem
                        onClick={handleSignOut}
                        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />}
                      >
                        Log Out
                      </MenuItem>
                    </div>
                  </div>
                </Menu.Items>
              </Menu>
            </div>
          ) : (
            <button
              onClick={() => {
                if (isHomePage) {
                  onAuthClick();
                } else {
                  navigate("/");
                }
              }}
              className="px-3.5 py-1.5 text-xs font-sans font-500
                       text-neon-pink border border-neon-pink/30 rounded-full
                       hover:bg-neon-pink/10 transition-all duration-300"
            >
              {isHomePage ? "Sign in" : "Create My Wall"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuItem({ onClick, icon, children }) {
  return (
    <Menu.Item>
      {({ active }) => (
        <button
          onClick={onClick}
          className={`${active ? "bg-white/[0.04]" : ""}
            w-full text-left px-3 py-2 text-xs font-sans text-gray-400
            flex items-center gap-2 transition-colors duration-150`}
        >
          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icon}
          </svg>
          {children}
        </button>
      )}
    </Menu.Item>
  );
}

function MenuItemLink({ href, icon, filled, children }) {
  return (
    <Menu.Item>
      {({ active }) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${active ? "bg-white/[0.04]" : ""}
            w-full text-left px-3 py-2 text-xs font-sans text-gray-400
            flex items-center gap-2 transition-colors duration-150`}
        >
          <svg className="w-3.5 h-3.5 text-gray-500" fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} viewBox="0 0 24 24">
            {icon}
          </svg>
          {children}
        </a>
      )}
    </Menu.Item>
  );
}
