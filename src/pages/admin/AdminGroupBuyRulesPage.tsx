import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Edit, Trash2, Search, 
  X, Save, RefreshCw, Layout,
  Layers, ChevronRight, AlertCircle,
  Tag, Percent, Wallet
} from 'lucide-react';
import { groupBuyRuleService } from '../../services/groupBuyRuleService';
import { GroupBuyRule } from '../../types/business';
import Toast from '../../components/Toast';

export default function AdminGroupBuyRulesPage() {
  const [rules, setRules] = useState<GroupBuyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editRule, setEditRule] = useState<Partial<GroupBuyRule> | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const data = await groupBuyRuleService.getRules();
      setRules(data);
    } catch (e: any) {
      setToastMessage(`加载失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rule: GroupBuyRule) => {
    setEditRule(rule);
    setIsEditing(true);
  };

  const handleNew = () => {
    setEditRule({
      name: '',
      min_order_amount: 0,
      discount_rate: 0,
      member_type: 'professional',
      status: 'active',
      sort_order: rules.length + 1,
      description: ''
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRule) return;

    try {
      setLoading(true);
      if (editRule.id) {
        await groupBuyRuleService.updateRule(editRule.id, editRule);
        setToastMessage('规则已更新');
      } else {
        await groupBuyRuleService.createRule(editRule);
        setToastMessage('规则已创建');
      }
      setIsEditing(false);
      loadRules();
    } catch (e: any) {
      setToastMessage(`保存失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-[1400px] mx-auto p-10 flex flex-col gap-8 text-left">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-[28px] font-black text-white tracking-tight">集采折扣规则</h1>
            <p className="text-white/40 text-[14px] font-medium">配置基于订单总额的动态优惠梯队。</p>
          </div>
        </div>
        <button 
          onClick={handleNew}
          className="px-8 py-3 bg-brand text-white rounded-2xl text-[15px] font-black flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-brand/20"
        >
          <Plus className="w-5 h-5" /> 新增规则
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full h-64 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-brand animate-spin" />
          </div>
        ) : rules.length > 0 ? (
          rules.map((rule) => (
            <div key={rule.id} className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-8 group relative overflow-hidden flex flex-col">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-[40px]" />
               
               <div className="flex items-start justify-between mb-6 relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                         rule.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                       }`}>
                         {rule.status === 'active' ? '启用中' : '已停用'}
                       </span>
                    </div>
                    <h3 className="text-[20px] font-black text-white">{rule.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[32px] font-black text-brand">{rule.discount_rate}%</p>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">OFF</p>
                  </div>
               </div>

               <div className="space-y-4 mb-8 relative z-10 flex-1">
                  <div className="flex items-center gap-3 text-[14px] text-white/70 bg-white/5 p-4 rounded-2xl">
                     <Wallet className="w-5 h-5 text-brand" />
                     <div>
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">最低采购金额</p>
                        <p className="font-black text-white">¥{rule.min_order_amount.toLocaleString()}</p>
                     </div>
                  </div>
                  <p className="text-[13px] text-white/50 leading-relaxed min-h-[40px]">
                    {rule.description || '暂无描述'}
                  </p>
               </div>

               <div className="flex items-center gap-2 relative z-10">
                 <button 
                  onClick={() => handleEdit(rule)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white text-[13px] font-black rounded-xl transition-all flex items-center justify-center gap-2"
                 >
                   <Edit className="w-4 h-4" /> 编辑规则
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
               <p className="text-white/40 font-bold">暂无折扣规则</p>
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
              className="relative w-full max-w-[500px] bg-zinc-900 border border-white/10 rounded-[48px] shadow-2xl overflow-hidden flex flex-col text-left"
            >
              <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-[20px] font-black text-white">折扣规则配置</h2>
                <button onClick={() => setIsEditing(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-full transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-10 space-y-6 text-left">
                <div className="space-y-2 text-left">
                  <label className="text-[11px] font-black text-white/30 uppercase tracking-widest pl-1">规则名称</label>
                  <input 
                   type="text" 
                   required
                   value={editRule?.name || ''} 
                   onChange={e => setEditRule(prev => ({ ...prev, name: e.target.value }))}
                   className="w-full bg-white/5 border border-white/5 h-12 px-4 rounded-xl text-[14px] font-bold text-white outline-none focus:border-brand/40" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-6 text-left">
                   <div className="space-y-2">
                     <label className="text-[11px] font-black text-white/30 uppercase tracking-widest pl-1">最低订单金额 (RMB)</label>
                     <input 
                      type="number" 
                      required
                      value={editRule?.min_order_amount || 0} 
                      onChange={e => setEditRule(prev => ({ ...prev, min_order_amount: Number(e.target.value) }))}
                      className="w-full bg-white/5 border border-white/5 h-12 px-4 rounded-xl text-[14px] font-bold text-white outline-none focus:border-brand/40" 
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[11px] font-black text-white/30 uppercase tracking-widest pl-1">折扣比例 (%)</label>
                     <input 
                      type="number" 
                      required
                      step="0.1"
                      value={editRule?.discount_rate || 0} 
                      onChange={e => setEditRule(prev => ({ ...prev, discount_rate: Number(e.target.value) }))}
                      className="w-full bg-white/5 border border-white/5 h-12 px-4 rounded-xl text-[14px] font-bold text-white outline-none focus:border-brand/40" 
                     />
                   </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-[11px] font-black text-white/30 uppercase tracking-widest pl-1">描述</label>
                  <textarea 
                   value={editRule?.description || ''} 
                   onChange={e => setEditRule(prev => ({ ...prev, description: e.target.value }))}
                   className="w-full bg-white/5 border border-white/5 p-4 rounded-xl text-[14px] font-medium text-white/70 outline-none h-24 resize-none focus:border-brand/40" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-6 text-left">
                   <div className="space-y-2">
                     <label className="text-[11px] font-black text-white/30 uppercase tracking-widest pl-1">状态</label>
                     <select 
                      value={editRule?.status || 'active'} 
                      onChange={e => setEditRule(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full bg-white/5 border border-white/5 h-12 px-4 rounded-xl text-[14px] font-bold text-white outline-none focus:border-brand/40"
                     >
                       <option value="active">启用</option>
                       <option value="inactive">停用</option>
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[11px] font-black text-white/30 uppercase tracking-widest pl-1">排序权重</label>
                     <input 
                      type="number" 
                      value={editRule?.sort_order || 0} 
                      onChange={e => setEditRule(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                      className="w-full bg-white/5 border border-white/5 h-12 px-4 rounded-xl text-[14px] font-bold text-white outline-none focus:border-brand/40" 
                     />
                   </div>
                </div>

                <div className="pt-6 flex gap-4 text-left">
                  <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white text-[14px] font-black rounded-2xl transition-all">取消</button>
                  <button type="submit" className="flex-[2] py-4 bg-brand text-white text-[14px] font-black rounded-2xl transition-all shadow-lg shadow-brand/20 flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" /> 保存规则
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
