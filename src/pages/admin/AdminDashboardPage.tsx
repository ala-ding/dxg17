import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Users, ShoppingBag, ListTodo, Layout, TrendingUp, 
  ArrowUpRight, Clock, CheckCircle2, AlertCircle, ShoppingCart,
  ArrowLeft, Activity, Target
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { authService } from '../../services/authService';
import { pricing } from '../../utils/pricing';
import Breadcrumbs from '../../components/Breadcrumbs';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    leadsCount: 0, ordersCount: 0, plansCount: 0,
    gmv: 0, pendingDeposits: 0, todayLeads: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { count: leadsCount } = await supabase.from('leads').select('*', { count: 'exact', head: true });
        const { count: plansCount } = await supabase.from('plans').select('*', { count: 'exact', head: true });
        const { data: orders } = await supabase.from('orders').select('grand_total, status');
        setStats({ leadsCount: leadsCount || 0, ordersCount: orders?.length || 0, plansCount: plansCount || 0, gmv: orders?.reduce((sum, o) => sum + Number(o.grand_total), 0) || 0, pendingDeposits: orders?.filter(o => o.status === 'lead_submitted').length || 0, todayLeads: 2 });
      } else {
        const localLeads = JSON.parse(localStorage.getItem('dxg_leads') || '[]');
        const localOrders = JSON.parse(localStorage.getItem('dxg_orders') || '[]');
        const localPlans = JSON.parse(localStorage.getItem('user_plans') || '[]');
        setStats({ leadsCount: localLeads.length, ordersCount: localOrders.length, plansCount: localPlans.length, gmv: localOrders.reduce((sum: number, o: any) => sum + (o.grand_total || 0), 0), pendingDeposits: localOrders.filter((o: any) => o.status === 'lead_submitted').length, todayLeads: localLeads.length > 0 ? 1 : 0 });
      }
    } finally { setLoading(false); }
  };

  const CARDS = [
    { label: '线索公海', value: stats.leadsCount, icon: <Users className="w-6 h-6" />, color: 'bg-blue-500/10 text-blue-500', path: '/admin/leads' },
    { label: '流水看板', value: stats.ordersCount, icon: <ShoppingCart className="w-6 h-6" />, color: 'bg-brand/10 text-brand', path: '/admin/orders' },
    { label: '总成交 GMV', value: `¥${pricing.formatCurrency(stats.gmv)}`, icon: <TrendingUp className="w-6 h-6" />, color: 'bg-emerald-500/10 text-emerald-500', path: '/admin/orders' },
    { label: '生成方案', value: stats.plansCount, icon: <Layout className="w-6 h-6" />, color: 'bg-purple-500/10 text-purple-500', path: '/admin/plans' }
  ];

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-24 md:pt-32 pb-40 overflow-x-hidden text-left">
      <div className="max-w-[1720px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <Breadcrumbs isDark={true} items={[{ name: '管理中心' }]} />
            <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-white/30 hover:text-white transition-colors font-bold text-[14px]"><ArrowLeft className="w-4 h-4" /> 返回个人中心</button>
        </div>

        <header className="mb-16 md:mb-20 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
           <div>
              <h1 className="text-[40px] md:text-[64px] font-black text-white italic tracking-tighter leading-none mb-4 uppercase">Control Panel</h1>
              <p className="text-[15px] md:text-[18px] text-white/30 font-medium italic max-w-xl">实时监控全平台交付链路，从线索获取、方案生成到最终履约的每一次交互。</p>
           </div>
           {!isSupabaseConfigured && (
             <div className="px-6 py-3 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3 w-full lg:w-auto">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-[14px] font-black text-white/60">Local Sync Mode (DEMO)</span>
             </div>
           )}
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16 md:mb-24">
           {CARDS.map(card => (
             <motion.div key={card.label} onClick={() => navigate(card.path)} className="bg-[#111] border border-white/5 rounded-[40px] p-8 cursor-pointer group hover:bg-[#141414] transition-all">
                <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center mb-10 group-hover:scale-110 transition-transform`}>{card.icon}</div>
                <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">{card.label}</p>
                <h3 className="text-[24px] md:text-[32px] font-black text-white italic truncate">{card.value}</h3>
             </motion.div>
           ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
           <div className="lg:col-span-2 space-y-6 md:space-y-8">
              <div className="bg-[#111] border border-white/5 rounded-[40px] md:rounded-[64px] p-8 md:p-14">
                 <div className="flex items-center gap-3 mb-12"><Target className="w-6 h-6 text-brand" /><h3 className="text-[20px] md:text-[24px] font-black text-white italic uppercase">Operational Tasks</h3></div>
                 <div className="space-y-6">
                    {stats.pendingDeposits > 0 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between p-8 bg-brand/5 border border-brand/20 rounded-[32px] gap-6 text-center sm:text-left">
                         <div className="flex items-center gap-6"><div className="w-14 h-14 bg-brand text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-brand/20"><Clock className="w-7 h-7" /></div><div><p className="text-[16px] md:text-[18px] font-black text-white italic">有 {stats.pendingDeposits} 个未确认定金订单</p><p className="text-[13px] text-brand/60 font-bold">请立即介入并核实库存与物流费用</p></div></div>
                         <button onClick={() => navigate('/admin/orders')} className="w-full sm:w-auto px-8 h-12 bg-brand text-white rounded-xl text-[14px] font-black shadow-xl active:scale-95 transition-all">前往跟进</button>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-8 bg-white/5 border border-white/5 rounded-[32px] opacity-40 grayscale">
                       <div className="flex items-center gap-6"><div className="w-14 h-14 bg-white/5 text-white/40 rounded-2xl flex items-center justify-center shrink-0"><Activity className="w-7 h-7" /></div><div><p className="text-[16px] md:text-[18px] font-black text-white italic">月度成交目标完成度 86%</p><p className="text-[13px] text-white/20 font-bold">距离 1,000,000 GMV 目标还剩 14 万</p></div></div>
                       <CheckCircle2 className="hidden sm:block w-7 h-7 text-white/10" />
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-[#111] border border-white/5 rounded-[40px] md:rounded-[64px] p-8 md:p-14">
              <h3 className="text-[20px] md:text-[24px] font-black text-white italic uppercase mb-10 text-center lg:text-left">Quick Access</h3>
              <div className="grid grid-cols-1 gap-3">
                 {[
                   { label: '产品库管理', path: '/admin/products' },
                   { label: '线索公海', path: '/admin/leads' },
                   { label: '全部方案', path: '/admin/plans' },
                   { label: '集采规则', path: '/admin/group-buy' }
                 ].map(link => (
                   <button key={link.path} onClick={() => navigate(link.path)} className="w-full h-16 px-8 bg-white/5 border border-white/5 rounded-2xl md:rounded-3xl flex items-center justify-between group transition-all hover:bg-brand hover:border-brand">
                      <span className="text-[15px] font-black text-white group-hover:text-white transition-colors">{link.label}</span>
                      <ArrowUpRight className="w-5 h-5 opacity-20 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                   </button>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}
