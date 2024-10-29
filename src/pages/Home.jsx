import { useAuth } from '../contexts/AuthContext';

export default function Home({ onAuthRequired }) {
  const { user } = useAuth();

  const handleAddArtist = () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    // proceed with adding artist logic
  };

  return (
    // ... your existing JSX
    <button 
      onClick={handleAddArtist}
      className="px-4 py-2 bg-neon-pink/20 border border-neon-pink 
                text-neon-pink rounded-lg hover:bg-neon-pink/30"
    >
      Add to My Wall
    </button>
    // ... rest of your component
  );
} 