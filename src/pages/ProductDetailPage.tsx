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
  { id: 'overview', name: '概览' },
  { id: 'effect', name: '效果' },
  { id: 'budget', name: '预算' },
  { id: 'matching', name: '搭配' },
  { id: 'suitability', name: '适配' },
  { id: 'landing', name: '落地' },
  { id: 'params', name: '参数' }
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const snapshot = location.state?.productSnapshot;
  const planId = location.state?.planId;

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [isScrolled, setIsScrolled] = useState(false);
  const [focusPoint, setFocusPoint] = useState<'default' | 'budget' | 'effect' | 'size' | 'family'>('default');
  
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
      if (snapshot) setProduct(snapshot);
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
    if (product) analyticsService.track('click_add_to_plan', { product_id: product.id });
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
    const hash = window.location.hash;
    if (hash) {
      const targetId = hash.replace('#', '');
      setTimeout(() => scrollToSection(targetId), 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
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
      navigate(`/my-plans?planId=${planId}&tab=${fromTab}`, { replace: true });
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-brand animate-spin mx-auto mb-4" />
          <p className="text-white/40 font-bold text-[14px]">正在搜寻全球好物...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white px-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-white/20 mx-auto mb-6" />
          <h1 className="text-xl font-black mb-8">产品信息暂不可用</h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={handleBackToPlan} className="w-full sm:w-auto text-brand font-black px-8 py-3 bg-brand/5 rounded-full border border-brand/20 transition-all">{planId ? '返回方案详情' : '返回上一页'}</button>
            <Link to="/products" className="w-full sm:w-auto text-white/40 font-black hover:text-white px-8 py-3 bg-white/5 rounded-full transition-all">返回产品库</Link>
          </div>
        </div>
      </div>
    );
  }

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = window.innerWidth < 768 ? 120 : 180;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-brand/30">
      {/* Sticky Header Navigation (Desktop) */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="fixed top-24 left-0 right-0 z-[400] px-6 hidden md:flex justify-center pointer-events-none"
        >
          <div className="w-full max-w-5xl h-16 bg-black/80 backdrop-blur-3xl border border-white/5 rounded-[28px] shadow-2xl pointer-events-auto flex items-center px-8 justify-between">
             <div className="flex items-center gap-4">
                <span className={`text-[15px] font-black line-clamp-1 ${isScrolled ? 'block' : 'hidden'}`}>{product.name}</span>
                {!isScrolled && <span className="text-[13px] font-black text-white/30 whitespace-nowrap">快速导航：</span>}
                <div className={`h-4 w-px bg-white/10 mx-2 ${isScrolled ? 'block' : 'hidden md:block'}`} />
                <div className="flex gap-4 lg:gap-6">
                  {SECTION_IDS.map(s => (
                    <button 
                      key={s.id} onClick={() => scrollToSection(s.id)}
                      className={`text-[13px] font-black transition-colors relative whitespace-nowrap ${activeSection === s.id ? 'text-brand' : 'text-white/30 hover:text-white'}`}
                    >
                      {s.name}
                      {activeSection === s.id && <motion.div layoutId="activeDot" className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand rounded-full" />}
                    </button>
                  ))}
                </div>
             </div>
             <div className="flex items-center gap-4 shrink-0 pl-4">
                <span className="text-[16px] font-black text-white">¥{(product.standard_service_price || Math.round(productPrice * 1.2)).toLocaleString()}</span>
                <button onClick={handleJoinPlan} className="px-5 py-2 bg-brand text-white rounded-full text-[12px] font-black shadow-lg shadow-brand/20">加入方案</button>
             </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Mobile Anchor Nav */}
      <div className={`md:hidden fixed top-20 left-0 right-0 z-[390] transition-all bg-black/90 backdrop-blur-xl border-b border-white/5 overflow-x-auto no-scrollbar scroll-smooth p-3 ${isScrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="flex gap-4 px-2">
          {SECTION_IDS.map(s => (
            <button key={s.id} onClick={() => scrollToSection(s.id)} className={`text-[13px] font-black whitespace-nowrap px-3 py-1 rounded-full transition-all ${activeSection === s.id ? 'bg-brand text-white' : 'text-white/40'}`}>
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <AddToPlanModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} product={product} onToast={(msg) => setToastMessage(msg)} />
      <Toast message={toastMessage} onClear={() => setToastMessage(null)} />

      {/* Hero Section */}
      <section id="overview" className="max-w-[1440px] mx-auto px-6 md:px-12 pt-28 md:pt-36 pb-16 md:pb-24">
        <div className="mb-8 hidden md:block">
          <Breadcrumbs isDark items={[{ name: '全部产品', path: '/products' }, ...(product?.category ? [{ name: product.category, path: `/products?category=${product.category}` }] : []), { name: '产品详情' }]} />
        </div>
        <button onClick={handleBackToPlan} className="mb-6 md:mb-12 inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-[13px] md:text-[14px] font-black transition-all group text-white/50 hover:text-white">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {planId ? '返回方案详情' : '返回'}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 items-start">
          {/* Left: Gallery */}
          <div className="space-y-4 md:space-y-6">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="aspect-[4/3] rounded-[32px] md:rounded-[64px] overflow-hidden bg-white/5 border border-white/10 group relative">
              <img src={product.image || null} className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-105" alt={product.name} />
              <button className="absolute bottom-6 right-6 md:bottom-10 md:right-10 w-12 h-12 md:w-14 md:h-14 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center shadow-2xl"><Maximize2 className="w-5 h-5 md:w-6 md:h-6 text-white" /></button>
            </motion.div>
            <div className="grid grid-cols-4 gap-3 md:gap-4">
              {[product.image, product.image, product.image].map((img, i) => (
                <div key={i} className="aspect-square rounded-2xl md:rounded-[32px] overflow-hidden bg-white/5 border border-white/5 flex items-center justify-center p-2"><img src={img || null} className="max-w-full max-h-full object-contain" alt="" /></div>
              ))}
              <div className="aspect-square rounded-2xl md:rounded-[32px] bg-white/5 border border-white/5 flex items-center justify-center text-white/20 group cursor-pointer hover:bg-white/10"><Play className="w-6 h-6 md:w-8 md:h-8 group-hover:scale-110 transition-transform" /></div>
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex flex-col h-full md:py-6">
            <div className="flex flex-wrap items-center gap-3 mb-6">
               <span className="px-4 py-1.5 bg-brand text-white rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg shadow-brand/20">
                 { [ '极简入门版', '精选入门版', '舒适基础版', '品质进阶版', '设计精选版', '格调生活版', '高阶定制版', '典雅至尊版', '国际藏家版', '臻选收藏版' ][(product.ladderLevel || 1) - 1] } · {Array.isArray(product.space) ? product.space[0] : (product.space || '全屋')}
               </span>
               <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">{Array.isArray(product.style) ? product.style[0] : (product.style || '默认风格')}</span>
            </div>
            
            <h1 className="text-[32px] md:text-[42px] lg:text-[56px] font-black ml-[-2px] leading-[1.1] tracking-tight mb-4 text-white uppercase">{product.name}</h1>
            <p className="text-[16px] md:text-[24px] text-white/40 font-medium mb-10">{product.tagline || (product.category ? `${product.category} · 品质之选` : "让空间先舒服起来。")}</p>
            
            <div className="mb-10 text-left">
              <div className="flex items-center gap-2 text-brand/60 text-[11px] md:text-[13px] font-black uppercase tracking-widest mb-2"><Sparkles className="w-4 h-4" /> 平台标准服务价</div>
              <div className="text-[32px] md:text-[48px] font-black flex items-baseline gap-4 text-white italic">¥{(product.standard_service_price || Math.round(productPrice * 1.2)).toLocaleString()}</div>
              <p className="text-white/30 text-[13px] md:text-[14px] font-medium mt-4 leading-relaxed max-w-lg">
                包含：产品出厂价 + 平台标准服务费用。加入方案后即可结算。
              </p>
            </div>

            <div className="p-6 md:p-8 bg-white/5 rounded-[32px] md:rounded-[48px] border border-white/5 mb-10 relative overflow-hidden text-left">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-5 bg-brand rounded-full" />
                  <span className="text-[10px] font-black text-brand uppercase tracking-[0.3em]">底线哥判断</span>
               </div>
               <p className="text-[15px] md:text-[17px] text-white/60 leading-relaxed font-medium italic">“{product.recommendationReason || product.description || "这款产品不仅满足基础功能，更在美学细节上达到了平衡。无论是材质的触感还是视觉的张力，都是方案中的点睛之笔。"}”</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
               <button onClick={handleJoinPlan} className="flex-1 px-8 py-5 md:py-6 bg-brand text-white rounded-full font-black text-[16px] md:text-[18px] shadow-2xl shadow-brand/20 flex items-center justify-center gap-3 transition-transform active:scale-95">加入方案 <Plus className="w-5 h-5" /></button>
               <button onClick={handleJoinLibrary} className="flex-1 px-8 py-5 md:py-6 bg-white/5 border border-white/10 text-white rounded-full font-black text-[16px] md:text-[18px] hover:bg-white/10 transition-all flex items-center justify-center gap-3 active:scale-95">加入库 <Heart className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
               {[
                 { label: '最佳适配', value: product.ladderLevel ? `P${product.ladderLevel}` : '全屋', icon: <Layers className="w-3.5 h-3.5" /> },
                 { label: '预算占比', value: product.budgetImpact?.percentage ? `${product.budgetImpact.percentage}%` : '5%', icon: <TrendingUp className="w-3.5 h-3.5" /> },
                 { label: '审美提升', value: product.aestheticLift || 'A+', icon: <Sparkles className="w-3.5 h-3.5" /> },
                 { label: '落地风险', value: product.landingRisk || '极低', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
                 { label: '依赖地毯', value: '是', icon: <RefreshCw className="w-3.5 h-3.5" /> }
               ].map((stat, i) => (
                 <div key={i} className="p-3 md:p-4 bg-white/5 border border-white/5 rounded-2xl md:rounded-[28px] text-center group hover:border-brand/30 transition-all">
                    <div className="flex justify-center text-white/20 mb-1.5">{stat.icon}</div>
                    <p className="text-[9px] text-white/40 font-black uppercase mb-1">{stat.label}</p>
                    <p className="text-[13px] md:text-[14px] font-black text-white">{stat.value}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* Focus Points Nav (Desktop hidden on small) */}
      <div className="hidden md:block sticky top-[100px] z-[350] bg-white text-gray-900 border-y border-gray-100 py-6 mb-24">
        <div className="max-w-[1440px] mx-auto px-12 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <span className="text-[13px] font-black text-gray-400 mr-4 italic">“我更关心：”</span>
              {['default', 'budget', 'effect', 'size', 'family'].map(id => (
                <button key={id} onClick={() => setFocusPoint(id as any)} className={`px-6 py-2.5 rounded-full text-[13px] font-black transition-all ${focusPoint === id ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-gray-100 text-gray-500'}`}>
                  {id === 'default' ? '默认' : id === 'budget' ? '预算' : id === 'effect' ? '效果' : id === 'size' ? '尺寸' : '适配'}
                </button>
              ))}
           </div>
           <div className="flex items-center gap-3 text-[12px] font-black text-gray-400"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>已对齐当前 P1 方案</span></div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-24 md:space-y-40 text-left">
        {/* Section: Effect */}
        <section id="effect" className="scroll-mt-32">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-20">
              <div className="max-w-2xl">
                 <h2 className="text-[32px] md:text-[48px] font-black mb-4 tracking-tighter">它放进家里的样子</h2>
                 <p className="text-[15px] md:text-[18px] text-white/40 font-medium">已自动模拟：{product.style?.[0] || '默认风格'} · M2 方案</p>
              </div>
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
              <div className="lg:col-span-8 rounded-[32px] md:rounded-[64px] overflow-hidden bg-white/5 border border-white/5 relative aspect-square md:aspect-[16/9]">
                 <img src="/images/products/p4.jpg" className="w-full h-full object-cover" alt="Sim" />
                 <div className="absolute inset-x-0 bottom-0 p-6 md:p-12 bg-gradient-to-t from-black/90 to-transparent"><p className="text-white text-[16px] md:text-[20px] font-black leading-relaxed max-w-xl">重心均衡，能够有效释放层高压力，呈现宁静气质。</p></div>
              </div>
              <div className="lg:col-span-4 flex flex-col gap-6 md:gap-12">
                 <div className="p-8 md:p-10 bg-white/5 text-white rounded-[32px] md:rounded-[56px] border border-white/10 flex-1">
                    <Sparkles className="w-10 h-10 text-brand/20 mb-6" />
                    <h3 className="text-[20px] md:text-[24px] font-black mb-6 text-brand">核心审美变化</h3>
                    <ul className="space-y-6 text-[14px] md:text-[15px] text-white/60 font-medium">
                       <li className="flex gap-3"><Plus className="w-4 h-4 text-brand shrink-0" />视觉重心下移，更显沉稳。</li>
                       <li className="flex gap-3"><Plus className="w-4 h-4 text-brand shrink-0" />材质颗粒形成优雅互补。</li>
                       <li className="flex gap-3 text-red-400"><Minus className="w-4 h-4 shrink-0" />需地毯柔化底部边界。</li>
                    </ul>
                 </div>
              </div>
           </div>
        </section>

        {/* Section: Budget */}
        <section id="budget" className="scroll-mt-32">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-32">
              <div>
                 <h2 className="text-[32px] md:text-[48px] font-black mb-8 md:mb-10 tracking-tighter">它会怎样影响预算</h2>
                 <div className="grid grid-cols-2 gap-4 md:gap-8 mb-8">
                    <div className="p-6 md:p-8 bg-white/5 rounded-3xl md:rounded-[40px] border border-white/5"><span className="text-[10px] text-white/30 font-black tracking-widest block mb-1">平台服务价</span><span className="text-[24px] md:text-[32px] font-black">¥{(product.standard_service_price || 0).toLocaleString()}</span></div>
                    <div className="p-6 md:p-8 bg-white/5 rounded-3xl md:rounded-[40px] border border-white/5"><span className="text-[10px] text-white/30 font-black tracking-widest block mb-1">同类区间</span><span className="text-[16px] md:text-[18px] font-black text-white/40">{product.budgetImpact?.comparison || '--'}</span></div>
                 </div>
                 <div className="p-8 md:p-10 bg-white/5 border border-white/10 rounded-[32px] md:rounded-[48px]">
                    <div className="flex items-center justify-between mb-8"><h3 className="text-[18px] md:text-[20px] font-black">M2 方案配合度</h3><span className="text-[12px] font-bold text-emerald-400">压力极小</span></div>
                    <div className="space-y-4">
                       <div className="flex justify-between text-[13px] md:text-[14px] text-white/40 font-medium"><span>单品预算占比</span><span className="font-black">{product.budgetImpact?.percentage || 5}%</span></div>
                       <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-brand" style={{ width: `${product.budgetImpact?.percentage || 5}%` }} /></div>
                    </div>
                 </div>
              </div>
              <div className="space-y-6 md:space-y-12">
                 <h3 className="text-[20px] md:text-[22px] font-black flex items-center gap-3"><RefreshCw className="w-5 h-5 text-brand" />替代方案推荐</h3>
                 {[
                   { label: '风格更省', name: '云居简约款', diff: '- ¥3,300', icon: <Minus className="w-4 h-4" /> },
                   { label: '更稳平衡', name: '大术工坊主流', diff: '持平', icon: <CheckCircle2 className="w-4 h-4" /> },
                   { label: '极奢升级', name: '大师收藏系', diff: '+ ¥5,600', icon: <Plus className="w-4 h-4" /> }
                 ].map((alt, i) => (
                    <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20">{alt.icon}</div>
                          <div><span className="text-[9px] text-white/30 font-black uppercase">{alt.label}</span><h4 className="text-[15px] font-black">{alt.name}</h4></div>
                       </div>
                       <span className={`text-[12px] font-black ${alt.diff.startsWith('+') ? 'text-amber-400' : 'text-emerald-400'}`}>{alt.diff}</span>
                    </div>
                 ))}
                 <div className="p-8 bg-brand/10 border border-brand/20 rounded-[32px]"><h4 className="text-[18px] font-black mb-2">需要高阶定制？</h4><p className="text-white/40 text-[13px] mb-6">针对大宅交付、多供应商议价或全案落地，推荐申请底线哥定制服务。</p><Link to="/custom-service" className="text-brand text-[13px] font-black flex items-center gap-2">查看服务详情 <ArrowRight className="w-4 h-4" /></Link></div>
              </div>
           </div>
        </section>

        {/* Section: Matching */}
        <section id="matching" className="scroll-mt-32">
           <div className="text-center md:max-w-4xl mx-auto mb-12 md:mb-24">
              <h2 className="text-[32px] md:text-[48px] font-black mb-6 tracking-tighter">搭配全链路建议</h2>
              <p className="text-[15px] md:text-[18px] text-white/40 leading-relaxed font-medium">家具不仅是单品，更是一套互补的审美系统。</p>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6">
              {[
                { tag: '核心', name: product.name, active: true },
                { tag: '必搭 (地基)', name: '羊毛手工地毯' },
                { tag: '必搭 (层次)', name: '亚麻原色帘' },
                { tag: '建议 (重心)', name: '胡桃木茶几' },
                { tag: '点亮 (可后补)', name: '极细落地灯' }
              ].map((item, i) => (
                <div key={i} className={`p-5 md:p-8 rounded-[32px] border text-center transition-all ${item.active ? 'bg-brand border-brand shadow-xl shadow-brand/20' : 'bg-white/5 border-white/5'}`}>
                   <span className={`text-[9px] font-black uppercase mb-3 block ${item.active ? 'text-white/60' : 'text-white/20'}`}>{item.tag}</span>
                   <h4 className="text-[13px] md:text-[15px] font-black mb-6 min-h-[40px] flex items-center justify-center line-clamp-2">{item.name}</h4>
                   <button className={`w-full py-3 rounded-xl text-[11px] font-black ${item.active ? 'bg-white/20' : 'bg-white/10'}`}>{item.active ? '当前查看' : '加入搭配'}</button>
                </div>
              ))}
           </div>
        </section>

        {/* Section: Suitability */}
        <section id="suitability" className="scroll-mt-32">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
              <div className="p-10 md:p-16 bg-emerald-500/5 rounded-[40px] md:rounded-[64px] border border-emerald-500/10"><CheckCircle2 className="w-10 h-10 text-emerald-500 mb-8" /><h3 className="text-[28px] md:text-[36px] font-black mb-6">适合怎样的家</h3><ul className="space-y-4 text-[15px] md:text-[17px] font-bold text-emerald-200/80">{product.suitableFor?.map((s, i) => <li key={i} className="flex gap-3"><span className="w-2 h-2 mt-2 bg-emerald-500 rounded-full shrink-0" />{s}</li>)}</ul></div>
              <div className="p-10 md:p-16 bg-red-500/5 rounded-[40px] md:rounded-[64px] border border-red-500/10"><AlertTriangle className="w-10 h-10 text-red-500 mb-8" /><h3 className="text-[28px] md:text-[36px] font-black mb-6">哪些不太适合</h3><ul className="space-y-4 text-[15px] md:text-[17px] font-bold text-red-200/80">{product.notSuitableFor?.map((s, i) => <li key={i} className="flex gap-3"><span className="w-2 h-2 mt-2 bg-red-500 rounded-full shrink-0" />{s}</li>)}</ul></div>
           </div>
        </section>

        {/* Section: Landing */}
        <section id="landing" className="scroll-mt-32">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
              <div className="lg:col-span-2"><h2 className="text-[32px] md:text-[48px] font-black mb-10 tracking-tighter">买之前，先确认</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="p-8 md:p-10 bg-white/5 border border-white/5 rounded-[32px]"><div className="flex items-center gap-4 mb-6"><Ruler className="w-5 h-5 text-brand" /><h4 className="text-[18px] md:text-[20px] font-black">尺寸与动线</h4></div><ul className="space-y-4 text-[14px] text-white/40 font-medium"><li>建议客厅开间：≥ 3.6m</li><li>前方通道：≥ 80cm</li><li className="pt-4 border-t border-white/5 italic text-white/60">{product.spaceAdvice}</li></ul></div><div className="p-8 md:p-10 bg-white/5 border border-white/5 rounded-[32px]"><div className="flex items-center gap-4 mb-6"><Box className="w-5 h-5 text-brand" /><h4 className="text-[18px] md:text-[20px] font-black">入户确认</h4></div><ul className="space-y-4 text-[14px] text-white/40 font-medium">{product.entryRequirements?.map((r, i) => <li key={i} className="flex gap-3"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />{r}</li>)}</ul></div></div></div>
              <div className="bg-[#111] p-10 md:p-12 rounded-[40px] md:rounded-[64px] border border-white/5"><ShieldCheck className="w-10 h-10 text-brand mb-6" /><h4 className="text-[24px] md:text-[28px] font-black mb-4">维护建议</h4><p className="text-white/40 text-[14px] md:text-[15px] leading-relaxed mb-10">{product.maintenance}</p><div className="pt-8 border-t border-white/10 flex flex-wrap gap-4 items-center"><span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[11px] font-black uppercase">低风险</span></div></div>
           </div>
        </section>

        {/* Section: Params */}
        <section id="params" className="scroll-mt-32 pb-40">
           <div className="flex items-center gap-3 mb-10"><div className="w-1.5 h-8 bg-brand rounded-full" /><h2 className="text-[32px] md:text-[42px] font-black tracking-tight">产品真实参数</h2></div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 md:gap-x-20 gap-y-10">
              {[
                { label: '基础', items: [['品牌', product.brand || 'DXG'], ['品类', product.category || '未分类']] },
                { label: '视觉', items: [['设计风格', Array.isArray(product.style) ? product.style[0] : (product.style || '默认')], ['适配层级', `P${product.ladderLevel || 1}`]] },
                { label: '材质', items: [['主材', product.material || '实木/棉麻'], ['内部', '高回弹海绵']] },
                { label: '尺寸', items: [['外型', product.dimensions || '240 x 105 x 85 cm'], ['坐高', '42 cm']] },
                { label: '适配', items: [['环保', 'ENF 级标准'], ['防潮', '具备']] },
                { label: '交付', items: [['配送', '专业上门'], ['周期', '15-20 天']] },
              ].map((group, i) => (
                <div key={i} className="space-y-5 text-left">
                   <h3 className="text-[11px] font-black text-brand uppercase tracking-widest">{group.label}</h3>
                   <div className="space-y-4">
                      {group.items.map(([k, v], j) => <div key={j} className="flex justify-between items-baseline border-b border-white/5 pb-3">
                         <span className="text-[13px] text-white/30 font-medium">{k}</span>
                         <span className="text-[13px] font-black text-white/80">{v}</span>
                      </div>)}
                   </div>
                </div>
              ))}
           </div>
        </section>
      </div>

      {/* Floating AI Button */}
      <div className="fixed bottom-32 right-6 md:bottom-12 md:right-12 z-[450] hidden sm:block">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-3 px-8 py-5 bg-brand text-white rounded-full shadow-2xl group">
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <div className="text-left text-sm font-black uppercase">AI 帮决策 / 是否适合我家？</div>
        </motion.button>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[500] px-3 md:px-6 pb-4 pointer-events-none">
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="max-w-4xl mx-auto h-auto bg-black/90 backdrop-blur-2xl border border-white/10 rounded-3xl md:rounded-[40px] shadow-2xl pointer-events-auto flex flex-col md:flex-row items-center justify-between p-3 md:px-10 gap-3">
           <div className="flex items-center justify-between w-full md:w-auto md:gap-10 px-2">
              <div className="flex flex-col text-left">
                <span className="text-white font-black text-[22px] md:text-[28px]">¥{(product.standard_service_price || 0).toLocaleString()}</span>
                <span className="text-white/30 text-[9px] md:text-[11px] font-black uppercase tracking-widest">包含平台交付服务</span>
              </div>
              <div className="px-3 py-1 bg-white/5 text-white/40 rounded-lg text-[10px] font-black block md:hidden">适配 {product.space?.[0] || '客厅'}</div>
           </div>
           <div className="flex items-center gap-2 w-full md:w-auto">
              <button onClick={handleJoinPlan} className="flex-[2] md:flex-none h-12 md:h-16 px-6 md:px-10 bg-brand text-white rounded-2xl font-black text-[15px] md:text-[17px] active:scale-95 transition-all flex items-center justify-center gap-2">加入方案 <Plus className="w-4 h-4" /></button>
              <button onClick={handleJoinLibrary} className="flex-1 md:flex-none h-12 md:h-16 px-5 bg-white/5 border border-white/5 text-white/40 rounded-2xl flex items-center justify-center active:scale-95 transition-all"><Heart className="w-5 h-5" /></button>
           </div>
        </motion.div>
      </div>
    </div>
  );
}
