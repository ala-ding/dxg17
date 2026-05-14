import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Package, Clock, ShieldCheck, MapPin, User, 
  CheckCircle2, AlertCircle, ShoppingBag, Truck, Share2, Printer, 
  CreditCard, MessageSquare, Sparkles 
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
      'deposit_pending': '待支付定金',
      'deposit_paid': '定金已支付',
      'procurement_pending': '待库房排期',
      'procurement_started': '开始采购',
      'delivering': '物流配送中',
      'completed': '订单已完成',
      'cancelled': '已取消'
    };
    return map[status] || status;
  };

  if (loading) return <div className="min-h-screen pt-40 px-12 text-center text-white/40">正在加载订单...</div>;
  if (!order) return <div className="min-h-screen pt-40 px-12 text-center text-white/40">订单未找到</div>;

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-24 pb-40">
      <div className="max-w-7xl mx-auto px-6">
        <Breadcrumbs 
          isDark={true}
          items={[
            { name: '个人中心', path: '/profile' },
            { name: '我的订单', path: '/orders' },
            { name: order.order_no }
          ]} 
        />
        <div className="flex items-center justify-between mb-12">
           <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
             <ArrowLeft className="w-5 h-5" /> 返回订单列表
           </button>
           <div className="flex items-center gap-4">
              <button onClick={() => window.print()} className="w-12 h-12 rounded-full bg-white/5 text-white/40 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all">
                 <Printer className="w-5 h-5" />
              </button>
              <button className="w-12 h-12 rounded-full bg-white/5 text-white/40 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all">
                 <Share2 className="w-5 h-5" />
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left">
           {/* Main Content */}
           <div className="lg:col-span-8 space-y-10">
              {/* Order Status Card */}
              <div className="bg-[#141414] border border-white/5 rounded-[48px] p-12 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[100px] pointer-events-none" />
                 
                 <div className="flex items-center gap-6 mb-12">
                    <div className="w-20 h-20 rounded-[32px] bg-brand text-white flex items-center justify-center shadow-2xl shadow-brand/20">
                       <Package className="w-10 h-10" />
                    </div>
                    <div>
                       <div className="flex items-center gap-4 mb-2">
                          <h2 className="text-[32px] font-black text-white">{getStatusLabel(order.status)}</h2>
                          <span className="px-4 py-1.5 bg-brand/10 text-brand text-[12px] font-black rounded-full border border-brand/20 uppercase tracking-widest">
                            {order.order_no}
                          </span>
                       </div>
                       <p className="text-white/40 text-[16px] font-medium leading-relaxed">
                          您的专属顾问正在为您核对清单，如有库存问题会通过电话与您沟通。
                       </p>
                    </div>
                 </div>

                 {/* Progress Stepper Simplified */}
                 <div className="flex items-center justify-between px-4 relative">
                    <div className="absolute top-5 left-10 right-10 h-0.5 bg-white/5" />
                    {[
                      { label: '提交需求', done: true },
                      { label: '顾问介入', done: order.status !== 'lead_submitted' },
                      { label: '方案定稿', done: ['proposal_confirmed', 'deposit_pending', 'deposit_paid'].includes(order.status) },
                      { label: '排期发货', done: ['procurement_started', 'delivering', 'completed'].includes(order.status) }
                    ].map((step, i) => (
                      <div key={i} className="flex flex-col items-center gap-3 relative z-10">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${step.done ? 'bg-brand text-white' : 'bg-white/5 text-white/20'}`}>
                            {step.done ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-5 h-5" />}
                         </div>
                         <span className={`text-[12px] font-black ${step.done ? 'text-white' : 'text-white/20'}`}>{step.label}</span>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Items List */}
              <div className="bg-[#141414] border border-white/5 rounded-[48px] p-12 shadow-2xl">
                 <h3 className="text-[20px] font-black text-white mb-10 flex items-center gap-3">
                    <ShoppingBag className="w-6 h-6 text-brand" /> 采购选品清单
                 </h3>
                 <div className="space-y-6">
                    {order.items?.length > 0 ? order.items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-3xl group">
                         <div className="w-24 h-24 bg-white rounded-2xl p-3 shrink-0 flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform">
                            <img src={item.product_snapshot?.image} className="w-full h-full object-contain" alt="" />
                         </div>
                         <div className="flex-1 text-left">
                            <div className="flex justify-between items-start mb-2">
                               <h4 className="text-[18px] font-black text-white group-hover:text-brand transition-colors">{item.name}</h4>
                               <span className="text-[16px] font-black text-white">¥{pricing.formatCurrency(item.subtotal)}</span>
                            </div>
                            <div className="flex items-center gap-4">
                               <span className="px-3 py-1 bg-white/5 rounded-lg text-[11px] font-black text-white/40 uppercase tracking-widest">{item.category}</span>
                               <span className="text-[13px] text-white/20 font-bold">单价 ¥{pricing.formatCurrency(item.unit_price)} x {item.quantity}</span>
                            </div>
                         </div>
                      </div>
                    )) : (
                      <div className="py-12 text-center text-white/20 border border-dashed border-white/10 rounded-3xl">
                         清单数据正在由顾问补全
                      </div>
                    )}
                 </div>
              </div>

              {/* Customer Info Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                 <div className="bg-[#141414] border border-white/5 rounded-[40px] p-10">
                    <h4 className="text-[14px] font-black text-white/20 uppercase tracking-widest mb-8">收货人信息 / Receiver</h4>
                    <div className="space-y-6">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20"><User className="w-5 h-5" /></div>
                          <div>
                            <p className="text-[15px] font-black text-white">{order.customer_name}</p>
                            <p className="text-[13px] text-white/40 font-bold">{order.customer_phone}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20"><MapPin className="w-5 h-5" /></div>
                          <div>
                            <p className="text-[15px] font-black text-white">{order.customer_city}</p>
                            <p className="text-[13px] text-white/40 font-bold">{order.customer_address || '还没填写具体地址'}</p>
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="bg-[#141414] border border-white/5 rounded-[40px] p-10">
                    <h4 className="text-[14px] font-black text-white/20 uppercase tracking-widest mb-8">方案背景 / Project Detail</h4>
                    <div className="space-y-6">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20"><Sparkles className="w-5 h-5" /></div>
                          <div>
                            <p className="text-[15px] font-black text-white">方案匹配度 92%</p>
                            <p className="text-[13px] text-white/40 font-bold">已基于您的户型进行了尺寸微调</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20"><MessageSquare className="w-5 h-5" /></div>
                          <div>
                            <p className="text-[15px] font-black text-white">备注说明</p>
                            <p className="text-[13px] text-white/40 font-bold">{order.note || '暂无补充'}</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Sidebar - Price & Action */}
           <div className="lg:col-span-4 space-y-8">
              <div className="sticky top-32 space-y-8">
                 <div className="bg-[#141414] border border-white/5 rounded-[48px] p-10 shadow-2xl">
                    <h4 className="text-[14px] font-black text-white/20 uppercase tracking-widest mb-8 text-left">款项明细 / Payment Details</h4>
                    <div className="space-y-5 text-left mb-10">
                       <div className="flex justify-between items-center text-[15px] font-bold">
                          <span className="text-white/40">商品总额</span>
                          <span className="text-white">¥{pricing.formatCurrency(order.product_amount)}</span>
                       </div>
                       <div className="flex justify-between items-center text-[15px] font-bold">
                          <span className="text-white/40">服务费 (5%)</span>
                          <span className="text-white">¥{pricing.formatCurrency(order.service_fee)}</span>
                       </div>
                       <div className="flex justify-between items-center text-[15px] font-bold">
                          <span className="text-white/40">物流安装费</span>
                          <span className="text-white">¥{pricing.formatCurrency(order.delivery_fee)}</span>
                       </div>
                       <div className="h-px bg-white/5 my-4" />
                       <div className="flex justify-between items-center">
                          <span className="text-[18px] font-black text-white">订单总额</span>
                          <span className="text-[28px] font-black text-brand">¥{pricing.formatCurrency(order.grand_total)}</span>
                       </div>
                    </div>

                    <div className="p-6 bg-brand/5 border border-brand/20 rounded-[32px] text-left mb-10">
                       <p className="text-[12px] font-black text-brand uppercase tracking-widest mb-2">当前支付状态</p>
                       <p className="text-[18px] font-black text-white">
                         {order.payment_status === 'unpaid' ? '待付定金' : order.payment_status === 'deposit_paid' ? '已付定金' : '全额已清'}
                       </p>
                    </div>

                    {['lead_submitted', 'deposit_pending'].includes(order.status) && order.payment_status === 'unpaid' && (
                      <div className="space-y-4">
                         <button 
                           onClick={handleSimulatePayment}
                           disabled={isPaying}
                           className="w-full py-6 bg-white text-black rounded-[32px] font-black text-[18px] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                         >
                            {isPaying ? '正在跳转支付...' : '支付定金锁定特惠'} <CreditCard className="w-6 h-6" />
                         </button>
                         <p className="text-[12px] text-white/20 font-bold text-center italic px-4">
                            * 支付定金后由顾问人工为您复核清单，支持 7 天无理由全额退还。
                         </p>
                      </div>
                    )}

                    {order.payment_status === 'deposit_paid' && (
                      <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-[32px] text-center">
                         <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                         <h4 className="text-[18px] font-black text-white mb-2">定金已确认</h4>
                         <p className="text-white/40 text-[14px] font-medium leading-relaxed">
                            感谢您的信任。采购专员已同步开始为您占位工厂产能。
                         </p>
                      </div>
                    )}
                 </div>

                 <div className="bg-[#141414] border border-white/5 rounded-[40px] p-8">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                          <MessageSquare className="w-5 h-5" />
                       </div>
                       <h5 className="font-black text-white text-[16px]">联系专属顾问</h5>
                    </div>
                    <button className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                       即时微信通话
                    </button>
                    <p className="text-[11px] text-white/20 font-bold text-center mt-4">周一至周日 09:00 - 22:00</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <Toast 
        message={toastMessage} 
        onClear={() => setToastMessage(null)} 
      />
    </main>
  );
}
