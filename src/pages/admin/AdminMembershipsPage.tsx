import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Edit, Trash2, Search, 
  X, Save, RefreshCw, Layout, Crown,
  Shield, CheckCircle2, AlertCircle
} from 'lucide-react';
import { membershipService, MembershipPlan } from '../../services/membershipService';
import Toast from '../../components/Toast';

export default function AdminMembershipsPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editPlan, setEditPlan] = useState<Partial<MembershipPlan> | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await membershipService.getMembershipPlans();
      setPlans(data);
    } catch (e: any) {
      setToastMessage(`加载失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: MembershipPlan) => {
    setEditPlan(plan);
    setIsEditing(true);
  };

  const handleNew = () => {
    setEditPlan({
      name: '',
      tier: 'consulting',
      price: 0,
      period: 'year',
      features: [],
      is_active: true
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPlan) return;

    try {
      setLoading(true);
      // For now, we only handle UI because the service doesn't have create/update yet
      // In a real app, we'd add these to membershipService
      setToastMessage('功能开发中：保存会员计划变更');
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-[1400px] mx-auto p-10 flex flex-col gap-8 text-left">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-[28px] font-black text-white tracking-tight">会员计划管理</h1>
            <p className="text-white/40 text-[14px] font-medium">配置不同等级的会员权益与价格体系。</p>
          </div>
        </div>
        <button 
          onClick={handleNew}
          className="px-8 py-3 bg-brand text-white rounded-2xl text-[15px] font-black flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-brand/20"
        >
          <Plus className="w-5 h-5" /> 新增计划
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full h-64 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-brand animate-spin" />
          </div>
        ) : plans.length > 0 ? (
          plans.map((plan) => (
            <div key={plan.id} className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-8 group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-[40px]" />
               <div className="flex items-start justify-between mb-6 relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                         plan.tier === 'professional' ? 'bg-amber-500/10 text-amber-500' : 
                         plan.tier === 'custom' ? 'bg-purple-500/10 text-purple-500' : 'bg-brand/10 text-brand'
                       }`}>
                         {plan.tier}
                       </span>
                       {!plan.is_active && <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest">已下架</span>}
                    </div>
                    <h3 className="text-[20px] font-black text-white">{plan.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[24px] font-black text-white">¥{plan.price}</p>
                    <p className="text-[12px] text-white/30 font-bold uppercase tracking-widest">/ {plan.period === 'year' ? '年' : '月'}</p>
                  </div>
               </div>

               <div className="space-y-3 mb-8 relative z-10">
                  {(plan.features || []).slice(0, 3).map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-[13px] text-white/60">
                       <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                       <span className="line-clamp-1">{f}</span>
                    </div>
                  ))}
                  {plan.features.length > 3 && (
                    <p className="text-[11px] text-white/30 font-black pl-7">+{plan.features.length - 3} 更多权益</p>
                  )}
               </div>

               <div className="flex items-center gap-2 relative z-10">
                 <button 
                  onClick={() => handleEdit(plan)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white text-[13px] font-black rounded-xl transition-all flex items-center justify-center gap-2"
                 >
                   <Edit className="w-4 h-4" /> 编辑配置
                 </button>
                 <button className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
            </div>
          ))
        ) : (
          <div className="col-span-full h-64 bg-zinc-900/30 border border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center gap-4">
             <AlertCircle className="w-12 h-12 text-white/10" />
             <div className="text-center">
               <p className="text-white/40 font-bold">暂无会员计划</p>
               <button onClick={handleNew} className="text-brand font-black text-[14px] mt-2 underline">立即创建一个</button>
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
              className="relative w-full max-w-[600px] bg-zinc-900 border border-white/10 rounded-[48px] shadow-2xl overflow-hidden flex flex-col text-left"
            >
              <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-[20px] font-black text-white">计划详情配置</h2>
                <button onClick={() => setIsEditing(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-full transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-10 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[11px] font-black text-white/30 uppercase tracking-widest pl-1">计划名称</label>
                     <input 
                      type="text" 
                      required
                      value={editPlan?.name || ''} 
                      onChange={e => setEditPlan(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-white/5 border border-white/5 h-12 px-4 rounded-xl text-[14px] font-bold text-white outline-none focus:border-brand/40" 
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[11px] font-black text-white/30 uppercase tracking-widest pl-1">等级 TIER</label>
                     <select 
                      value={editPlan?.tier || 'consulting'} 
                      onChange={e => setEditPlan(prev => ({ ...prev, tier: e.target.value as any }))}
                      className="w-full bg-white/5 border border-white/5 h-12 px-4 rounded-xl text-[14px] font-bold text-white outline-none focus:border-brand/40"
                     >
                       <option value="consulting">咨询会员 (Consulting)</option>
                       <option value="professional">专业会员 (Professional)</option>
                       <option value="custom">定制会员 (Custom)</option>
                     </select>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[11px] font-black text-white/30 uppercase tracking-widest pl-1">价格 (RMB)</label>
                     <input 
                      type="number" 
                      required
                      value={editPlan?.price || 0} 
                      onChange={e => setEditPlan(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full bg-white/5 border border-white/5 h-12 px-4 rounded-xl text-[14px] font-bold text-white outline-none focus:border-brand/40" 
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[11px] font-black text-white/30 uppercase tracking-widest pl-1">周期</label>
                     <select 
                      value={editPlan?.period || 'year'} 
                      onChange={e => setEditPlan(prev => ({ ...prev, period: e.target.value as any }))}
                      className="w-full bg-white/5 border border-white/5 h-12 px-4 rounded-xl text-[14px] font-bold text-white outline-none focus:border-brand/40"
                     >
                       <option value="month">按月</option>
                       <option value="year">按年</option>
                     </select>
                   </div>
                </div>

                <div className="flex items-center gap-3 py-4 border-t border-white/5">
                   <input 
                    type="checkbox" 
                    id="is_active"
                    checked={editPlan?.is_active ?? true} 
                    onChange={e => setEditPlan(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="w-5 h-5 rounded bg-white/5 border-white/10 text-brand outline-none cursor-pointer"
                   />
                   <label htmlFor="is_active" className="text-[14px] font-black text-white cursor-pointer uppercase tracking-tight">允许公开订阅</label>
                </div>

                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white text-[14px] font-black rounded-2xl transition-all">取消</button>
                  <button type="submit" className="flex-[2] py-4 bg-brand text-white text-[14px] font-black rounded-2xl transition-all shadow-lg shadow-brand/20 flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" /> 保存配置
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
