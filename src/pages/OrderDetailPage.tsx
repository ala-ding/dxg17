import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Package, Clock, ShieldCheck, MapPin, User, 
  CheckCircle2, AlertCircle, ShoppingBag, Truck, Share2, Printer, 
  CreditCard, MessageSquare, Sparkles, ChevronRight
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { orderService } from '../services/orderService';
import { analyticsService } from '../services/analyticsService';
import { pricing } from '../utils/pricing';
import Toast from '../components/Toast';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadOrder();
      analyticsService.track('view_order_detail', { orderId: id });
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      const data = await orderService.getOrderById(id!);
      setOrder(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    try {
      setIsPaying(true);
      await orderService.simulateDepositPaid(id!);
      await loadOrder();
      analyticsService.track('simulate_deposit_paid', { orderId: id });
      setToastMessage('模拟定金支付成功！');
    } catch (error) {
       setToastMessage('支付失败，请重试');
    } finally {
      setIsPaying(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      'lead_submitted': '需求已提交',
      'consulting': '顾问介入中',
      'proposal_confirmed': '方案已确认',
      'deposit_pending': '待付定金',
      'deposit_paid': '定金已付',
      'procurement_started': '开始采购',
      'delivering': '配送中',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return map[status] || status;
  };

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white/30 font-black">正在加载订单...</div>;
  if (!order) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white/30 font-black">订单未找到</div>;

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-24 md:pt-32 pb-40 text-left overflow-x-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="mb-8 hidden md:block">
           <Breadcrumbs isDark items={[{ name: '个人中心', path: '/profile' }, { name: '我的订单', path: '/orders' }, { name: order.order_no }]} />
        </div>
        <div className="flex items-center justify-between mb-8 md:mb-12">
           <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[14px] md:text-[16px] font-black"><ArrowLeft className="w-5 h-5" /> 返回列表</button>
           <div className="flex items-center gap-3">
              <button onClick={() => window.print()} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 text-white/30 flex items-center justify-center hover:bg-white/10 transition-all"><Printer className="w-5 h-5" /></button>
              <button className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 text-white/30 flex items-center justify-center hover:bg-white/10 transition-all"><Share2 className="w-5 h-5" /></button>
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 md:gap-16">
           <div className="flex-1 space-y-10">
              <div className="bg-[#141414] border border-white/5 rounded-[32px] md:rounded-[48px] p-6 md:p-12 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[80px] pointer-events-none" />
                 <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10 md:mb-12 relative z-10">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-[28px] md:rounded-[32px] bg-brand text-white flex items-center justify-center shadow-2xl shadow-brand/20"><Package className="w-8 h-8 md:w-10 md:h-10" /></div>
                    <div>
                       <div className="flex flex-wrap items-center gap-4 mb-2">
                          <h2 className="text-[28px] md:text-[32px] font-black text-white leading-tight">{getStatusLabel(order.status)}</h2>
                          <span className="px-3 py-1 bg-brand/10 text-brand text-[10px] md:text-[11px] font-black uppercase tracking-widest rounded-md border border-brand/20">{order.order_no}</span>
                       </div>
                       <p className="text-white/40 text-[14px] md:text-[16px] font-medium leading-relaxed italic">方案顾问正在复核清单并安排厂家排期。</p>
                    </div>
                 </div>

                 {/* Stepper */}
                 <div className="flex items-center justify-between px-2 relative overflow-x-auto no-scrollbar pb-2">
                    <div className="absolute top-[20px] left-8 right-8 h-[2px] bg-white/5 hidden md:block" />
                    {[
                      { label: '提交', done: true },
                      { label: '介入', done: order.status !== 'lead_submitted' },
                      { label: '定稿', done: ['proposal_confirmed', 'deposit_pending', 'deposit_paid'].includes(order.status) },
                      { label: '发货', done: ['procurement_started', 'delivering', 'completed'].includes(order.status) }
                    ].map((step, i) => (
                      <div key={i} className="flex flex-col items-center gap-3 relative z-10 min-w-[70px]">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${step.done ? 'bg-brand text-white' : 'bg-white/5 text-white/20'}`}>
                            {step.done ? <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" /> : <Clock className="w-5 h-5 md:w-5 md:h-5 text-white/10" />}
                         </div>
                         <span className={`text-[11px] md:text-[12px] font-black tracking-wide ${step.done ? 'text-white' : 'text-white/20'}`}>{step.label}</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-[#141414] border border-white/5 rounded-[32px] md:rounded-[48px] p-6 md:p-12 shadow-2xl">
                 <h3 className="text-[18px] md:text-[20px] font-black text-white mb-8 md:mb-10 flex items-center gap-3"><ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-brand" /> 方案选购清单</h3>
                 <div className="space-y-4 md:space-y-6">
                    {order.items?.length > 0 ? order.items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4 md:gap-8 p-4 md:p-6 bg-white/[0.02] border border-white/5 rounded-2xl md:rounded-3xl group">
                         <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-xl md:rounded-2xl p-2 shrink-0 flex items-center justify-center border border-white/5 overflow-hidden"><img src={item.product_snapshot?.image || null} className="w-full h-full object-contain" alt="" /></div>
                         <div className="flex-1 text-left min-w-0">
                            <div className="flex flex-col md:flex-row md:justify-between mb-1 md:mb-2 gap-1">
                               <h4 className="text-[15px] md:text-[18px] font-black text-white group-hover:text-brand transition-colors truncate">{item.name}</h4>
                               <span className="text-[14px] md:text-[16px] font-black text-white italic">¥{pricing.formatCurrency(item.subtotal)}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                               <span className="text-[10px] md:text-[11px] font-black text-white/20 uppercase tracking-widest">{item.category}</span>
                               <span className="text-[12px] text-white/10 font-bold whitespace-nowrap">¥{pricing.formatCurrency(item.unit_price)} × {item.quantity}</span>
                            </div>
                         </div>
                      </div>
                    )) : (
                      <div className="py-12 md:py-20 text-center text-white/10 border border-dashed border-white/5 rounded-[32px] font-bold">顾问正在配单中...</div>
                    )}
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                 <div className="bg-[#141414] border border-white/5 rounded-[32px] p-8 md:p-10 space-y-6">
                    <h4 className="text-[11px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">联系与地址</h4>
                    <div className="space-y-5">
                       <div className="flex items-start gap-4">
                          <User className="w-5 h-5 text-white/20 shrink-0 mt-0.5" />
                          <div><p className="text-[15px] font-black text-white leading-none mb-1">{order.customer_name}</p><p className="text-[13px] text-white/30 font-bold">{order.customer_phone}</p></div>
                       </div>
                       <div className="flex items-start gap-4">
                          <MapPin className="w-5 h-5 text-white/20 shrink-0 mt-0.5" />
                          <div><p className="text-[15px] font-black text-white leading-none mb-1">{order.customer_city}</p><p className="text-[13px] text-white/30 font-bold italic line-clamp-1">{order.customer_address || '未填写详细地址'}</p></div>
                       </div>
                    </div>
                 </div>
                 <div className="bg-[#141414] border border-white/5 rounded-[32px] p-8 md:p-10 space-y-6">
                    <h4 className="text-[11px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">备考信息</h4>
                    <div className="flex items-start gap-4">
                       <MessageSquare className="w-5 h-5 text-white/20 shrink-0 mt-0.5" />
                       <p className="text-[14px] text-white/30 font-medium leading-relaxed italic">{order.note || '提交需求开启 1V1 复核服务。'}</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="lg:w-[400px] shrink-0">
              <div className="sticky top-40 bg-[#141414] border border-white/5 rounded-[32px] md:rounded-[48px] p-8 md:p-12 shadow-2xl text-left">
                 <h4 className="text-[11px] font-black text-white/20 uppercase tracking-widest mb-10">款项结算 / Summary</h4>
                 <div className="space-y-5 mb-10">
                    <div className="flex justify-between font-bold text-[14px] md:text-[15px]"><span className="text-white/30">商品小计</span><span className="text-white font-black">¥{pricing.formatCurrency(order.product_amount)}</span></div>
                    <div className="flex justify-between font-bold text-[14px] md:text-[15px]"><span className="text-white/30">履约维护费</span><span className="text-white font-black">¥{pricing.formatCurrency(order.service_fee)}</span></div>
                    <div className="flex justify-between font-bold text-[14px] md:text-[15px]"><span className="text-white/30">物流预估</span><span className="text-brand/60 font-black italic">¥{pricing.formatCurrency(order.delivery_fee)}</span></div>
                    <div className="h-px bg-white/5 pt-4" />
                    <div className="flex justify-between items-end"><span className="text-[11px] font-black text-white/20 uppercase pb-1">Total</span><span className="text-[28px] md:text-[36px] font-black text-brand italic leading-none tracking-tighter">¥{pricing.formatCurrency(order.grand_total)}</span></div>
                 </div>

                 <div className="p-6 bg-brand/5 border border-brand/10 rounded-3xl mb-10">
                    <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">支付状态</p>
                    <p className="text-[17px] font-black text-white uppercase italic">{order.payment_status === 'unpaid' ? 'Pending' : order.payment_status === 'deposit_paid' ? 'Deposit Paid' : 'Balance Paid'}</p>
                 </div>

                 {['lead_submitted', 'deposit_pending'].includes(order.status) && order.payment_status === 'unpaid' && (
                    <div className="space-y-4">
                       <button onClick={handleSimulatePayment} disabled={isPaying} className="w-full py-6 bg-white text-black rounded-[28px] md:rounded-[32px] font-black text-[18px] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                          {isPaying ? '转接中...' : '立即支付定金'} <CreditCard className="w-6 h-6" />
                       </button>
                       <p className="text-[11px] text-white/10 font-bold text-center px-4 leading-relaxed">* 定金用于锁定出厂特惠排期，支持随时退款。</p>
                    </div>
                 )}

                 {order.payment_status === 'deposit_paid' && (
                    <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-[32px] text-center"><CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-4" /><h4 className="text-[18px] font-black text-white mb-2">定金已锁单</h4><p className="text-white/30 text-[13px] font-medium leading-relaxed italic">厂家产能已为您预留，等待顾问后续跟进。</p></div>
                 )}

                 <div className="mt-12 pt-12 border-t border-white/5 space-y-4">
                    <p className="text-[11px] font-black text-white/20 uppercase tracking-widest text-center">方案纠纷处理</p>
                    <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black text-[14px] flex items-center justify-center gap-2 transition-all"><MessageSquare className="w-4 h-4" /> 微信联系顾问</button>
                 </div>
              </div>
           </div>
        </div>
      </div>
      <Toast message={toastMessage} onClear={() => setToastMessage(null)} />
    </main>
  );
}
