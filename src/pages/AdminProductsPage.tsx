import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Edit, Trash2, Search, 
  ExternalLink, Package, Filter, X, 
  Save, Image as ImageIcon, Layout
} from 'lucide-react';
import { MOCK_PRODUCTS, Product } from '../data/products';
import { FLOORS } from '../constants';
import Breadcrumbs from '../components/Breadcrumbs';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [isEditing, setIsEditing] = useState(false);
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);
  const [adminSearch, setAdminSearch] = useState('');

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(adminSearch.toLowerCase()) || 
    p.brand?.toLowerCase().includes(adminSearch.toLowerCase()) ||
    p.category?.toLowerCase().includes(adminSearch.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setIsEditing(true);
  };

  const handleNew = () => {
    setEditProduct({
      id: `new-${Date.now()}`,
      name: '',
      brand: '',
      category: '沙发',
      price: 0,
      ladderLevel: 1,
      style: [],
      material: [],
      space: [],
      tags: [],
      highlights: [],
    });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个产品吗？')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <main className="flex-1 w-full max-w-[1600px] mx-auto p-10 z-10 flex flex-col gap-6 h-screen overflow-hidden">
      <div>
        <Breadcrumbs pageName="产品管理后台" />
      </div>
      
      {/* Header */}
      <section className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center">
            <Layout className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-[26px] font-black text-gray-800 tracking-tight">产品管理后台</h1>
            <p className="text-[14px] text-gray-400 font-bold">在此管理家具产品库，更新价格、配置方案及核心参数。</p>
          </div>
        </div>
        
        <button 
          onClick={handleNew}
          className="bg-brand text-white px-8 py-3 rounded-2xl text-[15px] font-black shadow-lg shadow-brand/20 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" /> 新增产品
        </button>
      </section>

      {/* Stats & Search Bar */}
      <section className="flex items-center gap-6 shrink-0">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="搜索产品名称、品牌、分类..."
            value={adminSearch}
            onChange={(e) => setAdminSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 h-14 pl-14 pr-6 rounded-2xl text-[15px] focus:ring-2 focus:ring-brand/20 transition-all outline-none"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="glass-morphism px-6 h-14 rounded-2xl flex items-center gap-3 border-white">
            <Package className="w-5 h-5 text-brand" />
            <span className="text-[14px] font-black text-gray-700">共 {products.length} 款产品</span>
          </div>
          <button className="glass-morphism w-14 h-14 rounded-2xl flex items-center justify-center text-gray-400 hover:text-brand transition-all border-white">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Product List Table */}
      <section className="flex-1 bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-gray-50">
                <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">产品信息</th>
                <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">分类/品牌</th>
                <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">价格</th>
                <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">配置方案</th>
                <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">状态标签</th>
                <th className="px-8 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                        <img src={p.image} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <p className="text-[15px] font-black text-gray-800 line-clamp-1">{p.name}</p>
                        <p className="text-[11px] text-gray-400 font-bold mt-0.5">ID: {p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[11px] font-bold rounded-lg mr-2">{p.category}</span>
                    <span className="text-[14px] text-gray-600 font-medium">{p.brand}</span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-[16px] font-black text-brand">¥{p.price.toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <div className="w-10 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-[12px] font-black">
                         {FLOORS.find(f => f.level === p.ladderLevel)?.model}
                       </div>
                       <span className="text-[13px] font-bold text-gray-700">{FLOORS.find(f => f.level === p.ladderLevel)?.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex gap-2">
                      {p.isRecommended && <span className="w-2 h-2 rounded-full bg-brand" title="推荐" />}
                      {p.isHot && <span className="w-2 h-2 rounded-full bg-red-400" title="热销" />}
                      {p.isNew && <span className="w-2 h-2 rounded-full bg-blue-400" title="新品" />}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-400 hover:text-brand transition-all">
                        <ExternalLink className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleEdit(p)}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-all"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit/New Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-10">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsEditing(false)}
               className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-[900px] max-h-[90vh] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
             >
                <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between">
                   <h2 className="text-[24px] font-black text-gray-800">
                     {editProduct?.id?.startsWith('new') ? '新增产品' : '编辑产品'}
                   </h2>
                   <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                     <X className="w-7 h-7" />
                   </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                   <div className="grid grid-cols-2 gap-8">
                      {/* Form Groups */}
                      <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">产品名称</label>
                          <input type="text" defaultValue={editProduct?.name} className="bg-gray-50 border-none h-12 px-4 rounded-xl text-[14px] font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="flex flex-col gap-2">
                             <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">分类</label>
                             <select defaultValue={editProduct?.category} className="bg-gray-50 border-none h-12 px-4 rounded-xl text-[14px] font-bold">
                                {['沙发', '床 / 床垫', '餐桌椅', '柜类收纳', '软装'].map(c => <option key={c}>{c}</option>)}
                             </select>
                           </div>
                           <div className="flex flex-col gap-2">
                             <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">价格 (元)</label>
                             <input type="number" defaultValue={editProduct?.price} className="bg-gray-50 border-none h-12 px-4 rounded-xl text-[14px] font-bold" />
                           </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">品牌</label>
                          <input type="text" defaultValue={editProduct?.brand} className="bg-gray-50 border-none h-12 px-4 rounded-xl text-[14px] font-bold" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">主图 URL</label>
                          <div className="relative group">
                            <input type="text" defaultValue={editProduct?.image} className="w-full bg-gray-50 border-none h-12 pl-12 pr-4 rounded-xl text-[11px] font-mono" />
                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="flex flex-col gap-2">
                             <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">配置方案</label>
                             <select defaultValue={editProduct?.ladderLevel} className="bg-gray-50 border-none h-12 px-4 rounded-xl text-[14px] font-bold">
                                {FLOORS.map(f => <option key={f.level} value={f.level}>{f.model} - {f.name}</option>)}
                             </select>
                           </div>
                           <div className="flex flex-col gap-2">
                             <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">状态设置</label>
                             <div className="flex items-center gap-3 h-12">
                                <label className="flex items-center gap-2 text-[12px] font-bold"><input type="checkbox" defaultChecked={editProduct?.isRecommended} /> 推荐</label>
                                <label className="flex items-center gap-2 text-[12px] font-bold"><input type="checkbox" defaultChecked={editProduct?.isHot} /> 热热</label>
                             </div>
                           </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">推荐理由</label>
                          <textarea className="bg-gray-50 border-none p-4 rounded-xl text-[13px] font-medium h-24 resize-none" defaultValue={editProduct?.recommendationReason}></textarea>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="px-10 py-8 bg-gray-50 flex items-center justify-end gap-4">
                   <button onClick={() => setIsEditing(false)} className="px-8 py-3 rounded-2xl text-[14px] font-black text-gray-400 hover:text-gray-600">取消</button>
                   <button 
                    onClick={() => {
                      alert('模拟保存成功（数据仅在当前会话有效）');
                      setIsEditing(false);
                    }}
                    className="bg-brand text-white px-10 py-3 rounded-2xl text-[14px] font-black shadow-lg shadow-brand/20 flex items-center gap-2"
                   >
                     <Save className="w-5 h-5" /> 保存更新
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
