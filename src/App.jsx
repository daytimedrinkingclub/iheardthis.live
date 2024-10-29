import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import Profile from './pages/Profile';
import ArtistSearch from './components/ArtistSearch';
import AuthModal from './components/AuthModal';
import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import PublicProfile from './pages/PublicProfile';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Function to handle non-logged in user actions
  const handleAuthRequired = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-dark flex flex-col">
          <Header onAuthClick={() => setIsAuthModalOpen(true)} />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={
                <div className="animated-gradient-transparent min-h-screen">
                  <div className="noise" />
                  <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col items-center pt-20 pb-20">
                      <ArtistSearch onAuthRequired={handleAuthRequired} />
                    </div>
                  </div>
                </div>
              } />
              <Route path="/profile" element={<Profile />} />
              <Route path="/:username" element={<PublicProfile />} />
            </Routes>
          </main>
          <Footer />
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onSuccess={(userData) => {
              setIsAuthModalOpen(false);
            }}
          />
          <Toaster position="bottom-center" theme="dark" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
