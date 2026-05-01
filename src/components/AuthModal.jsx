import { useState } from 'react';
import { pb } from '../lib/pb';
import { toast } from 'sonner';
import Spinner from './Spinner';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const authData = await pb
        .collection('users')
        .authWithOAuth2({ provider: 'google' });
      toast.success('Welcome!');
      onSuccess(authData.record);
    } catch (error) {
      toast.error(error?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-[100]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-dark-elevated border border-white/[0.08] rounded-2xl
                      shadow-2xl shadow-black/60 px-8 py-10 mx-4 w-full max-w-sm
                      text-center space-y-6">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center
                     rounded-full text-gray-500 hover:text-white hover:bg-white/[0.06]
                     transition-colors duration-200 text-lg"
        >
          &times;
        </button>

        {/* Heading */}
        <div className="space-y-2">
          <h2 className="text-xl font-display font-700 text-white tracking-tight">
            Join the wall
          </h2>
          <p className="text-sm font-sans text-gray-500 leading-relaxed">
            Track artists you've seen live
          </p>
        </div>

        {/* Google Button */}
        <div className="flex flex-col items-center gap-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-3">
              <Spinner className="w-5 h-5" />
              <span>Signing in...</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center gap-3 w-full max-w-[320px]
                         px-4 py-2.5 bg-white text-gray-800 rounded-md
                         hover:bg-gray-100 transition-colors duration-200
                         font-sans font-500 text-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <p className="text-[11px] text-gray-600 font-sans leading-relaxed">
          By continuing, you agree to let us track your concert experiences
        </p>
      </div>
    </div>
  );
}
