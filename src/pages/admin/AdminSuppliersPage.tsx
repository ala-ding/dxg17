import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Edit, Trash2, Search, 
  X, Save, RefreshCw, Building2,
  Phone, Mail, MapPin, Star, AlertCircle
} from 'lucide-react';
import { supplierService, Supplier } from '../../services/supplierService';
import Toast from '../../components/Toast';

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Partial<Supplier> | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await supplierService.getSuppliers();
      setSuppliers(data);
    } catch (e: any) {
      setToastMessage(`加载失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditSupplier(supplier);
    setIsEditing(true);
  };

  const handleNew = () => {
    setEditSupplier({
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      category: '家具',
      reliability_score: 5,
      is_active: true
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage('功能开发中：保存供应商信息');
    setIsEditing(false);
  };

  return (
    <div className="flex-1 w-full max-w-[1400px] mx-auto p-10 flex flex-col gap-8 text-left">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-[28px] font-black text-white tracking-tight">供应商管理</h1>
            <p className="text-white/40 text-[14px] font-medium">管理上游工厂与经销商资源，配置采购对接规则。</p>
          </div>
        </div>
        <button 
          onClick={handleNew}
          className="px-8 py-3 bg-emerald-500 text-white rounded-2xl text-[15px] font-black flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" /> 新增供应商
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full h-64 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : suppliers.length > 0 ? (
          suppliers.map((s) => (
            <div key={s.id} className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-8 group relative flex flex-col">
               <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                        <Building2 className="w-6 h-6" />
                     </div>
                     <div>
                        <h3 className="text-[18px] font-black text-white line-clamp-1">{s.name}</h3>
                        <p className="text-[12px] text-white/30 font-bold uppercase tracking-widest">{s.category}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-[11px] font-black">{s.reliability_score}</span>
                  </div>
               </div>

               <div className="space-y-4 mb-8 flex-1">
                  <div className="flex items-center gap-3 text-[13px] text-white/60">
                     <Phone className="w-4 h-4 text-emerald-500/40" />
                     <span>{s.phone || '未填写手机'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[13px] text-white/60">
                     <Mail className="w-4 h-4 text-emerald-500/40" />
                     <span className="line-clamp-1">{s.email || '未填写邮箱'}</span>
                  </div>
                  <div className="flex items-start gap-3 text-[13px] text-white/60">
                     <MapPin className="w-4 h-4 text-emerald-500/40 shrink-0" />
                     <span className="line-clamp-2 leading-relaxed">{s.address || '未填写地址'}</span>
                  </div>
               </div>

               <div className="flex items-center gap-2">
                 <button 
                  onClick={() => handleEdit(s)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white text-[13px] font-black rounded-xl transition-all flex items-center justify-center gap-2"
                 >
                   <Edit className="w-4 h-4" /> 资料管理
                 </button>
                 <button className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
            </div>
          ))
        ) : (
          <div className="col-span-full h-64 bg-zinc-900/30 border border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center gap-4">
             <Building2 className="w-12 h-12 text-white/10" />
             <div className="text-center">
               <p className="text-white/40 font-bold">暂无供应商数据</p>
               <button onClick={handleNew} className="text-emerald-500 font-black text-[14px] mt-2 underline">录入首个供应商</button>
             </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-[700px] bg-zinc-900 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col text-left"
            >
              <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-[20px] font-black text-white">供应商档案配置</h2>
                <button onClick={() => setIsEditing(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-full transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-10 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[11px] font-black text-white/30 uppercase tracking-widest pl-1">供应商全称</label>
                     <input 
                      type="text" 
                      required
                      value={editSupplier?.name || ''} 
                      onChange={e => setEditSupplier(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-white/5 border border-white/5 h-12 px-4 rounded-xl text-[14px] font-bold text-white outline-none focus:border-emerald-500/40" 
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[11px] font-black text-white/30 uppercase tracking-widest pl-1">主营类目</label>
                     <input 
                      type="text" 
                      value={editSupplier?.category || ''} 
                      onChange={e => setEditSupplier(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-white/5 border border-white/5 h-12 px-4 rounded-xl text-[14px] font-bold text-white outline-none focus:border-emerald-500/40" 
                     />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[11px] font-black text-white/30 uppercase tracking-widest pl-1">联系人</label>
                     <input 
                      type="text" 
                      value={editSupplier?.contact_person || ''} 
                      onChange={e => setEditSupplier(prev => ({ ...prev, contact_person: e.target.value }))}
                      className="w-full bg-white/5 border border-white/5 h-12 px-4 rounded-xl text-[14px] font-bold text-white outline-none focus:border-emerald-500/40" 
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[11px] font-black text-white/30 uppercase tracking-widest pl-1">联系电话</label>
                     <input 
                      type="text" 
                      value={editSupplier?.phone || ''} 
                      onChange={e => setEditSupplier(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-white/5 border border-white/5 h-12 px-4 rounded-xl text-[14px] font-bold text-white outline-none focus:border-emerald-500/40" 
                     />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[11px] font-black text-white/30 uppercase tracking-widest pl-1">办公地址</label>
                   <input 
                    type="text" 
                    value={editSupplier?.address || ''} 
                    onChange={e => setEditSupplier(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full bg-white/5 border border-white/5 h-12 px-4 rounded-xl text-[14px] font-bold text-white outline-none focus:border-emerald-500/40" 
                   />
                </div>

                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-white/5 text-white text-[14px] font-black rounded-2xl transition-all">取消</button>
                  <button type="submit" className="flex-[2] py-4 bg-emerald-500 text-white text-[14px] font-black rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" /> 更新供应商档案
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
    </div>
  );
}
