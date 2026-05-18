import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { User, Settings, CreditCard, Heart, LogOut, ArrowRight, Sparkles, LayoutGrid, Package, ChevronRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { libraryService } from '../services/libraryService';
import { orderService } from '../services/orderService';
import { planService } from '../services/planService';
import { analyticsService } from '../services/analyticsService';
import { membershipService } from '../services/membershipService';
import { UserMembership } from '../types/business';
import Breadcrumbs from '../components/Breadcrumbs';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [stats, setStats] = useState({ plans: 0, library: 0, orders: 0 });

  useEffect(() => {
    loadUserData();
    analyticsService.track('page_view', { page: 'profile' });
  }, []);

  const loadUserData = async () => {
    const user = await authService.getCurrentUser();
    setCurrentUser(user);
    const [adminStatus, m] = await Promise.all([
      authService.isAdmin(),
      membershipService.getCurrentUserMembership()
    ]);
    setIsAdmin(adminStatus);
    setMembership(m);
    const plans = await planService.getPlans();
    const library = await libraryService.getLibrary();
    const orders = await orderService.getMyOrders();
    setStats({ plans: plans.length, library: library.length, orders: orders.length });
  };

  const handleSignOut = async () => {
    await authService.signOut();
    navigate('/');
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-24 md:pt-32 pb-40 overflow-x-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 text-left">
        <div className="mb-4 hidden md:block"><Breadcrumbs isDark items={[{ name: '个人中心' }]} /></div>
        <div className="mb-8 md:mb-12">
          <h1 className="text-[32px] md:text-[42px] font-black text-white tracking-tight mb-2">个人中心</h1>
          <p className="text-[14px] md:text-[16px] text-white/40 font-medium tracking-wide italic">管理你的家，从这里开始</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 md:gap-16"
        >
          {/* Sidebar / Profile Card */}
          <div className="space-y-8">
            <div className="bg-[#141414] border border-white/5 p-8 md:p-10 rounded-[32px] md:rounded-[48px] text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-[50px] pointer-events-none" />
               <div className="relative mb-6">
                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-3xl md:rounded-[40px] bg-gradient-to-br from-brand to-brand-dark mx-auto flex items-center justify-center text-white text-[28px] md:text-[40px] font-black shadow-2xl ring-4 ring-white/5">
                    {currentUser?.email?.[0].toUpperCase() || 'U'}
                  </div>
                  {membership?.plan_code === 'professional' && <div className="absolute -bottom-1 -right-1 bg-brand text-white px-3 py-1 rounded-full text-[9px] font-black border-4 border-[#141414]">PRO</div>}
               </div>
               <h2 className="text-[20px] md:text-[24px] font-black text-white mb-2 truncate">{currentUser?.email?.split('@')[0] || '访客屋主'}</h2>
               <div className="inline-block px-3 py-1 bg-white/5 rounded-full text-[10px] text-white/40 font-black uppercase tracking-widest leading-none">
                  {isAdmin ? '管理员' : '普通屋主'}
               </div>
            </div>

            <nav className="space-y-3">
               {[
                 { icon: LayoutGrid, label: '我的方案', path: '/my-plans' },
                 { icon: Package, label: '我的订单', path: '/orders' },
                 { icon: Heart, label: '收藏产品', path: '/my-plans?tab=library' },
                 { icon: CreditCard, label: '会员权益', path: '/membership' }
               ].map((item, i) => (
                 <Link key={i} to={item.path} className="flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl md:rounded-3xl transition-all group">
                    <div className="flex items-center gap-4"><item.icon className="w-5 h-5 text-white/30 group-hover:text-brand transition-colors" /><span className="text-[15px] font-black text-white/80 group-hover:text-white transition-colors">{item.label}</span></div>
                    <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white" />
                 </Link>
               ))}
               {isAdmin && (
                 <Link to="/admin" className="flex items-center justify-between p-5 bg-amber-400/5 hover:bg-amber-400/10 border border-amber-400/10 rounded-2xl md:rounded-3xl transition-all group">
                    <div className="flex items-center gap-4"><Settings className="w-5 h-5 text-amber-400" /><span className="text-[15px] font-black text-amber-400">管理员后台</span></div>
                    <ChevronRight className="w-4 h-4 text-amber-400/30" />
                 </Link>
               )}
               <button onClick={handleSignOut} className="w-full flex items-center gap-4 p-5 text-red-500/50 hover:text-red-500 hover:bg-red-500/5 rounded-2xl md:rounded-3xl transition-all font-black text-[15px]"><LogOut className="w-5 h-5" /> 退出登录</button>
            </nav>
          </div>

          {/* Activity & Stats */}
          <div className="space-y-12">
            <section>
              <h3 className="text-[18px] md:text-[20px] font-black text-white mb-6 md:mb-10 flex items-center gap-3"><div className="w-1 h-6 bg-brand rounded-full" />活跃状态</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
                 {[
                   { label: '生成的方案', val: stats.plans, sub: '个', icon: <LayoutGrid className="w-5 h-5" /> },
                   { label: '收藏的产品', val: stats.library, sub: '件', icon: <Heart className="w-5 h-5" /> },
                   { label: '成交的订单', val: stats.orders, sub: '笔', icon: <Package className="w-5 h-5" /> }
                 ].map((stat, i) => (
                   <div key={i} className="bg-[#141414] border border-white/5 p-6 md:p-10 rounded-[32px] md:rounded-[40px] text-left">
                      <div className="text-white/20 mb-4">{stat.icon}</div>
                      <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                      <p className="text-[32px] md:text-[42px] font-black text-white leading-none">{stat.val} <span className="text-[14px] text-white/20 font-medium">{stat.sub}</span></p>
                   </div>
                 ))}
              </div>
            </section>

            <section>
              <h3 className="text-[18px] md:text-[20px] font-black text-white mb-6 md:mb-10 flex items-center gap-3"><div className="w-1 h-6 bg-brand rounded-full" />会员推荐</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {[
                   { title: '专业会员', desc: '解锁出厂底价，支持设计师与工程采购。', path: '/membership?tab=professional' },
                   { title: '定制服务', desc: '全案交付协调，由资深管家全程跟进。', path: '/custom-service' }
                 ].map((card, i) => (
                   <Link key={i} to={card.path} className="p-8 md:p-10 bg-white/5 border border-white/5 rounded-[32px] md:rounded-[48px] flex flex-col group hover:border-brand/40 transition-all text-left">
                      <h4 className="text-[18px] md:text-[20px] font-black text-white mb-2 group-hover:text-brand transition-colors">{card.title}</h4>
                      <p className="text-white/40 text-[14px] font-medium leading-relaxed mb-8 flex-1 italic">{card.desc}</p>
                      <div className="text-[13px] font-black text-white/20 group-hover:text-white flex items-center gap-2">查看详情 <ArrowRight className="w-4 h-4" /></div>
                   </Link>
                 ))}
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
