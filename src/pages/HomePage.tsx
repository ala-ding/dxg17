import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Layout, Zap } from 'lucide-react';
import HousePlanPreview from '../components/HousePlanPreview';
import { StyleTag } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { analyticsService } from '../services/analyticsService';

interface HomePageProps {
  currentLevel: number;
  setCurrentLevel: (lvl: number) => void;
  currentStyle: StyleTag;
  setCurrentStyle: (style: StyleTag) => void;
  showToast: (msg: string) => void;
  openModal: (type: any, data?: any) => void;
}

export default function HomePage({ 
  currentLevel, setCurrentLevel, 
  currentStyle, setCurrentStyle, 
  showToast, openModal 
}: HomePageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    analyticsService.track('page_view', { page: 'home' });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sid = parseInt(entry.target.getAttribute('data-id') || '0');
            setActiveSection(sid);
            analyticsService.track('scroll_section', { section_id: sid });
          }
        });
      },
      { threshold: 0.5 }
    );

    const sections = containerRef.current?.querySelectorAll('section');
    sections?.forEach(s => observer.observe(s));
    return () => sections?.forEach(s => observer.unobserve(s));
  }, []);

  return (
    <div 
      id="home-page-container"
      ref={containerRef}
      className="min-h-screen w-full md:h-screen md:overflow-y-scroll md:snap-y md:snap-mandatory bg-black text-white scroll-smooth overflow-x-hidden"
    >
      {/* Section 1: Brand Vision */}
      <section 
        data-id="0"
        className="min-h-[100svh] md:h-screen w-full md:snap-start relative flex items-center justify-center overflow-hidden py-20 md:py-0"
      >
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=2600" 
            alt="Hero Home"
            className="w-full h-full object-cover opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-center px-4 md:px-6 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-[10px] md:text-[12px] font-black tracking-widest text-brand mb-6 md:mb-8 uppercase">
            Designed by DXG AI
          </div>
          <h1 className="text-[32px] sm:text-[40px] md:text-[64px] lg:text-[88px] font-medium tracking-tight leading-[1.1] mb-6 md:mb-8">
            先看见家，<br />
            再决定预算。
          </h1>
          <p className="text-[14px] sm:text-[16px] md:text-[18px] lg:text-[22px] text-white/60 font-light max-w-[280px] sm:max-w-xl mx-auto leading-relaxed mb-10 md:mb-12">
            用 AI 预览不同预算下的全屋空间效果，<br className="hidden md:block" />
            快速找到真正适合你的家具配置。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 w-full max-w-[320px] sm:max-w-none mx-auto sm:w-auto">
            <button 
              onClick={() => {
                if (window.innerWidth < 768) {
                  document.getElementById('house-plan-preview')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  containerRef.current?.scrollTo({ top: window.innerHeight * 2, behavior: 'smooth' });
                }
                analyticsService.track('click_hero_preview');
              }}
              className="w-full sm:w-auto px-10 h-14 md:h-16 bg-white text-black rounded-full text-[16px] md:text-[17px] font-bold hover:scale-105 active:scale-95 transition-all shadow-2xl"
            >
              直接预览全屋方案
            </button>
            <Link 
              to="/products"
              onClick={() => analyticsService.track('click_hero_products')}
              className="w-full sm:w-auto px-10 h-14 md:h-16 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full text-[16px] md:text-[17px] font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              搜索单品库 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-12 md:mt-16 flex flex-col items-center gap-6">
            <div className="text-[12px] md:text-[14px] text-white/40 font-bold flex items-center gap-2 uppercase tracking-widest">
              探索更多维度
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
              <button 
                onClick={() => navigate('/products?openDrawer=space')}
                className="group flex flex-col items-center gap-2 md:gap-3"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-brand group-hover:border-brand transition-all">
                  <Layout className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <span className="text-[11px] md:text-[13px] font-black text-white/60 group-hover:text-white transition-colors">按空间看</span>
              </button>
              <button 
                onClick={() => navigate('/products?openDrawer=budget')}
                className="group flex flex-col items-center gap-2 md:gap-3"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-brand group-hover:border-brand transition-all">
                  <Zap className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <span className="text-[11px] md:text-[13px] font-black text-white/60 group-hover:text-white transition-colors">按预算看</span>
              </button>
              <button 
                onClick={() => navigate('/products?openDrawer=ai')}
                className="group flex flex-col items-center gap-2 md:gap-3"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-brand group-hover:border-brand transition-all">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <span className="text-[11px] md:text-[13px] font-black text-white/60 group-hover:text-white transition-colors">AI 帮选</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mt-12 md:mt-16 pt-8 border-t border-white/5">
             <div className="flex flex-col items-center">
                <span className="text-[18px] md:text-[24px] font-black text-white">400+</span>
                <span className="text-[9px] md:text-[11px] text-white/30 uppercase tracking-widest whitespace-nowrap">严选单品</span>
             </div>
             <div className="hidden sm:block w-px h-8 bg-white/10" />
             <div className="flex flex-col items-center">
                <span className="text-[18px] md:text-[24px] font-black text-white">5</span>
                <span className="text-[9px] md:text-[11px] text-white/30 uppercase tracking-widest whitespace-nowrap">预算体系</span>
             </div>
             <div className="hidden sm:block w-px h-8 bg-white/10" />
             <div className="flex flex-col items-center">
                <span className="text-[18px] md:text-[24px] font-black text-white">0</span>
                <span className="text-[9px] md:text-[11px] text-white/30 uppercase tracking-widest whitespace-nowrap">设计费</span>
             </div>
          </div>
        </motion.div>

        {/* Floating Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-[11px] font-medium tracking-[0.3em] uppercase">Scroll</span>
          <div className="w-[1px] h-12 bg-white/30 relative overflow-hidden">
            <motion.div 
              animate={{ y: [0, 48] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 w-full h-1/3 bg-white"
            />
          </div>
        </div>
      </section>

      {/* Section 2: Value Discovery */}
      <section 
        data-id="1"
        className="min-h-[100svh] md:h-screen w-full md:snap-start relative flex items-center justify-center bg-[#0a0a0a] py-20 md:py-0"
      >
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
           {/* Layered Content to simulate depth */}
           <div className="w-[90vw] md:w-[85vw] h-[80svh] md:h-[75vh] relative">
              <img 
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2600" 
                alt="Detail"
                className="w-full h-full object-cover opacity-40 rounded-[20px] md:rounded-[40px] blur-[2px]"
              />
              <div className="absolute inset-0 bg-black/40 rounded-[20px] md:rounded-[40px]" />
           </div>
        </div>

        <div className="relative z-10 w-full max-w-[1400px] px-6 md:px-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-12 md:gap-20">
           <motion.div
             initial={{ opacity: 0, x: -40 }}
             whileInView={{ opacity: 1, x: 0 }}
             transition={{ duration: 1 }}
             className="text-center lg:text-left"
           >
              <h2 className="text-[28px] sm:text-[32px] md:text-[48px] lg:text-[64px] font-medium tracking-tight mb-6 md:mb-8 leading-tight">
                每一档预算，<br />
                都有清晰的空间差异。
              </h2>
              <p className="text-[15px] md:text-[20px] text-white/50 font-light leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8 md:mb-12">
                从基础入住到高阶设计，系统将家具、灯具、软装与预算关系可视化呈现。
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 md:gap-4">
                 {['预算可视化', '空间效果预览', '全屋搭配逻辑'].map(tag => (
                   <span key={tag} className="px-4 md:px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-[11px] md:text-[13px] font-medium backdrop-blur-md">
                     {tag}
                   </span>
                 ))}
              </div>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1.2, delay: 0.2 }}
             className="relative aspect-[4/3] bg-white/5 rounded-2xl md:rounded-3xl border border-white/10 backdrop-blur-2xl p-6 md:p-8 flex flex-col justify-end overflow-hidden group shadow-2xl"
           >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="flex items-center gap-4 mb-4 md:mb-6">
                 <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <Layout className="w-5 h-5 md:w-6 md:h-6 text-white/80" />
                 </div>
                 <div className="h-px flex-1 bg-white/10" />
                 <div className="text-[10px] md:text-[12px] font-mono text-white/30">SPATIAL_SYNC_01</div>
              </div>
              <h3 className="text-xl md:text-2xl font-medium mb-3 md:mb-4">精准的落地参考</h3>
              <p className="text-[13px] md:text-base text-white/40 leading-relaxed font-light">
                不只是看图，底线哥为您拆解每一个环节的成本分布，让您在开始装修前就对自己“未来的家”了如指掌。
              </p>
              
              <div className="absolute top-6 right-6 md:top-10 md:right-10 flex flex-col gap-2">
                 {[1, 2, 3].map(i => (
                    <div key={i} className={`w-6 md:w-8 h-1 rounded-full ${i === 2 ? 'bg-white' : 'bg-white/20'}`} />
                 ))}
              </div>
           </motion.div>
        </div>
      </section>

      {/* Section 3: The Stage (Main Interactive area) */}
      <section 
        data-id="2"
        id="house-plan-preview"
        className="min-h-screen w-full md:snap-start relative flex flex-col overflow-hidden bg-black"
      >
        <HousePlanPreview 
          currentLevel={currentLevel}
          setCurrentLevel={setCurrentLevel}
          currentStyle={currentStyle}
          setCurrentStyle={setCurrentStyle}
          showToast={showToast}
          openModal={openModal}
        />
      </section>

      {/* Section 4: AI Conclusion */}
      <section 
        data-id="3"
        className="min-h-[100svh] md:h-screen w-full md:snap-start relative flex items-center justify-center bg-black py-20 md:py-0"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-brand/20 rounded-full blur-[100px] md:blur-[180px] opacity-40 animate-pulse" />
        </div>

           <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="relative z-10 text-center px-6 max-w-4xl"
           >
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[11px] md:text-[12px] font-medium mb-6 md:mb-8">
               <Sparkles className="w-3.5 h-3.5 text-brand" />
               AI 家居顾问
             </div>
             <h2 className="text-[32px] sm:text-[36px] md:text-[56px] lg:text-[72px] font-medium tracking-tight mb-6 md:mb-8">
               让 AI 生成真正<br />适合你的家。
             </h2>
             <p className="text-[15px] md:text-[19px] lg:text-[22px] text-white/50 font-light max-w-2xl mx-auto leading-relaxed mb-8 md:mb-12">
               上传户型、预算或喜欢的图片，<br className="hidden md:block" />
               获得可落地的全屋配置建议。
             </p>
             
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 w-full max-w-[280px] sm:max-w-none mx-auto sm:w-auto">
               <button 
                 onClick={() => openModal('newPlan')}
                 className="w-full sm:w-auto px-10 md:px-12 h-14 md:h-16 bg-white text-black rounded-full text-[16px] md:text-[17px] font-bold hover:scale-105 active:scale-95 transition-all shadow-2xl"
               >
                 新建 AI 方案
               </button>
               <button 
                 onClick={() => {
                   if (window.innerWidth < 768) {
                     document.getElementById('house-plan-preview')?.scrollIntoView({ behavior: 'smooth' });
                   } else {
                     containerRef.current?.scrollTo({
                       top: window.innerHeight * 2,
                       behavior: 'smooth'
                     });
                   }
                   analyticsService.track('click_view_budget_examples');
                 }}
                 className="w-full sm:w-auto px-10 md:px-12 h-14 md:h-16 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-full text-[16px] md:text-[17px] font-bold hover:bg-white/10 transition-all"
               >
                 查看预算案例
               </button>
             </div>

          <div className="grid grid-cols-3 gap-6 md:gap-10 mt-16 md:mt-24 max-w-2xl mx-auto">
             {[
               { icon: Layout, label: '识别风格' },
               { icon: Zap, label: '匹配预算' },
               { icon: Sparkles, label: '生成方案' }
             ].map((item, idx) => (
               <div key={idx} className="flex flex-col items-center gap-2 md:gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <item.icon className="w-4 h-4 md:w-5 md:h-5 text-white/50" />
                  </div>
                  <span className="text-[11px] md:text-[13px] text-white/40 font-medium">{item.label}</span>
               </div>
             ))}
          </div>
        </motion.div>

        {/* Minimal Footer */}
        <div className="absolute bottom-6 md:bottom-10 inset-x-6 md:inset-x-10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] md:text-[11px] font-medium tracking-widest text-white/20 uppercase">
           <span>Design by DXG AI</span>
           <div className="flex gap-6 md:gap-8">
              <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
              <span className="hover:text-white transition-colors cursor-pointer">Terms</span>
              <span className="hover:text-white transition-colors cursor-pointer">Contact</span>
           </div>
        </div>
      </section>

      {/* Nav dots */}
      <div className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-[150] hidden sm:flex flex-col gap-4">
        {[0, 1, 2, 3].map(i => (
          <button 
            key={i}
            onClick={() => {
              if (window.innerWidth < 768) {
                const targets = ['home-page-container', 'discover-section', 'house-plan-preview', 'ai-section'];
                // This is a bit simplified, but scrollTo might be better
                containerRef.current?.children[i]?.scrollIntoView({ behavior: 'smooth' });
              } else {
                containerRef.current?.scrollTo({ top: window.innerHeight * i, behavior: 'smooth' });
              }
            }}
            className={`w-1.5 transition-all duration-500 rounded-full ${activeSection === i ? 'h-8 bg-white' : 'h-1.5 bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  );
}
