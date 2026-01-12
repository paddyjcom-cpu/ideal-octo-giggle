import React, { useMemo } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Stats, Product, UserProfile } from '../types';
import { DollarSign, ShoppingCart, TrendingUp, Package, ArrowUpRight, PlusCircle } from 'lucide-react';

interface Props {
  user: UserProfile;
  stats: Stats;
  products: Product[];
  onRevenueClick: () => void;
  onProfitClick: () => void;
  onSoldClick: () => void;
  onActiveClick: () => void;
}

const PLATFORM_COLORS: Record<string, string> = {
  eBay: '#0064d2',
  Depop: '#ff3d00',
  Vinted: '#00c1d4',
  Grailed: '#000000',
  Poshmark: '#8e1728',
  Other: '#64748b'
};

const DashboardView: React.FC<Props> = ({ 
  user,
  stats, 
  products, 
  onRevenueClick, 
  onProfitClick, 
  onSoldClick, 
  onActiveClick 
}) => {
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthSold = products.filter(p => {
        if (p.status !== 'Sold' || !p.dateSold) return false;
        const d = new Date(p.dateSold);
        return d.getMonth() === index && d.getFullYear() === currentYear;
      });
      
      const revenue = monthSold.reduce((acc, p) => acc + (p.soldPrice || 0), 0);
      const profit = revenue - monthSold.reduce((acc, p) => acc + p.cost, 0);
      
      return { name: month, revenue, profit };
    });
  }, [products]);

  const platformData = useMemo(() => {
    const counts: Record<string, number> = {};
    products.filter(p => p.status === 'Sold').forEach(p => {
      const platform = p.platform || 'Other';
      counts[platform] = (counts[platform] || 0) + ((p.soldPrice || 0) - p.cost);
    });
    return Object.entries(counts).map(([name, profit]) => ({ name, profit }));
  }, [products]);

  const hasSales = products.some(p => p.status === 'Sold');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Revenue" 
          value={`${user.currency}${stats.totalRevenue.toFixed(2)}`} 
          icon={<DollarSign size={20} className="text-emerald-600" />} 
          bgColor="bg-emerald-50" 
          onClick={onRevenueClick}
        />
        <StatCard 
          title="Profit" 
          value={`${user.currency}${stats.totalProfit.toFixed(2)}`} 
          icon={<TrendingUp size={20} className="text-blue-600" />} 
          bgColor="bg-blue-50" 
          onClick={onProfitClick}
        />
        <StatCard 
          title="Active" 
          value={stats.activeListings.toString()} 
          icon={<Package size={20} className="text-indigo-600" />} 
          bgColor="bg-indigo-50" 
          onClick={onActiveClick}
        />
        <StatCard 
          title="Sold" 
          value={stats.soldItemsCount.toString()} 
          icon={<ShoppingCart size={20} className="text-violet-600" />} 
          bgColor="bg-violet-50" 
          onClick={onSoldClick}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="font-black text-slate-800 tracking-tight mb-6 flex items-center justify-between">
            Profit Growth
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-lg">Annual View</span>
          </h3>
          <div className="h-[300px] w-full">
            {hasSales ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} 
                    itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                    formatter={(value) => [`${user.currency}${value}`, 'Profit']}
                  />
                  <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                  <TrendingUp className="text-indigo-400" size={32} />
                </div>
                <h4 className="text-sm font-black text-slate-700 mb-1">No sales data yet</h4>
                <p className="text-xs font-bold text-slate-400 max-w-xs">Record your first sale in the Inventory tab to start seeing profit trends here.</p>
                <button onClick={onActiveClick} className="mt-4 flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-indigo-600 hover:bg-slate-50 transition-all">
                  <PlusCircle size={14} /> Add Listing
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="font-black text-slate-800 tracking-tight mb-6">Platform Distribution</h3>
          {platformData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#64748b'}} width={70} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}} 
                    contentStyle={{ borderRadius: '12px', border: 'none' }}
                    formatter={(value) => [`${user.currency}${value}`, 'Profit']}
                  />
                  <Bar dataKey="profit" radius={[0, 4, 4, 0]}>
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[entry.name] || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
              <Package className="text-slate-300 mb-2" size={32} />
              <p className="text-xs font-bold text-slate-500">Your platform breakdown will appear here once items are marked as Sold.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  bgColor: string;
  onClick: () => void;
}> = ({ title, value, icon, bgColor, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between transition-all duration-300 h-full hover:shadow-xl hover:shadow-indigo-50 hover:border-indigo-200 group text-left w-full focus:outline-none focus:ring-4 focus:ring-indigo-50"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${bgColor} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
        {icon}
      </div>
      <ArrowUpRight size={16} className="text-slate-300 transition-all group-hover:text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </div>
    <div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
      <h4 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h4>
    </div>
  </button>
);

export default DashboardView;
