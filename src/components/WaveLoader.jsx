export default function WaveLoader({ text = "Loading..." }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-dark/50 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center justify-center bg-dark/30 rounded-2xl p-8 backdrop-blur-md">
        {/* Fixed height container for waves */}
        <div className="h-12 flex items-center mb-4">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 rounded-full animate-soundwave bg-gradient-to-t from-neon-pink to-neon-blue"
                style={{
                  height: '16px',
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.7s'
                }}
              />
            ))}
          </div>
        </div>
        {/* Loading text */}
        <div className="h-6 flex items-center">
          <p className="text-sm font-medium text-gray-400">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
} 