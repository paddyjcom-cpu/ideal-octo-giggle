import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Package, TrendingUp, User, Loader2, Menu, X, Settings, DollarSign, ShoppingCart, ArrowUpRight, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Product, Stats, UserProfile } from './TYPES';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const user: UserProfile = {
    id: 'test-123',
    email: 'paddy@resellflow.com',
    name: 'Paddy Jenkins',
    tier: 'Growth',
    subscriptionActive: true,
    currency: '£'
  };

  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      title: 'Nike Dunk Low Retro Black',
      brand: 'Nike',
      category: 'Footwear',
      platform: 'eBay',
      cost: 50,
      listPrice: 100,
      status: 'Available',
      dateAdded: '2025-01-15',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop'
    },
    {
      id: '2',
      title: 'Vintage Carhartt Jacket',
      brand: 'Carhartt',
      category: 'Clothing',
      platform: 'Depop',
      cost: 30,
      listPrice: 80,
      soldPrice: 80,
      status: 'Sold',
      dateAdded: '2025-01-10',
      dateSold: '2025-01-16',
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop'
    },
    {
      id: '3',
      title: 'Adidas Originals Hoodie',
      brand: 'Adidas',
      category: 'Clothing',
      platform: 'Vinted',
      cost: 25,
      listPrice: 65,
      status: 'Available',
      dateAdded: '2025-01-12',
      imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop'
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

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 shadow-2xl">
          <Loader2 className="animate-spin text-white mb-4 mx-auto" size={56} />
          <h2 className="font-black text-white text-xl tracking-tight">Loading ResellFlow...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="text-white" size={18} />
            </div>
            <h1 className="text-base font-black text-slate-900">ResellFlow</h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 pt-20 space-y-5">
              <nav className="space-y-1.5">
                <button
                  onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 p-3.5 font-bold rounded-xl transition-all text-sm ${
                    activeTab === 'dashboard'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard size={19} />
                  Dashboard
                </button>
                <button
                  onClick={() => { setActiveTab('inventory'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 p-3.5 font-bold rounded-xl transition-all text-sm ${
                    activeTab === 'inventory'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Package size={19} />
                  Inventory
                </button>
              </nav>
              <div className="pt-5 border-t border-slate-100">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-slate-50 to-indigo-50 rounded-xl">
                  <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-slate-800">{user.name}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{user.tier} Plan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - FULL SCREEN */}
      <main className="flex-1 overflow-y-auto">
        <header className="p-5 mt-14 md:mt-0 bg-white/10 backdrop-blur-xl flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-black text-white capitalize">{activeTab}</h2>
          <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <Settings size={20} className="text-white/80" />
          </button>
        </header>

        <div className="p-5 pb-24">
          {activeTab === 'dashboard' ? (
            <div className="space-y-5 max-w-2xl mx-auto">
              {/* Stats Cards - BIGGER & CENTERED */}
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl h-40 hover:scale-105 transition-all duration-300 text-left group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
                      <DollarSign size={26} className="text-white" strokeWidth={2.5} />
                    </div>
                    <ArrowUpRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-[11px] font-black uppercase tracking-wider mb-1.5">Revenue</p>
                    <h4 className="text-3xl font-black text-slate-900">{user.currency}{stats.totalRevenue.toFixed(2)}</h4>
                  </div>
                </button>

                <button className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl h-40 hover:scale-105 transition-all duration-300 text-left group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg">
                      <TrendingUp size={26} className="text-white" strokeWidth={2.5} />
                    </div>
                    <ArrowUpRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-[11px] font-black uppercase tracking-wider mb-1.5">Profit</p>
                    <h4 className="text-3xl font-black text-slate-900">{user.currency}{stats.totalProfit.toFixed(2)}</h4>
                  </div>
                </button>

                <button className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl h-40 hover:scale-105 transition-all duration-300 text-left group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 shadow-lg">
                      <Package size={26} className="text-white" strokeWidth={2.5} />
                    </div>
                    <ArrowUpRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-[11px] font-black uppercase tracking-wider mb-1.5">Active</p>
                    <h4 className="text-3xl font-black text-slate-900">{stats.activeListings}</h4>
                  </div>
                </button>

                <button className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl h-40 hover:scale-105 transition-all duration-300 text-left group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 shadow-lg">
                      <ShoppingCart size={26} className="text-white" strokeWidth={2.5} />
                    </div>
                    <ArrowUpRight size={18} className="text-slate-300 group-hover:text-violet-500 transition-colors" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-[11px] font-black uppercase tracking-wider mb-1.5">Sold</p>
                    <h4 className="text-3xl font-black text-slate-900">{stats.soldItemsCount}</h4>
                  </div>
                </button>
              </div>

              {/* Recent Products - FULL WIDTH */}
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
                <h3 className="font-black text-slate-800 text-lg mb-5">Recent Products</h3>
                <div className="space-y-4">
                  {products.slice(0, 3).map(product => (
                    <div key={product.id} className="flex gap-4 p-4 bg-gradient-to-r from-slate-50 to-indigo-50/50 rounded-2xl hover:shadow-lg transition-all">
                      <img src={product.imageUrl} className="w-16 h-16 rounded-xl object-cover shadow-md flex-shrink-0" alt={product.title} />
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-base text-slate-900 truncate mb-1">{product.title}</p>
                        <p className="text-xs text-slate-500 font-bold mb-2">{product.brand}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900">{user.currency}{product.listPrice}</span>
                          <span className="text-[10px] font-black px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded uppercase">{product.platform}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-black self-start ${
                        product.status === 'Sold' ? 'bg-emerald-500 text-white' : 'bg-indigo-500 text-white'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5 max-w-2xl mx-auto">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={20} />
                <input
                  type="text"
                  placeholder="Search your inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-2xl text-base focus:ring-2 focus:ring-white outline-none font-bold text-slate-700 shadow-xl placeholder:text-slate-400"
                />
              </div>

              {/* Products Grid */}
              <div className="space-y-4">
                {filteredProducts.map(product => (
                  <div key={product.id} className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-5 hover:scale-[1.02] transition-all">
                    <div className="flex gap-4">
                      <img
                        src={product.imageUrl}
                        className="w-20 h-20 rounded-2xl object-cover shadow-lg flex-shrink-0"
                        alt={product.title}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-black text-slate-900 truncate mb-1">{product.title}</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase">{product.brand} • {product.category}</p>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full flex-shrink-0 ${
                            product.status === 'Available' ? 'bg-indigo-500 text-white' :
                            product.status === 'Sold' ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'
                          }`}>
                            {product.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xl font-black text-slate-900 mb-1">{user.currency}{product.listPrice.toFixed(2)}</p>
                            <span className="inline-block text-[10px] font-black px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg uppercase">
                              {product.platform}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-2.5 text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl transition-all shadow-lg">
                              <Edit2 size={16} />
                            </button>
                            <button className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-lg">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Button */}
              <button className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 transition-transform">
                <Plus size={30} className="text-white" strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
