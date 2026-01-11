import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Package, BookOpen, Rocket, User, ArrowLeft, Loader2, Cloud, TrendingUp, Settings } from 'lucide-react';
import { supabase } from "./services/supabase";
import { Product, Stats, UserProfile } from './types';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import ResellingTipsView from './components/ResellingTipsView';
import GrowthHubView from './components/GrowthHubView';
import AuthView from './components/AuthView';
import { loadProductsFromSupabase, saveProductToSupabase, deleteProductFromSupabase } from './services/dbService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'playbook' | 'growth'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => handleSession(session));
    supabase.auth.onAuthStateChange((_event, session) => handleSession(session));
  }, []);

  const handleSession = async (session: any) => {
    if (session) {
      const profile = { id: session.user.id, email: session.user.email, name: session.user.user_metadata?.full_name || "User", tier: 'Growth', monthlySalesCount: 0, subscriptionActive: true, nextRenewalDate: '', currency: '£' } as UserProfile;
      setUser(profile); setIsAuthenticated(true);
      const data = await loadProductsFromSupabase(session.user.id);
      setProducts(data);
    } else { setIsAuthenticated(false); }
    setIsLoading(false);
  };

  const stats = useMemo(() => {
    const sold = products.filter(p => p.status === 'Sold');
    const rev = sold.reduce((a, b) => a + (b.soldPrice || 0), 0);
    const profit = rev - sold.reduce((a, b) => a + b.cost, 0);
    return { totalRevenue: rev, totalProfit: profit, activeListings: products.filter(p => p.status === 'Available').length, soldItemsCount: sold.length };
  }, [products]);

  if (isLoading) return <div className="h-screen flex items-center justify-center font-black">SYNCING...</div>;
  if (!isAuthenticated) return <AuthView onLogin={() => {}} />;

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r p-6 hidden md:block">
        <h1 className="text-xl font-black mb-10">ResellFlow</h1>
        <nav className="space-y-1">
          <button onClick={() => setActiveTab('dashboard')} className="w-full text-left p-3 font-bold rounded-xl hover:bg-slate-50">Dashboard</button>
          <button onClick={() => setActiveTab('inventory')} className="w-full text-left p-3 font-bold rounded-xl hover:bg-slate-50">Inventory</button>
          <button onClick={() => setActiveTab('playbook')} className="w-full text-left p-3 font-bold rounded-xl hover:bg-slate-50">Playbook</button>
          <button onClick={() => setActiveTab('growth')} className="w-full text-left p-3 font-bold rounded-xl bg-indigo-50 text-indigo-600">Launch Hub</button>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        {activeTab === 'dashboard' && <DashboardView user={user!} stats={stats} products={products} onRevenueClick={()=>{}} onProfitClick={()=>{}} onSoldClick={()=>{}} onActiveClick={()=>{}} />}
        {activeTab === 'inventory' && <InventoryView user={user!} products={products} onAddProduct={async (p) => { await saveProductToSupabase(user!.id, p); setProducts([p, ...products]); }} onUpdateProduct={()=>{}} onDeleteProduct={()=>{}} tier="Growth" />}
        {activeTab === 'playbook' && <ResellingTipsView />}
        {activeTab === 'growth' && <GrowthHubView user={user} />}
      </main>
    </div>
  );
};
export default App;
