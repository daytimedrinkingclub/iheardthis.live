import { useState, useEffect } from 'react';
import { Menu } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export default function Header({ onAuthClick }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) setProfile(data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    navigate('/');
    toast.success('Signed out successfully');
  };

  return (
    <header className="sticky top-0 z-20 bg-dark border-b border-gray-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <h1 
          onClick={() => navigate('/')}
          className="text-2xl font-bold bg-gradient-to-r from-neon-pink to-neon-blue 
                   text-transparent bg-clip-text cursor-pointer"
        >
          I heard this live
        </h1>

        {user ? (
          <Menu as="div" className="relative">
            <Menu.Button className="w-10 h-10 rounded-full overflow-hidden">
              <img
                src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </Menu.Button>

            <Menu.Items className="absolute right-0 mt-2 w-56 bg-dark border border-gray-800 
                                rounded-lg shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800">
                <p className="text-sm text-gray-300 font-medium truncate">
                  {profile?.name || user.email.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => navigate('/profile')}
                    className={`${
                      active ? 'bg-gray-800' : ''
                    } w-full text-left px-4 py-3 text-sm text-gray-300 flex items-center space-x-2`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Update Profile</span>
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
                      active ? 'bg-gray-800' : ''
                    } w-full text-left px-4 py-3 text-sm text-gray-300 flex items-center space-x-2`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" 
                            d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                    </svg>
                    <span>Star us on GitHub</span>
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleSignOut}
                    className={`${
                      active ? 'bg-gray-800' : ''
                    } w-full text-left px-4 py-3 text-sm text-gray-300 flex items-center space-x-2`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Log Out</span>
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        ) : (
          <button
            onClick={onAuthClick}
            className="px-4 py-2 bg-neon-pink/20 border border-neon-pink 
                     text-neon-pink rounded-lg hover:bg-neon-pink/30"
          >
            Create My Wall
          </button>
        )}
      </div>
    </header>
  );
} 