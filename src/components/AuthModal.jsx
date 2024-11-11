import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import Spinner from './Spinner';

const usernameValidation = async (username, supabase) => {
  if (!username) return false;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return !!data; // Returns true if username exists
  } catch (error) {
    console.error('Error checking username:', error);
    return false;
  }
};

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('signup'); // 'signup' or 'login'
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [shakeUsername, setShakeUsername] = useState(false);
  
  // Signup form state
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    username: '',
    password: ''
  });
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    if (!isOpen || activeTab !== 'login') return;
    
    // Small timeout to ensure the DOM element exists
    const timeoutId = setTimeout(() => {
      if (window.google && document.getElementById("googleButton")) {
        google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        google.accounts.id.renderButton(
          document.getElementById("googleButton"),
          { 
            theme: "outline", 
            size: "large",
            width: "100%",
            type: "standard", // This ensures it shows both icon and text
            shape: "rectangular",
            text: "signin_with",
            locale: "en"
          }
        );

        google.accounts.id.prompt();
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [isOpen, activeTab]); // Add activeTab to dependencies

  const handleGoogleSignIn = async (response) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      });

      if (error) throw error;

      toast.success('Welcome!');
      resetForms();
      onSuccess(data.user);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Username validation with debounce
  const checkUsername = async (username) => {
    if (!username) return;
    
    setCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        toast.error('Username is already taken');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    } finally {
      setCheckingUsername(false);
    }
  };

  const resetForms = () => {
    setSignupForm({
      name: '',
      email: '',
      username: '',
      password: ''
    });
    setLoginForm({
      email: '',
      password: ''
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Prevent submission if username is taken
    if (shakeUsername) {
      toast.error('Please choose a different username');
      return;
    }

    setLoading(true);

    try {
      // Validate username
      const isUsernameAvailable = await checkUsername(signupForm.username);
      if (!isUsernameAvailable) {
        setLoading(false);
        return;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
        options: {
          data: {
            name: signupForm.name,
            username: signupForm.username,
          }
        }
      });

      if (authError) throw authError;

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: signupForm.name,
          username: signupForm.username,
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      toast.success('Profile created!');
      resetForms();
      onSuccess(authData.user);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password
      });

      if (error) throw error;
      toast.success('Welcome back!');
      resetForms();
      onSuccess(data.user);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    // Only clear error state if the username actually changes
    if (value !== signupForm.username) {
      setShakeUsername(false);
    }
    setSignupForm({ ...signupForm, username: value });
  };

  const handleUsernameBlur = async (e) => {
    const username = e.target.value;
    if (!username) return;

    setCheckingUsername(true);
    try {
      const isTaken = await usernameValidation(username, supabase);
      if (isTaken) {
        toast.error('Username already taken');
        setShakeUsername(true);
      }
    } finally {
      setCheckingUsername(false);
    }
  };

  if (!isOpen) return null;

  const socialLoginButtons = (mode) => (
    <div className="space-y-4 mb-6">
      {mode === 'login' && (
        <div id="googleButton" className="flex justify-center w-full !min-w-full">
          {/* The '!min-w-full' class ensures the button takes full width */}
        </div>
      )}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-dark-card text-gray-400">
            {mode === 'login' ? 'or login with email' : 'sign up with email'}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-[100]">
      <div className="bg-dark-card w-full max-w-md rounded-2xl border border-gray-800 p-8 mx-4 
                    transform transition-all">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-2 text-center rounded-lg transition-colors
                      ${activeTab === 'signup' 
                        ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/50' 
                        : 'text-gray-400 hover:text-white'}`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 text-center rounded-lg transition-colors
                      ${activeTab === 'login' 
                        ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/50' 
                        : 'text-gray-400 hover:text-white'}`}
          >
            Login
          </button>
        </div>

        {/* Signup Form */}
        {activeTab === 'signup' && (
          <>
            {socialLoginButtons('signup')}
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                  className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg 
                           text-white focus:outline-none focus:border-neon-pink"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={signupForm.username}
                    onChange={handleUsernameChange}
                    onBlur={handleUsernameBlur}
                    className={`w-full px-4 py-3 bg-dark border 
                             ${shakeUsername ? 'border-red-500 shake' : 'border-gray-700'} 
                             rounded-lg text-white focus:outline-none focus:border-neon-pink
                             transition-colors duration-200`}
                    placeholder="Choose a username"
                  />
                  {checkingUsername && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Spinner className="w-5 h-5" />
                    </div>
                  )}
                </div>
                {shakeUsername && (
                  <p className="mt-1 text-sm text-red-500">
                    This username is already taken
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                  className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg 
                           text-white focus:outline-none focus:border-neon-pink"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                  className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg 
                           text-white focus:outline-none focus:border-neon-pink"
                  placeholder="Choose a password"
                />
              </div>

              <button
                type="submit"
                disabled={loading || checkingUsername}
                className="w-full px-4 py-3 mt-6 bg-neon-pink/20 border border-neon-pink 
                         text-neon-pink rounded-lg hover:bg-neon-pink/30 
                         focus:outline-none focus:ring-2 focus:ring-neon-pink/50
                         disabled:opacity-50 disabled:cursor-not-allowed
                         font-medium transition-all duration-200
                         flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Spinner className="w-5 h-5" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          </>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <>
            {socialLoginButtons('login')}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg 
                           text-white focus:outline-none focus:border-neon-pink"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg 
                           text-white focus:outline-none focus:border-neon-pink"
                  placeholder="Your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 mt-6 bg-neon-pink/20 border border-neon-pink 
                         text-neon-pink rounded-lg hover:bg-neon-pink/30 
                         focus:outline-none focus:ring-2 focus:ring-neon-pink/50
                         disabled:opacity-50 disabled:cursor-not-allowed
                         font-medium transition-all duration-200
                         flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Spinner className="w-5 h-5" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </form>
          </>
        )}

        {/* Close button */}
        <button
          onClick={() => {
            resetForms();
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
        >
          ×
        </button>
      </div>
    </div>
  );
} 