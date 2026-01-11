import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Package, Lightbulb, Settings, TrendingUp, User, ArrowLeft, Loader2, Cloud, Sparkles, Rocket } from 'lucide-react';
import { supabase } from "./services/supabase";
import { Product, Stats, UserProfile } from './types';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import ResellingTipsView from './components/ResellingTipsView';
import GrowthHubView from './components/GrowthHubView';
import ProfileModal from './components/ProfileModal';
import SettingsDropdown from './components/SettingsDropdown';
import StatsDetailModal from './components/StatsDetailModal';
import ProgressShareModal from './components/ProgressShareModal';
import LegalModal from './components/LegalModal';
import AuthView from './components/AuthView';
import { loadProductsFromSupabase, saveProductToSupabase, deleteProductFromSupabase, clearUserSupabaseData } from './services/dbService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'reselling-tips' | 'growth'>('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
  const [statsModalType, setStatsModalType] = useState<'revenue' | 'profit' | 'sold' | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      setUser(profile);
      setIsAuthenticated(true);
      const cloudProducts = await loadProductsFromSupabase(session.user.id);
      setProducts(cloudProducts);
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  };

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <AuthView onLogin={() => {}} />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar/Nav logic here */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && user && <DashboardView user={user} stats={{totalRevenue: 0, totalProfit: 0, activeListings: 0, soldItemsCount: 0}} products={products} onRevenueClick={() => {}} onProfitClick={() => {}} onSoldClick={() => {}} onActiveClick={() => {}} />}
        {activeTab === 'growth' && user && <GrowthHubView user={user} />}
      </main>
    </div>
  );
};
export default App;
