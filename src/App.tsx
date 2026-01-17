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
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop'
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
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop'
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
      imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=300&fit=crop'
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 shadow-2xl">
          <Loader2 className="animate-spin text-white mb-4 mx-auto" size={56} />
          <h2 className="font-black text-white text-xl tracking-tight">Loading ResellFlow...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/30 overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <TrendingUp className="text-white" size={20} />
            </div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">ResellFlow</h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 pt-24 space-y-6">
              <nav className="space-y-2">
                <button
                  onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 p-4 font-bold rounded-2xl transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard size={20} />
                  Dashboard
                </button>
                <button
                  onClick={() => { setActiveTab('inventory'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 p-4 font-bold rounded-2xl transition-all ${
                    activeTab === 'inventory'
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Package size={20} />
                  Inventory
                </button>
              </nav>
              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500 font-semibold">{user.tier} Plan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 flex-col shadow-xl">
        <div className="p-8 border-b border-slate-100 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <TrendingUp className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">ResellFlow</h1>
        </div>
        <nav className="flex-1 p-6 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 p-4 font-bold rounded-2xl transition-all ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center gap-3 p-4 font-bold rounded-2xl transition-all ${
              activeTab === 'inventory'
                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Package size={20} />
            Inventory
          </button>
        </nav>
        <div className="p-6 border-t border-slate-100">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-500 font-semibold">{user.tier} Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="p-6 md:p-8 mt-16 md:mt-0 border-b bg-white/60 backdrop-blur-xl flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 capitalize">{activeTab}</h2>
          <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
            <Settings size={22} className="text-slate-400" />
          </button>
        </header>

        <div className="p-4 md:p-10 pb-24">
          {activeTab === 'dashboard' ? (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-slate-100 h-36 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 text-left group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200">
                      <DollarSign size={24} className="text-white" />
                    </div>
                    <ArrowUpRight size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Revenue</p>
                    <h4 className="text-2xl font-black text-slate-900">{user.currency}{stats.totalRevenue.toFixed(2)}</h4>
                  </div>
                </button>

                <button className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-slate-100 h-36 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 text-left group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-200">
                      <TrendingUp size={24} className="text-white" />
                    </div>
                    <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Profit</p>
                    <h4 className="text-2xl font-black text-slate-900">{user.currency}{stats.totalProfit.toFixed(2)}</h4>
                  </div>
                </button>

                <button className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-slate-100 h-36 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 text-left group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200">
                      <Package size={24} className="text-white" />
                    </div>
                    <ArrowUpRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Active</p>
                    <h4 className="text-2xl font-black text-slate-900">{stats.activeListings}</h4>
                  </div>
                </button>

                <button className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-slate-100 h-36 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 text-left group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-200">
                      <ShoppingCart size={24} className="text-white" />
                    </div>
                    <ArrowUpRight size={16} className="text-slate-300 group-hover:text-violet-500 transition-colors" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Sold</p>
                    <h4 className="text-2xl font-black text-slate-900">{stats.soldItemsCount}</h4>
                  </div>
                </button>
              </div>

              {/* Recent Products */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-slate-100">
                <h3 className="font-black text-slate-800 text-lg mb-4">Recent Products</h3>
                <div className="space-y-3">
                  {products.slice(0, 3).map(product => (
                    <div key={product.id} className="flex gap-4 p-4 bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-2xl hover:shadow-md transition-all">
                      <img src={product.imageUrl} className="w-20 h-20 rounded-2xl object-cover shadow-sm" alt={product.title} />
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm text-slate-900 truncate">{product.title}</p>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">{product.brand} • {user.currency}{product.listPrice}</p>
                        <span className="inline-block mt-2 text-[9px] font-black px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg uppercase">{product.platform}</span>
                      </div>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-black self-start ${
                        product.status === 'Sold' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search your inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-200 outline-none font-semibold text-slate-700 shadow-sm"
                />
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 gap-4">
                {filteredProducts.map(product => (
                  <div key={product.id} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-100 p-5 hover:shadow-xl transition-all">
                    <div className="flex gap-4">
                      <img
                        src={product.imageUrl}
                        className="w-28 h-28 rounded-2xl object-cover shadow-md flex-shrink-0"
                        alt={product.title}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-black text-slate-900 truncate">{product.title}</h3>
                            <p className="text-xs text-slate-500 font-semibold uppercase mt-1">{product.brand} • {product.category}</p>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full flex-shrink-0 ${
                            product.status === 'Available' ? 'bg-indigo-100 text-indigo-700' :
                            product.status === 'Sold' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {product.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-black text-slate-900">{user.currency}{product.listPrice.toFixed(2)}</p>
                            {product.status === 'Sold' && (
                              <p className="text-sm font-black text-emerald-600">Sold: {user.currency}{(product.soldPrice ?? product.listPrice).toFixed(2)}</p>
                            )}
                            <span className="inline-block mt-2 text-[9px] font-black px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg uppercase">
                              {product.platform}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                              <Edit2 size={18} />
                            </button>
                            <button className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Button */}
              <button className="fixed bottom-24 md:bottom-8 right-6 w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-2xl shadow-indigo-300 flex items-center justify-center hover:scale-110 transition-transform">
                <Plus size={28} className="text-white" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
