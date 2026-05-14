import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { User, Settings, CreditCard, Heart, LogOut, ArrowRight, Sparkles, LayoutGrid, Package } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { libraryService } from '../services/libraryService';
import { orderService } from '../services/orderService';
import { planService } from '../services/planService';
import { analyticsService } from '../services/analyticsService';
import Breadcrumbs from '../components/Breadcrumbs';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    plans: 0,
    library: 0,
    orders: 0
  });

  useEffect(() => {
    loadUserData();
    analyticsService.track('page_view', { page: 'profile' });
  }, []);

  const loadUserData = async () => {
    const user = await authService.getCurrentUser();
    setCurrentUser(user);
    
    const adminStatus = await authService.isAdmin();
    setIsAdmin(adminStatus);

    // Load actual counts
    const plans = await planService.getPlans();
    const library = await libraryService.getLibrary();
    const orders = await orderService.getMyOrders();

    setStats({
      plans: plans.length,
      library: library.length,
      orders: orders.length
    });
  };

  const handleSignOut = async () => {
    await authService.signOut();
    navigate('/');
  };

  return (
    <main className="flex-1 w-full max-w-[1200px] mx-auto flex flex-col items-center p-6 md:p-10 z-10 pt-24 pb-40">
      <div className="w-full text-left mb-4">
        <Breadcrumbs 
          isDark={true}
          items={[{ name: '个人中心' }]} 
        />
      </div>
      <div className="w-full text-left mb-12">
        <h1 className="text-[42px] font-black text-white tracking-tight">个人中心</h1>
        <p className="text-white/40 font-medium">管理你的家，从这里开始</p>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1A1A1A] w-full p-6 md:p-12 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12 border border-white/10 rounded-[48px] shadow-2xl"
      >
        {/* Sidebar */}
        <div className="flex flex-col gap-10 lg:border-r border-white/5 lg:pr-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-28 h-28 rounded-[40px] bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white text-[40px] font-black shadow-2xl shadow-brand/20 mb-6 ring-8 ring-white/5">
              {currentUser?.email?.[0].toUpperCase() || 'U'}
            </div>
            <h2 className="text-[24px] font-black text-white mb-2">{currentUser?.email?.split('@')[0] || '访客屋主'}</h2>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-white/40 font-black uppercase tracking-widest">
                {isAdmin ? '管理员控制台已解锁' : '普通屋主'}
              </span>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {[
              { icon: User, label: '账户概览', path: '/profile', active: true },
              { icon: LayoutGrid, label: '我的方案', path: '/my-plans' },
              { icon: Package, label: '订单追踪', path: '/orders' },
              { icon: Heart, label: '灵感库', path: '/my-plans' }, // Library is in my-plans now
            ].map((item, idx) => (
              <Link 
                key={idx} 
                to={item.path}
                className={`flex items-center gap-4 px-6 py-4 rounded-3xl text-[15px] font-black transition-all ${item.active ? 'bg-brand text-white shadow-xl shadow-brand/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}

            {isAdmin && (
              <Link 
                to="/admin"
                className="flex items-center gap-4 px-6 py-4 rounded-3xl text-[15px] font-black text-amber-400 bg-amber-400/5 border border-amber-400/10 mt-4 hover:bg-amber-400/10 transition-all"
              >
                <Settings className="w-5 h-5" />
                管理员后台
              </Link>
            )}
          </nav>

          <button 
            onClick={handleSignOut}
            className="mt-8 flex items-center gap-4 px-6 py-4 text-red-400 font-black text-[15px] hover:bg-red-400/5 rounded-3xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            退出登录
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-col gap-12 text-left">
          {/* Quick Stats Grid */}
          <section>
            <h3 className="text-[20px] font-black text-white mb-8 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-brand" /> 家居数据盘点
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
               {[
                 { label: '已生成方案', val: stats.plans, sub: '个', icon: <LayoutGrid className="w-5 h-5" />, color: 'text-brand' },
                 { label: '灵感库收藏', val: stats.library, sub: '件', icon: <Heart className="w-5 h-5" />, color: 'text-red-400' },
                 { label: '订单记录', val: stats.orders, sub: '笔', icon: <Package className="w-5 h-5" />, color: 'text-amber-400' },
               ].map((stat, i) => (
                 <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-[40px] group hover:border-white/20 transition-all">
                   <div className={`${stat.color} mb-4 opacity-50`}>{stat.icon}</div>
                   <p className="text-[12px] font-black text-white/30 uppercase tracking-widest mb-2">{stat.label}</p>
                   <p className="text-[42px] font-black text-white leading-none">
                     {stat.val} <span className="text-[16px] text-white/30 font-medium">{stat.sub}</span>
                   </p>
                 </div>
               ))}
            </div>
          </section>

          {/* Membership / Promotion */}
          <section>
            <h3 className="text-[20px] font-black text-white mb-8 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-brand" /> 尊享权益
            </h3>
            <div className="bg-gradient-to-br from-[#111] via-[#222] to-[#111] rounded-[48px] p-10 text-white relative overflow-hidden group border border-white/10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.1),transparent)]" />
              <Sparkles className="absolute right-[-20px] top-[-20px] w-56 h-56 text-brand/5 rotate-12 group-hover:scale-110 transition-transform duration-1000" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="max-w-md">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/20 text-brand rounded-full text-[10px] font-black mb-4">
                    限时特惠中
                  </div>
                  <h4 className="text-[32px] font-black tracking-tight mb-2">底线哥选品会员</h4>
                  <p className="text-white/40 text-[15px] font-medium leading-relaxed">
                    加入底线哥官方选品库，解锁源头大厂直供价格，享受 AI 全屋方案 1:1 动态还原及 10 年长期售后保障。
                  </p>
                </div>
                <div className="flex flex-col items-center gap-4 text-center">
                   <p className="text-[36px] font-black text-white">¥1,299 <span className="text-[14px] text-white/40 line-through">¥2,599</span></p>
                   <button className="px-10 py-5 bg-brand text-white rounded-[24px] text-[17px] font-black shadow-2xl shadow-brand/20 hover:scale-105 active:scale-95 transition-all">
                     立即加入，节省更多
                   </button>
                   <p className="text-white/30 text-[12px] font-medium">权益终身有效 · 专家 1对1 咨询</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </main>
  );
}
