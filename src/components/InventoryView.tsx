import React, { useState, useEffect, useRef } from 'react';
import { Product, SubscriptionTier, UserProfile } from '../TYPES';
import { Plus, Search, Edit2, Trash2, X, FileSpreadsheet, Package, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';

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

const generateProductDescription = async (title: string, brand: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return `${title} by ${brand}. This item is in excellent condition and ready to ship. Perfect for collectors and enthusiasts. Don't miss out on this opportunity to own a quality piece. Fast shipping and secure packaging guaranteed.`;
};

const InventoryView: React.FC<Props> = ({ user, products, onAddProduct, onUpdateProduct, onDeleteProduct }) => {
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
      alert('Please enter a title first!');
      return;
    }
    
    setIsGenerating(true);
    try {
      const aiText = await generateProductDescription(title, brand || 'Unbranded');
      setDescription(aiText);
    } catch (err) {
      console.error(err);
      alert('AI generation failed.');
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
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
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
    <div className="space-y-6 pb-24">
      {/* Search and Actions */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search items..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none w-full transition-all font-semibold text-slate-700 shadow-sm"
          />
        </div>
        <div className="flex gap-3">
          <button 
            className="flex items-center justify-center gap-2 px-4 py-3.5 bg-white text-slate-700 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm hover:bg-slate-50 flex-1" 
            onClick={handleExportCSV}
          >
            <FileSpreadsheet size={16} className="text-indigo-600" /> Export
          </button>
          <button 
            onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} 
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex-1"
          >
            <Plus size={20} /> New Item
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-all">
              <div className="flex gap-4">
                <img 
                  src={product.imageUrl} 
                  className="w-24 h-24 rounded-2xl object-cover bg-slate-100 border border-slate-100 shadow-sm flex-shrink-0" 
                  alt={product.title} 
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-black text-slate-900 truncate">{product.title}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{product.brand} • {product.category}</p>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex-shrink-0 ${
                      product.status === 'Available' ? 'bg-indigo-50 text-indigo-600' : 
                      product.status === 'Sold' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-slate-900">{user.currency}{product.listPrice.toFixed(2)}</p>
                      {product.status === 'Sold' && (
                        <p className="text-xs font-black text-emerald-600">Sold: {user.currency}{(product.soldPrice ?? product.listPrice).toFixed(2)}</p>
                      )}
                      <span className="text-[9px] font-black px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg uppercase inline-block mt-1">
                        {product.platform || 'Other'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setEditingProduct(product); setIsModalOpen(true); }} 
                        className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => onDeleteProduct(product.id)} 
                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-white rounded-3xl border border-slate-100">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
            <Package size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">No items yet</h3>
            <p className="text-slate-500 font-medium text-sm max-w-xs">Add your first listing to start tracking.</p>
          </div>
          <button 
            onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} 
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-indigo-100"
          >
            Add Item
          </button>
        </div>
      )}

      {/* Modal - Same as before but optimized */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full md:max-w-2xl md:rounded-[3rem] rounded-t-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-100">
            <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-black text-slate-900">{editingProduct ? 'Update Item' : 'Create Listing'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cover Photo</label>
                <div onClick={() => fileInputRef.current?.click()} className="relative h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl overflow-hidden cursor-pointer hover:bg-slate-100 flex items-center justify-center text-center p-6 transition-all group">
                  {selectedImage ? (
                    <img src={selectedImage} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" alt="Product" />
                  ) : (
                    <div className="space-y-2">
                      <ImageIcon size={28} className="mx-auto text-slate-300" />
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Upload Image</p>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Title</label>
                  <input name="title" required type="text" defaultValue={editingProduct?.title} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-indigo-50 text-sm" placeholder="Nike Dunk Low" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Brand</label>
                    <input name="brand" type="text" defaultValue={editingProduct?.brand} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 text-sm" placeholder="Nike" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                    <input name="category" type="text" defaultValue={editingProduct?.category} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 text-sm" placeholder="Footwear" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Platform</label>
                    <select name="platform" defaultValue={editingProduct?.platform || 'eBay'} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 text-sm">
                      {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Status</label>
                    <select name="status" defaultValue={editingProduct?.status || 'Available'} onChange={(e) => setFormStatus(e.target.value as any)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 text-sm">
                      <option value="Available">Available</option>
                      <option value="Sold">Sold</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Description</label>
                    <button 
                      type="button"
                      onClick={handleMagicWrite}
                      disabled={isGenerating}
                      className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                      Magic Write
                    </button>
                  </div>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter details or click Magic Write..."
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[120px] outline-none font-medium text-slate-700 text-sm leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Cost ({user.currency})</label>
                    <input name="cost" required type="number" step="0.01" defaultValue={editingProduct?.cost} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 text-sm" />
                  </div>
                  {formStatus === 'Sold' ? (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Sold ({user.currency})</label>
                      <input name="soldPrice" required type="number" step="0.01" defaultValue={editingProduct?.soldPrice || editingProduct?.listPrice} className="w-full px-5 py-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl outline-none font-bold text-emerald-700 text-sm" />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">List ({user.currency})</label>
                      <input name="listPrice" required type="number" step="0.01" defaultValue={editingProduct?.listPrice} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 text-sm" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 sticky bottom-0 bg-white pt-4 pb-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black transition-all hover:bg-slate-200 text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 text-sm">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
