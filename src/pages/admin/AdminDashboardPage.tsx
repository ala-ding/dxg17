import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Users, ShoppingBag, ListTodo, Layout, TrendingUp, 
  ArrowUpRight, Clock, CheckCircle2, AlertCircle, ShoppingCart,
  ArrowLeft
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { authService } from '../../services/authService';
import { leadService } from '../../services/leadService';
import { orderService } from '../../services/orderService';
import { planService } from '../../services/planService';
import { pricing } from '../../utils/pricing';
import Breadcrumbs from '../../components/Breadcrumbs';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    leadsCount: 0,
    ordersCount: 0,
    plansCount: 0,
    gmv: 0,
    pendingDeposits: 0,
    todayLeads: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
    loadStats();
  }, []);

  const checkAdmin = async () => {
    const isAdmin = await authService.isAdmin();
    if (!isAdmin && isSupabaseConfigured) {
      // navigate('/');
    }
  };

  const loadStats = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { count: leadsCount } = await supabase.from('leads').select('*', { count: 'exact', head: true });
        const { count: plansCount } = await supabase.from('plans').select('*', { count: 'exact', head: true });
        const { data: orders } = await supabase.from('orders').select('grand_total, status');
        
        const gmv = orders?.reduce((sum, o) => sum + Number(o.grand_total), 0) || 0;
        const pendingDeposits = orders?.filter(o => o.status === 'lead_submitted').length || 0;
        
        setStats({
          leadsCount: leadsCount || 0,
          ordersCount: orders?.length || 0,
          plansCount: plansCount || 0,
          gmv,
          pendingDeposits,
          todayLeads: 2 // Mock today
        });
      } else {
        const localLeads = JSON.parse(localStorage.getItem('dxg_leads') || '[]');
        const localOrders = JSON.parse(localStorage.getItem('dxg_orders') || '[]');
        const localPlans = JSON.parse(localStorage.getItem('user_plans') || '[]');
        
        setStats({
          leadsCount: localLeads.length,
          ordersCount: localOrders.length,
          plansCount: localPlans.length,
          gmv: localOrders.reduce((sum: number, o: any) => sum + (o.grand_total || 0), 0),
          pendingDeposits: localOrders.filter((o: any) => o.status === 'lead_submitted').length,
          todayLeads: localLeads.length > 0 ? 1 : 0
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const CARDS = [
    { label: '累计线索 (Leads)', value: stats.leadsCount, icon: <Users className="w-6 h-6" />, color: 'bg-blue-500/10 text-blue-500', path: '/admin/leads' },
    { label: '方案订单 (Orders)', value: stats.ordersCount, icon: <ShoppingCart className="w-6 h-6" />, color: 'bg-brand/10 text-brand', path: '/admin/orders' },
    { label: '预估成交总额 (GMV)', value: `¥${pricing.formatCurrency(stats.gmv)}`, icon: <TrendingUp className="w-6 h-6" />, color: 'bg-emerald-500/10 text-emerald-500', path: '/admin/orders' },
    { label: '生成方案总计', value: stats.plansCount, icon: <Layout className="w-6 h-6" />, color: 'bg-purple-500/10 text-purple-500', path: '/admin/plans' }
  ];

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-24 pb-40">
      <div className="max-w-7xl mx-auto px-6">
        <Breadcrumbs 
          isDark={true}
          items={[
            { name: '个人中心', path: '/profile' },
            { name: '管理后台' }
          ]} 
        />
        <div className="mb-12 text-left">
           <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors font-bold text-[14px]">
             <ArrowLeft className="w-5 h-5" /> 返回个人中心
           </button>
        </div>
        <header className="mb-16 flex justify-between items-end">
           <div className="text-left">
              <h1 className="text-[48px] font-black text-white mb-4 tracking-tight">管理后台</h1>
              <p className="text-[18px] text-white/40 font-medium italic">Dashboard / 实时数据中心</p>
           </div>
           {!isSupabaseConfigured && (
             <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span className="text-[14px] font-bold text-white/60">当前处于 Local Fallback 演示模式</span>
             </div>
           )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
           {CARDS.map(card => (
             <motion.div 
               key={card.label}
               whileHover={{ y: -5 }}
               onClick={() => navigate(card.path)}
               className="bg-[#141414] border border-white/5 rounded-[40px] p-8 cursor-pointer group transition-all hover:bg-white/[0.04]"
             >
                <div className={`w-14 h-14 rounded-2xl ${card.color} flex items-center justify-center mb-10 group-hover:scale-110 transition-transform`}>
                   {card.icon}
                </div>
                <p className="text-[12px] font-black text-white/20 uppercase tracking-widest mb-2">{card.label}</p>
                <h3 className="text-[28px] font-black text-white">{card.value}</h3>
             </motion.div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-left">
           <div className="lg:col-span-2 space-y-8">
              <div className="bg-[#141414] border border-white/5 rounded-[48px] p-12">
                 <div className="flex items-center justify-between mb-12">
                    <h3 className="text-[20px] font-black text-white flex items-center gap-3">
                       <ListTodo className="w-6 h-6 text-brand" /> 待办事项
                    </h3>
                 </div>
                 <div className="space-y-6">
                    {stats.pendingDeposits > 0 && (
                      <div className="flex items-center justify-between p-6 bg-brand/5 border border-brand/20 rounded-3xl">
                         <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center">
                               <Clock className="w-6 h-6" />
                            </div>
                            <div>
                               <p className="text-[16px] font-black text-white">您有 {stats.pendingDeposits} 个待确认订单需求</p>
                               <p className="text-[13px] text-brand/60 font-bold">请尽快联系客户核对产品库存</p>
                            </div>
                         </div>
                         <button onClick={() => navigate('/admin/orders')} className="px-6 py-2.5 bg-brand text-white rounded-xl text-[13px] font-black">前往处理</button>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-3xl opacity-50">
                       <div className="flex items-center gap-6">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 text-white/20 flex items-center justify-center">
                             <TrendingUp className="w-6 h-6" />
                          </div>
                          <div>
                             <p className="text-[16px] font-black text-white">月度业绩目标完成度 86%</p>
                             <p className="text-[13px] text-white/20 font-bold">目前距离 100 万 GMV 目标还差 14 万</p>
                          </div>
                       </div>
                       <CheckCircle2 className="w-6 h-6 text-white/10" />
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              <div className="bg-[#141414] border border-white/5 rounded-[48px] p-12">
                 <h3 className="text-[20px] font-black text-white mb-10">快速入口</h3>
                 <div className="grid grid-cols-1 gap-4">
                    {[
                      { label: '产品库管理', path: '/admin/products' },
                      { label: '线索公海', path: '/admin/leads' },
                      { label: '订单管理', path: '/admin/orders' },
                      { label: '查看所有方案', path: '/admin/plans' }
                    ].map(link => (
                      <button 
                        key={link.path}
                        onClick={() => navigate(link.path)}
                        className="w-full p-6 text-left bg-white/5 border border-white/10 rounded-3xl text-white font-black hover:bg-brand hover:border-brand transition-all flex items-center justify-between"
                      >
                         {link.label}
                         <ArrowUpRight className="w-5 h-5 opacity-20" />
                      </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}
