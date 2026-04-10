/* global google */
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import Spinner from './Spinner';

async function generateNonce() {
  const raw = crypto.randomUUID();
  const encoded = new TextEncoder().encode(raw);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashed = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return { raw, hashed };
}

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [currentNonce, setCurrentNonce] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const initGoogle = async () => {
      const nonce = await generateNonce();
      if (cancelled) return;
      setCurrentNonce(nonce.raw);

      setTimeout(() => {
        if (cancelled) return;
        if (window.google && document.getElementById("googleButton")) {
          google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: (response) => handleGoogleSignIn(response, nonce.raw),
            auto_select: false,
            cancel_on_tap_outside: true,
            nonce: nonce.hashed,
          });

          google.accounts.id.renderButton(
            document.getElementById("googleButton"),
            {
              theme: "outline",
              size: "large",
              width: 320,
              type: "standard",
              shape: "rectangular",
              text: "continue_with",
              locale: "en"
            }
          );
        }
      }, 0);
    };

    initGoogle();
    return () => { cancelled = true; };
  }, [isOpen]);

  const handleGoogleSignIn = async (response, nonce) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
        nonce: nonce || currentNonce,
      });

      if (error) throw error;

      toast.success('Welcome!');
      onSuccess(data.user);
    } catch (error) {
      toast.error(error.message);
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
            <div id="googleButton" className="flex justify-center" />
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
