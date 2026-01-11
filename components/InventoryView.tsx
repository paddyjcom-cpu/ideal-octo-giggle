import React, { useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';

const InventoryView = ({ user, products, onAddProduct, onDeleteProduct }: any) => {
  const [search, setSearch] = useState('');
  const filtered = products.filter((p: any) => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in pb-24">
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold" />
        </div>
        <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black">New Listing</button>
      </div>
      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">Item</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Price</th>
              <th className="px-8 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((p: any) => (
              <tr key={p.id}>
                <td className="px-8 py-4 font-black">{p.title}</td>
                <td className="px-6 py-4 font-bold">{user.currency}{p.listPrice}</td>
                <td className="px-8 py-4 text-right"><button onClick={() => onDeleteProduct(p.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default InventoryView;
