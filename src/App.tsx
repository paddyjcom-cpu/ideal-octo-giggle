import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Package, TrendingUp, User, Loader2, Cloud, Menu, X, Settings } from 'lucide-react';
import { Product, Stats, UserProfile } from './TYPES';

// Temporarily bypass Supabase to test
const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock user for testing
  const user: UserProfile = {
    id: 'test-123',
    email: 'test@test.com',
    name: 'Test User',
    tier: 'Growth',
    subscriptionActive: true,
    currency: '£'
  };

  // Mock products
  const [products] = useState<Product[]>([
    {
      id: '1',
      title: 'Nike Sneakers',
      brand: 'Nike',
      category: 'Footwear',
      platform: 'eBay',
      cost: 50,
      listPrice: 100,
      status: 'Available',
      dateAdded: '2025-01-15',
      imageUrl: 'https://picsum.photos/seed/nike/400/300'
    },
    {
      id: '2',
      title: 'Vintage Jacket',
      brand: 'Carhartt',
      category: 'Clothing',
      platform: 'Depop',
      cost: 30,
      listPrice: 80,
      soldPrice: 80,
      status: 'Sold',
      dateAdded: '2025-01-10',
      dateSold: '2025-01-16',
      imageUrl: 'https://picsum.photos/seed/jacket/400/300'
    }
  ]);

  const stats: Stats = useMemo(() => {
    const soldItems = products.filter(p => p.status === 'Sold');
    const revenue = soldItems.reduce((acc, p) => acc + (p.soldPrice || p.listPrice || 0), 0);
    const costs = soldItems.reduce((acc, p) => acc + (p.cost || 0), 0);
    return {
      totalRevenue: revenue,
      totalProfit: revenue - costs,
      activeListings: products.filter(p => p.status === 'Available').length,
      soldItemsCount: soldItems.length
    };
  }, [products]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsAuthenticated(true);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md">
          <h2 className="text-xl font-black text-red-600 mb-4">Error Loading App</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold"
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
        <h2 className="font-black text-slate-800 text-lg">Loading ResellFlow...</h2>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-indigo-600" size={24} />
            <h1 className="text-lg font-black text-slate-900">ResellFlow</h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 pt-20 space-y-6">
              <nav className="space-y-2">
                <button
                  onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 p-4 font-bold rounded-xl transition-colors ${
                    activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard size={20} />
                  Dashboard
                </button>
                <button
                  onClick={() => { setActiveTab('inventory'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 p-4 font-bold rounded-xl transition-colors ${
                    activeTab === 'inventory' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Package size={20} />
                  Inventory
                </button>
              </nav>
              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <User className="text-slate-400" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.tier} Plan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col">
        <div className="p-8 border-b border-slate-100 flex items-center gap-3">
          <TrendingUp className="text-indigo-600" />
          <h1 className="text-xl font-black text-slate-900">ResellFlow</h1>
        </div>
        <nav className="flex-1 p-6 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 p-4 font-bold rounded-xl transition-colors ${
              activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center gap-3 p-4 font-bold rounded-xl transition-colors ${
              activeTab === 'inventory' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Package size={20} />
            Inventory
          </button>
        </nav>
        <div className="p-6 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <User className="text-slate-400" size={20} />
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-500">{user.tier} Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="p-6 md:p-8 mt-16 md:mt-0 border-b bg-white/80 backdrop-blur-sm flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 capitalize">{activeTab}</h2>
          <Settings className="text-slate-400 cursor-pointer hover:text-slate-600" />
        </header>

        <div className="p-4 md:p-10 pb-24">
          {activeTab === 'dashboard' ? (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 h-32">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-50 shadow-sm">
                      <DollarSign size={22} className="text-emerald-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Revenue</p>
                    <h4 className="text-xl font-black text-slate-900">{user.currency}{stats.totalRevenue.toFixed(2)}</h4>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 h-32">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-2xl bg-blue-50 shadow-sm">
                      <TrendingUp size={22} className="text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Profit</p>
                    <h4 className="text-xl font-black text-slate-900">{user.currency}{stats.totalProfit.toFixed(2)}</h4>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 h-32">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-2xl bg-indigo-50 shadow-sm">
                      <Package size={22} className="text-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Active</p>
                    <h4 className="text-xl font-black text-slate-900">{stats.activeListings}</h4>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 h-32">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-2xl bg-violet-50 shadow-sm">
                      <ShoppingCart size={22} className="text-violet-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Sold</p>
                    <h4 className="text-xl font-black text-slate-900">{stats.soldItemsCount}</h4>
                  </div>
                </div>
              </div>

              {/* Products List */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-black text-slate-800 mb-4">Recent Products</h3>
                <div className="space-y-3">
                  {products.map(product => (
                    <div key={product.id} className="flex gap-4 p-4 bg-slate-50 rounded-2xl">
                      <img src={product.imageUrl} className="w-16 h-16 rounded-xl object-cover" alt={product.title} />
                      <div className="flex-1">
                        <p className="font-bold text-sm text-slate-900">{product.title}</p>
                        <p className="text-xs text-slate-500">{product.brand} • {user.currency}{product.listPrice}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold self-start ${
                        product.status === 'Sold' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center">
              <Package size={48} className="mx-auto text-indigo-400 mb-4" />
              <h3 className="text-lg font-black text-slate-900 mb-2">Inventory View</h3>
              <p className="text-slate-600">Coming soon - Add your products here</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const DollarSign = ({ size, className }: { size: number; className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const ShoppingCart = ({ size, className }: { size: number; className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

export default App;
