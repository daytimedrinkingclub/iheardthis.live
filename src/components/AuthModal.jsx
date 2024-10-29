import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First try to sign in
      let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      // If user doesn't exist, sign up
      if (error?.message.includes('Invalid login credentials')) {
        ({ data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: email.split('@')[0], // Default name from email
            }
          }
        }));

        if (error) throw error;
        toast.success('Account created!');
      } else if (error) {
        throw error;
      } else {
        toast.success('Welcome back!');
      }

      if (data?.user) {
        onSuccess(data.user);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-[100]">
      <div className="bg-dark-card w-full max-w-md rounded-2xl border border-gray-800 p-8 mx-4 
                    transform transition-all">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">Join the Community</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg 
                       text-white focus:outline-none focus:border-neon-pink"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg 
                       text-white focus:outline-none focus:border-neon-pink"
              placeholder="Choose a password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 mt-6 bg-neon-pink/20 border border-neon-pink 
                     text-neon-pink rounded-lg hover:bg-neon-pink/30 
                     focus:outline-none focus:ring-2 focus:ring-neon-pink/50
                     disabled:opacity-50 disabled:cursor-not-allowed
                     font-medium transition-all duration-200"
          >
            {loading ? 'Processing...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
} 