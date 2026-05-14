import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ShoppingCart, ArrowLeft, Package, Clock, ShieldCheck, 
  Search, Filter, ExternalLink, CreditCard, ChevronRight, Download,
  MoreHorizontal
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { orderService } from '../../services/orderService';
import { pricing } from '../../utils/pricing';
import Toast from '../../components/Toast';
import Breadcrumbs from '../../components/Breadcrumbs';

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        setOrders(data || []);
      } else {
        const local = JSON.parse(localStorage.getItem('dxg_orders') || '[]');
        setOrders(local);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('orders').update({ status }).eq('id', id);
      } else {
        const local = JSON.parse(localStorage.getItem('dxg_orders') || '[]');
        const updated = local.map((o: any) => o.id === id ? { ...o, status } : o);
        localStorage.setItem('dxg_orders', JSON.stringify(updated));
      }
      setToastMessage('订单状态已更新');
      loadOrders();
    } catch (e) {
      setToastMessage('操作失败');
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      'lead_submitted': '需求提交',
      'consulting': '顾问介入',
      'proposal_confirmed': '方案定稿',
      'deposit_pending': '待付定金',
      'deposit_paid': '定金已支付',
      'procurement_pending': '待采购',
      'procurement_started': '采购中',
      'delivering': '物流中',
      'completed': '完成',
      'cancelled': '取消'
    };
    return map[status] || status;
  };

  if (loading) return <div className="min-h-screen pt-40 px-12 text-center text-white/40">加载中...</div>;

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-24 pb-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <Breadcrumbs 
            isDark={true}
            items={[
              { name: '个人中心', path: '/profile' },
              { name: '管理后台', path: '/admin' },
              { name: '订单看板' }
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
            <h1 className="text-[42px] font-black text-white tracking-tight">订单流水看板</h1>
          </header>
          <div className="flex gap-4">
             <div className="relative group">
                <input 
                  type="text" 
                  placeholder="搜索订单号/手机" 
                  className="bg-white/5 border border-white/10 rounded-2xl px-12 py-3 text-white font-bold w-[300px] focus:border-brand outline-none transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 transition-colors" />
             </div>
             <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-black hover:bg-white/10 transition-all flex items-center gap-2">
                <Download className="w-5 h-5" /> 导出全部
             </button>
          </div>
        </div>

        <div className="bg-[#141414] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
           <table className="w-full text-left border-collapse">
              <thead className="bg-white/[0.02] border-b border-white/5">
                 <tr>
                    <th className="px-8 py-6 text-[12px] font-black text-white/20 uppercase tracking-widest">订单/客户</th>
                    <th className="px-8 py-6 text-[12px] font-black text-white/20 uppercase tracking-widest">总金额</th>
                    <th className="px-8 py-6 text-[12px] font-black text-white/20 uppercase tracking-widest">状态阶段</th>
                    <th className="px-8 py-6 text-[12px] font-black text-white/20 uppercase tracking-widest text-center">操作</th>
                 </tr>
              </thead>
              <tbody>
                 {orders.map(o => (
                   <tr key={o.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-all">
                      <td className="px-8 py-8">
                         <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40"><Package className="w-6 h-6" /></div>
                            <div>
                               <p className="text-[16px] font-black text-white group-hover:text-brand transition-colors">{o.order_no}</p>
                               <p className="text-[13px] text-white/40 font-bold">{o.customer_name} · {o.customer_phone}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-8">
                         <p className="text-[18px] font-black text-brand mb-1">¥{pricing.formatCurrency(o.grand_total)}</p>
                         <p className={`text-[11px] font-black uppercase tracking-widest ${o.payment_status === 'deposit_paid' ? 'text-emerald-500' : 'text-white/20'}`}>
                           {o.payment_status === 'unpaid' ? '未支付' : o.payment_status === 'deposit_paid' ? '已付定金' : '已付全款'}
                         </p>
                      </td>
                      <td className="px-8 py-8">
                         <div className="flex flex-col gap-2">
                           <span className="px-4 py-1 bg-white/5 border border-white/5 text-white/60 rounded-lg text-[11px] font-black uppercase tracking-wider inline-block w-fit">
                             {getStatusLabel(o.status)}
                           </span>
                           <div className="flex gap-1">
                             {[1,2,3,4,5].map(step => (
                               <div key={step} className={`h-1 w-6 rounded-full ${step <= (o.status === 'completed' ? 5 : 2) ? 'bg-brand' : 'bg-white/5'}`} />
                             ))}
                           </div>
                         </div>
                      </td>
                      <td className="px-8 py-8">
                         <div className="flex items-center justify-center gap-4">
                            <button onClick={() => navigate(`/orders/${o.id}`)} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/60 font-black text-[13px] hover:bg-white/10 transition-all">
                               查看详情
                            </button>
                            <div className="relative group">
                               <button className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl text-white/40 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all">
                                  <MoreHorizontal className="w-5 h-5" />
                               </button>
                               <div className="absolute right-0 top-12 w-[180px] bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-20">
                                  <button onClick={() => updateStatus(o.id, 'consulting')} className="w-full px-6 py-3 text-left text-[13px] font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all">标记：已沟通</button>
                                  <button onClick={() => updateStatus(o.id, 'proposal_confirmed')} className="w-full px-6 py-3 text-left text-[13px] font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all">标记：方案已确认</button>
                                  <button onClick={() => updateStatus(o.id, 'deposit_paid')} className="w-full px-6 py-3 text-left text-[13px] font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all">标记：已收定金</button>
                                  <div className="h-px bg-white/5 my-1" />
                                  <button onClick={() => updateStatus(o.id, 'cancelled')} className="w-full px-6 py-3 text-left text-[13px] font-bold text-red-400 hover:bg-red-400/10 transition-all">取消订单</button>
                               </div>
                            </div>
                         </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
           {orders.length === 0 && <div className="py-20 text-center text-white/20 font-bold">暂无销售订单</div>}
        </div>
      </div>
      <Toast 
        message={toastMessage} 
        onClear={() => setToastMessage(null)} 
      />
    </main>
  );
}
