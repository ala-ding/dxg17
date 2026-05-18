import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Edit, Trash2, Search, 
  ExternalLink, Package, Filter, X, 
  Save, Image as ImageIcon, Layout, RefreshCw, Database,
  ArrowLeft, Upload, FileText, Download, AlertCircle, CheckCircle
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
  const [isImporting, setIsImporting] = useState(false);
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);
  const [adminSearch, setAdminSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Import state
  const [importStep, setImportStep] = useState<'upload' | 'preview'>('upload');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isProcessingImport, setIsProcessingImport] = useState(false);

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

  const handleBatchImport = () => {
    setImportStep('upload');
    setParsedData([]);
    setImportErrors([]);
    setIsImporting(true);
  };

  const downloadTemplate = () => {
    const headers = ['sku', 'name', 'category', 'brand', 'imageUrl', 'costPrice', 'standardPrice', 'space', 'style', 'budgetLevel', 'planLevel', 'groupBuyStatus', 'description', 'isActive'];
    const example = ['sofa-009', '现代简约三人位布艺沙发', '沙发', 'DXG Select', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc', '3200', '4679', '客厅', '现代简约', '3-5万', '品质进阶版', '未开启集采', '适合客厅的现代简约沙发', 'true'];
    const csvContent = [headers.join(','), example.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'dxg_product_import_template.csv');
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

      dataRows.forEach((row, index) => {
        const values = row.split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((header, i) => {
          obj[header] = values[i];
        });

        // Validation
        const rowIndex = index + 2;
        if (!obj.name) errors.push(`第 ${rowIndex} 行: 产品名称不能为空`);
        if (!obj.category) errors.push(`第 ${rowIndex} 行: 分类不能为空`);
        if (!obj.brand) errors.push(`第 ${rowIndex} 行: 品牌不能为空`);
        if (isNaN(Number(obj.standardPrice))) errors.push(`第 ${rowIndex} 行: 平台标准价必须是数字`);
        
        results.push(obj);
      });

      setParsedData(results);
      setImportErrors(errors);
      setImportStep('preview');
    };
    reader.readAsText(file);
  };

  const confirmImport = async () => {
    if (importErrors.length > 0) return;
    
    try {
      setIsProcessingImport(true);
      let successCount = 0;
      
      for (const item of parsedData) {
        await productService.createProduct({
          id: item.sku || `sku-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: item.name,
          category: item.category,
          brand: item.brand,
          image: item.imageUrl,
          price: Number(item.standardPrice),
          factory_price: Number(item.costPrice) || Number(item.standardPrice) * 0.7,
          standard_service_price: Number(item.standardPrice),
          space: item.space ? [item.space] : [],
          style: item.style ? [item.style] : [],
          ladder_level: Number(item.ladderLevel) || 5,
          status: (item.isActive === 'true' || item.isActive === '上架' || item.isActive === '1') ? 'active' : 'hidden',
          description: item.description,
          specs: {}
        } as any);
        successCount++;
      }
      
      setToastMessage(`导入成功！共导入 ${successCount} 个产品`);
      setIsImporting(false);
      loadProducts();
    } catch (e: any) {
      setToastMessage(`导入出错: ${e.message}`);
    } finally {
      setIsProcessingImport(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要将该产品从当前列表中移除吗？')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      setToastMessage('已从当前列表移除');
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
    <main className="w-full max-w-[1600px] mx-auto p-6 md:p-10 z-10 flex flex-col gap-6">
      <div className="flex items-center justify-between text-left">
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
            <button 
              onClick={handleBatchImport}
              className="px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl text-[14px] font-black border border-gray-200 flex items-center gap-2 hover:bg-gray-200 transition-all"
            >
              <Upload className="w-4 h-4" /> 批量导入
            </button>
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
      <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
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
                  <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">出厂价 / 标准价</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">集采权益</th>
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
                          <img src={p.image || null} className="w-full h-full object-cover" alt={p.name} />
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
                        <div className="flex flex-col gap-0.5">
                          <p className="text-[15px] font-black text-gray-800">¥{(p.factory_price || p.price).toLocaleString()}</p>
                          <p className="text-[11px] font-bold text-brand italic">S: ¥{(p.standard_service_price || (p.factory_price || p.price) * 1.2).toLocaleString()}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {p.allow_group_buy_discount ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[14px] font-black text-amber-600">等级: {p.group_buy_level || 'A'}</span>
                            <span className="text-[11px] font-bold text-amber-600/60 leading-none">优惠: {p.estimated_discount_min || 5}%-{p.estimated_discount_max || 15}%</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-300 font-bold uppercase tracking-widest">未开启集采</span>
                        )}
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
                                 {['沙发', '床 / 床垫', '餐桌椅', '柜类收纳', '软装', '灯具', '窗帘', '地毯', '饰品', '装饰画'].map(c => <option key={c}>{c}</option>)}
                              </select>
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">标准服务价 (元)</label>
                              <input 
                                type="number" 
                                required
                                value={editProduct?.standard_service_price || editProduct?.price || 0} 
                                onChange={e => setEditProduct(prev => ({ ...prev, standard_service_price: Number(e.target.value), price: Number(e.target.value) }))}
                                className="bg-gray-50 border-none h-12 px-4 rounded-xl text-[14px] font-bold outline-none focus:ring-2 focus:ring-brand/20 transition-all" 
                              />
                            </div>
                         </div>
                         
                         <div className="bg-amber-50/50 rounded-[32px] p-6 border border-amber-100 flex flex-col gap-6">
                           <div className="flex items-center justify-between">
                             <label className="text-[14px] font-black text-amber-700 flex items-center gap-2">
                               <Database className="w-4 h-4" /> 专业会员集采设置
                             </label>
                             <div className="flex items-center gap-2">
                               <span className="text-[11px] font-bold text-amber-600 uppercase tracking-widest">开启集采折扣</span>
                               <button 
                                 type="button"
                                 onClick={() => setEditProduct(prev => ({ ...prev, allow_group_buy_discount: !prev?.allow_group_buy_discount }))}
                                 className={`w-10 h-6 rounded-full transition-all relative ${editProduct?.allow_group_buy_discount ? 'bg-amber-500' : 'bg-gray-200'}`}
                               >
                                 <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${editProduct?.allow_group_buy_discount ? 'left-5' : 'left-1'}`} />
                               </button>
                             </div>
                           </div>
                           
                           {editProduct?.allow_group_buy_discount && (
                             <div className="grid grid-cols-2 gap-4 text-left animate-in fade-in duration-300">
                               <div className="flex flex-col gap-2">
                                 <label className="text-[11px] font-black text-amber-600 uppercase tracking-widest">集采等级</label>
                                 <select 
                                   value={editProduct?.group_buy_level || 'A'} 
                                   onChange={e => setEditProduct(prev => ({ ...prev, group_buy_level: e.target.value }))}
                                   className="bg-white border-none h-10 px-4 rounded-xl text-[13px] font-bold outline-none shadow-sm"
                                 >
                                   <option value="A">A级 (全国统配)</option>
                                   <option value="B">B级 (区域集采)</option>
                                   <option value="C">C级 (单项协议)</option>
                                 </select>
                               </div>
                               <div className="grid grid-cols-2 gap-2">
                                 <div className="flex flex-col gap-2">
                                   <label className="text-[11px] font-black text-amber-600 uppercase tracking-widest">最小优惠 %</label>
                                   <input 
                                     type="number" 
                                     value={editProduct?.estimated_discount_min || 5} 
                                     onChange={e => setEditProduct(prev => ({ ...prev, estimated_discount_min: Number(e.target.value) }))}
                                     className="bg-white border-none h-10 px-4 rounded-xl text-[13px] font-bold outline-none shadow-sm" 
                                   />
                                 </div>
                                 <div className="flex flex-col gap-2">
                                   <label className="text-[11px] font-black text-amber-600 uppercase tracking-widest">最大优惠 %</label>
                                   <input 
                                     type="number" 
                                     value={editProduct?.estimated_discount_max || 15} 
                                     onChange={e => setEditProduct(prev => ({ ...prev, estimated_discount_max: Number(e.target.value) }))}
                                     className="bg-white border-none h-10 px-4 rounded-xl text-[13px] font-bold outline-none shadow-sm" 
                                   />
                                 </div>
                               </div>
                               <div className="col-span-2 flex flex-col gap-2">
                                 <label className="text-[11px] font-black text-amber-600 uppercase tracking-widest">集采规则说明 (专业可见)</label>
                                 <textarea 
                                   value={editProduct?.tier_purchase_rules || ''} 
                                   onChange={e => setEditProduct(prev => ({ ...prev, tier_purchase_rules: e.target.value }))}
                                   placeholder="例如：1件起享基础折扣；5件以上另议..."
                                   className="bg-white border-none p-3 rounded-xl text-[12px] font-medium h-20 resize-none outline-none shadow-sm" 
                                 />
                               </div>
                               <div className="col-span-2 flex flex-col gap-2">
                                 <label className="text-[11px] font-black text-amber-600 uppercase tracking-widest">专业采购备注 (专业可见)</label>
                                 <textarea 
                                   value={editProduct?.professional_note || ''} 
                                   onChange={e => setEditProduct(prev => ({ ...prev, professional_note: e.target.value }))}
                                   placeholder="仅限专业认证会员。支持异地打样..."
                                   className="bg-white border-none p-3 rounded-xl text-[12px] font-medium h-20 resize-none outline-none shadow-sm italic" 
                                 />
                               </div>
                             </div>
                           )}
                         </div>
                         <div className="flex flex-col gap-2 text-left">
                           <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">适用空间</label>
                           <div className="flex flex-wrap gap-2">
                             {['客厅', '餐厅', '主卧', '次卧', '儿童房', '玄关', '阳台', '全屋'].map(s => (
                               <button
                                 key={s}
                                 type="button"
                                 onClick={() => {
                                   const current = editProduct?.space || [];
                                   const next = current.includes(s) ? current.filter(x => x !== s) : [...current, s];
                                   setEditProduct(prev => ({ ...prev, space: next }));
                                 }}
                                 className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                                   (editProduct?.space || []).includes(s) 
                                     ? 'bg-brand text-white' 
                                     : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                 }`}
                               >
                                 {s}
                               </button>
                             ))}
                           </div>
                         </div>

                         <div className="flex flex-col gap-2 text-left">
                           <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">产品风格</label>
                           <div className="flex flex-wrap gap-2">
                             {['现代简约', '中古风', '意式极简', '原木风', '北欧风', '轻奢'].map(s => (
                               <button
                                 key={s}
                                 type="button"
                                 onClick={() => {
                                   const current = editProduct?.style || [];
                                   const next = current.includes(s) ? current.filter(x => x !== s) : [...current, s];
                                   setEditProduct(prev => ({ ...prev, style: next }));
                                 }}
                                 className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                                   (editProduct?.style || []).includes(s) 
                                     ? 'bg-blue-500 text-white' 
                                     : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                 }`}
                               >
                                 {s}
                               </button>
                             ))}
                           </div>
                         </div>

                         <div className="flex flex-col gap-2 text-left">
                           <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">品牌 / 供应商</label>
                           <div className="grid grid-cols-2 gap-2">
                             <input 
                               type="text" 
                               value={editProduct?.brand || ''} 
                               onChange={e => setEditProduct(prev => ({ ...prev, brand: e.target.value }))}
                               placeholder="显示品牌"
                               className="bg-gray-50 border-none h-12 px-4 rounded-xl text-[14px] font-bold outline-none" 
                             />
                             <input 
                               type="text" 
                               value={editProduct?.supplier_id || ''} 
                               onChange={e => setEditProduct(prev => ({ ...prev, supplier_id: e.target.value }))}
                               placeholder="供应商ID (后台关联)"
                               className="bg-zinc-50 border-none h-12 px-4 rounded-xl text-[14px] font-bold outline-none" 
                             />
                           </div>
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

      {/* Batch Import Modal */}
      <AnimatePresence>
        {isImporting && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-10 text-left">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isProcessingImport && setIsImporting(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[800px] max-h-[85vh] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-[24px] font-black text-gray-800">批量导入产品</h2>
                  <p className="text-[14px] text-gray-400 font-bold">支持 XLSX / CSV 格式快速录入</p>
                </div>
                <button 
                  onClick={() => setIsImporting(false)} 
                  disabled={isProcessingImport}
                  className="p-2 hover:bg-gray-50 rounded-full transition-all disabled:opacity-50"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                {importStep === 'upload' ? (
                  <div className="flex flex-col gap-8">
                    {/* Template Section */}
                    <div className="p-8 bg-brand/5 border border-brand/10 rounded-[32px] flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-[16px] font-black text-gray-800">下载导入模板</p>
                          <p className="text-[13px] text-gray-500 font-bold">请先下载模板并按格式填写资料</p>
                        </div>
                      </div>
                      <button 
                        onClick={downloadTemplate}
                        className="px-6 py-3 bg-white text-brand border border-brand/20 rounded-xl text-[14px] font-black flex items-center gap-2 hover:bg-brand hover:text-white transition-all"
                      >
                        <Download className="w-4 h-4" /> 下载 CSV 模板
                      </button>
                    </div>

                    {/* Upload Section */}
                    <label className="relative group cursor-pointer">
                      <input 
                        type="file" 
                        accept=".csv" 
                        onChange={handleFileUpload}
                        className="hidden" 
                      />
                      <div className="border-2 border-dashed border-gray-200 rounded-[32px] p-16 flex flex-col items-center gap-4 group-hover:border-brand/40 group-hover:bg-brand/5 transition-all">
                        <div className="w-16 h-16 rounded-3xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:scale-110 group-hover:text-brand transition-all">
                          <Upload className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                          <p className="text-[18px] font-black text-gray-800">上传已填写的 CSV 文件</p>
                          <p className="text-[14px] text-gray-400 font-bold mt-1">点击或拖拽文件至此处</p>
                        </div>
                      </div>
                    </label>

                    {/* Instructions */}
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-3">
                      <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> 导入说明
                      </label>
                      <ul className="text-[13px] text-gray-500 font-bold space-y-1 ml-4 list-disc">
                        <li>请确保产品名称、分类、品牌、平台标准价字段不为空</li>
                        <li>SKU 如果重复，新数据将覆盖旧数据</li>
                        <li>价格必须为纯数字，支持小数点</li>
                        <li>图片暂支持 URL 链接导入</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[12px] font-black">
                          解析完成: {parsedData.length} 条
                        </div>
                        {importErrors.length > 0 && (
                          <div className="px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-[12px] font-black flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {importErrors.length} 个错误
                          </div>
                        )}
                        {importErrors.length === 0 && (
                          <div className="px-4 py-1.5 bg-brand/10 text-brand rounded-full text-[12px] font-black flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> 数据校验通过
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => setImportStep('upload')}
                        className="text-[13px] font-black text-gray-400 hover:text-gray-600 flex items-center gap-1"
                      >
                         重新上传
                      </button>
                    </div>

                    {/* Preview Table */}
                    <div className="border border-gray-100 rounded-2xl overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                             <th className="px-4 py-3 text-[11px] font-black text-gray-400 uppercase">产品名称</th>
                             <th className="px-4 py-3 text-[11px] font-black text-gray-400 uppercase">SKU</th>
                             <th className="px-4 py-3 text-[11px] font-black text-gray-400 uppercase">分类/品牌</th>
                             <th className="px-4 py-3 text-[11px] font-black text-gray-400 uppercase">平台价格</th>
                             <th className="px-4 py-3 text-[11px] font-black text-gray-400 uppercase">状态</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {parsedData.slice(0, 10).map((item, i) => (
                            <tr key={i} className="text-[13px] font-bold text-gray-600">
                              <td className="px-4 py-3">{item.name || <span className="text-red-400">缺失</span>}</td>
                              <td className="px-4 py-3 font-mono text-[11px]">{item.sku || '-'}</td>
                              <td className="px-4 py-3">{item.category} / {item.brand}</td>
                              <td className="px-4 py-3">¥{item.standardPrice}</td>
                              <td className="px-4 py-3">
                                {item.isActive === 'true' ? (
                                  <span className="text-emerald-500">上架</span>
                                ) : (
                                  <span className="text-gray-400">隐藏</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {parsedData.length > 10 && (
                        <div className="p-3 bg-gray-50 text-center text-[12px] text-gray-400 font-bold">
                          以及另外 {parsedData.length - 10} 条数据...
                        </div>
                      )}
                    </div>

                    {/* Error Log */}
                    {importErrors.length > 0 && (
                      <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex flex-col gap-2">
                        <p className="text-[14px] font-black text-red-700 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> 请修正以下错误后重新上传
                        </p>
                        <div className="max-h-[150px] overflow-y-auto custom-scrollbar space-y-1 mt-2">
                          {importErrors.map((err, i) => (
                            <p key={i} className="text-[12px] text-red-500 font-bold">• {err}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="px-10 py-8 bg-gray-50 flex items-center justify-end gap-4 shrink-0">
                <button 
                  onClick={() => setIsImporting(false)} 
                  disabled={isProcessingImport}
                  className="px-8 py-3 rounded-2xl text-[14px] font-black text-gray-400 hover:text-gray-600 transition-all disabled:opacity-50"
                >
                  取消
                </button>
                {importStep === 'preview' && (
                  <button 
                    onClick={confirmImport}
                    disabled={importErrors.length > 0 || isProcessingImport}
                    className="px-10 py-3 bg-brand text-white rounded-2xl text-[14px] font-black shadow-lg shadow-brand/20 disabled:opacity-50 disabled:grayscale hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                  >
                    {isProcessingImport ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    确认导入产品库
                  </button>
                )}
              </div>
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
