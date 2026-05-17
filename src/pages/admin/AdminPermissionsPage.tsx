import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Edit, Trash2, Search, 
  X, Save, RefreshCw, Shield,
  Lock, Unlock, Filter, AlertCircle
} from 'lucide-react';
import { permissionService, Permission } from '../../services/permissionService';
import Toast from '../../components/Toast';

export default function AdminPermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editPermission, setEditPermission] = useState<Partial<Permission> | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      // Mock data for now as the service implementation was simplified
      const mockPerms: Permission[] = [
        { id: '1', code: 'view_procurement_price', name: '查看专业采购价', description: '允许查看产品的专业采购价格', category: 'product' },
        { id: '2', code: 'view_supplier_info', name: '查看供应商信息', description: '允许查看产品的供应商及厂家联系方式', category: 'supplier' },
        { id: '3', code: 'request_custom_service', name: '申请定制服务', description: '允许提交定制采购服务申请', category: 'service' }
      ];
      setPermissions(mockPerms);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (perm: Permission) => {
    setEditPermission(perm);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage('功能开发中：保存权限配置');
    setIsEditing(false);
  };

  return (
    <div className="flex-1 w-full max-w-[1400px] mx-auto p-10 flex flex-col gap-8 text-left">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-[28px] font-black text-white tracking-tight">权限系统管理</h1>
            <p className="text-white/40 text-[14px] font-medium">定义细粒度的功能权限，用于跨会员等级分配。</p>
          </div>
        </div>
        <button className="px-8 py-3 bg-white/5 text-white/40 rounded-2xl text-[15px] font-black flex items-center gap-2 cursor-not-allowed border border-white/5">
          <Plus className="w-5 h-5" /> 新增权限项 (锁定)
        </button>
      </header>

      <div className="bg-zinc-900/50 border border-white/5 rounded-[40px] overflow-hidden">
        <table className="w-full border-collapse">
           <thead>
             <tr className="border-b border-white/5 bg-white/2">
                <th className="px-8 py-6 text-left text-[11px] font-black text-white/30 uppercase tracking-widest">权限名称 / 代码</th>
                <th className="px-8 py-6 text-left text-[11px] font-black text-white/30 uppercase tracking-widest">描述</th>
                <th className="px-8 py-6 text-left text-[11px] font-black text-white/30 uppercase tracking-widest">分类</th>
                <th className="px-8 py-6 text-right text-[11px] font-black text-white/30 uppercase tracking-widest">操作</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-white/5">
             {loading ? (
                <tr>
                   <td colSpan={4} className="px-8 py-12 text-center">
                      <RefreshCw className="w-8 h-8 text-brand animate-spin mx-auto" />
                   </td>
                </tr>
             ) : permissions.map(perm => (
               <tr key={perm.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                           <Lock className="w-4 h-4" />
                        </div>
                        <div>
                           <p className="text-[15px] font-black text-white">{perm.name}</p>
                           <p className="text-[11px] font-mono text-white/30">{perm.code}</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-8 py-6">
                     <p className="text-[14px] text-white/60 font-medium max-w-md">{perm.description}</p>
                  </td>
                  <td className="px-8 py-6">
                     <span className="px-3 py-1 bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest rounded-full">{perm.category}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                     <div className="flex items-center justify-end gap-2">
                        <button 
                         onClick={() => handleEdit(perm)}
                         className="p-2 text-white/20 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-xl"
                        >
                           <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-white/10 hover:text-red-500 transition-all bg-white/5 hover:bg-red-500/10 rounded-xl">
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                  </td>
               </tr>
             ))}
           </tbody>
        </table>
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
              className="relative w-full max-w-[500px] bg-zinc-900 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col text-left"
            >
              <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-[20px] font-black text-white">权限项配置</h2>
                <button onClick={() => setIsEditing(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-full transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-white/30 uppercase tracking-widest pl-1">权限名称</label>
                  <input 
                   type="text" 
                   value={editPermission?.name || ''} 
                   onChange={e => setEditPermission(prev => ({ ...prev, name: e.target.value }))}
                   className="w-full bg-white/5 border border-white/5 h-12 px-4 rounded-xl text-[14px] font-bold text-white outline-none focus:border-indigo-500/40" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-white/30 uppercase tracking-widest pl-1">描述</label>
                  <textarea 
                   value={editPermission?.description || ''} 
                   onChange={e => setEditPermission(prev => ({ ...prev, description: e.target.value }))}
                   className="w-full bg-white/5 border border-white/5 p-4 rounded-xl text-[14px] font-medium text-white/70 outline-none h-24 resize-none focus:border-indigo-500/40" 
                  />
                </div>
                
                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-white/5 text-white text-[14px] font-black rounded-2xl">取消</button>
                  <button type="submit" className="flex-[2] py-4 bg-indigo-500 text-white text-[14px] font-black rounded-2xl shadow-lg shadow-indigo-500/20">保存变更</button>
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
