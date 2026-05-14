import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Layout, ArrowLeft, Search, Filter, Sparkles, 
  CheckCircle2, ArrowRight, MoreHorizontal, User, Clock
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { planService } from '../../services/planService';
import { pricing } from '../../utils/pricing';
import Breadcrumbs from '../../components/Breadcrumbs';

export default function AdminPlansPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.from('plans').select('*').order('created_at', { ascending: false });
        setPlans(data || []);
      } else {
        const local = JSON.parse(localStorage.getItem('user_plans') || '[]');
        setPlans(local);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      'draft': '草稿',
      'in_progress': '进行中',
      'confirmed': '已确认',
      'ordered': '已下单',
      'archived': '已归档'
    };
    return map[status] || status;
  };

  if (loading) return <div className="min-h-screen pt-40 px-12 text-center text-white/40">加载中...</div>;

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-24 pb-40">
      <div className="max-w-7xl mx-auto px-6">
       <div className="flex items-center justify-between mb-8 text-left">
          <Breadcrumbs 
            isDark={true}
            items={[
              { name: '个人中心', path: '/profile' },
              { name: '管理后台', path: '/admin' },
              { name: '方案管理' }
            ]} 
          />
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors font-bold text-[14px]"
          >
            <ArrowLeft className="w-4 h-4" /> 返回管理中心
          </button>
        </div>
       <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <header className="text-left">
             <h1 className="text-[42px] font-black text-white tracking-tight">所有全屋方案</h1>
          </header>
          <div className="flex gap-4">
             <div className="relative group">
                <input 
                  type="text" 
                  placeholder="搜索方案/用户" 
                  className="bg-white/5 border border-white/10 rounded-2xl px-12 py-3 text-white font-bold w-[300px] focus:border-brand outline-none transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 transition-colors" />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {plans.map(plan => (
             <motion.div 
               key={plan.id}
               layout
               className="bg-[#141414] border border-white/5 rounded-[40px] p-8 text-left hover:border-white/20 transition-all group relative overflow-hidden"
             >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-[60px]" />
                
                <div className="flex items-center justify-between mb-8">
                   <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20">
                      <Sparkles className="w-6 h-6" />
                   </div>
                   <span className="px-3 py-1 bg-white/5 text-[11px] font-black uppercase tracking-wider text-white/40 rounded-full border border-white/10">
                      {getStatusLabel(plan.status)}
                   </span>
                </div>

                <h3 className="text-[20px] font-black text-white mb-2 leading-tight">{plan.name}</h3>
                <div className="flex items-center gap-4 mb-8">
                   <User className="w-4 h-4 text-white/20" />
                   <span className="text-[13px] text-white/40 font-bold">UID: {plan.user_id?.slice(0,8) || plan.anonymous_id?.slice(0,8)}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                   <div>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">风格</p>
                      <p className="text-[14px] font-bold text-white/60">{plan.style || '自动匹配'}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">预算范围</p>
                      <p className="text-[14px] font-bold text-white/60">{plan.budget_range || '未预留'}</p>
                   </div>
                   <div className="col-span-2 pt-2 border-t border-white/5 mt-2">
                       <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">方案预估总额</p>
                       <p className="text-[20px] font-black text-brand">¥{pricing.formatCurrency(plan.grand_total || 0)}</p>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-white/5">
                   <div className="flex items-center gap-2 text-[12px] font-bold text-white/20">
                      <Clock className="w-4 h-4" /> {new Date(plan.created_at).toLocaleDateString()}
                   </div>
                   <button 
                     onClick={() => navigate(`/match?id=${plan.id}`)}
                     className="text-[13px] font-black text-white/20 hover:text-white transition-colors flex items-center gap-1.5"
                   >
                     查看明细 <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
             </motion.div>
           ))}
        </div>
        {plans.length === 0 && <div className="py-20 text-center text-white/20 font-bold">暂无生成方案</div>}
      </div>
    </main>
  );
}
