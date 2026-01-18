import React, { useState, useEffect } from 'react';
import { TrendingUp, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simple test - no Supabase
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a1628] p-6">
        <div className="bg-red-500/10 border border-red-500 rounded-2xl p-8 max-w-md">
          <h2 className="text-xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-white">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a1628]">
        <Loader2 className="animate-spin text-teal-400 mb-4" size={56} />
        <h2 className="font-black text-white text-xl">Loading ResellFlow...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628]">
      {/* Header */}
      <div className="bg-[#0f1d35] border-b border-gray-800 p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center">
            <TrendingUp className="text-teal-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-teal-400">ResellFlow</h1>
            <p className="text-xs text-gray-500">Track. Analyze. Profit.</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div className="bg-[#0f1d35] rounded-3xl p-8 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Total Revenue</p>
          <h2 className="text-5xl font-black text-white">$0</h2>
        </div>

        <div className="bg-[#0f1d35] rounded-3xl p-8 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Total Profit</p>
          <h2 className="text-5xl font-black text-white">$0</h2>
        </div>

        <div className="bg-[#0f1d35] rounded-3xl p-8 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Items Sold</p>
          <h2 className="text-5xl font-black text-white">0</h2>
        </div>

        <div className="bg-teal-500/10 border border-teal-500/30 rounded-2xl p-6 mt-8">
          <p className="text-teal-400 font-bold text-center">✓ App is working!</p>
          <p className="text-gray-400 text-sm text-center mt-2">If you can see this, the basic app is loading correctly.</p>
        </div>
      </div>
    </div>
  );
};

export default App;