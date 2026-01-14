import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Package, Settings, TrendingUp, User, ArrowLeft, Loader2, Cloud, Sparkles, Code } from 'lucide-react';
import { supabase } from "/services/supabase";
import { Product, Stats, UserProfile } from './TYPES';
import DashboardView from './DashboardView';
import InventoryView from './InventoryView';
import AuthView from './AuthView';
import { loadProductsFromSupabase, saveProductToSupabase, deleteProductFromSupabase, clearUserSupabaseData } from './dbService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

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
        email: authUser.email || "",
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || "Reseller",
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
    if(confirm('Delete this product?')) { 
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
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600 mb-2" size={48} />
        <h2 className="font-black text-slate-800">Syncing...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView onLogin={() => {}} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
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
        <header className="p-8 border-b bg-white/80 backdrop-blur-sm flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-2xl font-black text-slate-900 capitalize">{activeTab}</h2>
          <Settings className="text-slate-400 cursor-pointer hover:text-slate-600" />
        </header>
        <div className="p-10">
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
