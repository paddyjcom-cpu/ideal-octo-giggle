import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, DollarSign, Package, ShoppingCart, Layers, Plus, Loader2, Mail, Lock, X } from 'lucide-react';
import { supabase } from './services/supabase';
import { Product, Stats, UserProfile } from './TYPES';
import { loadProductsFromSupabase, saveProductToSupabase, deleteProductFromSupabase } from './services/dbService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  
  // Auth state
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => handleUserSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => handleUserSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const handleUserSession = async (session: any) => {
    if (session) {
      const { user: authUser } = session;
      const profile: UserProfile = {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        tier: 'Growth',
        subscriptionActive: true,
        currency: '$'
      };
      setUser(profile);
      setIsAuthenticated(true);
      try {
        const cloudProducts = await loadProductsFromSupabase(authUser.id);
        setProducts(cloudProducts);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
      setProducts([]);
      setIsLoading(false);
      setShowAuth(true);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for verification link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      alert(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const stats: Stats = useMemo(() => {
    const soldItems = products.filter(p => p.status === 'Sold');
    const revenue = soldItems.reduce((acc, p) => acc + (p.soldPrice || p.listPrice || 0), 0);
    const costs = soldItems.reduce((acc, p) => acc + (p.cost || 0), 0);
    const inventoryValue = products.filter(p => p.status === 'Available').reduce((acc, p) => acc + p.listPrice, 0);
    return {
      totalRevenue: revenue,
      totalProfit: revenue - costs,
      activeListings: products.filter(p => p.status === 'Available').length,
      soldItemsCount: soldItems.length,
      inventoryValue
    };
  }, [products]);

  const getFilteredProducts = () => {
    if (!selectedStat) return [];
    switch (selectedStat) {
      case 'revenue':
      case 'profit':
        return products.filter(p => p.status === 'Sold');
      case 'inventory':
        return products.filter(p => p.status === 'Available');
      case 'sold':
        return products.filter(p => p.status === 'Sold');
      default:
        return [];
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a1628]">
        <Loader2 className="animate-spin text-teal-400 mb-4" size={56} />
        <h2 className="font-black text-white text-xl">Loading ResellFlow...</h2>
      </div>
    );
  }

  if (showAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a1628] p-6">
        <div className="w-full max-w-md bg-[#0f1d35] rounded-3xl shadow-2xl border border-gray-800 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-teal-400" size={32} />
            </div>
            <h1 className="text-2xl font-black text-teal-400 mb-2 text-centre">ResellFlow</h1>
            <p className="text-gray-400 text-sm">Track. Analyze. Profit.</p>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-[#0a1628] border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-[#0a1628] border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-4 bg-teal-500 text-white rounded-xl font-black hover:bg-teal-600 transition-all disabled:opacity-50"
            >
              {authLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : (isSignup ? 'Sign Up' : 'Sign In')}
            </button>
          </form>
          
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="w-full mt-4 text-sm text-gray-400 hover:text-teal-400 transition-colors"
          >
            {isSignup ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] overflow-hidden">
      {/* Header */}
      <div className="bg-[#0f1d35] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-5 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center">
              <TrendingUp className="text-teal-400" size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black text-teal-400">ResellFlow</h1>
              <p className="text-xs text-gray-500 font-medium">Track. Analyze. Profit.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2.5 bg-gray-800/50 text-gray-300 rounded-xl text-sm font-bold border border-gray-700 hover:bg-gray-800 transition-all flex items-center gap-2">
              <Plus size={18} />
              <span className="hidden sm:inline">Add Item</span>
            </button>
            <button className="px-4 py-2.5 bg-teal-500 text-white rounded-xl text-sm font-bold hover:bg-teal-600 transition-all flex items-center gap-2">
              <Plus size={18} />
              <span className="hidden sm:inline">Log Sale</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-5 py-6 space-y-5 pb-24">
        {/* Total Revenue Card */}
        <button
          onClick={() => setSelectedStat(selectedStat === 'revenue' ? null : 'revenue')}
          className="w-full bg-gradient-to-br from-[#0f1f3a] to-[#0a1628] rounded-3xl p-8 border border-gray-800/50 shadow-2xl hover:scale-[1.02] transition-all text-left"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-gray-400 text-sm font-semibold mb-3">Total Revenue</p>
              <h2 className="text-6xl font-black text-white mb-4">${stats.totalRevenue.toLocaleString()}</h2>
              <div className="flex items-center gap-2 text-teal-400">
                <TrendingUp size={16} />
                <span className="text-sm font-bold">Click to view details</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center">
              <DollarSign className="text-teal-400" size={32} strokeWidth={2.5} />
            </div>
          </div>
        </button>

        {/* Total Profit Card */}
        <button
          onClick={() => setSelectedStat(selectedStat === 'profit' ? null : 'profit')}
          className="w-full bg-gradient-to-br from-[#0f1f3a] to-[#0a1628] rounded-3xl p-8 border border-gray-800/50 shadow-2xl hover:scale-[1.02] transition-all text-left"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-gray-400 text-sm font-semibold mb-3">Total Profit</p>
              <h2 className="text-6xl font-black text-white mb-4">${stats.totalProfit.toLocaleString()}</h2>
              <div className="flex items-center gap-2 text-teal-400">
                <TrendingUp size={16} />
                <span className="text-sm font-bold">Click to view details</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center">
              <TrendingUp className="text-teal-400" size={32} strokeWidth={2.5} />
            </div>
          </div>
        </button>

        {/* Inventory Value Card */}
        <button
          onClick={() => setSelectedStat(selectedStat === 'inventory' ? null : 'inventory')}
          className="w-full bg-gradient-to-br from-[#0f1f3a] to-[#0a1628] rounded-3xl p-8 border border-gray-800/50 shadow-2xl hover:scale-[1.02] transition-all text-left"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-gray-400 text-sm font-semibold mb-3">Inventory Value</p>
              <h2 className="text-6xl font-black text-white mb-4">${stats.inventoryValue?.toLocaleString() || 0}</h2>
              <div className="flex items-center gap-2 text-teal-400">
                <Package size={16} />
                <span className="text-sm font-bold">{stats.activeListings} items available</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center">
              <Layers className="text-teal-400" size={32} strokeWidth={2.5} />
            </div>
          </div>
        </button>

        {/* Items Sold Card */}
        <button
          onClick={() => setSelectedStat(selectedStat === 'sold' ? null : 'sold')}
          className="w-full bg-gradient-to-br from-[#0f1f3a] to-[#0a1628] rounded-3xl p-8 border border-gray-800/50 shadow-2xl hover:scale-[1.02] transition-all text-left"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-gray-400 text-sm font-semibold mb-3">Items Sold</p>
              <h2 className="text-6xl font-black text-white mb-4">{stats.soldItemsCount}</h2>
              <div className="flex items-center gap-2 text-teal-400">
                <ShoppingCart size={16} />
                <span className="text-sm font-bold">Click to view details</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center">
              <ShoppingCart className="text-teal-400" size={32} strokeWidth={2.5} />
            </div>
          </div>
        </button>
      </div>

      {/* Details Modal */}
      {selectedStat && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedStat(null)}>
          <div className="bg-[#0f1d35] w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl border border-gray-800 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-[#0f1d35]">
              <h3 className="text-xl font-black text-white capitalize">{selectedStat} Details</h3>
              <button onClick={() => setSelectedStat(null)} className="p-2 hover:bg-gray-800 rounded-xl transition-colors">
                <X className="text-gray-400" size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {getFilteredProducts().length > 0 ? (
                getFilteredProducts().map(product => (
                  <div key={product.id} className="bg-[#0a1628] rounded-2xl p-4 border border-gray-800">
                    <div className="flex items-center gap-4">
                      {product.imageUrl && (
                        <img src={product.imageUrl} className="w-16 h-16 rounded-xl object-cover" alt={product.title} />
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-white">{product.title}</p>
                        <p className="text-sm text-gray-400">{product.brand}</p>
                        <p className="text-sm text-teal-400 font-bold mt-1">${product.listPrice}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        product.status === 'Sold' ? 'bg-teal-500/20 text-teal-400' : 'bg-gray-700 text-gray-300'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 font-medium">No items to display</p>
                  <p className="text-sm text-gray-600 mt-2">Start adding products to see them here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;                     
