import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Package, Lightbulb, Settings, TrendingUp, User, ArrowLeft, Loader2, Cloud, Sparkles, Rocket } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'reselling-tips' | 'growth'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => handleUserSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => handleUserSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const handleUserSession = async (session: any) => {
    if (session) {
      const profile: UserProfile = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.full_name || "Reseller",
        tier: 'Growth',
        monthlySalesCount: 0,
        subscriptionActive: true,
        nextRenewalDate: new Date().toISOString(),
        currency: '£'
      };
      setUser(profile); setIsAuthenticated(true);
      const cloudProducts = await loadProductsFromSupabase(session.user.id);
      setProducts(cloudProducts);
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  };

  if (isLoading) return <div className="p-20 text-center font-black">SYNCING...</div>;
  if (!isAuthenticated) return <AuthView onLogin={() => {}} />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-64 bg-white border-r hidden md:flex flex-col p-6">
        <h1 className="text-2xl font-black mb-10">ResellFlow</h1>
        <nav className="space-y-2">
           <button onClick={() => setActiveTab('dashboard')} className="w-full text-left p-4 font-bold rounded-xl hover:bg-slate-50">Dashboard</button>
           <button onClick={() => setActiveTab('inventory')} className="w-full text-left p-4 font-bold rounded-xl hover:bg-slate-50">Inventory</button>
           <button onClick={() => setActiveTab('growth')} className="w-full text-left p-4 font-bold rounded-xl hover:bg-slate-50 bg-indigo-50 text-indigo-600">Growth Hub</button>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        {activeTab === 'dashboard' && user && <DashboardView user={user} products={products} stats={{totalRevenue:0, totalProfit:0, activeListings:0, soldItemsCount:0}} onRevenueClick={()=>{}} onProfitClick={()=>{}} onSoldClick={()=>{}} onActiveClick={()=>{}} />}
        {activeTab === 'growth' && user && <GrowthHubView user={user} />}
        {activeTab === 'inventory' && user && <InventoryView user={user} products={products} onAddProduct={async (p)=>{await saveProductToSupabase(user.id, p); setProducts([p,...products])}} onUpdateProduct={()=>{}} onDeleteProduct={()=>{}} tier="Growth" />}
      </main>
    </div>
  );
};
export default App;
