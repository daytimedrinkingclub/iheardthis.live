import ArtistSearch from './components/ArtistSearch';

function App() {
  return (
    <div className="container mx-auto px-4 min-h-screen">
      <div className="flex flex-col items-center pt-20 pb-20">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r 
                     from-neon-pink to-neon-blue animate-pulse">
          I heard this live
        </h1>
        <ArtistSearch />
      </div>
    </div>
  );
}

export default App;
