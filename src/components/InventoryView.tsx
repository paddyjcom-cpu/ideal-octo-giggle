import React, { useState, useEffect, useRef } from 'react';
import { Product, SubscriptionTier, UserProfile } from '../types';
import { Plus, Search, Edit2, Trash2, X, FileSpreadsheet, ChevronLeft, Image as ImageIcon, Package, Sparkles, Loader2 } from 'lucide-react';

interface Props {
  user: UserProfile;
  products: Product[];
  onAddProduct: (p: Product) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  tier: SubscriptionTier;
  onBack?: () => void;
}

const PLATFORMS = ['eBay', 'Depop', 'Vinted', 'Grailed', 'Poshmark', 'Other'] as const;

const InventoryView: React.FC<Props> = ({ user, products, onAddProduct, onUpdateProduct, onDeleteProduct, tier, onBack }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formStatus, setFormStatus] = useState<'Available' | 'Sold' | 'Draft'>('Available');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingProduct) {
      setFormStatus(editingProduct.status);
      setSelectedImage(editingProduct.imageUrl || null);
      setDescription(editingProduct.description || '');
    } else {
      setFormStatus('Available');
      setSelectedImage(null);
      setDescription('');
    }
  }, [editingProduct, isModalOpen]);

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMagicWrite = async (e: React.MouseEvent) => {
    e.preventDefault();
    const titleInput = document.getElementsByName('title')[0] as HTMLInputElement;
    const brandInput = document.getElementsByName('brand')[0] as HTMLInputElement;
    const title = titleInput?.value;
    const brand = brandInput?.value;
    
    if (!title) {
      alert("Please enter a title first so AI knows what to describe!");
      return;
    }
    
    setIsGenerating(true);
    try {
      const aiText = await generateProductDescription(title, brand || 'Unbranded');
      setDescription(aiText);
    } catch (err) {
      console.error(err);
      alert("AI failed to generate. Check your internet connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Brand', 'Category', 'Cost', 'ListPrice', 'SoldPrice', 'Status', 'Platform', 'DateAdded', 'DateSold'];
    const rows = products.map(p => [
      p.id, p.title, p.brand, p.category, p.cost, p.listPrice, p.soldPrice || 0, p.status, p.platform || 'N/A', p.dateAdded, p.dateSold || ''
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `resellflow_ledger_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const status = formData.get('status') as any;
    
    const pData: Partial<Product> = {
      title: formData.get('title') as string,
      brand: (formData.get('brand') as string) || 'Unknown',
      category: (formData.get('category') as string) || 'Misc',
      platform: formData.get('platform') as any,
      cost: parseFloat(formData.get('cost') as string) || 0,
      listPrice: parseFloat(formData.get('listPrice') as string) || 0,
      status,
      soldPrice: status === 'Sold' ? (parseFloat(formData.get('soldPrice') as string) || 0) : undefined,
      imageUrl: selectedImage || `https://picsum.photos/seed/${formData.get('title')}/400/300`,
      description: description
    };

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        ...pData,
        dateSold: status === 'Sold' && !editingProduct.dateSold ? new Date().toISOString().split('T')[0] : (status !== 'Sold' ? undefined : editingProduct.dateSold)
      } as Product);
    } else {
      const id = window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substr(2, 9);
      onAddProduct({
        id,
        ...pData,
        dateAdded: new Date().toISOString().split('T')[0],
        dateSold: status === 'Sold' ? new Date().toISOString().split('T')[0] : undefined,
      } as Product);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-100 outline-none w-full sm:w-72 transition-all font-bold text-slate-700 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm hover:bg-slate-50" onClick={handleExportCSV}>
            <FileSpreadsheet size={18} className="text-indigo-600" /> Export CSV
          </button>
        </div>
        <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all w-full sm:w-auto justify-center">
          <Plus size={20} /> New Record
        </button>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Channel</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <img src={product.imageUrl} className="w-16 h-16 rounded-2xl object-cover bg-slate-100 border border-slate-100 shadow-sm" />
                        <div>
                          <p className="text-sm font-black text-slate-900 leading-tight">{product.title}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5">{product.brand} • {product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className="text-[10px] font-black px-4 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl uppercase">
                        {product.platform || 'Other'}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-sm font-black text-slate-900">{user.currency}{product.listPrice.toFixed(2)}</p>
                      {product.status === 'Sold' && (
                        <p className="text-xs font-black text-emerald-600">Sold: {user.currency}{(product.soldPrice ?? product.listPrice).toFixed(2)}</p>
                      )}
                    </td>
                    <td className="px-6 py-6">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${
                        product.status === 'Available' ? 'bg-indigo-50 text-indigo-600' : 
                        product.status === 'Sold' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => { setEditingProduct(product); setIsModalOpen(true); }} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                        <button onClick={() => onDeleteProduct(product.id)} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-24 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
              <Package size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Cloud inventory is empty</h3>
              <p className="text-slate-500 font-medium max-w-xs mx-auto">Add your first listing to start tracking sales and generating AI descriptions.</p>
            </div>
            <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-100">Add Item</button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in zoom-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-100">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{editingProduct ? 'Update Item' : 'Create Listing'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-3 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cover Photo</label>
                <div onClick={() => fileInputRef.current?.click()} className="relative h-56 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] overflow-hidden cursor-pointer hover:bg-slate-100 flex items-center justify-center text-center p-8 transition-all group">
                  {selectedImage ? (
                    <img src={selectedImage} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="space-y-3">
                      <ImageIcon size={32} className="mx-auto text-slate-300" />
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Upload Item Image</p>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Listing Title</label>
                  <input name="title" required type="text" defaultValue={editingProduct?.title} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50" placeholder="e.g. Nike Dunk Low Retro Black" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Brand</label>
                  <input name="brand" type="text" defaultValue={editingProduct?.brand} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" placeholder="e.g. Nike" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Category</label>
                  <input name="category" type="text" defaultValue={editingProduct?.category} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" placeholder="e.g. Footwear" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Marketplace</label>
                  <select name="platform" defaultValue={editingProduct?.platform || 'eBay'} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700">
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Current Status</label>
                  <select name="status" defaultValue={editingProduct?.status || 'Available'} onChange={(e) => setFormStatus(e.target.value as any)} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700">
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>

                <div className="col-span-2 space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Description Generator</label>
                    <button 
                      type="button"
                      onClick={handleMagicWrite}
                      disabled={isGenerating}
                      className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      Magic Write
                    </button>
                  </div>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter details or click Magic Write to generate..."
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[2rem] min-h-[160px] outline-none font-medium text-slate-700 text-sm leading-relaxed custom-scrollbar"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Cost ({user.currency})</label>
                  <input name="cost" required type="number" step="0.01" defaultValue={editingProduct?.cost} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" />
                </div>
                {formStatus === 'Sold' ? (
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Sold Price ({user.currency})</label>
                    <input name="soldPrice" required type="number" step="0.01" defaultValue={editingProduct?.soldPrice || editingProduct?.listPrice} className="w-full px-6 py-4 bg-emerald-50 border border-emerald-200 rounded-2xl outline-none font-bold text-emerald-700" />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">List Price ({user.currency})</label>
                    <input name="listPrice" required type="number" step="0.01" defaultValue={editingProduct?.listPrice} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" />
                  </div>
                )}
              </div>
              <div className="pt-4 flex gap-6 sticky bottom-0 bg-white pb-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black transition-all hover:bg-slate-200">Discard</button>
                <button type="submit" className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700">Save Listing</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
