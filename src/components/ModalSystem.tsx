/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, User, Phone, ShieldCheck, Search, Image as ImageIcon, Sparkles, LayoutGrid, Layout, ChevronRight, Plus } from 'lucide-react';
import { ModalType, FloorData } from '../types';

interface ModalProps {
  type: ModalType;
  isOpen: boolean;
  onClose: () => void;
  data?: any;
  onToast: (msg: string) => void;
}

export default function ModalSystem({ type, isOpen, onClose, data, onToast }: ModalProps) {
  if (!isOpen) return null;

  const renderContent = () => {
    switch (type) {
      case 'newPlan':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-[28px] font-black text-gray-800 tracking-tight">你想怎么开始？</h2>
              <p className="text-gray-400 font-medium mt-2">可以让 AI 先帮你看，也可以从产品或灵感方案开始。</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                 { id: 'ai', title: 'AI帮我看', desc: '上传图片或回答问题，让 AI 根据你的家先生成一版方案。', icon: Sparkles, color: 'text-brand', path: '/match' },
                 { id: 'manual', title: '手动搭配', desc: '从产品库中自己选择家具，慢慢组成一个方案。', icon: Search, color: 'text-blue-500', path: '/products' },
                 { id: 'inspiration', title: '从灵感方案开始', desc: '选择一个喜欢的搭配方向，再根据你的预算和空间调整。', icon: ImageIcon, color: 'text-purple-500', path: '/ladder' },
                 { id: 'copy', title: '复制已有方案', desc: '基于之前保存的方案快速修改，适合做多个户型。', icon: LayoutGrid, color: 'text-orange-500', path: '/my-plans' }
               ].map((opt) => (
                 <a 
                   key={opt.id} 
                   href={opt.path}
                   onClick={(e) => {
                     e.preventDefault();
                     onClose();
                     // Here we would normally trigger navigation
                     window.location.href = opt.path;
                   }}
                   className="p-6 bg-white/50 border border-white/40 rounded-[32px] hover:border-brand/40 hover:bg-white transition-all group text-left"
                 >
                   <div className={`w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-brand/5 ${opt.color} transition-colors`}>
                     <opt.icon className="w-6 h-6" />
                   </div>
                   <h3 className="text-[18px] font-black text-gray-800 mb-2">{opt.title}</h3>
                   <p className="text-[12px] text-gray-400 font-bold leading-relaxed">{opt.desc}</p>
                 </a>
               ))}
            </div>
          </div>
        );

      case 'planSelection':
        const plans = data?.plans || [];
        const productName = data?.productName || '产品';
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-[28px] font-black text-gray-800 tracking-tight">选择目标方案</h2>
              <p className="text-gray-400 font-medium mt-2">请选择将“{productName}”加入哪一个方案？</p>
            </div>
            {plans.length > 0 ? (
              <div className="space-y-3">
                {plans.map((p: any) => (
                  <button 
                    key={p.id}
                    onClick={() => {
                      onToast(`已成功加入“${p.name}”`);
                      onClose();
                    }}
                    className="w-full p-6 bg-white/50 border border-white/40 rounded-[28px] hover:border-brand/40 hover:bg-white transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand/5 flex items-center justify-center text-brand">
                        <Layout className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="text-[16px] font-black text-gray-800">{p.name}</p>
                        <p className="text-[12px] text-gray-400 font-bold">{p.updatedAt} 更新 · 已完成 {p.completion}%</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand transition-colors" />
                  </button>
                ))}
                <button 
                  onClick={() => {
                    onClose();
                    // In a real app, this would trigger new plan flow
                    window.location.href = '/match';
                  }}
                  className="w-full p-5 border-2 border-dashed border-gray-100 rounded-[28px] text-[15px] font-black text-gray-400 hover:border-brand/20 hover:text-brand transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <Plus className="w-5 h-5" /> 新建方案
                </button>
              </div>
            ) : (
              <div className="text-center py-10 space-y-8">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                  <Layout className="w-10 h-10" />
                </div>
                <div>
                  <p className="text-gray-500 font-bold mb-6">你还没有正在进行的方案</p>
                  <button 
                    onClick={() => {
                      onClose();
                      window.location.href = '/match';
                    }}
                    className="px-10 py-4 bg-brand text-white rounded-full font-black shadow-xl shadow-brand/20 hover:scale-105 transition-all"
                  >
                    立即去新建一个方案
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'login':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">登录后查看我的方案</h2>
            <div className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" placeholder="手机号" className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand" />
              </div>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" placeholder="验证码" className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand" />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-brand text-sm font-medium">获取验证码</button>
              </div>
              <button 
                onClick={() => { onToast('登录成功，模拟状态'); onClose(); }}
                className="w-full py-3 bg-brand text-white rounded-xl font-bold hover:bg-opacity-90 transition-all brand-glow"
              >
                登录
              </button>
            </div>
          </div>
        );

      case 'member':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">开通底线哥家具会员</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: '专属匹配', desc: '针对性的家具匹配方案' },
                { title: '避坑清单', desc: '家具选购防坑指南' },
                { title: '预算分配', desc: '科学的预算分配建议' }
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-white/50 rounded-xl border border-white/30 text-center space-y-2">
                  <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center mx-auto text-brand">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
            <button 
              onClick={() => { onToast('会员已开通，模拟状态'); onClose(); }}
              className="w-full py-3 bg-brand text-white rounded-xl font-bold hover:bg-opacity-90 transition-all brand-glow"
            >
              模拟开通
            </button>
          </div>
        );

      case 'productDrawer':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">所有产品</h2>
            <div className="grid grid-cols-2 gap-4">
              {['沙发', '床垫', '餐桌椅', '单椅', '柜类', '灯具'].map((cat) => (
                <div key={cat} className="p-6 bg-white/50 rounded-2xl border border-white/30 hover:border-brand cursor-pointer transition-all group">
                  <span className="font-medium group-hover:text-brand">{cat}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'searchResult':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">搜索结果</h2>
            <div className="text-gray-600 bg-brand/5 p-4 rounded-xl">正在根据『{data?.query}』匹配家具建议</div>
            <div className="space-y-4">
              {[
                { label: '推荐进入', value: '第4层｜舒适日常', color: 'text-brand' },
                { label: '推荐风格', value: '现代简约', color: 'text-black' },
                { label: '推荐预算', value: '2万-3万', color: 'text-black' }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-white/50 rounded-xl border border-white/30">
                  <span className="text-gray-500">{item.label}</span>
                  <span className={`font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'upload':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">上传图片匹配</h2>
            <div 
              onClick={() => onToast('图片已上传，模拟识别中')}
              className="w-full aspect-video border-2 border-dashed border-white/50 rounded-3xl flex flex-col items-center justify-center p-8 cursor-pointer hover:border-brand transition-all bg-white/20"
            >
              <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-center text-gray-500">上传客厅、卧室或户型图，系统将识别你的家具需求</p>
              <button className="mt-4 px-6 py-2 bg-brand/10 text-brand rounded-full text-sm font-bold">模拟上传</button>
            </div>
          </div>
        );

      case 'matchIntro':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">开始我的家具匹配</h2>
            <div className="p-6 bg-brand/5 rounded-2xl text-center space-y-4">
              <Sparkles className="w-12 h-12 text-brand mx-auto" />
              <p className="text-lg">通过 8 个问题，生成你的家具天梯定位</p>
              <button 
                onClick={() => { onToast('进入8页匹配流程，下一阶段实现'); onClose(); }}
                className="w-full py-3 bg-brand text-white rounded-xl font-bold brand-glow mt-4"
              >
                开始填写
              </button>
            </div>
          </div>
        );

      case 'levelDetail':
        const floor = data as FloorData;
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-brand">第{floor.level}层｜{floor.name}</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-sm text-gray-500">预算参考</span>
                <p className="text-xl font-bold">{floor.budget}</p>
              </div>
              <div className="space-y-2">
                <span className="text-sm text-gray-500">核心价值</span>
                <p className="text-xl font-bold">{floor.value}</p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand"></div> 适合人群
              </h3>
              <ul className="grid grid-cols-1 gap-2">
                {floor.people.map((p, i) => <li key={i} className="text-gray-600 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-brand">{p}</li>)}
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand"></div> 购买建议
              </h3>
              <ul className="grid grid-cols-1 gap-2">
                {floor.advice.map((a, i) => <li key={i} className="text-gray-600 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-brand">{a}</li>)}
              </ul>
            </div>
            <button 
              onClick={() => { onToast(`已进入第${floor.level}层详情，下一阶段实现`); onClose(); }}
              className="w-full py-4 bg-brand text-white rounded-xl font-bold brand-glow text-lg"
            >
              进入这一层
            </button>
          </div>
        );

      case 'budgetInfo':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">预算参考说明</h2>
            <div className="p-6 bg-white/50 rounded-2xl border border-white/30 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                当前预算用于估算主要家具组合，不包含硬装和大型家电。
              </p>
              <p className="text-sm text-gray-500">
                家具组合通常包括：沙发、电视柜、茶几、餐桌椅、双人床、床垫、衣柜（成品）等核心部件。
              </p>
            </div>
            <button 
              onClick={onClose}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold"
            >
              我知道了
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const isDrawer = type === 'productDrawer';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
        />
        <motion.div
           layoutId="modal"
           initial={isDrawer ? { x: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
           animate={isDrawer ? { x: 0 } : { opacity: 1, scale: 1, y: 0 }}
           exit={isDrawer ? { x: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
           className={`relative glass-morphism p-8 shadow-2xl z-[101] ${isDrawer ? 'h-full w-full max-w-md ml-auto rounded-l-3xl rounded-r-none' : 'max-w-2xl w-[90vw] rounded-3xl'}`}
        >
          <button onClick={onClose} className="absolute right-6 top-6 p-2 rounded-full hover:bg-black/5 transition-all">
            <X className="w-6 h-6 text-gray-400" />
          </button>
          {renderContent()}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
