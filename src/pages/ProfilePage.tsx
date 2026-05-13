import React from 'react';
import { motion } from 'motion/react';
import { User, Settings, CreditCard, Heart, LogOut, ArrowRight, Sparkles } from 'lucide-react';

import Breadcrumbs from '../components/Breadcrumbs';

export default function ProfilePage() {
  return (
    <main className="flex-1 w-full max-w-[1000px] mx-auto flex flex-col items-center p-10 z-10 pt-24">
      <div className="w-full text-left mb-8">
        <h1 className="text-[32px] font-black text-white tracking-tight">个人中心</h1>
        <p className="text-white/40 font-medium">账户管理、收藏产品及订单信息</p>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1A1A1A] w-full p-10 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12 border border-white/10 rounded-[40px] shadow-2xl"
      >
        {/* Sidebar */}
        <div className="flex flex-col gap-8 md:border-r border-white/5 md:pr-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-brand to-brand/60 flex items-center justify-center text-white text-[32px] font-black shadow-lg shadow-brand/20 mb-4 ring-4 ring-white/5">
              U
            </div>
            <h2 className="text-[20px] font-black text-white">普通会员用户</h2>
            <p className="text-[12px] text-white/30 font-bold uppercase tracking-widest mt-1">Free Tier</p>
          </div>

          <div className="flex flex-col gap-2">
            {[
              { icon: User, label: '个人资料', active: true },
              { icon: Heart, label: '我的收藏', active: false },
              { icon: CreditCard, label: '订单管理', active: false },
              { icon: Settings, label: '账号设置', active: false },
            ].map((item, idx) => (
              <button 
                key={idx} 
                className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[14px] font-bold transition-all ${item.active ? 'bg-brand text-white shadow-md shadow-brand/10' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </div>

          <button className="mt-auto flex items-center gap-4 px-5 py-3.5 text-red-400 font-bold text-[14px] hover:bg-red-50/5 rounded-2xl transition-all">
            <LogOut className="w-5 h-5" />
            退出登录
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-col gap-10 text-left">
          <section>
            <h3 className="text-[18px] font-black text-white mb-6 flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand" /> 会员中心
            </h3>
            <div className="bg-gradient-to-br from-[#222] to-[#111] rounded-[32px] p-8 text-white relative overflow-hidden group border border-white/5">
              <Sparkles className="absolute right-[-10px] top-[-10px] w-40 h-40 text-brand/5 rotate-12 group-hover:scale-110 transition-transform" />
              <div className="relative z-10 flex flex-col gap-6">
                <div>
                  <h4 className="text-[24px] font-black tracking-tight">底线哥高级会员</h4>
                  <p className="text-white/40 text-[13px] mt-1 font-medium italic">每年省下数万元家具购置税</p>
                </div>
                <div className="flex items-center gap-2">
                   <div className="px-5 py-2.5 bg-brand text-white rounded-xl text-[14px] font-black transition-all cursor-pointer hover:bg-brand/80">
                     立即开通 $199/Yr
                   </div>
                   <button className="text-[13px] font-bold text-white/40 hover:text-white px-4">查看权益详情</button>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[18px] font-black text-white mb-6 flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand" /> 数据概览
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               {[
                 { label: '收藏家具', val: '24', sub: '件' },
                 { label: '历史订单', val: '2', sub: '单' },
               ].map((stat, i) => (
                 <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-[28px]">
                   <p className="text-[12px] font-bold text-white/30 mb-2">{stat.label}</p>
                   <p className="text-[32px] font-black text-white leading-none">
                     {stat.val} <span className="text-[14px] text-white/30">{stat.sub}</span>
                   </p>
                 </div>
               ))}
            </div>
          </section>
        </div>
      </motion.div>
    </main>
  );
}
