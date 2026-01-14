import React, { useState, useEffect, useMemo } from ‘react’;
import { LayoutDashboard, Package, Settings, TrendingUp, User, ArrowLeft, Loader2, Cloud, Sparkles, Code } from ‘lucide-react’;
import { supabase } from “/services/supabase”;
import { Product, Stats, UserProfile } from ‘./types’;
import DashboardView from ‘./components/DashboardView’;
import InventoryView from ‘./components/InventoryView’;
import ProfileModal from ‘./components/ProfileModal’;
import SettingsDropdown from ‘./components/SettingsDropdown’;
import StatsDetailModal from ‘./components/StatsDetailModal’;
import ProgressShareModal from ‘./components/ProgressShareModal’;
import LegalModal from ‘./components/LegalModal’;
import AuthView from ‘./components/AuthView’;
import { loadProductsFromSupabase, saveProductToSupabase, deleteProductFromSupabase, clearUserSupabaseData } from ‘./services/dbService’;

const App: React.FC = () => {
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [activeTab, setActiveTab] = useState(‘dashboard’);
const [isProfileOpen, setIsProfileOpen] = useState(false);
const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
const [statsModalType, setStatsModalType] = useState(null);
const [progressShareOpen, setProgressShareOpen] = useState(false);
const [legalModalType, setLegalModalType] = useState(null);
const [isLoading, setIsLoading] = useState(true);
const [isSyncing, setIsSyncing] = useState(false);
const [user, setUser] = useState(null);
const [products, setProducts] = useState([]);

useEffect(() => {
supabase.auth.getSession().then(({ data: { session } }) => handleUserSession(session));
const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => handleUserSession(session));
return () => subscription.unsubscribe();
}, []);

const handleUserSession = async (session) => {
if (session) {
const { user: authUser } = session;
const profile = {
id: authUser.id, email: authUser.email || “”,
name: authUser.user_metadata?.full_name || authUser.email?.split(’@’)[0] || “Reseller”,
tier: ‘Growth’, subscriptionActive: true, currency: authUser.user_metadata?.currency || ‘£’
};
setUser(profile); setIsAuthenticated(true);
try { const cloudProducts = await loadProductsFromSupabase(authUser.id); setProducts(cloudProducts); }
catch (error) { console.error(error); } finally { setIsLoading(false); }
} else {
setUser(null); setIsAuthenticated(false); setProducts([]); setIsLoading(false);
}
};

const stats = useMemo(() => {
const soldItems = products.filter(p => p.status === ‘Sold’);
const revenue = soldItems.reduce((acc, p) => acc + (p.soldPrice || p.listPrice || 0), 0);
const costs = soldItems.reduce((acc, p) => acc + (p.cost || 0), 0);
return { totalRevenue: revenue, totalProfit: revenue - costs, activeListings: products.filter(p => p.status === ‘Available’).length, soldItemsCount: soldItems.length };
}, [products]);

const addProduct = async (p) => { setIsSyncing(true); try { setProducts(prev => [p, …prev]); await saveProductToSupabase(user.id, p); } finally { setIsSyncing(false); } };
const updateProduct = async (p) => { setIsSyncing(true); try { setProducts(prev => prev.map(item => item.id === p.id ? p : item)); await saveProductToSupabase(user.id, p); } finally { setIsSyncing(false); } };
const deleteProduct = async (id) => { if(confirm(‘Delete?’)) { setIsSyncing(true); try { setProducts(prev => prev.filter(p => p.id !== id)); await deleteProductFromSupabase(user.id, id); } finally { setIsSyncing(false); } } };

if (isLoading) return <div className="h-screen flex flex-col items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-indigo-600 mb-2" size={48} /><h2 className="font-black text-slate-800">Syncing…</h2></div>;
if (!isAuthenticated) return <AuthView onLogin={() => {}} />;

return (
<div className="flex h-screen bg-slate-50 overflow-hidden">
<aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
<div className="p-8 border-b border-slate-100 flex items-center gap-3"><TrendingUp className="text-indigo-600" /><h1 className="text-xl font-black text-slate-900">ResellFlow</h1></div>
<nav className="flex-1 p-6 space-y-2">
<button onClick={() => setActiveTab(‘dashboard’)} className=“w-full flex p-4 font-bold text-slate-600 hover:bg-slate-50 rounded-xl”>Dashboard</button>
<button onClick={() => setActiveTab(‘inventory’)} className=“w-full flex p-4 font-bold text-slate-600 hover:bg-slate-50 rounded-xl”>Inventory</button>
<button onClick={() => setActiveTab(‘launch’)} className=“w-full flex p-4 font-bold text-slate-600 hover:bg-slate-50 rounded-xl”>Launch Pad</button>
</nav>
</aside>
<main className="flex-1 overflow-y-auto">
<header className="p-8 border-b bg-white/80 flex justify-between items-center"><h2 className="text-xl font-black">{activeTab}</h2><Settings className="text-slate-400" /></header>
<div className="p-10">
{activeTab === ‘dashboard’ && <DashboardView user={user} stats={stats} products={products} onActiveClick={() => setActiveTab(‘inventory’)} onRevenueClick={() => {}} onProfitClick={() => {}} onSoldClick={() => {}} />}
{activeTab === ‘inventory’ && <InventoryView user={user} products={products} onAddProduct={addProduct} onUpdateProduct={updateProduct} onDeleteProduct={deleteProduct} tier="Growth" />}
{activeTab === ‘launch’ && <LaunchPadView />}
</div>
</main>
</div>
);
};
export default App;
