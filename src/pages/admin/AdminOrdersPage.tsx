import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ShoppingCart, ArrowLeft, Package, Clock, ShieldCheck, Lock,
  Search, Filter, ExternalLink, CreditCard, ChevronRight, Download,
  MoreHorizontal, Zap, ArrowRight, RefreshCw
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { pricing } from '../../utils/pricing';
import Toast from '../../components/Toast';
import Breadcrumbs from '../../components/Breadcrumbs';

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        setOrders(data || []);
      } else {
        const local = JSON.parse(localStorage.getItem('dxg_orders') || '[]');
        setOrders(local);
      }
    } finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      if (isSupabaseConfigured && supabase) { await supabase.from('orders').update({ status }).eq('id', id); }
      else {
        const local = JSON.parse(localStorage.getItem('dxg_orders') || '[]');
        const updated = local.map((o: any) => o.id === id ? { ...o, status } : o);
        localStorage.setItem('dxg_orders', JSON.stringify(updated));
      }
      setToastMessage('订单状态已更新');
      loadOrders();
    } catch (e) { setToastMessage('操作失败'); }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      'lead_submitted': '需求提交', 'consulting': '顾问介入', 'proposal_confirmed': '方案定稿',
      'deposit_pending': '待付定金', 'deposit_paid': '定金已支付', 'procurement_pending': '待采购',
      'procurement_started': '采购中', 'delivering': '物流中', 'completed': '完成',
      'cancelled': '取消', 'paid': '已支付'
    };
    return map[status] || status;
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-24 md:pt-32 pb-40 overflow-x-hidden text-left">
      <div className="max-w-[1720px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <Breadcrumbs isDark={true} items={[{ name: '管理中心', path: '/admin' }, { name: '订单流水' }]} />
          <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-white/30 hover:text-white transition-colors font-bold text-[14px]"><ArrowLeft className="w-5 h-5" /> 返回看板</button>
        </div>

        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <header>
             <h1 className="text-[36px] md:text-[56px] font-black text-white italic tracking-tighter leading-none mb-4 uppercase">Sales Ledger</h1>
             <p className="text-[15px] md:text-[18px] text-white/30 font-medium italic max-w-xl">实时同步全球会员订阅与方案解锁订单，建立完整的软装交付履约链路。</p>
          </header>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
             <div className="relative group flex-1 sm:w-[320px]">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input type="text" placeholder="搜索订单号/手机" className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl pl-14 pr-6 text-white font-bold outline-none focus:ring-1 ring-brand transition-all" />
             </div>
             <button className="h-14 px-8 bg-white/5 border border-white/5 rounded-2xl text-white font-black hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <Download className="w-5 h-5" /> <span className="whitespace-nowrap">导出报表</span>
             </button>
          </div>
        </section>

        <section className="bg-[#141414] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl flex flex-col min-h-[400px]">
           <div className="overflow-x-auto no-scrollbar flex-1">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                 <thead className="bg-white/[0.02] border-b border-white/5">
                    <tr>
                       <th className="px-10 py-6 text-[11px] font-black text-white/20 uppercase tracking-[0.2em]">Order Detail</th>
                       <th className="px-10 py-6 text-[11px] font-black text-white/20 uppercase tracking-[0.2em]">Financials</th>
                       <th className="px-10 py-6 text-[11px] font-black text-white/20 uppercase tracking-[0.2em]">Execution Status</th>
                       <th className="px-10 py-6 text-right text-[11px] font-black text-white/20 uppercase tracking-[0.2em]">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {loading ? <tr><td colSpan={4} className="py-40 text-center"><RefreshCw className="w-10 h-10 text-white/5 animate-spin mx-auto" /></td></tr> : orders.map(o => (
                      <tr key={o.id} className="hover:bg-white/[0.01] transition-all group">
                         <td className="px-10 py-8">
                            <div className="flex items-center gap-5">
                               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 ${o.type === 'membership' ? 'bg-brand/10 text-brand' : 'bg-blue-500/10 text-blue-500'}`}>
                                  {o.type === 'membership' ? <ShieldCheck className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
                               </div>
                               <div>
                                  <p className="text-[16px] font-black text-white group-hover:text-brand transition-colors mb-0.5">{o.order_no}</p>
                                  <div className="flex items-center gap-2 mb-1.5"><span className="text-[10px] font-black text-brand uppercase tracking-widest">{o.type === 'membership' ? '会员下单' : '清单解锁'}</span><span className="w-1 h-1 rounded-full bg-white/10" /><span className="text-[10px] text-white/40 font-bold uppercase">{o.customer_name || '访客用户'}</span></div>
                                  <p className="text-[13px] text-white/20 font-medium italic line-clamp-1">{o.title}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-10 py-8">
                            <p className="text-[20px] font-black text-brand italic mb-1">¥{pricing.formatCurrency(o.amount || 0)}</p>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${o.payment_status === 'paid' ? 'bg-brand/10 text-brand' : 'bg-white/5 text-white/20'}`}>{o.payment_status === 'paid' ? 'Paid' : 'Pending'}</span>
                         </td>
                         <td className="px-10 py-8">
                            <div className="flex flex-col gap-3">
                               <span className="px-4 py-1.5 h-8 bg-white/5 border border-white/5 rounded-xl text-[11px] font-black text-white/60 uppercase tracking-widest flex items-center justify-center w-fit italic">{getStatusLabel(o.status)}</span>
                               <div className="flex gap-1.5">{[1,2,3,4,5].map(s => <div key={s} className={`h-1 flex-1 rounded-full ${s <= (o.status === 'completed' ? 5 : 2) ? 'bg-brand shadow-[0_0_10px_rgba(0,201,190,0.4)]' : 'bg-white/5'}`} />)}</div>
                            </div>
                         </td>
                         <td className="px-10 py-8 text-right">
                            <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                               <button onClick={() => navigate(`/orders/${o.id}`)} className="h-10 px-6 bg-white/5 border border-white/10 rounded-xl text-white/60 font-black text-[12px] hover:text-white hover:bg-white/10 transition-all underline decoration-brand/20 underline-offset-4">查看</button>
                               <div className="relative group/menu">
                                  <button className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center text-white/20"><MoreHorizontal className="w-5 h-5" /></button>
                                  <div className="absolute right-0 top-12 w-[200px] bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl py-2 opacity-0 scale-95 origin-top-right group-hover/menu:opacity-100 group-hover/menu:scale-100 transition-all z-20 pointer-events-none group-hover/menu:pointer-events-auto">
                                     {['consulting', 'proposal_confirmed', 'completed'].map(s => <button key={s} onClick={() => updateStatus(o.id, s)} className="w-full px-6 py-3 text-left text-[13px] font-black text-white/40 hover:text-brand hover:bg-brand/5 transition-all">标记：{getStatusLabel(s)}</button>)}
                                  </div>
                               </div>
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           {!loading && orders.length === 0 && <div className="py-40 text-center"><p className="text-[14px] font-black text-white/10 italic">EMPTY LEDGER</p></div>}
        </section>
      </div>
      <Toast message={toastMessage} onClear={() => setToastMessage(null)} />
    </main>
  );
}
