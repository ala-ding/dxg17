import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ShoppingBag, ChevronRight, Package, Clock, ShieldCheck, 
  MapPin, User, ArrowRight, LayoutGrid, Search, Filter 
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { analyticsService } from '../services/analyticsService';
import { pricing } from '../utils/pricing';
import Breadcrumbs from '../components/Breadcrumbs';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    analyticsService.track('view_orders');
  }, []);

  const loadOrders = async () => {
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      'lead_submitted': '需求已提交',
      'consulting': '沟通中',
      'proposal_confirmed': '方案已确认',
      'deposit_pending': '待支付定金',
      'deposit_paid': '定金已付',
      'procurement_started': '开始采购',
      'delivering': '配送中',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return map[status] || status;
  };

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white/30 font-black">加载订单中...</div>;

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-24 md:pt-32 pb-40 text-left overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-4 hidden md:block">
           <Breadcrumbs isDark items={[{ name: '个人中心', path: '/profile' }, { name: '我的订单' }]} />
        </div>
        <header className="mb-10 md:mb-16">
          <h1 className="text-[32px] md:text-[42px] font-black text-white mb-3 tracking-tight">我的方案订单</h1>
          <p className="text-[14px] md:text-[18px] text-white/40 font-medium">跟进你的装修方案落地进度</p>
        </header>

        {orders.length === 0 ? (
          <div className="py-24 md:py-32 flex flex-col items-center justify-center text-center bg-white/5 border border-dashed border-white/10 rounded-[40px] md:rounded-[64px] px-6">
             <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/5 flex items-center justify-center text-white/10 mb-8"><ShoppingBag className="w-8 h-8 md:w-12 md:h-12" /></div>
             <h3 className="text-[20px] md:text-[24px] font-black text-white mb-3">暂无方案订单</h3>
             <p className="text-white/20 text-[14px] md:text-[16px] max-w-sm mx-auto mb-10 italic">快去选品并提交您的采购方案吧。</p>
             <button onClick={() => navigate('/products')} className="px-10 py-4 bg-brand text-white rounded-full font-black text-[15px] shadow-2xl active:scale-95 transition-all">前往选品库</button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <motion.div 
                key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="bg-[#141414] border border-white/5 rounded-[28px] md:rounded-[40px] p-6 md:p-10 hover:border-white/20 transition-all cursor-pointer group shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[80px] pointer-events-none" />
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8 md:mb-10 relative z-10">
                   <div className="flex items-start md:items-center gap-4 md:gap-6">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-brand group-hover:text-white transition-all shadow-xl shrink-0"><Package className="w-6 h-6 md:w-8 md:h-8" /></div>
                      <div className="flex-1">
                         <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h3 className="text-[17px] md:text-[20px] font-black text-white">{order.order_no}</h3>
                            <span className="px-2.5 py-0.5 bg-brand/10 text-brand text-[10px] md:text-[11px] font-black uppercase tracking-wider rounded-md border border-brand/20 whitespace-nowrap">{getStatusLabel(order.status)}</span>
                         </div>
                         <p className="text-[12px] md:text-[13px] text-white/20 font-bold">提交于 {new Date(order.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
                      </div>
                   </div>
                   <div className="flex items-center justify-between lg:justify-end gap-6 md:gap-12 border-t lg:border-t-0 border-white/5 pt-6 lg:pt-0">
                      <div className="text-left lg:text-right">
                         <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">订单金额</p>
                         <p className="text-[20px] md:text-[24px] font-black text-brand italic">¥{pricing.formatCurrency(order.grand_total || 0)}</p>
                      </div>
                      <ChevronRight className="w-6 h-6 text-white/10 group-hover:text-brand transition-all group-hover:translate-x-1" />
                   </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-6 md:pt-10 border-t border-white/5 relative z-10">
                   <div className="flex items-center gap-3 text-white/30"><User className="w-4 h-4 shrink-0" /><span className="text-[13px] font-bold truncate">{order.customer_name}</span></div>
                   <div className="flex items-center gap-3 text-white/30"><MapPin className="w-4 h-4 shrink-0" /><span className="text-[13px] font-bold truncate">{order.customer_city}</span></div>
                   <div className="flex items-center gap-3 text-white/30"><Clock className="w-4 h-4 shrink-0" /><span className="text-[13px] font-bold line-clamp-1 italic">正在分配方案顾问...</span></div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
