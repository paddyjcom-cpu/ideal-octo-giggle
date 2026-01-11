import React, { useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Stats, Product, UserProfile } from '../types';
import { DollarSign, ShoppingCart, TrendingUp, Package, ArrowUpRight } from 'lucide-react';

const DashboardView: React.FC<{ user: UserProfile; stats: Stats; products: Product[]; onRevenueClick: () => void; onProfitClick: () => void; onSoldClick: () => void; onActiveClick: () => void; }> = ({ user, stats, products, onRevenueClick, onProfitClick, onSoldClick, onActiveClick }) => {
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => {
      const monthSold = products.filter(p => p.status === 'Sold' && p.dateSold && new Date(p.dateSold).getMonth() === index);
      const rev = monthSold.reduce((a, b) => a + (b.soldPrice || 0), 0);
      return { name: month, revenue: rev, profit: rev - monthSold.reduce((a, b) => a + b.cost, 0) };
    });
  }, [products]);

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Revenue" value={`${user.currency}${stats.totalRevenue.toFixed(2)}`} icon={<DollarSign size={20} />} bgColor="bg-emerald-50" onClick={onRevenueClick} />
        <StatCard title="Profit" value={`${user.currency}${stats.totalProfit.toFixed(2)}`} icon={<TrendingUp size={20} />} bgColor="bg-blue-50" onClick={onProfitClick} />
        <StatCard title="Active" value={stats.activeListings.toString()} icon={<Package size={20} />} bgColor="bg-indigo-50" onClick={onActiveClick} />
        <StatCard title="Sold" value={stats.soldItemsCount.toString()} icon={<ShoppingCart size={20} />} bgColor="bg-violet-50" onClick={onSoldClick} />
      </div>
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100">
        <h3 className="font-black text-slate-800 mb-6">Profit Trends</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="profit" stroke="#4f46e5" fill="#4f46e520" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, bgColor, onClick }: any) => (
  <button onClick={onClick} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col group text-left transition-all hover:shadow-xl">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${bgColor}`}>{icon}</div>
      <ArrowUpRight size={16} className="text-slate-300" />
    </div>
    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
    <h4 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h4>
  </button>
);

export default DashboardView;
