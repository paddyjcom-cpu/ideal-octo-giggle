import React, { useState, useMemo } from 'react';
import { LayoutDashboard, Package, Settings, TrendingUp, User, Cloud } from 'lucide-react';
import { Product, Stats, UserProfile } from './TYPES';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const user: UserProfile = {
    id: 'test-123',
    email: 'test@example.com',
    name: 'Test User',
    tier: 'Growth',
    subscriptionActive: true,
    currency: '£'
  };

  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Test Product',
      cost: 50,
      listPrice: 100,
      status: 'Available',
      dateAdded: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Sold Item',
      cost: 30,
      listPrice: 80,
      soldPrice: 80,
      status: 'Sold',
      dateAdded: new Date().toISOString()
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

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
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

      <main className="flex-1 overflow-y-auto">
        <header className="p-8 border-b bg-white/80 backdrop-blur-sm flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-2xl font-black text-slate-900 capitalize">{activeTab}</h2>
          <Settings className="text-slate-400 cursor-pointer hover:text-slate-600" />
        </header>
        
        <div className="p-10">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-800">Stats Overview</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-slate-500 text-sm font-semibold mb-2">Total Revenue</p>
                  <p className="text-3xl font-black text-slate-900">{user.currency}{stats.totalRevenue}</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-slate-500 text-sm font-semibold mb-2">Total Profit</p>
                  <p className="text-3xl font-black text-green-600">{user.currency}{stats.totalProfit}</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-slate-500 text-sm font-semibold mb-2">Active Listings</p>
                  <p className="text-3xl font-black text-indigo-600">{stats.activeListings}</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-sm text-slate-500 font-semibold mb-2">Items Sold</p>
                  <p className="text-3xl font-black text-slate-900">{stats.soldItemsCount}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h4 className="text-lg font-bold text-slate-800 mb-4">Recent Products</h4>
                <div className="space-y-3">
                  {products.map(product => (
                    <div key={product.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-bold text-slate-900">{product.name}</p>
                        <p className="text-sm text-slate-500">Cost: {user.currency}{product.cost} | List: {user.currency}{product.listPrice}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        product.status === 'Sold' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Inventory View</h3>
              <p className="text-slate-600">Inventory component will go here</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
