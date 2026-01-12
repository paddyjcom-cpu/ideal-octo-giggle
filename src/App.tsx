import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Package, Settings, TrendingUp, User, ArrowLeft, Loader2, Cloud, Sparkles, Code
} from 'lucide-react';
import { supabase } from "./services/supabase";
import { Product, Stats, UserProfile } from './types';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import LaunchPadView from './components/LaunchPadView';
import ProfileModal from './components/ProfileModal';
import SettingsDropdown from './components/SettingsDropdown';
import StatsDetailModal from './components/StatsDetailModal';
import ProgressShareModal from './components/ProgressShareModal';
import LegalModal from './components/LegalModal';
import AuthView from './components/AuthView';
import { 
  loadProductsFromSupabase, 
  saveProductToSupabase, 
  deleteProductFromSupabase,
  clearUserSupabaseData
} from './services/dbService';

type TabType = 'dashboard' | 'inventory' | 'launch';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
  const [statsModalType, setStatsModalType] = useState<'revenue' | 'profit' | 'sold' | null>(null);
  const [progressShareOpen, setProgressShareOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | 'cookies' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUserSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUserSession(session);
    });
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
        monthlySalesCount: 0,
        subscriptionActive: true,
        nextRenewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        currency: authUser.user_metadata?.currency || '£'
      };
      setUser(profile);
      setIsAuthenticated(true);
      try {
        const cloudProducts = await loadProductsFromSupabase(authUser.id);
        setProducts(cloudProducts);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
      setProducts([]);
      setActiveTab('dashboard');
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
      soldItemsCount: soldItems.length,
    };
  }, [products]);

  const addProduct = async (newProduct: Product) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      setProducts(prev => [newProduct, ...prev]);
      await saveProductToSupabase(user.id, newProduct);
    } catch (err) {
      console.error(err);
      setProducts(prev => prev.filter(p => p.id !== newProduct.id));
    } finally {
      setIsSyncing(false);
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    if (!user) return;
    setIsSyncing(true);
    const originalProducts = [...products];
    try {
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      await saveProductToSupabase(user.id, updatedProduct);
    } catch (err) {
      console.error(err);
      setProducts(originalProducts);
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!user) return;
    if (confirm('Permanently delete this record?')) {
      setIsSyncing(true);
      const originalProducts = [...products];
      try {
        setProducts(prev => prev.filter(p => p.id !== id));
        await deleteProductFromSupabase(user.id, id);
      } catch (err) {
        console.error(err);
        setProducts(originalProducts);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const setCurrency = async (currency: string) => {
    if (!user) return;
    setUser(prev => prev ? ({ ...prev, currency }) : null);
    await supabase.auth.updateUser({ data: { currency } });
  };

  const handleLogout = async () => {
    setIsProfileOpen(false);
    setIsLoading(true);
    try {
      setUser(null);
      setIsAuthenticated(false);
      setProducts([]);
      await supabase.auth.signOut();
    } catch (err) {
      window.location.reload(); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    if (user && confirm('DANGER: Delete ALL cloud data?')) {
      setIsLoading(true);
      await clearUserSupabaseData(user.id);
      window.location.reload();
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 gap-4 text-center p-6">
        <Loader2 className="animate-spin text-indigo-600 mb-2" size={48} />
        <h2 className="text-xl font-black text-slate-800 tracking-tight">Syncing your Reseller OS</h2>
        <p className="text-slate-500 font-bold animate-pulse tracking-tight text-sm">Connecting to Supabase Cloud...</p>
      </div>
    );
  }

  if (!isAuthenticated) return <AuthView onLogin={() => {}} />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-8 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <TrendingUp className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            ResellFlow
          </h1>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          <SidebarItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <SidebarItem active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package size={20} />} label="Inventory" />
          <SidebarItem active={activeTab === 'launch'} onClick={() => setActiveTab('launch')} icon={<Code size={20} />} label="Launch Pad" />
          
          <button onClick={() => setIsProfileOpen(true)} className="w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all text-slate-500 hover:bg-slate-50 mt-auto font-bold text-sm">
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
               <User size={16} />
            </div>
            My Profile
          </button>
        </nav>

        <div className="p-6">
          <div className="bg-indigo-600 rounded-3xl p-6 shadow-xl shadow-indigo-100 relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
              <Sparkles size={48} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Status</p>
            <h4 className="font-black text-lg">Beta Access</h4>
          </div>
        </div>
      </aside>

      {/* Mobile Nav */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-xl border border-slate-200 px-6 py-4 rounded-[2.5rem] shadow-2xl flex items-center gap-8 md:hidden">
        <MobileNavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={24} />} />
        <MobileNavItem active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package size={24} />} />
        <MobileNavItem active={activeTab === 'launch'} onClick={() => setActiveTab('launch')} icon={<Code size={24} />} />
        <button onClick={() => setIsProfileOpen(true)} className="text-slate-400 hover:text-indigo-600 transition-colors p-2">
          <User size={24} />
        </button>
      </nav>

      <main className="flex-1 overflow-y-auto relative pb-32 md:pb-0" onClick={() => setIsSettingsDropdownOpen(false)}>
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-slate-900 capitalize tracking-tight">{activeTab}</h2>
            {isSyncing && (
              <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full animate-pulse">
                <Cloud size={10} /> Cloud Sync
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setIsSettingsDropdownOpen(!isSettingsDropdownOpen); }} className={`p-2.5 rounded-xl transition-all ${isSettingsDropdownOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-100'}`}>
                <Settings size={22} />
              </button>
              {isSettingsDropdownOpen && (
                <SettingsDropdown 
                  currency={user?.currency || '£'}
                  onSetCurrency={setCurrency}
                  onShowProgress={() => setProgressShareOpen(true)}
                  onShowLegal={(type) => setLegalModalType(type)}
                  onClearData={handleClearData} 
                  onClose={() => setIsSettingsDropdownOpen(false)} 
                />
              )}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-10 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && user && (
            <DashboardView 
              user={user} stats={stats} products={products} 
              onActiveClick={() => setActiveTab('inventory')}
              onRevenueClick={() => setStatsModalType('revenue')}
              onProfitClick={() => setStatsModalType('profit')}
              onSoldClick={() => setStatsModalType('sold')}
            />
          )}
          {activeTab === 'inventory' && user && (
            <InventoryView 
              user={user} products={products} onAddProduct={addProduct} onUpdateProduct={updateProduct} onDeleteProduct={deleteProduct} tier={user.tier} onBack={() => setActiveTab('dashboard')}
            />
          )}
          {activeTab === 'launch' && <LaunchPadView />}
        </div>
      </main>

      {isProfileOpen && user && (
        <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} onUpdateTier={() => {}} onLogout={handleLogout} />
      )}
      {statsModalType && user && (
        <StatsDetailModal user={user} type={statsModalType} products={products} onClose={() => setStatsModalType(null)} />
      )}
      {progressShareOpen && user && (
        <ProgressShareModal user={user} stats={stats} onClose={() => setProgressShareOpen(false)} />
      )}
      {legalModalType && (
        <LegalModal type={legalModalType} onClose={() => setLegalModalType(null)} />
      )}
    </div>
  );
};

const SidebarItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all ${active ? 'bg-indigo-50 text-indigo-600 font-black shadow-sm' : 'text-slate-500 hover:bg-slate-50 font-bold'}`}>
    {icon}
    {label}
  </button>
);

const MobileNavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode }> = ({ active, onClick, icon }) => (
  <button onClick={onClick} className={`p-4 rounded-[1.5rem] transition-all ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-400'}`}>
    {icon}
  </button>
);

export default App;
