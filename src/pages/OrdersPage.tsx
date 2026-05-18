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
      'consulting': '方案顾问沟通中',
      'proposal_confirmed': '方案已确认',
      'deposit_pending': '待支付定金',
      'deposit_paid': '定金已支付',
      'procurement_pending': '待库房排期',
      'procurement_started': '开始采购采购',
      'delivering': '物流配送中',
      'completed': '订单已完成',
      'cancelled': '已取消'
    };
    return map[status] || status;
  };

  if (loading) return <div className="min-h-screen pt-40 px-12 text-center text-white/40">加载数据中...</div>;

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-24 pb-40">
      <div className="max-w-7xl mx-auto px-6">
        <Breadcrumbs 
          isDark={true}
          items={[
            { name: '个人中心', path: '/profile' },
            { name: '我的订单' }
          ]} 
        />
        <header className="mb-16 text-left">
          <h1 className="text-[48px] font-black text-white mb-4 tracking-tight">我的方案订单</h1>
          <p className="text-[18px] text-white/40 font-medium">跟踪您的方案进度与物流状态</p>
        </header>

        {orders.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-center bg-[#141414] border border-dashed border-white/10 rounded-[64px]">
             <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-white/10 mb-8">
                <ShoppingBag className="w-12 h-12" />
             </div>
             <h3 className="text-[24px] font-black text-white mb-4">还没有提交过方案需求</h3>
             <p className="text-white/20 text-[16px] max-w-md mx-auto mb-12">
                快去把心仪的产品加入方案，提交给您的专属顾问吧。
             </p>
             <button 
               onClick={() => navigate('/products')}
               className="px-12 py-5 bg-brand text-white rounded-full font-black text-[16px] shadow-2xl hover:scale-105 transition-all"
             >
                前往选品库
             </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="bg-[#141414] border border-white/5 rounded-[40px] p-10 hover:border-white/20 transition-all cursor-pointer group shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[100px] pointer-events-none" />
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-brand group-hover:text-white transition-all shadow-xl">
                         <Package className="w-8 h-8" />
                      </div>
                      <div>
                         <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-[20px] font-black text-white">{order.order_no}</h3>
                            <span className="px-3 py-1 bg-brand/10 text-brand text-[11px] font-black uppercase tracking-wider rounded-full border border-brand/20">
                               {getStatusLabel(order.status)}
                            </span>
                         </div>
                         <p className="text-[13px] text-white/20 font-bold">
                           创建于 {new Date(order.created_at).toLocaleString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                         </p>
                      </div>
                   </div>

                   <div className="flex items-center gap-12">
                      <div className="text-right">
                         <p className="text-[11px] font-black text-white/20 uppercase tracking-widest mb-1">付款状态</p>
                         <p className={`text-[15px] font-bold ${order.payment_status === 'paid' ? 'text-emerald-500' : 'text-white/60'}`}>
                           {order.payment_status === 'unpaid' ? '未支付' : order.payment_status === 'deposit_paid' ? '已收定金' : '已支付'}
                         </p>
                      </div>
                      <div className="text-right">
                         <p className="text-[11px] font-black text-white/20 uppercase tracking-widest mb-1">订单金额</p>
                         <p className="text-[24px] font-black text-brand">¥{pricing.formatCurrency(order.grand_total || 0)}</p>
                      </div>
                      <ChevronRight className="w-8 h-8 text-white/5 group-hover:text-brand transition-colors" />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-white/5">
                   <div className="flex items-center gap-4 text-white/40">
                      <User className="w-5 h-5" />
                      <span className="text-[14px] font-bold">{order.customer_name}</span>
                   </div>
                   <div className="flex items-center gap-4 text-white/40">
                      <MapPin className="w-5 h-5" />
                      <span className="text-[14px] font-bold">{order.customer_city}</span>
                   </div>
                   <div className="flex items-center gap-4 text-white/40">
                      <Clock className="w-5 h-5" />
                      <span className="text-[14px] font-bold">预计 24 小时内有顾问介入</span>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
