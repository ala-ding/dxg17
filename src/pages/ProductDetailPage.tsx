import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Breadcrumbs from '../components/Breadcrumbs';
import { 
  ChevronRight, ArrowLeft, ShoppingBag, Sparkles, ShieldCheck, 
  Info, AlertTriangle, CheckCircle2, TrendingUp, Layers, 
  Ruler, Box, Wrench, Droplet, Users, ChevronDown, Share2, 
  Maximize2, Play, Heart, RefreshCw, Zap, Minus, Plus, Search,
  ArrowUpRight, ArrowRight, Building2, Phone
} from 'lucide-react';
import { Product } from '../types/business';
import { productService } from '../services/productService';
import { libraryService } from '../services/libraryService';
import { analyticsService } from '../services/analyticsService';
import { membershipService } from '../services/membershipService';
import { UserMembership } from '../types/business';
import Toast from '../components/Toast';
import AddToPlanModal from '../components/AddToPlanModal';

const SECTION_IDS = [
  { id: 'overview', name: '产品概览' },
  { id: 'effect', name: '搭配效果' },
  { id: 'budget', name: '预算影响' },
  { id: 'matching', name: '专业搭配' },
  { id: 'suitability', name: '家庭适配' },
  { id: 'landing', name: '落地提醒' },
  { id: 'params', name: '参数详情' }
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const snapshot = location.state?.productSnapshot;
  const planId = location.state?.planId;

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [isScrolled, setIsScrolled] = useState(false);
  const [focusPoint, setFocusPoint] = useState<'default' | 'budget' | 'effect' | 'size' | 'family'>('default');
  
  // Add to plan modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  useEffect(() => {
    if (id) {
      loadProduct(id);
      analyticsService.track('page_view', { page: 'product_detail', product_id: id });
    }
  }, [id]);

  const loadProduct = async (id: string) => {
    try {
      setLoading(true);
      const [data, m] = await Promise.all([
        productService.getProductById(id),
        membershipService.getCurrentUserMembership()
      ]);
      setMembership(m);
      if (data) {
        setProduct(data);
      } else if (snapshot) {
        setProduct(snapshot);
      }
    } catch (e) {
      if (snapshot) {
        setProduct(snapshot);
      }
    } finally {
      setLoading(false);
    }
  };

  const productPrice = useMemo(() => {
    if (!product) return 0;
    return Number(product.price ?? product.unitPrice ?? product.unit_price ?? 0);
  }, [product]);

  const handleJoinPlan = () => {
    setIsAddModalOpen(true);
    if (product) {
      analyticsService.track('click_add_to_plan', { product_id: product.id });
    }
  };

  const handleJoinLibrary = async () => {
    if (!product) return;
    try {
      const success = await libraryService.addToLibrary(product.id);
      if (success) {
        setToastMessage('已加入灵感产品库！');
        analyticsService.track('add_to_library', { product_id: product.id });
      } else {
        setToastMessage('系统异常，请稍后重试。');
      }
    } catch (e) {
      setToastMessage('已存在于灵感库中。');
    }
  };
  
  useEffect(() => {
    // 1. 处理初始进入页面的滚动逻辑
    const hash = window.location.hash;
    if (hash) {
      // 如果有 hash，平滑滚动到对应位置
      const targetId = hash.replace('#', '');
      setTimeout(() => scrollToSection(targetId), 100);
    } else {
      // 默认滚动到顶部 (Hero 区域)
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
      
      // Update active section based on scroll
      for (const section of SECTION_IDS) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160 && rect.bottom >= 160) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBackToPlan = () => {
    const fromTab = location.state?.fromTab || 'items';

    if (planId) {
      navigate(`/my-plans?planId=${planId}&tab=${fromTab}`, {
        replace: true
      });
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-brand animate-spin mx-auto mb-4" />
          <p className="text-white/40 font-bold">正在搜寻全球好物...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-white/20 mx-auto mb-6" />
          <h1 className="text-2xl font-black mb-8">产品信息暂不可用</h1>
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={handleBackToPlan}
              className="text-brand font-black hover:underline px-8 py-3 bg-brand/5 rounded-full border border-brand/20 transition-all"
            >
              {planId ? '返回方案详情' : '返回上一页'}
            </button>
            <Link to="/products" className="text-white/40 font-black hover:text-white px-8 py-3 bg-white/5 rounded-full transition-all">返回产品库</Link>
          </div>
        </div>
      </div>
    );
  }

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* 0. Sticky Header Navigation */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-[100px] left-0 right-0 z-[400] px-6 hidden md:flex justify-center pointer-events-none"
        >
          <div className="w-full max-w-5xl h-16 bg-black/80 backdrop-blur-3xl border border-white/5 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] pointer-events-auto flex items-center px-8 justify-between">
             <div className="flex items-center gap-4">
                <span className={`text-[15px] font-black underline-offset-4 decoration-2 ${isScrolled ? 'block' : 'hidden'}`}>{product.name}</span>
                {!isScrolled && <span className="text-[13px] font-black text-white/30">快速导航：</span>}
                <div className={`h-4 w-px bg-white/10 mx-2 ${isScrolled ? 'block' : 'hidden md:block'}`} />
                <div className="flex gap-6">
                  {SECTION_IDS.map(s => (
                    <button 
                      key={s.id}
                      onClick={() => scrollToSection(s.id)}
                      className={`text-[13px] font-black transition-colors relative ${activeSection === s.id ? 'text-brand' : 'text-white/30 hover:text-white'}`}
                    >
                      {s.name}
                      {activeSection === s.id && (
                        <motion.div layoutId="activeDot" className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
             </div>
             <div className="flex items-center gap-4">
                <span className="text-[16px] font-black text-white">¥{(product.standard_service_price || Math.round(productPrice * 1.2)).toLocaleString()}</span>
                <button 
                  onClick={handleJoinPlan}
                  className="px-6 py-2.5 bg-brand text-white rounded-full text-[13px] font-black shadow-lg shadow-brand/20 hover:scale-105 transition-all"
                >
                  加入我的方案
                </button>
             </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <AddToPlanModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        product={product} 
        onToast={(msg) => setToastMessage(msg)}
      />

      <Toast 
        message={toastMessage} 
        onClear={() => setToastMessage(null)} 
      />

      {/* 1. Hero Product Summary */}
      <section id="overview" className="max-w-[1720px] mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-16 md:pb-24">
        <Breadcrumbs 
          isDark={true}
          items={[
            { name: '全部产品', path: '/products' },
            ...(product?.category ? [{ name: product.category, path: `/products?category=${product.category}` }] : []),
            { name: '产品详情' }
          ]} 
        />
        <button 
          onClick={handleBackToPlan}
          className="mb-12 inline-flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-[14px] font-black transition-all group text-white/60 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {planId ? '返回方案详情' : '返回'}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          {/* Left: Visual Gallery */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="aspect-[4/3] rounded-[24px] md:rounded-[64px] overflow-hidden bg-white/5 border border-white/10 group relative"
            >
              <img 
                src={product.image || null} 
                className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-105" 
                alt={product.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              <button className="absolute bottom-10 right-10 w-14 h-14 bg-white/10 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-white/20 transition-all">
                <Maximize2 className="w-6 h-6 text-white" />
              </button>
            </motion.div>
            
            <div className="grid grid-cols-4 gap-4">
              {[product.image, product.image, product.image].map((img, i) => (
                <div key={i} className="aspect-square rounded-[16px] md:rounded-[32px] overflow-hidden bg-white/5 border border-white/5 cursor-pointer hover:border-brand transition-all flex items-center justify-center p-2">
                   <img src={img || null} className="max-w-full max-h-full object-contain" alt={`${product.name} thumbnail ${i + 1}`} />
                </div>
              ))}
              <div className="aspect-square rounded-[16px] md:rounded-[32px] bg-white/5 border border-white/5 flex items-center justify-center text-white/20 group cursor-pointer hover:bg-brand/5">
                 <Play className="w-8 h-8 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </div>

          {/* Right: Info Panel */}
          <div className="flex flex-col h-full py-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                 <span className="px-5 py-2 bg-brand text-white rounded-full text-[12px] font-black uppercase tracking-widest shadow-lg shadow-brand/20">
                   { [
                      '极简入门版', '精选入门版', '舒适基础版', '品质进阶版', 
                      '设计精选版', '格调生活版', '高阶定制版', '典雅至尊版', 
                      '国际藏家版', '臻选收藏版'
                   ][(product.ladderLevel || 1) - 1] } / {Array.isArray(product.space) ? product.space[0] : (product.space || '全屋')}
                 </span>
                 <span className="text-[13px] font-black text-white/20 uppercase tracking-[0.2em]">{Array.isArray(product.style) ? product.style[0] : (product.style || '默认风格')}</span>
              </div>
              
              <h1 className="text-[22px] md:text-[56px] font-black leading-[1.1] tracking-tight mb-3 md:mb-4 text-white uppercase">{product.name}</h1>
              <p className="text-[15px] md:text-[28px] text-white/40 font-medium mb-8 md:mb-10">{product.tagline || (product.category ? `${product.category} · 品质之选` : "让空间先舒服起来。")}</p>
              
              <div className="mb-10 md:mb-12">
                <div className="flex items-center gap-2 text-brand/60 text-[11px] md:text-[13px] font-black uppercase tracking-widest mb-1.5 md:mb-2">
                  <Sparkles className="w-4 h-4" /> 平台标准服务价
                </div>
                <div className="text-[28px] md:text-[48px] font-black flex items-baseline gap-4 text-white italic">
                  ¥{(product.standard_service_price || Math.round(productPrice * 1.2)).toLocaleString()}
                </div>
                <p className="text-white/40 text-[12px] md:text-[14px] font-medium mt-3 md:mt-4 leading-relaxed max-w-lg">
                  包含：产品出厂价 + 平台标准服务费用。加入方案后，可根据你的需求在结算页选择 <span className="text-white">自助采购</span>、<span className="text-white">平台标准服务</span> 或 <span className="text-white">本地区域服务商</span>。
                </p>
              </div>

              {/* Bottom Line Bro Judgment */}
              <div className="p-5 md:p-8 bg-white/5 rounded-[24px] md:rounded-[48px] border border-white/5 mb-8 md:mb-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                  <Sparkles className="w-24 h-24 text-brand" />
                </div>
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-3 md:mb-4">
                      <div className="w-1.5 h-4 md:h-6 bg-brand rounded-full" />
                      <span className="text-[10px] md:text-[11px] font-black text-brand uppercase tracking-[0.2em] md:tracking-[0.3em]">底线哥判断</span>
                   </div>
                   <p className="text-[15px] md:text-[17px] text-white/60 leading-relaxed font-medium italic">
                     “{product.recommendationReason || product.description || product.note || "这款产品不仅满足基础功能，更在美学细节上达到了平衡。"}”
                   </p>
                </div>
              </div>

              {/* Actions - Hidden on mobile, moved to bottom bar */}
              <div className="hidden md:flex flex-wrap gap-6 mb-16">
                 <button 
                  onClick={handleJoinPlan}
                  className="px-12 py-6 bg-brand text-white rounded-full font-black text-[18px] shadow-2xl shadow-brand/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                 >
                   加入我的方案 <Plus className="w-5 h-5" />
                 </button>
                 <button 
                  onClick={handleJoinLibrary}
                  className="px-12 py-6 bg-gray-100 text-gray-900 rounded-full font-black text-[18px] hover:bg-gray-200 transition-all flex items-center gap-3"
                 >
                   加入产品库 <Heart className="w-5 h-5" />
                 </button>
                 <button className="px-12 py-6 bg-white/5 text-white/40 rounded-full font-black text-[18px] hover:bg-white/10 transition-all flex items-center gap-3">
                   AI 帮我判断 <Sparkles className="w-5 h-5" />
                 </button>
              </div>

              {/* Indicator Mini Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                 {[
                   { label: '最佳适配', value: product.ladderLevel ? `P${product.ladderLevel} 最佳` : '全屋最佳', icon: <Layers className="w-4 h-4" /> },
                   { label: '预算影响', value: product.budgetImpact?.percentage ? `${product.budgetImpact.percentage}%` : '5%', icon: <TrendingUp className="w-4 h-4" /> },
                   { label: '审美提升', value: product.aestheticLift || 'A+', icon: <Sparkles className="w-4 h-4" /> },
                   { label: '落地风险', value: product.landingRisk || '极低', icon: <ShieldCheck className="w-4 h-4" /> },
                   { label: '搭配依赖', value: '需地毯/窗帘', icon: <RefreshCw className="w-4 h-4" /> }
                 ].map((stat, i) => (
                   <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-[28px] text-center group hover:border-brand/30 transition-all">
                      <div className="flex justify-center text-white/20 group-hover:text-brand transition-colors mb-2">
                        {stat.icon}
                      </div>
                      <p className="text-[10px] text-white/40 font-black uppercase mb-1">{stat.label}</p>
                      <p className="text-[14px] font-black text-white">{stat.value}</p>
                   </div>
                 ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Focus Points Navigation */}
      <div className="sticky top-[100px] z-[350] bg-white/80 backdrop-blur-3xl border-y border-gray-100 py-6 mb-24 hidden md:block">
        <div className="max-w-[1720px] mx-auto px-12 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <span className="text-[14px] font-black text-gray-400 mr-8 italic">“我更关心：”</span>
              {[
                { id: 'default', label: '默认', icon: <Info className="w-4 h-4" /> },
                { id: 'budget', label: '预算', icon: <TrendingUp className="w-4 h-4" /> },
                { id: 'effect', label: '效果', icon: <Maximize2 className="w-4 h-4" /> },
                { id: 'size', label: '尺寸', icon: <Ruler className="w-4 h-4" /> },
                { id: 'family', label: '家庭适配', icon: <Users className="w-4 h-4" /> }
              ].map(point => (
                <button 
                  key={point.id}
                  onClick={() => setFocusPoint(point.id as any)}
                  className={`px-8 py-3.5 rounded-full text-[14px] font-black flex items-center gap-2.5 transition-all ${focusPoint === point.id ? 'bg-brand text-white shadow-xl shadow-brand/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                  {point.icon} {point.label}
                </button>
              ))}
           </div>
           
           <div className="flex items-center gap-4 text-[13px] font-black text-gray-400">
              <CheckCircle2 className="w-4 h-4 text-brand" />
              <span>数据已实时对齐当前 P1 方案</span>
           </div>
        </div>
      </div>

      {/* 3. Detailed Sections Grid */}
      <div className="max-w-[1720px] mx-auto px-6 md:px-12 space-y-24 md:space-y-40 pb-32 md:pb-40">
        
        {/* Section: Effect */}
        <section id="effect" className={`scroll-mt-48 transition-all duration-700 ${focusPoint === 'effect' ? 'scale-105' : ''}`}>
           <div className="flex items-end justify-between mb-20">
              <div className="max-w-2xl">
                 <h2 className="text-[24px] md:text-[48px] font-black mb-3 md:mb-4 tracking-tighter">它放进家里的样子</h2>
                 <p className="text-[18px] text-gray-400 font-medium">已自动模拟放入：{product.style?.[0] || '默认风格'} · M2 · 客厅配置方案</p>
              </div>
              <div className="flex items-center gap-6">
                 <div className="flex p-1.5 bg-gray-100 rounded-full">
                    {['加入后', '对比原件'].map(t => (
                      <button key={t} className={`px-6 py-2.5 rounded-full text-[13px] font-black transition-all ${t === '加入后' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>
                        {t}
                      </button>
                    ))}
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 rounded-[24px] md:rounded-[64px] overflow-hidden bg-gray-50 border border-gray-100 relative group aspect-[16/9]">
                 <img src="/images/products/p4.jpg" className="w-full h-full object-cover" alt="Space simulation" />
                 <div className="absolute inset-x-0 bottom-0 p-6 md:p-12 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                    <p className="text-white text-[15px] md:text-[20px] font-black leading-relaxed max-w-xl">
                      这件产品会让客厅视觉更柔和，低重心设计有效释放了层高压力。
                    </p>
                 </div>
              </div>
              <div className="lg:col-span-4 flex flex-col gap-6 md:gap-12">
                 <div className="flex-1 p-6 md:p-10 bg-[#111] text-white rounded-[24px] md:rounded-[56px] relative overflow-hidden">
                    <Sparkles className="absolute top-0 right-0 p-8 opacity-[0.1] w-40 h-40" />
                    <h3 className="text-[20px] md:text-[24px] font-black mb-6 md:mb-8 relative z-10 text-brand">核心审美变化</h3>
                    <ul className="space-y-4 md:space-y-8 relative z-10 text-[13px] md:text-[15px] font-medium text-white/60">
                       <li className="flex items-start gap-4">
                          <Plus className="w-5 h-5 text-brand shrink-0" />
                          <span>视觉重心下移，客厅明显“稳”了很多。</span>
                       </li>
                       <li className="flex items-start gap-4">
                          <Plus className="w-5 h-5 text-brand shrink-0" />
                          <span>材质颗粒度与现有餐桌形成互补，风格感更统一。</span>
                       </li>
                       <li className="flex items-start gap-4">
                          <Minus className="w-5 h-5 text-red-400 shrink-0" />
                          <span>如果不搭配大地毯，沙发在大开间会显得有些孤立。</span>
                       </li>
                    </ul>
                 </div>
                 <div className="p-10 bg-white border border-gray-100 rounded-[56px] shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-1.5 h-6 bg-brand rounded-full" />
                       <span className="text-[11px] font-black text-brand uppercase tracking-widest">专家建议</span>
                    </div>
                    <p className="text-[15px] text-gray-500 font-medium leading-relaxed">
                      {product.usageAdvice}
                    </p>
                 </div>
              </div>
           </div>
        </section>

        {/* Section: Budget */}
        <section id="budget" className={`scroll-mt-48 transition-all duration-700 ${focusPoint === 'budget' ? 'scale-105' : ''}`}>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-32">
              <div>
                 <h2 className="text-[24px] md:text-[48px] font-black mb-6 md:mb-10 tracking-tighter">它会怎样影响预算</h2>
                 <div className="space-y-6 md:space-y-12">
                    <div className="grid grid-cols-2 gap-4 md:gap-8">
                       <div className="p-4 md:p-8 bg-gray-50 rounded-[20px] md:rounded-[40px] border border-gray-100">
                          <span className="text-[9px] md:text-[11px] text-gray-400 font-black uppercase tracking-widest block mb-1">标准服务价</span>
                          <span className="text-[22px] md:text-[32px] font-black">¥{(product.standard_service_price || Math.round(productPrice * 1.2)).toLocaleString()}</span>
                       </div>
                       <div className="p-4 md:p-8 bg-gray-50 rounded-[20px] md:rounded-[40px] border border-gray-100">
                          <span className="text-[9px] md:text-[11px] text-gray-400 font-black uppercase tracking-widest block mb-1">同类参考</span>
                          <span className="text-[14px] md:text-[18px] font-black text-gray-500 line-clamp-1">{product.budgetImpact?.comparison}</span>
                       </div>
                    </div>
                    
                    <div className="p-6 md:p-10 bg-white border border-gray-100 rounded-[24px] md:rounded-[48px] shadow-xl shadow-gray-100/50">
                       <div className="flex items-center justify-between mb-6 md:mb-8">
                          <h3 className="text-[16px] md:text-[20px] font-black">放入 M2 方案的表现</h3>
                          <span className={`px-3 py-1 rounded-full text-[10px] md:text-[12px] font-black ${product.budgetImpact?.pressure === '高' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                            压力 {product.budgetImpact?.pressure}
                          </span>
                       </div>
                       <div className="space-y-4 md:space-y-6">
                          <div className="flex justify-between text-[13px] md:text-[14px]">
                            <span className="text-gray-400 font-medium">预算占比</span>
                            <span className="font-black">{product.budgetImpact?.percentage}%</span>
                          </div>
                          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                             <div className="h-full bg-brand rounded-full" style={{ width: `${product.budgetImpact?.percentage}%` }} />
                          </div>
                          <p className="text-[14px] text-gray-500 font-medium leading-relaxed pt-4 border-t border-gray-50 italic">
                            “如果你总预算低于 3 万，不建议把它作为首选；如果你总预算在 5-8 万，它是值得优先保留的大件。”
                          </p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-12 pt-12 lg:pt-0">
                 <div className="flex items-center gap-3 mb-10">
                    <RefreshCw className="w-6 h-6 text-brand" />
                    <h3 className="text-[22px] font-black uppercase tracking-tight">你可以这样替代</h3>
                 </div>
                 {[
                   { label: '同风格更省', name: '云居简约款', price: '¥5,600', diff: '- ¥3,300', icon: <Minus className="w-5 h-5" /> },
                   { label: '同预算更稳', name: '大术工坊主流款', price: '¥8,200', diff: '- ¥700', icon: <CheckCircle2 className="w-5 h-5" /> },
                   { label: '高一档升级', name: '国际大师复刻系列', price: '¥14,500', diff: '+ ¥5,600', icon: <Plus className="w-5 h-5" /> }
                 ].map((alt, i) => (
                   <div key={i} className="group p-8 bg-white hover:bg-gray-50 border border-gray-100 rounded-[40px] flex items-center justify-between transition-all cursor-pointer">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-gray-100 rounded-[22px] flex items-center justify-center text-gray-400 group-hover:bg-brand group-hover:text-white transition-all">
                           {alt.icon}
                        </div>
                        <div>
                           <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{alt.label}</span>
                           <h4 className="text-[18px] font-black">{alt.name}</h4>
                        </div>
                      </div>
                      <div className="text-right">
                         <div className="text-[18px] font-black">{alt.price}</div>
                         <div className={`text-[12px] font-bold ${alt.diff.startsWith('+') ? 'text-amber-500' : 'text-emerald-500'}`}>{alt.diff}</div>
                      </div>
                   </div>
                 ))}

                 {/* Custom Service Call to Action */}
                 <div className="p-10 bg-brand/5 border border-brand/20 rounded-[48px] relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 blur-[40px]" />
                   <h4 className="text-[20px] font-black text-gray-900 mb-2 relative z-10 text-left">需要更高阶的采购服务？</h4>
                   <p className="text-gray-500 text-[14px] font-medium mb-8 relative z-10 text-left leading-relaxed">
                     对于复杂的厂家协调、多供应商比价、大宗采购议价或项目落地跟见，你可以申请我们的定制服务。
                   </p>
                   <Link 
                     to="/custom-service"
                     className="inline-flex items-center gap-2 text-[14px] font-black text-brand relative z-10 hover:gap-4 transition-all"
                   >
                     了解定制服务详情 <ArrowRight className="w-5 h-5" />
                   </Link>
                 </div>
              </div>
           </div>
        </section>

        {/* Section: Matching */}
        <section id="matching" className="scroll-mt-48">
           <div className="text-center max-w-4xl mx-auto mb-24">
              <h2 className="text-[24px] md:text-[48px] font-black mb-4 md:mb-6 tracking-tighter">和它一起，空间才完整</h2>
              <p className="text-[18px] text-gray-400 font-medium leading-relaxed">
                单品无法建立审美。我们通过对数千个成功交付案例的分析，整理出了这套搭配全链路建议。
              </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[
                { tag: '主件核心', name: product.name, status: 'active' },
                { tag: '必搭 (地基)', name: '羊毛手工织造地毯', status: 'required' },
                { tag: '必搭 (层次)', name: '亚麻原色遮光帘', status: 'required' },
                { tag: '建议搭 (重心)', name: '胡桃木极简茶几', status: 'suggested' },
                { tag: '可后补 (点亮)', name: '极细落地阅读灯', status: 'optional' }
              ].map((item, i) => (
                <div key={i} className="relative flex flex-col items-center">
                   {i < 4 && <div className="hidden lg:block absolute top-1/3 -right-3 z-10"><ChevronRight className="w-6 h-6 text-gray-200" /></div>}
                   <div className={`w-full p-8 rounded-[48px] border text-center transition-all ${item.status === 'active' ? 'bg-brand text-white border-brand shadow-2xl shadow-brand/30' : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'}`}>
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 block ${item.status === 'active' ? 'text-white/60' : 'text-gray-400'}`}>
                        {item.tag}
                      </span>
                      <h4 className="text-[16px] font-black leading-tight mb-8 min-h-[40px] flex items-center justify-center">
                        {item.name}
                      </h4>
                      <button className={`w-full py-4 rounded-[20px] text-[12px] font-black transition-all ${item.status === 'active' ? 'bg-white/20' : 'bg-gray-50 hover:bg-black hover:text-white'}`}>
                        {item.status === 'active' ? '当前查看' : '查看/加入'}
                      </button>
                   </div>
                </div>
              ))}
           </div>
           
           <div className="mt-20 p-12 bg-gray-50 flex flex-col md:flex-row items-center justify-between rounded-[56px] gap-8">
              <div className="flex items-center gap-6">
                 <div className="w-20 h-20 rounded-[32px] bg-white flex items-center justify-center shadow-xl">
                    <RefreshCw className="w-10 h-10 text-brand" />
                 </div>
                 <div>
                    <h4 className="text-[24px] font-black mb-2">一键生成全空间搭配组合</h4>
                    <p className="text-gray-400 font-medium">我们将根据该单品，自动匹配 4 件其它必选家具</p>
                 </div>
              </div>
              <button className="px-12 py-6 bg-brand text-white rounded-full font-black text-[18px] shadow-2xl shadow-brand/20 hover:scale-105 active:scale-95 transition-all">
                立即生成搭配方案
              </button>
           </div>
        </section>

        {/* Section: Suitability */}
        <section id="suitability" className={`scroll-mt-48 transition-all duration-700 ${focusPoint === 'family' ? 'scale-105' : ''}`}>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
              <div className="p-8 md:p-16 bg-emerald-50/50 rounded-[32px] md:rounded-[64px] border border-emerald-100/50 relative overflow-hidden group">
                 <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 blur-[80px] group-hover:scale-150 transition-transform duration-1000" />
                 <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-emerald-500 mb-6 md:mb-10" />
                 <h3 className="text-[24px] md:text-[36px] font-black mb-6 md:mb-8">适合什么样的家</h3>
                 <ul className="space-y-4 md:space-y-6">
                   {product.suitableFor?.map((s, i) => (
                     <li key={i} className="flex items-center gap-3 text-[14px] md:text-[17px] font-bold text-emerald-800">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {s}
                     </li>
                   ))}
                 </ul>
              </div>
              <div className="p-8 md:p-16 bg-red-50/50 rounded-[32px] md:rounded-[64px] border border-red-100/50 relative overflow-hidden group">
                 <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-500/10 blur-[80px] group-hover:scale-150 transition-transform duration-1000" />
                 <AlertTriangle className="w-10 h-10 md:w-12 md:h-12 text-red-500 mb-6 md:mb-10" />
                 <h3 className="text-[24px] md:text-[36px] font-black mb-6 md:mb-8">不适合的情况</h3>
                 <ul className="space-y-4 md:space-y-6">
                   {product.notSuitableFor?.map((s, i) => (
                     <li key={i} className="flex items-center gap-3 text-[14px] md:text-[17px] font-bold text-red-800">
                       <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> {s}
                     </li>
                   ))}
                 </ul>
              </div>
           </div>
        </section>

        {/* Section: Landing */}
        <section id="landing" className={`scroll-mt-48 transition-all duration-700 ${focusPoint === 'size' ? 'scale-105' : ''}`}>
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                 <h2 className="text-[24px] md:text-[48px] font-black mb-8 md:mb-12 tracking-tighter">买之前，先确认这些</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-10 bg-white border border-gray-100 rounded-[48px] shadow-sm">
                       <div className="flex items-center gap-4 mb-8">
                          <Ruler className="w-6 h-6 text-brand" />
                          <h4 className="text-[18px] md:text-[20px] font-black">空间尺寸与动线</h4>
                       </div>
                       <ul className="space-y-6 text-[15px] font-medium text-gray-500">
                          <li className="flex justify-between">
                             <span>建议客厅开间</span>
                             <span className="text-black font-black">≥ 3.6m</span>
                          </li>
                          <li className="flex justify-between">
                             <span>前方预留通道</span>
                             <span className="text-black font-black">≥ 80cm</span>
                          </li>
                          <li className="pt-4 border-t border-gray-50 italic">
                             {product.spaceAdvice}
                          </li>
                       </ul>
                    </div>
                    
                    <div className="p-10 bg-white border border-gray-100 rounded-[48px] shadow-sm">
                       <div className="flex items-center gap-4 mb-8">
                          <Box className="w-6 h-6 text-brand" />
                          <h4 className="text-[18px] md:text-[20px] font-black">入户条件确认</h4>
                       </div>
                       <ul className="space-y-6 text-[15px] font-medium text-gray-500">
                          {product.entryRequirements?.map((r, i) => (
                            <li key={i} className="flex items-center gap-3">
                               <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {r}
                            </li>
                          ))}
                          <li className="flex items-center gap-3">
                             <AlertTriangle className="w-4 h-4 text-amber-500" /> 包装最长边约 220cm
                          </li>
                       </ul>
                    </div>
                 </div>
              </div>
              
              <div className="bg-[#111] text-white p-8 md:p-12 rounded-[32px] md:rounded-[64px] flex flex-col justify-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-12 opacity-[0.2]">
                    <ShieldCheck className="w-32 h-32 text-brand" />
                 </div>
                 <div className="relative z-10">
                    <h4 className="text-[22px] md:text-[28px] font-black mb-4">清洁与维护</h4>
                    <p className="text-white/40 text-[14px] md:text-[16px] leading-relaxed mb-8 md:mb-10 font-medium">
                       {product.maintenance}
                    </p>
                    <div className="flex items-center gap-4 pt-10 border-t border-white/10">
                       <div className="px-5 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-[12px] font-black">
                          落地风险：{product.landingRisk}
                       </div>
                       <span className="text-white/30 text-[12px] font-bold italic">由 AI 安全评估生成</span>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Section: Params */}
        <section id="params" className="scroll-mt-48 pb-24">
           <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-3">
              <div className="w-1.5 h-6 md:h-10 bg-brand rounded-full" />
              <h2 className="text-[24px] md:text-[42px] font-black tracking-tight">产品真实参数</h2>
           </div>
           <p className="text-[13px] md:text-[16px] text-gray-400 font-medium mb-10 md:mb-16 ml-4 md:ml-6">
             以下数据会用于方案适配、预算影响、搭配推荐和 AI 判断。
           </p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-20 gap-y-12">
              {[
                { label: '基础信息', items: [['品牌', product.brand || 'DXG'], ['名称', product.name], ['品类', product.category || '未分类']] },
                { label: '视觉与风格', items: [['设计风格', Array.isArray(product.style) ? product.style.join(' / ') : (product.style || '默认')], ['适配层级', `P${product.ladderLevel || 1}`], ['主要色系', '米色/灰色']] },
                { label: '材质说明', items: [['主材', product.material || '高支克棉麻'], ['内部填充', '45D 高回弹海绵'], ['框架', '实木多层板']] },
                { label: '尺寸规格', items: [['外型尺寸', product.dimensions || '240 x 105 x 85 cm'], ['坐深/坐高', '65 / 42 cm'], ['净重', '68kg']] },
                { label: '家庭适配', items: [['环保等级', 'ENF 级标准'], ['防霉防潮', '具备'], ['耐磨系数', '≥ 20,000次']] },
                { label: '交付与服务', items: [['配送策略', '专业师傅上门'], ['质保期限', '框架 5 年 / 面料 1 年'], ['备货周期', '15-20 天']] },
              ].map((group, i) => (
                <div key={i} className="space-y-6">
                   <h3 className="text-[13px] font-black text-brand uppercase tracking-widest">{group.label}</h3>
                   <div className="space-y-4">
                      {group.items.map(([k, v], j) => (
                        <div key={j} className="flex justify-between items-baseline border-b border-gray-50 pb-4">
                           <span className="text-[14px] text-gray-400 font-medium">{k}</span>
                           <span className="text-[14px] font-black text-right max-w-[200px]">{v}</span>
                        </div>
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </section>
      </div>

      {/* 4. AI Individual Assessment (Fixed Entry) - Hidden on mobile in this page to avoid overlap */}
      <div className="fixed bottom-12 right-12 z-[450] hidden md:block">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 px-10 py-6 bg-brand text-white rounded-full shadow-[0_30px_70px_rgba(45,212,191,0.4)] group"
        >
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <div className="text-left">
             <span className="block text-[11px] font-black opacity-60 uppercase tracking-widest leading-none mb-1">AI 帮我决策</span>
             <span className="block text-[17px] font-black leading-none">是否适合我家？</span>
          </div>
        </motion.button>
      </div>

      {/* 5. Sticky Bottom Action Bar (Desktop) */}
      <div className="fixed bottom-0 left-0 right-0 z-[400] px-6 pb-10 pointer-events-none hidden md:block">
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="max-w-[1720px] mx-auto h-24 bg-black/90 backdrop-blur-3xl border border-white/5 rounded-[40px] shadow-[0_30px_80px_rgba(0,0,0,0.4)] pointer-events-auto flex items-center justify-between px-12"
        >
           <div className="flex items-center gap-12 text-left">
              <div className="flex flex-col">
                <span className="text-white font-black text-[28px]">¥{(product.standard_service_price || Math.round(productPrice * 1.2)).toLocaleString()}</span>
                <span className="text-white/40 text-[12px] font-bold uppercase tracking-widest">包含平台标准服务费</span>
              </div>
              <div className="hidden lg:flex items-center gap-4">
                 <div className="px-4 py-1.5 bg-brand/20 border border-brand/20 text-brand rounded-[12px] text-[12px] font-black">
                   适配 {Array.isArray(product.space) ? product.space[0] : (product.space || '全屋')}
                 </div>
                 <div className="text-white/40 text-[12px] font-black flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 空间已确认
                 </div>
              </div>
           </div>
           
           <div className="flex items-center gap-6">
              <button 
                onClick={handleJoinPlan}
                className="px-10 py-5 bg-white text-black rounded-[24px] font-black text-[17px] hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
              >
                加入我的方案 <Plus className="w-5 h-5" />
              </button>
              <button 
                onClick={handleJoinLibrary}
                className="px-10 py-5 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-[24px] font-black text-[17px] hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
              >
                加入产品库 <Heart className="w-5 h-5" />
              </button>
              <button className="px-8 py-5 text-white/40 hover:text-brand transition-all flex items-center gap-3 font-black text-[15px]">
                AI 帮我判断 <Sparkles className="w-5 h-5" />
              </button>
           </div>
        </motion.div>
      </div>

      {/* 6. Sticky Bottom Action Bar (Mobile) */}
      <div className="mobile-bottom-bar md:hidden">
        <div className="flex flex-col text-left">
          <span className="text-white font-black text-[20px] md:text-[22px] leading-tight">¥{(product.standard_service_price || Math.round(productPrice * 1.2)).toLocaleString()}</span>
          <span className="text-white/30 text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-black">标准服务价</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
           <button 
             onClick={handleJoinLibrary}
             className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 active:bg-white/10"
           >
             <Heart className="w-5 h-5" />
           </button>
           <button 
             onClick={handleJoinPlan}
             className="h-10 md:h-12 px-5 md:px-6 bg-brand text-white rounded-full font-black text-[13px] md:text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-brand/20 active:scale-95 transition-transform"
           >
             加入方案
           </button>
        </div>
      </div>
      
      {/* Scroll padding */}
      <div className="h-[220px]" />
    </div>
  );
}
