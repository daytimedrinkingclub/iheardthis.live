import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import Profile from './pages/Profile';
import ArtistSearch from './components/ArtistSearch';
import AuthModal from './components/AuthModal';
import { useState } from 'react';

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-dark flex flex-col">
        <Header onAuthClick={() => setShowAuthModal(true)} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={
              <div className="container mx-auto px-4">
                <div className="flex flex-col items-center pt-20 pb-20">
                  <ArtistSearch />
                </div>
              </div>
            } />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        <Footer />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={(userData) => {
            setShowAuthModal(false);
          }}
        />
        <Toaster position="bottom-center" theme="dark" />
      </div>
    </Router>
  );
}

export default App;
