import ArtistSearch from './components/ArtistSearch';

function App() {
  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-center mt-20">
        <h1 className="text-3xl font-bold mb-8">Artist Profile Wall</h1>
        <ArtistSearch />
      </div>
    </div>
  );
}

export default App;
