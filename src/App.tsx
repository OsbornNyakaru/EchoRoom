import React, { useState } from 'react';
import { Zap, MessageCircle, Mic, Volume2 } from 'lucide-react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              EchoRoom
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Volume2 className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">AI Voice Ready</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="text-center space-y-12 max-w-4xl mx-auto px-6">
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-8 mb-8">
              {/* Vite Logo */}
              <div className="relative group">
                <div className="w-24 h-24 relative transform transition-transform group-hover:scale-110">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-400 rounded-xl transform rotate-12 opacity-80"></div>
                  <div className="absolute inset-2 bg-gradient-to-br from-yellow-400 via-orange-500 to-purple-600 rounded-xl transform -rotate-12"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-12 h-12 text-white z-10" />
                  </div>
                </div>
              </div>

              {/* React Logo */}
              <div className="w-24 h-24 relative group transform transition-transform group-hover:scale-110">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-20 h-20 text-cyan-400 animate-spin-slow" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="2" />
                    <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1" />
                    <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(60 12 12)" />
                    <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(120 12 12)" />
                  </svg>
                </div>
              </div>
            </div>

            <h1 className="text-6xl md:text-7xl font-light text-white tracking-wide">
              Voice-Powered
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Conversations
              </span>
            </h1>

            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Experience the future of digital interaction with AI-powered voice conversations. 
              Built with cutting-edge technology for seamless, natural communication.
            </p>
          </div>

          {/* Interactive Demo Section */}
          <div className="space-y-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-md mx-auto">
              <h3 className="text-2xl font-semibold mb-6 flex items-center justify-center space-x-3">
                <Mic className="w-6 h-6 text-purple-400" />
                <span>Try the Demo</span>
              </h3>
              
              <button
                onClick={() => setCount(count + 1)}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/50 font-semibold text-lg"
              >
                Interactions: {count}
              </button>
              
              <p className="text-gray-400 text-sm mt-4 text-center">
                Click to test the interactive counter while exploring voice features
              </p>
            </div>

            {/* Voice Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Natural Speech</h4>
                <p className="text-gray-400 text-sm">Advanced AI understands context and responds naturally</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Volume2 className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Real-time Audio</h4>
                <p className="text-gray-400 text-sm">Low-latency voice processing for smooth conversations</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Smart Responses</h4>
                <p className="text-gray-400 text-sm">Contextual AI that adapts to your conversation style</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4 text-gray-400 max-w-2xl mx-auto">
            <p className="text-lg">
              The ElevenLabs AI voice widget is now active. Look for the voice interface to start your conversation.
            </p>
            <p className="text-sm">
              Edit <code className="bg-white/10 px-3 py-1 rounded-lg text-cyan-400 font-mono">src/App.tsx</code> to customize your voice-powered application
            </p>
          </div>
        </div>
      </main>

      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
}

export default App;