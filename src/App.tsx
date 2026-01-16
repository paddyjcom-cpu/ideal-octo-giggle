import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Package, Settings, TrendingUp, User, Loader2, Cloud, Menu, X } from 'lucide-react';
import { supabase } from './services/supabase';
import { Product, Stats, UserProfile } from './TYPES';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import AuthView from './components/AuthView';
import { loadProductsFromSupabase, saveProductToSupabase, deleteProductFromSupabase } from './services/dbService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Reseller',
        tier: 'Growth',
        subscriptionActive: true,
        currency: authUser.user_metadata?.currency || '£'
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
    }
  };

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

  const addProduct = async (p: Product) => {
    setIsSyncing(true);
    try {
      setProducts(prev => [p, ...prev]);
      if (user) await saveProductToSupabase(user.id, p);
    } finally {
      setIsSyncing(false);
    }
  };

  const updateProduct = async (p: Product) => {
    setIsSyncing(true);
    try {
      setProducts(prev => prev.map(item => item.id === p.id ? p : item));
      if (user) await saveProductToSupabase(user.id, p);
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (confirm('Delete this product?')) {
      setIsSyncing(true);
      try {
        setProducts(prev => prev.filter(p => p.id !== id));
        if (user) await deleteProductFromSupabase(user.id, id);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
        <h2 className="font-black text-slate-800 text-lg">Loading ResellFlow...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView onLogin={() => {}} />;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-indigo-600" size={24} />
            <h1 className="text-lg font-black text-slate-900">ResellFlow</h1>
            {isSyncing && <Cloud className="animate-pulse text-indigo-400" size={16} />}
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 pt-20 space-y-6">
              <nav className="space-y-2">
                <button
                  onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 p-4 font-bold rounded-xl transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard size={20} />
                  Dashboard
                </button>
                <button
                  onClick={() => { setActiveTab('inventory'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 p-4 font-bold rounded-xl transition-colors ${
                    activeTab === 'inventory'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:bg-slate-50'
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
                    <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                    <p className="text-xs text-slate-500">{user?.tier} Plan</p>
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
          {isSyncing && <Cloud className="animate-pulse text-indigo-400" size={16} />}
        </div>
        <nav className="flex-1 p-6 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 p-4 font-bold rounded-xl transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center gap-3 p-4 font-bold rounded-xl transition-colors ${
              activeTab === 'inventory'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-600 hover:bg-slate-50'
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
              <p className="text-sm font-bold text-slate-800">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.tier} Plan</p>
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

        <div className="p-4 md:p-10">
          {activeTab === 'dashboard' && (
            <DashboardView
              user={user!}
              stats={stats}
              products={products}
              onActiveClick={() => setActiveTab('inventory')}
              onRevenueClick={() => {}}
              onProfitClick={() => {}}
              onSoldClick={() => {}}
            />
          )}
          {activeTab === 'inventory' && (
            <InventoryView
              user={user!}
              products={products}
              onAddProduct={addProduct}
              onUpdateProduct={updateProduct}
              onDeleteProduct={deleteProduct}
              tier="Growth"
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
