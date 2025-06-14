import React, { useState } from 'react';
import { Zap } from 'lucide-react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Logos */}
        <div className="flex items-center justify-center space-x-8">
          {/* Vite Logo */}
          <div className="relative">
            <div className="w-24 h-24 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-400 rounded-lg transform rotate-12"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-yellow-400 via-orange-500 to-purple-600 rounded-lg transform -rotate-12"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="w-10 h-10 text-white z-10" />
              </div>
            </div>
          </div>

          {/* React Logo */}
          <div className="w-24 h-24 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-20 h-20 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="2" />
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="none" />
                <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1" />
                <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(60 12 12)" />
                <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(120 12 12)" />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-light text-gray-100 tracking-wide">
          Vite + React
        </h1>

        {/* Counter */}
        <div className="space-y-4">
          <button
            onClick={() => setCount(count + 1)}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white px-6 py-3 rounded-lg transition-all duration-200 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            count is {count}
          </button>
        </div>

        {/* Instructions */}
        <div className="space-y-2 text-gray-400">
          <p>
            Edit <code className="bg-gray-800 px-2 py-1 rounded text-cyan-400">src/App.tsx</code> and save to test HMR
          </p>
        </div>

        {/* Footer text */}
        <p className="text-gray-500 text-sm">
          Click on the Vite and React logos to learn more
        </p>
      </div>
    </div>
  );
}

export default App;