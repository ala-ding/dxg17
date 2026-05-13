import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Sparkles, ArrowRight, ChevronRight, Layout, Zap, Info } from 'lucide-react';
import HousePlanPreview from '../components/HousePlanPreview';
import { StyleTag } from '../types';

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
  const [activeSection, setActiveSection] = useState(0);

  // Handle intersection for active section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(parseInt(entry.target.getAttribute('data-id') || '0'));
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
      className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-black text-white scroll-smooth"
    >
      {/* Section 1: Brand Vision */}
      <section 
        data-id="0"
        className="h-screen w-full snap-start relative flex items-center justify-center overflow-hidden"
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
          className="relative z-10 text-center px-6 max-w-4xl"
        >
          <h1 className="text-[64px] md:text-[88px] font-medium tracking-tight leading-tight mb-8">
            先看见家，<br />
            再决定预算。
          </h1>
          <p className="text-[18px] md:text-[22px] text-white/60 font-light max-w-2xl mx-auto leading-relaxed mb-12">
            用 AI 预览不同预算下的全屋空间效果，<br />
            快速找到真正适合你的家具配置。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={() => containerRef.current?.scrollTo({ top: window.innerHeight * 2, behavior: 'smooth' })}
              className="px-10 h-14 bg-white text-black rounded-full text-[16px] font-bold hover:scale-105 active:scale-95 transition-all shadow-2xl"
            >
              直接预览
            </button>
            <button 
              onClick={() => openModal('newPlan')}
              className="px-10 h-14 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full text-[16px] font-bold hover:bg-white/20 transition-all flex items-center gap-2"
            >
              新建方案 <ArrowRight className="w-4 h-4" />
            </button>
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
        className="h-screen w-full snap-start relative flex items-center justify-center bg-[#0a0a0a]"
      >
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
           {/* Layered Content to simulate depth */}
           <div className="w-[85vw] h-[75vh] relative">
              <img 
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2600" 
                alt="Detail"
                className="w-full h-full object-cover opacity-40 rounded-[40px] blur-[2px]"
              />
              <div className="absolute inset-0 bg-black/40 rounded-[40px]" />
           </div>
        </div>

        <div className="relative z-10 w-full max-w-[1400px] px-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-20">
           <motion.div
             initial={{ opacity: 0, x: -40 }}
             whileInView={{ opacity: 1, x: 0 }}
             transition={{ duration: 1 }}
           >
              <h2 className="text-[48px] md:text-[64px] font-medium tracking-tight mb-8 leading-tight">
                每一档预算，<br />
                都有清晰的空间差异。
              </h2>
              <p className="text-[20px] text-white/50 font-light leading-relaxed max-w-lg mb-12">
                从基础入住到高阶设计，系统将家具、灯具、软装与预算关系可视化呈现。
              </p>
              <div className="flex flex-wrap gap-4">
                 {['预算可视化', '空间效果预览', '全屋搭配逻辑'].map(tag => (
                   <span key={tag} className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-[13px] font-medium backdrop-blur-md">
                     {tag}
                   </span>
                 ))}
              </div>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1.2, delay: 0.2 }}
             className="relative aspect-[4/3] bg-white/5 rounded-3xl border border-white/10 backdrop-blur-2xl p-8 flex flex-col justify-end overflow-hidden group shadow-2xl"
           >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <Layout className="w-6 h-6 text-white/80" />
                 </div>
                 <div className="h-px flex-1 bg-white/10" />
                 <div className="text-[12px] font-mono text-white/30">SPATIAL_SYNC_01</div>
              </div>
              <h3 className="text-2xl font-medium mb-4">精准的落地参考</h3>
              <p className="text-white/40 leading-relaxed font-light">
                不只是看图，底线哥为您拆解每一个环节的成本分布，让您在开始装修前就对自己“未来的家”了如指掌。
              </p>
              
              <div className="absolute top-10 right-10 flex flex-col gap-2">
                 {[1, 2, 3].map(i => (
                   <div key={i} className={`w-8 h-1 rounded-full ${i === 2 ? 'bg-white' : 'bg-white/20'}`} />
                 ))}
              </div>
           </motion.div>
        </div>
      </section>

      {/* Section 3: The Stage (Main Interactive area) */}
      <section 
        data-id="2"
        id="house-plan-preview"
        className="h-screen w-full snap-start relative flex flex-col overflow-hidden bg-black"
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
        className="h-screen w-full snap-start relative flex items-center justify-center bg-black"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/20 rounded-full blur-[180px] opacity-40 animate-pulse" />
        </div>

        <motion.div 
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 1 }}
           className="relative z-10 text-center px-6 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[12px] font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            AI 家居顾问
          </div>
          <h2 className="text-[56px] md:text-[72px] font-medium tracking-tight mb-8">
            让 AI 生成真正<br />适合你的家。
          </h2>
          <p className="text-[19px] md:text-[22px] text-white/50 font-light max-w-2xl mx-auto leading-relaxed mb-12">
            上传户型、预算或喜欢的图片，<br />
            获得可落地的全屋配置建议。
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={() => openModal('newPlan')}
              className="px-12 h-16 bg-white text-black rounded-full text-[17px] font-bold hover:scale-105 active:scale-95 transition-all shadow-2xl"
            >
              新建 AI 方案
            </button>
            <button 
              className="px-12 h-16 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-full text-[17px] font-bold hover:bg-white/10 transition-all"
            >
              查看示例
            </button>
          </div>

          <div className="grid grid-cols-3 gap-10 mt-24 max-w-2xl mx-auto">
             {[
               { icon: Layout, label: '识别风格' },
               { icon: Zap, label: '匹配预算' },
               { icon: Sparkles, label: '生成方案' }
             ].map((item, idx) => (
               <div key={idx} className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-white/50" />
                  </div>
                  <span className="text-[13px] text-white/40 font-medium">{item.label}</span>
               </div>
             ))}
          </div>
        </motion.div>

        {/* Minimal Footer */}
        <div className="absolute bottom-10 inset-x-10 flex justify-between items-center text-[11px] font-medium tracking-widest text-white/20 uppercase">
           <span>Design by DXG AI</span>
           <div className="flex gap-8">
              <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
              <span className="hover:text-white transition-colors cursor-pointer">Terms</span>
              <span className="hover:text-white transition-colors cursor-pointer">Contact</span>
           </div>
        </div>
      </section>

      {/* Nav dots */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-[150] flex flex-col gap-4">
        {[0, 1, 2, 3].map(i => (
          <button 
            key={i}
            onClick={() => containerRef.current?.scrollTo({ top: window.innerHeight * i, behavior: 'smooth' })}
            className={`w-1.5 transition-all duration-500 rounded-full ${activeSection === i ? 'h-8 bg-white' : 'h-1.5 bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  );
}

