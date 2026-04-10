/* global google */
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

async function generateNonce() {
  const raw = crypto.randomUUID();
  const encoded = new TextEncoder().encode(raw);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashed = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return { raw, hashed };
}

export default function GoogleOneTap() {
  const { user } = useAuth();
  const location = useLocation();
  const [prompted, setPrompted] = useState(false);

  useEffect(() => {
    // Only show on homepage for logged-out users, and only once per mount
    if (user || location.pathname !== '/' || prompted) return;

    let cancelled = false;

    const init = async () => {
      const nonce = await generateNonce();
      if (cancelled) return;

      // Wait for Google script to load
      const waitForGoogle = () => {
        if (window.google) {
          google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: (response) => handleSignIn(response, nonce.raw),
            auto_select: true,
            cancel_on_tap_outside: false,
            nonce: nonce.hashed,
          });
          google.accounts.id.prompt();
          setPrompted(true);
        } else {
          setTimeout(waitForGoogle, 200);
        }
      };
      waitForGoogle();
    };

    // Small delay so the page renders first
    const timeout = setTimeout(init, 500);
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [user, location.pathname, prompted]);

  const handleSignIn = async (response, nonce) => {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
        nonce,
      });

      if (error) throw error;
      toast.success('Welcome!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  // This component renders nothing - One Tap is a Google-managed overlay
  return null;
}
