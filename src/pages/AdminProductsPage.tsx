import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Edit, Trash2, Search, 
  ExternalLink, Package, Filter, X, 
  Save, Image as ImageIcon, Layout, RefreshCw, Database,
  ArrowLeft
} from 'lucide-react';
import { MOCK_PRODUCTS_LIST as MOCK_PRODUCTS } from '../data/products';
import { Product } from '../types/business';
import { productService } from '../services/productService';
import { isSupabaseConfigured } from '../lib/supabase';
import { FLOORS } from '../constants';
import Breadcrumbs from '../components/Breadcrumbs';
import Toast from '../components/Toast';
import { useNavigate } from 'react-router-dom';

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);
  const [adminSearch, setAdminSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [adminSearch]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts({ search: adminSearch });
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

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
      ladder_level: 5,
      style: [],
      material: [],
      space: [],
      specs: {},
      status: 'active'
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个产品吗？')) {
      try {
        await productService.deleteProduct(id);
        setProducts(prev => prev.filter(p => p.id !== id));
        setToastMessage('删除成功');
      } catch (e: any) {
        setToastMessage(`删除失败: ${e.message}`);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;

    try {
      setLoading(true);
      if (editProduct.id?.startsWith('new')) {
        // Create
        const { id, ...prodData } = editProduct;
        await productService.createProduct(prodData as any);
        setToastMessage('产品创建成功');
      } else {
        // Update
        await productService.updateProduct(editProduct.id!, editProduct);
        setToastMessage('产品更新成功');
      }
      setIsEditing(false);
      await loadProducts();
    } catch (e: any) {
      setToastMessage(`操作失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncMock = async () => {
    try {
      setIsSyncing(true);
      const result = await productService.syncMockProductsToSupabase();
      if (result.success) {
        setToastMessage('Mock 产品同步成功！');
        loadProducts();
      } else {
        setToastMessage(result.message || '同步失败');
      }
    } catch (e: any) {
      setToastMessage(`同步失败: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <main className="flex-1 w-full max-w-[1600px] mx-auto p-10 z-10 flex flex-col gap-6 h-screen overflow-hidden">
      <div className="flex items-center justify-between mb-8 text-left">
        <Breadcrumbs 
          isDark={true}
          items={[
            { name: '个人中心', path: '/profile' },
            { name: '管理后台', path: '/admin' },
            { name: '产品管理' }
          ]} 
        />
        <button 
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors font-bold text-[14px]"
        >
          <ArrowLeft className="w-5 h-5" /> 返回管理中心
        </button>
      </div>
      
      <section className="flex flex-col gap-6 shrink-0 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center">
              <Layout className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-[26px] font-black text-gray-800 tracking-tight">产品管理后台</h1>
              <p className="text-[14px] text-gray-400 font-bold">在此管理家具产品库，更新价格、配置方案及核心参数。</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isSupabaseConfigured && (
              <button 
                onClick={handleSyncMock}
                disabled={isSyncing}
                className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[14px] font-black border border-emerald-100 flex items-center gap-2 hover:bg-emerald-100 transition-all disabled:opacity-50"
              >
                {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                同步 Mock 产品
              </button>
            )}
            <button 
              onClick={handleNew}
              className="bg-brand text-white px-8 py-3 rounded-2xl text-[15px] font-black shadow-lg shadow-brand/20 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" /> 新增产品
            </button>
          </div>
        </div>
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
          {loading ? (
             <div className="flex items-center justify-center h-full">
                <RefreshCw className="w-10 h-10 text-brand animate-spin" />
             </div>
          ) : (
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-gray-50">
                  <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">产品信息</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">分类/品牌</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">价格</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">配置方案</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                          <img src={p.image} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <p className="text-[15px] font-black text-gray-800 line-clamp-1">{p.name}</p>
                          <p className="text-[11px] text-gray-400 font-bold mt-0.5">ID: {p.id.slice(0, 8)}</p>
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
                          {p.ladder_level}
                        </div>
                        <span className="text-[13px] font-bold text-gray-700">级</span>
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
          )}
        </div>
      </section>

      {/* Edit/New Modal - Simplified for brevity in this step, keeping structure */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-10 text-left">
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
                   <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-50 rounded-full transition-all">
                     <X className="w-6 h-6 text-gray-400" />
                   </button>
                </div>

                <form onSubmit={handleSave} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                  <div className="p-10 flex-1">
                    <div className="grid grid-cols-2 gap-8">
                       {/* Form Fields */}
                       <div className="flex flex-col gap-6">
                         <div className="flex flex-col gap-2 text-left">
                           <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">产品名称</label>
                           <input 
                            type="text" 
                            required
                            value={editProduct?.name || ''} 
                            onChange={e => setEditProduct(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-gray-50 border-none h-12 px-4 rounded-xl text-[14px] font-bold outline-none focus:ring-2 focus:ring-brand/20 transition-all" 
                           />
                         </div>
                         <div className="grid grid-cols-2 gap-4 text-left">
                            <div className="flex flex-col gap-2">
                              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">分类</label>
                              <select 
                                value={editProduct?.category || ''} 
                                onChange={e => setEditProduct(prev => ({ ...prev, category: e.target.value }))}
                                className="bg-gray-50 border-none h-12 px-4 rounded-xl text-[14px] font-bold outline-none"
                              >
                                 {['沙发', '床 / 床垫', '餐桌椅', '柜类收纳', '软装'].map(c => <option key={c}>{c}</option>)}
                              </select>
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">价格 (元)</label>
                              <input 
                                type="number" 
                                required
                                value={editProduct?.price || 0} 
                                onChange={e => setEditProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                                className="bg-gray-50 border-none h-12 px-4 rounded-xl text-[14px] font-bold outline-none focus:ring-2 focus:ring-brand/20 transition-all" 
                              />
                            </div>
                         </div>
                         <div className="flex flex-col gap-2 text-left">
                           <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">品牌</label>
                           <input 
                            type="text" 
                            value={editProduct?.brand || ''} 
                            onChange={e => setEditProduct(prev => ({ ...prev, brand: e.target.value }))}
                            className="bg-gray-50 border-none h-12 px-4 rounded-xl text-[14px] font-bold outline-none" 
                           />
                         </div>
                       </div>
 
                       <div className="flex flex-col gap-6 text-left">
                         <div className="flex flex-col gap-2">
                           <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">主图 URL</label>
                           <div className="relative group">
                             <input 
                              type="text" 
                              required
                              value={editProduct?.image || ''} 
                              onChange={e => setEditProduct(prev => ({ ...prev, image: e.target.value }))}
                              className="w-full bg-gray-50 border-none h-12 pl-12 pr-4 rounded-xl text-[11px] font-mono outline-none" 
                             />
                             <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                           </div>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">配置层级 (1-10)</label>
                              <input 
                                type="number" 
                                min="1" 
                                max="10" 
                                value={editProduct?.ladder_level || 5} 
                                onChange={e => setEditProduct(prev => ({ ...prev, ladder_level: Number(e.target.value) }))}
                                className="bg-gray-50 border-none h-12 px-4 rounded-xl text-[14px] font-bold outline-none" 
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">状态</label>
                              <select 
                                value={editProduct?.status || 'active'} 
                                onChange={e => setEditProduct(prev => ({ ...prev, status: e.target.value as any }))}
                                className="bg-gray-50 border-none h-12 px-4 rounded-xl text-[14px] font-bold outline-none"
                              >
                                 <option value="active">上架中</option>
                                 <option value="hidden">已隐藏</option>
                                 <option value="discontinued">已停产</option>
                              </select>
                            </div>
                         </div>
                         <div className="flex flex-col gap-2">
                           <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">推荐理由</label>
                           <textarea 
                            className="bg-gray-50 border-none p-4 rounded-xl text-[13px] font-medium h-24 resize-none outline-none focus:ring-2 focus:ring-brand/20" 
                            value={editProduct?.recommendation_reason || ''}
                            onChange={e => setEditProduct(prev => ({ ...prev, recommendation_reason: e.target.value }))}
                           />
                         </div>
                       </div>
                    </div>
                  </div>
 
                  <div className="px-10 py-8 bg-gray-50 flex items-center justify-end gap-4 shrink-0">
                     <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-3 rounded-2xl text-[14px] font-black text-gray-400 hover:text-gray-600 transition-colors">取消</button>
                     <button 
                      type="submit"
                      disabled={loading}
                      className="bg-brand text-white px-10 py-3 rounded-2xl text-[14px] font-black shadow-lg shadow-brand/20 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                     >
                       {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                       {editProduct?.id?.startsWith('new') ? '立即创建' : '保存更新'}
                     </button>
                  </div>
                </form>
              </motion.div>
           </div>
        )}
      </AnimatePresence>

      <Toast 
        message={toastMessage} 
        onClear={() => setToastMessage(null)} 
      />
    </main>
  );
}
