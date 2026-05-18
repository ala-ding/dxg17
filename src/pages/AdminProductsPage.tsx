import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Edit, Trash2, Search, ExternalLink, Package, Filter, X, 
  Save, Image as ImageIcon, Layout, RefreshCw, Database,
  ArrowLeft, Upload, FileText, Download, AlertCircle, CheckCircle
} from 'lucide-react';
import { Product } from '../types/business';
import { productService } from '../services/productService';
import Breadcrumbs from '../components/Breadcrumbs';
import Toast from '../components/Toast';
import { useNavigate } from 'react-router-dom';

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);
  const [adminSearch, setAdminSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [importStep, setImportStep] = useState<'upload' | 'preview'>('upload');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isProcessingImport, setIsProcessingImport] = useState(false);

  useEffect(() => { loadProducts(); }, [adminSearch]);

  const loadProducts = async () => {
    try { setLoading(true); const data = await productService.getProducts({ search: adminSearch }); setProducts(data); }
    finally { setLoading(false); }
  };

  const handleEdit = (product: Product) => { setEditProduct(product); setIsEditing(true); };
  const handleNew = () => {
    setEditProduct({ id: `new-${Date.now()}`, name: '', brand: '', category: '沙发', price: 0, ladder_level: 5, style: [], material: [], space: [], specs: {}, status: 'active' });
    setIsEditing(true);
  };
  const handleBatchImport = () => { setImportStep('upload'); setParsedData([]); setImportErrors([]); setIsImporting(true); };

  const downloadTemplate = () => {
    const headers = ['sku', 'name', 'category', 'brand', 'imageUrl', 'costPrice', 'standardPrice', 'space', 'style', 'budgetLevel', 'planLevel', 'groupBuyStatus', 'description', 'isActive'];
    const example = ['sofa-009', '现代简约沙发', '沙发', 'DXG', 'http...', '3200', '4600', '客厅', '现代', '1-2万', '入门', '未开启', 'desc', 'true'];
    const csv = [headers.join(','), example.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const dataRows = lines.slice(1).filter(line => line.trim());
      const results: any[] = [];
      const errors: string[] = [];
      dataRows.forEach((row, idx) => {
        const values = row.split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((h, i) => obj[h] = values[i]);
        if (!obj.name) errors.push(`第${idx+2}行:名称空`);
        results.push(obj);
      });
      setParsedData(results); setImportErrors(errors); setImportStep('preview');
    };
    reader.readAsText(file);
  };

  const confirmImport = async () => {
    if (importErrors.length > 0) return;
    try {
      setIsProcessingImport(true);
      for (const item of parsedData) {
        await productService.createProduct({ id: item.sku || `sku-${Date.now()}`, name: item.name, category: item.category, brand: item.brand, image: item.imageUrl, price: Number(item.standardPrice), factory_price: Number(item.costPrice), ladder_level: Number(item.ladderLevel) || 5, status: 'active', specs: {} } as any);
      }
      setToastMessage('导入完成'); setIsImporting(false); loadProducts();
    } catch (e: any) { setToastMessage(`错误:${e.message}`); }
    finally { setIsProcessingImport(false); }
  };

  const handleDelete = (id: string) => { if (confirm('确定移除？')) { setProducts(prev => prev.filter(p => p.id !== id)); setToastMessage('已移除'); } };
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    try {
      setLoading(true);
      if (editProduct.id?.startsWith('new')) await productService.createProduct(editProduct as any);
      else await productService.updateProduct(editProduct.id!, editProduct);
      setToastMessage('保存成功'); setIsEditing(false); await loadProducts();
    } catch (e: any) { setToastMessage(`错误:${e.message}`); }
    finally { setLoading(false); }
  };

  return (
    <main className="w-full max-w-[1720px] mx-auto p-6 md:p-10 flex flex-col gap-8 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <Breadcrumbs isDark={true} items={[{ name: '管理中心', path: '/admin' }, { name: '产品库管理' }]} />
        <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors font-bold text-[14px]"><ArrowLeft className="w-4 h-4" /> 返回工作台</button>
      </div>

      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-zinc-900 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg"><Layout className="w-7 h-7" /></div>
           <div><h1 className="text-[24px] md:text-[32px] font-black text-zinc-900 tracking-tighter leading-none mb-1">产品库管理</h1><p className="text-[13px] text-zinc-400 font-medium italic">管理全球严选库中的每一件单品，确保价格、参数与方案层级实时同步</p></div>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
           <button onClick={handleBatchImport} className="flex-1 md:flex-none px-6 h-12 bg-zinc-100 text-zinc-600 rounded-xl text-[14px] font-black border border-zinc-200 flex items-center justify-center gap-2">批量导入</button>
           <button onClick={handleNew} className="flex-1 md:flex-none px-8 h-12 bg-zinc-900 text-white rounded-xl text-[14px] font-black flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"><Plus className="w-5 h-5" /> 新增单品</button>
        </div>
      </section>

      <section className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
         <div className="flex-1 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
            <input type="text" placeholder="搜索产品、品牌或分类..." value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} className="w-full h-14 bg-white border border-zinc-100 rounded-2xl pl-14 pr-6 text-[15px] outline-none shadow-sm focus:ring-2 ring-zinc-900/5 transition-all" />
         </div>
         <div className="flex items-center gap-3">
            <div className="flex-1 md:flex-none px-6 h-14 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-center gap-3">
               <Package className="w-5 h-5 text-zinc-300" /><span className="text-[14px] font-black text-zinc-900">{products.length} Items</span>
            </div>
            <button className="w-14 h-14 bg-white border border-zinc-100 rounded-2xl flex items-center justify-center text-zinc-300"><Filter className="w-5 h-5" /></button>
         </div>
      </section>

      <section className="bg-white border border-zinc-100 rounded-[32px] md:rounded-[48px] shadow-sm overflow-hidden flex flex-col min-h-[400px]">
         <div className="overflow-x-auto no-scrollbar flex-1">
            <table className="w-full border-collapse min-w-[1000px]">
               <thead>
                  <tr className="border-b border-zinc-50 bg-zinc-50/50">
                     <th className="px-8 py-6 text-left text-[11px] font-black text-zinc-400 uppercase tracking-widest">产品信息</th>
                     <th className="px-8 py-6 text-left text-[11px] font-black text-zinc-400 uppercase tracking-widest">分类/品牌</th>
                     <th className="px-8 py-6 text-left text-[11px] font-black text-zinc-400 uppercase tracking-widest">标准服务价</th>
                     <th className="px-8 py-6 text-left text-[11px] font-black text-zinc-400 uppercase tracking-widest">集采权益</th>
                     <th className="px-8 py-6 text-left text-[11px] font-black text-zinc-400 uppercase tracking-widest">层级</th>
                     <th className="px-8 py-6 text-right text-[11px] font-black text-zinc-400 uppercase tracking-widest">操作</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-zinc-50">
                  {loading ? <tr><td colSpan={6} className="py-32 text-center"><RefreshCw className="w-8 h-8 text-zinc-200 animate-spin mx-auto" /></td></tr> : products.map(p => (
                    <tr key={p.id} className="group hover:bg-zinc-50/50 transition-colors">
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-14 h-14 bg-zinc-50 rounded-xl overflow-hidden border border-zinc-100 shrink-0">
                                {p.image ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-zinc-200"><ImageIcon className="w-6 h-6" /></div>}
                             </div>
                             <div><p className="text-[15px] font-black text-zinc-900 truncate max-w-[200px]">{p.name}</p><p className="text-[10px] font-bold text-zinc-300 uppercase mt-0.5">ID: {p.id.slice(0,8)}</p></div>
                          </div>
                       </td>
                       <td className="px-8 py-6"><span className="px-3 py-1 bg-zinc-100 rounded-lg text-[11px] font-black text-zinc-400 mr-2">{p.category}</span><span className="text-[14px] font-bold text-zinc-600">{p.brand}</span></td>
                       <td className="px-8 py-6"><p className="text-[16px] font-black text-zinc-900 italic">¥{p.price.toLocaleString()}</p></td>
                       <td className="px-8 py-6">{p.allow_group_buy_discount ? <span className="px-3 py-1 bg-amber-50 rounded-lg text-[11px] font-black text-amber-600 border border-amber-100">Lv.{p.group_buy_level || 'A'} 集采中</span> : <span className="text-[11px] font-bold text-zinc-200">未开启</span>}</td>
                       <td className="px-8 py-6"><div className="w-10 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-[13px] font-black text-white italic">{p.ladder_level}</div></td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => handleEdit(p)} className="p-2 text-zinc-300 hover:text-zinc-900"><Edit className="w-5 h-5" /></button>
                             <button onClick={() => handleDelete(p.id)} className="p-2 text-zinc-300 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
         {!loading && products.length === 0 && <div className="p-32 text-center"><p className="text-[14px] font-black text-zinc-200 uppercase italic">No Products Found</p></div>}
      </section>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-0 md:p-6 bg-zinc-900/80 backdrop-blur-xl">
             <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-[900px] h-full md:h-auto md:max-h-[90vh] bg-white rounded-none md:rounded-[48px] overflow-hidden flex flex-col shadow-2xl">
                <header className="px-8 md:px-12 py-8 border-b border-zinc-100 flex items-center justify-between">
                   <h2 className="text-[20px] md:text-[24px] font-black italic">{editProduct?.id?.startsWith('new') ? '新增全球单品' : '编辑单品详情'}</h2>
                   <button onClick={() => setIsEditing(false)} className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-300"><X className="w-6 h-6" /></button>
                </header>
                <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                      <div className="space-y-8">
                         <div className="space-y-2"><label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">产品名称 / Name *</label><input required value={editProduct?.name || ''} onChange={e => setEditProduct(prev => ({...prev, name: e.target.value}))} className="w-full h-14 bg-zinc-50 border-none rounded-2xl px-6 text-[15px] font-bold outline-none" placeholder="输入完整产品名" /></div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">分类 / Category</label><select value={editProduct?.category || ''} onChange={e => setEditProduct(prev => ({...prev, category: e.target.value}))} className="w-full h-14 bg-zinc-50 border-none rounded-2xl px-6 text-[14px] font-bold outline-none appearance-none">{['沙发', '床铺', '餐桌椅', '灯具', '饰品'].map(c => <option key={c}>{c}</option>)}</select></div>
                            <div className="space-y-2"><label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">平台售价 / Price *</label><input type="number" required value={editProduct?.price || ''} onChange={e => setEditProduct(prev => ({...prev, price: Number(e.target.value)}))} className="w-full h-14 bg-zinc-50 border-none rounded-2xl px-6 text-[15px] font-bold outline-none" /></div>
                         </div>
                         <div className="p-6 bg-amber-50 rounded-[32px] border border-amber-100 space-y-6">
                            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600"><Database className="w-4 h-4" /></div><span className="text-[15px] font-black text-amber-900 italic">开启集采折扣</span></div><button type="button" onClick={() => setEditProduct(prev => ({...prev, allow_group_buy_discount: !prev?.allow_group_buy_discount}))} className={`w-12 h-7 rounded-full relative transition-all ${editProduct?.allow_group_buy_discount ? 'bg-amber-500' : 'bg-zinc-200'}`}><div className={`absolute top-1.5 w-4 h-4 bg-white rounded-full transition-all ${editProduct?.allow_group_buy_discount ? 'left-6.5' : 'left-1.5'}`} /></button></div>
                            {editProduct?.allow_group_buy_discount && <div className="grid grid-cols-2 gap-4 animate-in fade-in"><div className="space-y-2"><label className="text-[10px] font-black text-amber-400 uppercase tracking-widest">MIN %</label><input type="number" value={editProduct?.estimated_discount_min || 5} onChange={e => setEditProduct(prev => ({...prev, estimated_discount_min: Number(e.target.value)}))} className="w-full h-12 bg-white border-none rounded-xl px-4 text-[14px] font-black" /></div><div className="space-y-2"><label className="text-[10px] font-black text-amber-400 uppercase tracking-widest">MAX %</label><input type="number" value={editProduct?.estimated_discount_max || 15} onChange={e => setEditProduct(prev => ({...prev, estimated_discount_max: Number(e.target.value)}))} className="w-full h-12 bg-white border-none rounded-xl px-4 text-[14px] font-black" /></div></div>}
                         </div>
                      </div>
                      <div className="space-y-8">
                         <div className="space-y-2"><label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">主图图片 / Image Link</label><div className="relative"><ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" /><input required value={editProduct?.image || ''} onChange={e => setEditProduct(prev => ({...prev, image: e.target.value}))} className="w-full h-14 bg-zinc-50 border-none rounded-2xl pl-12 pr-6 text-[12px] font-mono outline-none" /></div></div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">配置分级 (1-10)</label><input type="number" min="1" max="10" value={editProduct?.ladder_level || 5} onChange={e => setEditProduct(prev => ({...prev, ladder_level: Number(e.target.value)}))} className="w-full h-14 bg-zinc-50 border-none rounded-2xl px-6 text-[15px] font-black" /></div>
                            <div className="space-y-2"><label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">在库状态</label><select value={editProduct?.status || 'active'} onChange={e => setEditProduct(prev => ({...prev, status: e.target.value as any}))} className="w-full h-14 bg-zinc-50 border-none rounded-2xl px-6 text-[14px] font-bold outline-none appearance-none"><option value="active">正常销售</option><option value="hidden">内部隐藏</option></select></div>
                         </div>
                         <div className="space-y-2"><label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">核心选购逻辑</label><textarea value={editProduct?.recommendation_reason || ''} onChange={e => setEditProduct(prev => ({...prev, recommendation_reason: e.target.value}))} rows={4} className="w-full bg-zinc-50 border-none rounded-2xl p-6 text-[14px] font-medium outline-none resize-none italic" placeholder="为什么推荐这款？材质、功能或场景匹配度..." /></div>
                      </div>
                   </div>
                   <div className="mt-12 flex items-center justify-end gap-4">
                      <button type="button" onClick={() => setIsEditing(false)} className="px-8 h-14 text-[14px] font-black text-zinc-400">取消</button>
                      <button type="submit" disabled={loading} className="px-12 h-14 bg-zinc-900 text-white rounded-[24px] text-[15px] font-black shadow-2xl active:scale-95 transition-all flex items-center gap-3">
                         {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                         <span>{editProduct?.id?.startsWith('new') ? '立即入库' : '保存变更'}</span>
                      </button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Toast message={toastMessage} onClear={() => setToastMessage(null)} />
    </main>
  );
}
