import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { planService } from '../services/planService';
import { PLAN_TEMPLATES } from '../data/planTemplates';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, ShoppingBag, CheckCircle2,
  Upload, Edit3, Sparkles, TrendingDown, Info, MessageSquare, X, ChevronRight, ArrowLeft
} from 'lucide-react';
import { FLOORS, STYLE_TAGS, SCENE_IMAGES } from '../constants';
import { StyleTag } from '../types';
import TemplateChecklistModal from './TemplateChecklistModal';

const budgetLevelMap: Record<string, { title: string; subtitle: string }> = {
  '1万以内': { title: '极简入门版', subtitle: '适合简装居住' },
  '1-2万': { title: '精选入门版', subtitle: '适合基础配置' },
  '2-3万': { title: '舒适基础版', subtitle: '适合基础软装配置' },
  '3-5万': { title: '品质进阶版', subtitle: '适合完整软装入门' },
  '5-10万': { title: '设计精选版', subtitle: '适合品质感升级' },
  '10-15万': { title: '格调生活版', subtitle: '适合全空间风格化' },
  '15-25万': { title: '高阶定制版', subtitle: '适合全屋系统搭配' },
  '25-50万': { title: '典雅至尊版', subtitle: '适合奢华软装配置' },
  '50-100万': { title: '国际藏家版', subtitle: '适合顶奢艺术配置' },
  '100万以上': { title: '臻选收藏版', subtitle: '适合高端定制配置' }
};

interface HousePlanPreviewProps {
  currentLevel: number;
  setCurrentLevel: (lvl: number) => void;
  currentStyle: StyleTag;
  setCurrentStyle: (style: StyleTag) => void;
  showToast: (msg: string) => void;
  openModal: (type: any, data?: any) => void;
}

export default function HousePlanPreview({ 
  currentLevel, setCurrentLevel, 
  currentStyle, setCurrentStyle, 
  showToast, openModal 
}: HousePlanPreviewProps) {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showPlanSummary, setShowPlanSummary] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const lastScrollTime = useRef(0);
  const [rubberBand, setRubberBand] = useState<'top' | 'bottom' | null>(null);
  
  const currentFloor = FLOORS.find(f => f.level === currentLevel) || FLOORS[3];
  const currentTemplate = PLAN_TEMPLATES.find(t => t.code === currentFloor.model) || PLAN_TEMPLATES[0];

  const getAIContent = () => {
    const levelKey = currentLevel <= 3 ? 'F' : currentLevel <= 6 ? 'M' : currentLevel <= 8 ? 'P' : currentLevel <= 9 ? 'S' : 'X';
    const adviceMap: Record<string, string> = {
      F: "先别追求花哨，先把床、灯和基础收纳做好。",
      M: "这档位别急着买装饰，核心沙发和床垫要升舱。",
      P: "这档极易出完整风格，一定要做灯光环境控制。",
      S: "这一档不建议单买贵件，要追求全屏材质感统一。",
      X: "顶级材质的统治力，需要极简的比例来承托。"
    };
    return {
      title: "AI 空间评估",
      dixiange: adviceMap[levelKey],
      add: currentLevel < 5 ? ['主沙发面料', '核心睡眠系统', '遮光窗帘'] : ['大师级单品', '艺术灯控系统', '全屋高定材质']
    };
  };

  const aiContent = getAIContent();

  const togglePanel = (target: 'details' | 'ai' | 'plan') => {
    if (target === 'details') { setShowDetails(!showDetails); setShowAI(false); setShowPlanSummary(false); }
    else if (target === 'ai') { setShowAI(!showAI); setShowDetails(false); setShowPlanSummary(false); }
    else if (target === 'plan') { setShowPlanSummary(!showPlanSummary); setShowDetails(false); setShowAI(false); }
  };

  const budgetAllocation = currentLevel <= 3 ? [
    { label: '核心活动家具', value: 75, color: '#00B6AD', desc: '沙发、基础睡眠、餐桌椅' },
    { label: '灯饰照明', value: 10, color: '#60A5FA', desc: '全屋主照明灯具' },
    { label: '窗帘软装', value: 15, color: '#818CF8', desc: '遮光窗帘与抱枕' },
  ] : currentLevel <= 7 ? [
    { label: '高品质家具', value: 60, color: '#00B6AD', desc: '主力家具质感大幅提升' },
    { label: '氛围与软装', value: 30, color: '#60A5FA', desc: '开始决定视觉氛围' },
    { label: '地毯挂画', value: 10, color: '#818CF8', desc: '细节层次补足' },
  ] : [
    { label: '设计与顶级材质', value: 45, color: '#00B6AD', desc: '为品牌、比例和工艺溢价' },
    { label: '智能艺术灯光', value: 25, color: '#60A5FA', desc: '实现五星级空间氛围' },
    { label: '全屋定制软装', value: 30, color: '#818CF8', desc: '材质深度交互与艺术收藏' },
  ];

  const handleLevelChange = (newLevel: number) => { 
    if (newLevel >= 1 && newLevel <= 10) {
      setCurrentLevel(newLevel); 
    }
  };
  
  const nextLevel = () => { if (currentLevel < 10) handleLevelChange(currentLevel + 1); };
  const prevLevel = () => { if (currentLevel > 1) handleLevelChange(currentLevel - 1); };

  const triggerRubberBand = (dir: 'top' | 'bottom') => { setRubberBand(dir); setTimeout(() => setRubberBand(null), 300); };

  const generatePlanFromCase = async () => {
    try {
      const name = newPlanName || `${currentFloor.model} ${currentStyle}方案`;
      const newPlan = await planService.createPlanFromTemplate(currentTemplate.id, { name });
      showToast('方案生成成功');
      setIsGeneratingPlan(false);
      navigate(`/my-plans?planId=${newPlan.id}`);
    } catch (e) { showToast(`生成失败`); }
  };

  useEffect(() => {
    // Hide global floating buttons when this section is active
    const fabContainer = document.querySelector('.fixed.bottom-6.right-4');
    if (fabContainer) {
      if (window.innerWidth < 1024) {
        (fabContainer as HTMLElement).style.display = 'none';
      } else {
        // On desktop, we might want to keep or hide it, user says "recommended to hide"
        (fabContainer as HTMLElement).style.display = 'none';
      }
    }
    return () => {
      if (fabContainer) (fabContainer as HTMLElement).style.display = 'flex';
    };
  }, []);

  return (
    <div id="house-plan-preview-container" className="relative w-full min-h-screen md:h-screen flex flex-col items-center justify-start md:justify-center bg-black overflow-x-hidden text-left py-0 md:py-0">
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentStyle+currentLevel} 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 0.2 }} 
          exit={{ opacity: 0 }} 
          transition={{ duration: 1.5 }} 
          className="absolute inset-0 z-0 bg-cover bg-center blur-[120px] scale-125 pointer-events-none" 
          style={{ backgroundImage: `url("${SCENE_IMAGES[currentStyle][currentLevel].image}")` }} 
        />
      </AnimatePresence>

      {/* Style Tabs - Sticky on Mobile, Top on Desktop */}
      <div className="sticky top-[64px] md:absolute md:top-16 lg:top-24 left-0 right-0 z-50 px-6 py-4 md:py-0 bg-black/60 backdrop-blur-2xl md:bg-transparent md:backdrop-blur-none border-b border-white/5 md:border-none flex items-center justify-center">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full">
          <div className="flex items-center gap-1.5 p-1 bg-white/5 md:bg-black/40 backdrop-blur-xl md:border md:border-white/10 rounded-full md:shadow-2xl">
            {STYLE_TAGS.map(style => (
              <button 
                key={style} 
                onClick={() => setCurrentStyle(style as StyleTag)} 
                className={`h-9 px-5 md:h-10 md:px-6 rounded-full text-[12px] md:text-[13px] font-black transition-all whitespace-nowrap ${currentStyle === style ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col md:flex-row items-center justify-center p-0 md:p-12 lg:px-24 md:py-16 lg:py-24">
        {/* Navigation Arrows - Desktop */}
        <button 
          onClick={prevLevel}
          disabled={currentLevel === 1}
          className={`hidden md:flex absolute left-8 lg:left-12 xl:left-24 top-1/2 -translate-y-1/2 w-14 h-14 lg:w-16 lg:h-16 bg-white/5 border border-white/10 rounded-full items-center justify-center text-white transition-all z-50 ${currentLevel === 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10 hover:border-brand hover:text-brand shadow-[0_0_20px_rgba(0,0,0,0.5)]'}`}
        >
          <ArrowLeft className="w-6 h-6 lg:w-8 lg:h-8" />
        </button>

        <button 
          onClick={nextLevel}
          disabled={currentLevel === 10}
          className={`hidden md:flex absolute right-8 lg:right-12 xl:right-24 top-1/2 -translate-y-1/2 w-14 h-14 lg:w-16 lg:h-16 bg-white/5 border border-white/10 rounded-full items-center justify-center text-white transition-all z-50 ${currentLevel === 10 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10 hover:border-brand hover:text-brand shadow-[0_0_20px_rgba(0,0,0,0.5)]'}`}
        >
          <ArrowRight className="w-6 h-6 lg:w-8 lg:h-8" />
        </button>

        {/* Swipeable Carousel Container */}
        <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div 
               key={currentLevel + currentStyle}
               initial={{ opacity: 0, x: 100, scale: 0.95 }}
               animate={{ opacity: 1, x: 0, scale: 1 }}
               exit={{ opacity: 0, x: -100, scale: 0.95 }}
               transition={{ type: 'spring', damping: 25, stiffness: 120 }}
               drag="x"
               dragConstraints={{ left: 0, right: 0 }}
               onDragEnd={(_, info) => {
                 if (info.offset.x > 80) prevLevel();
                 else if (info.offset.x < -80) nextLevel();
               }}
               className="w-full h-full flex flex-col md:flex-row items-center justify-center gap-0 md:gap-12 lg:gap-20 px-0 md:px-0"
            >
               {/* Main Display Card */}
               <div className="relative w-full aspect-[16/10] sm:aspect-[4/3] md:aspect-auto md:w-[50vw] md:h-[60vh] lg:h-[65vh] xl:h-[70vh] md:rounded-[40px] lg:rounded-[56px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/5 group bg-[#0A0A0A] shrink-0 mx-0 md:mx-0 rounded-[20px] max-w-[calc(100vw-32px)]">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" style={{ backgroundImage: `url("${SCENE_IMAGES[currentStyle][currentLevel].image}")` }}>
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  </div>

                  {/* Desktop Title Overlay */}
                  <div className="absolute top-8 left-8 lg:top-12 lg:left-12 z-20 hidden md:block">
                     <div className="bg-black/60 backdrop-blur-xl px-6 py-4 lg:px-8 lg:py-5 rounded-[32px] lg:rounded-[40px] border border-white/10 shadow-2xl">
                        <span className="text-brand text-[10px] lg:text-[12px] font-black uppercase tracking-[0.3em] block mb-1">Budget Ladder</span>
                        <h3 className="text-white text-[22px] lg:text-[28px] font-black italic tracking-tighter leading-none">{budgetLevelMap[currentFloor.budget]?.title}</h3>
                     </div>
                  </div>

                  {/* Navigation Helper - Bottom Arrows for Mobile */}
                  <div className="md:hidden absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none z-30">
                    <button onClick={prevLevel} className={`w-10 h-10 bg-black/40 backdrop-blur-md rounded-full items-center justify-center text-white pointer-events-auto ${currentLevel === 1 ? 'opacity-0' : 'flex'}`}><ArrowLeft className="w-5 h-5" /></button>
                    <button onClick={nextLevel} className={`w-10 h-10 bg-black/40 backdrop-blur-md rounded-full items-center justify-center text-white pointer-events-auto ${currentLevel === 10 ? 'opacity-0' : 'flex'}`}><ArrowRight className="w-5 h-5" /></button>
                  </div>
               </div>

               {/* Info & Content Column */}
               <div className="w-full md:w-[280px] lg:w-[350px] xl:w-[400px] mt-6 md:mt-0 flex flex-col gap-5 md:gap-8 lg:gap-10 text-left h-auto md:h-full justify-center px-4 md:px-0 max-w-[calc(100vw-32px)]">
                  <div className="flex flex-col gap-1 md:gap-2">
                     <div className="flex items-center gap-3">
                        <span className="text-brand text-[13px] md:text-[14px] font-black uppercase tracking-[0.2em]">{currentStyle}风格</span>
                        <div className="h-px w-8 md:w-12 bg-white/10" />
                        <span className="text-white/30 text-[10px] md:text-[12px] font-bold uppercase tracking-widest">{budgetLevelMap[currentFloor.budget]?.subtitle}</span>
                     </div>
                     <h2 className="text-[44px] md:text-[56px] lg:text-[72px] xl:text-[88px] font-black tracking-tighter leading-none text-white italic">{currentFloor.budget}</h2>
                     <p className="text-white/60 text-[13px] md:text-[15px] lg:text-[16px] xl:text-[18px] font-medium italic mt-1 md:mt-2">极致性价比下的空间魔法，精选全球供应链，让每一分预算均有所见。</p>
                  </div>

                  <div className="flex flex-col gap-3 md:gap-4 lg:gap-5">
                     <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => togglePanel('plan')} className="h-12 md:h-14 lg:h-16 xl:h-20 bg-white text-black rounded-[16px] md:rounded-[24px] font-black text-[14px] md:text-[15px] lg:text-[16px] shadow-xl flex items-center justify-center gap-2 hover:bg-brand hover:text-white transition-all transform active:scale-95">方案概览 <ChevronRight className="w-4 h-4 md:w-5 md:h-5" /></button>
                        <button onClick={() => setShowChecklistModal(true)} className="h-12 md:h-14 lg:h-16 xl:h-20 bg-brand text-white rounded-[16px] md:rounded-[24px] font-black text-[14px] md:text-[15px] lg:text-[16px] shadow-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all transform active:scale-95">完整清单 <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" /></button>
                     </div>
                     <div className="flex gap-3">
                        <button onClick={() => togglePanel('details')} className={`flex-1 flex items-center justify-center gap-2 h-11 md:h-12 lg:h-14 rounded-[16px] md:rounded-[24px] text-[11px] md:text-[13px] lg:text-[14px] font-bold transition-all ${showDetails ? 'bg-brand/20 text-brand border border-brand/50' : 'bg-white/5 text-white/60 border border-white/5 hover:bg-white/10'}`}><Info className="w-4 h-4 md:w-5 md:h-5" /> 空间权重</button>
                        <button onClick={() => togglePanel('ai')} className={`flex-1 flex items-center justify-center gap-2 h-11 md:h-12 lg:h-14 rounded-[16px] md:rounded-[24px] text-[11px] md:text-[13px] lg:text-[14px] font-bold transition-all ${showAI ? 'bg-brand/20 text-brand border border-brand/50' : 'bg-white/5 text-white/60 border border-white/5 hover:bg-white/10'}`}><Sparkles className="w-4 h-4 md:w-5 md:h-5" /> AI 点评</button>
                     </div>
                  </div>

                  {/* Horizontal Budget Dots Indicator */}
                  <div className="flex items-center gap-3 pt-6 border-t border-white/5 mb-10 md:mb-0">
                     <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mr-2 leading-none">Ladder Level</span>
                     <div className="flex gap-2">
                        {FLOORS.map(f => (
                          <button 
                            key={f.level} 
                            onClick={() => handleLevelChange(f.level)} 
                            className={`w-2 md:w-3 h-2 md:h-3 rounded-full transition-all ${f.level === currentLevel ? 'bg-brand w-6 md:w-10' : 'bg-white/10 hover:bg-white/30'}`}
                          />
                        ))}
                     </div>
                  </div>
               </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Desktop Vertical Ladder Helper (Redesigned) */}
      <div className="hidden xl:flex absolute right-12 top-1/2 -translate-y-1/2 z-50 flex-col items-center gap-3">
         <div className="w-[2px] h-[400px] bg-white/5 relative rounded-full">
            <div className="absolute top-0 bottom-0 left-[-4px] right-[-4px] flex flex-col justify-between py-4">
               {FLOORS.slice().reverse().map(f => (
                 <button 
                   key={f.level} 
                   onClick={() => handleLevelChange(f.level)} 
                   className={`group relative flex items-center justify-end transition-all h-8 pr-4`}
                 >
                   <span className={`text-[10px] font-black uppercase tracking-widest mr-4 transition-all ${f.level === currentLevel ? 'text-brand opacity-100' : 'text-white/20 opacity-0 group-hover:opacity-100'}`}>{f.budget}</span>
                   <div className={`w-2 h-2 rounded-full border-2 transition-all ${f.level === currentLevel ? 'bg-brand border-brand scale-150' : 'bg-transparent border-white/20 group-hover:border-white/60'}`} />
                 </button>
               ))}
            </div>
         </div>
      </div>

      {/* Panels (Details/AI) - Moved to bottom for better mobile reach */}
      <AnimatePresence>
        {showDetails && (
          <motion.div initial={window.innerWidth > 768 ? { x: -460, opacity: 0 } : { y: '100%', opacity: 0 }} animate={window.innerWidth > 768 ? { x: 0, opacity: 1 } : { y: 0, opacity: 1 }} exit={window.innerWidth > 768 ? { x: -460, opacity: 0 } : { y: '100%', opacity: 0 }} className="fixed md:absolute left-0 md:left-8 top-auto md:top-1/2 md:-translate-y-1/2 bottom-0 md:bottom-auto z-[100] w-full md:w-[460px] p-8 md:p-10 bg-black/80 backdrop-blur-3xl md:rounded-[40px] rounded-t-[32px] border-t md:border border-white/10 shadow-2xl text-left">
            <div className="flex justify-between items-start mb-10">
               <div><h3 className="text-[20px] md:text-[24px] font-black text-white">这档钱花在哪</h3><p className="text-[11px] text-white/30 uppercase mt-1 tracking-widest">{currentFloor.model} · {currentFloor.budget}</p></div>
               <button onClick={() => setShowDetails(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-8 pb-10">
               {budgetAllocation.map(item => (
                 <div key={item.label} className="space-y-3">
                    <div className="flex justify-between items-end"><div className="text-left"><span className="text-[14px] font-black text-white/80 block">{item.label}</span><span className="text-[11px] text-white/30 block leading-tight">{item.desc}</span></div><span className="text-[12px] font-black text-white/20 italic">{item.value}%</span></div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${item.value}%` }} className="h-full rounded-full" style={{ backgroundColor: item.color }} /></div>
                 </div>
               ))}
            </div>
          </motion.div>
        )}
        {showAI && (
          <motion.div initial={window.innerWidth > 768 ? { x: 460, opacity: 0 } : { y: '100%', opacity: 0 }} animate={window.innerWidth > 768 ? { x: 0, opacity: 1 } : { y: 0, opacity: 1 }} exit={window.innerWidth > 768 ? { x: 460, opacity: 0 } : { y: '100%', opacity: 0 }} className="fixed md:absolute right-0 md:right-8 top-auto md:top-1/2 md:-translate-y-1/2 bottom-0 md:bottom-auto z-[100] w-full md:w-[460px] p-8 md:p-10 bg-black/80 backdrop-blur-3xl md:rounded-[40px] rounded-t-[32px] border-t md:border border-white/10 shadow-2xl text-left">
            <div className="flex justify-between items-start mb-8">
               <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center shadow-inner"><Sparkles className="w-6 h-6 text-brand" /></div><h3 className="text-[20px] md:text-[24px] font-black text-white">{aiContent.title}</h3></div>
               <button onClick={() => setShowAI(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-8 pb-10">
               <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl relative overflow-hidden"><div className="absolute top-0 left-0 w-1 h-full bg-brand" /><p className="text-[15px] md:text-[16px] leading-relaxed text-white font-medium italic">“{aiContent.dixiange}”</p></div>
               <div className="space-y-4">
                  <span className="text-[10px] text-white/20 uppercase tracking-widest block font-black">加预算建议 / Upgrade Tips</span>
                  <div className="flex flex-wrap gap-2">
                     {aiContent.add.map(s => <span key={s} className="px-4 py-2 bg-brand/5 border border-brand/10 rounded-xl text-[13px] text-brand font-bold">{s}</span>)}
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan Summary Overlay */}
      <AnimatePresence>
        {showPlanSummary && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-8 bg-black/80 backdrop-blur-xl">
             <button onClick={() => setShowPlanSummary(false)} className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/5 text-white z-20 flex items-center justify-center"><X className="w-6 h-6" /></button>
             <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-[1000px] bg-[#111] md:border md:border-white/10 md:rounded-[48px] overflow-hidden shadow-2xl flex flex-col lg:flex-row h-full md:h-auto md:max-h-[85vh] overflow-y-auto no-scrollbar">
                <div className="w-full lg:w-[45%] aspect-square lg:h-auto shrink-0 border-b lg:border-b-0 lg:border-r border-white/5 relative">
                   <img src={SCENE_IMAGES[currentStyle][currentLevel].image} className="w-full h-full object-cover" alt="" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="flex-1 p-8 md:p-14 flex flex-col justify-between text-left">
                   <div className="space-y-8">
                      <div>
                         <h3 className="text-[28px] md:text-[36px] font-black text-white italic leading-tight mb-4">{currentTemplate.name}</h3>
                         <div className="flex flex-wrap items-center gap-4 text-[12px] md:text-[14px] text-white/30 font-black uppercase tracking-widest">
                            <span className="text-brand">{currentTemplate.budgetRange}</span><span className="w-1 h-1 rounded-full bg-white/10" /><span>{currentTemplate.style}</span><span className="w-1 h-1 rounded-full bg-white/10" /><span>{currentTemplate.areaRange}</span>
                         </div>
                      </div>
                      <div className="space-y-4">
                         <span className="text-[11px] text-white/20 uppercase tracking-widest block font-black">核心清单预览 / Items</span>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                            {currentTemplate.items.slice(0, 6).map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3 text-[13px] text-white/40 font-medium truncate"><div className="w-1 h-1 rounded-full bg-brand" /><span className="truncate">{item.name}</span> <span className="text-white/10">x{item.quantity}</span></div>
                            ))}
                         </div>
                      </div>
                   </div>
                   <div className="flex flex-col sm:flex-row items-center gap-4 mt-12">
                      <button onClick={() => { setShowPlanSummary(false); setNewPlanName(`${currentFloor.model}｜${currentStyle}全屋方案`); setIsGeneratingPlan(true); }} className="w-full sm:flex-1 h-14 md:h-16 bg-white text-black rounded-[24px] font-black text-[16px] shadow-2xl active:scale-95 transition-all">按这套生成方案</button>
                      <button onClick={() => setShowChecklistModal(true)} className="w-full sm:flex-1 h-14 md:h-16 bg-white/5 text-white rounded-[24px] font-black text-[16px] border border-white/5 active:scale-95 transition-all">查看完整清单</button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Generate From Case Modal */}
      <AnimatePresence>
        {isGeneratingPlan && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-[#1A1A1A] border border-white/5 rounded-[40px] p-8 md:p-10 shadow-2xl text-left">
              <h3 className="text-[20px] md:text-[24px] font-black text-white mb-8">方案命名</h3>
              <input type="text" value={newPlanName} onChange={(e) => setNewPlanName(e.target.value)} className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-white text-[15px] font-bold outline-none focus:border-brand mb-10" placeholder="例如：我的现代风新家" />
              <div className="flex gap-4">
                <button onClick={() => setIsGeneratingPlan(false)} className="flex-1 h-14 bg-white/5 text-white/30 rounded-2xl font-black">取消</button>
                <button onClick={generatePlanFromCase} className="flex-1 h-14 bg-brand text-white rounded-2xl font-black shadow-xl shadow-brand/20">生成方案</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Budget Rail */}
      <div className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 z-50 flex-col items-center gap-3">
         <div className="w-[1px] h-[300px] bg-white/10 relative">
            <div className="absolute top-0 bottom-0 left-[-4px] right-[-4px] flex flex-col justify-between py-2">
               {FLOORS.slice().reverse().map(f => (
                 <button key={f.level} onClick={() => handleLevelChange(f.level)} className={`group relative flex items-center justify-center transition-all h-8 ${f.level === currentLevel ? 'scale-125' : 'hover:scale-110'}`}><div className={`w-2 h-2 rounded-full border transition-all ${f.level === currentLevel ? 'bg-white border-white' : 'bg-transparent border-white/20 group-hover:border-white/40'}`} />{f.level === currentLevel && <motion.div layoutId="active-dot-ring" className="absolute w-5 h-5 rounded-full border border-brand/50 blur-[1px]" />}</button>
               ))}
            </div>
         </div>
      </div>

      {showChecklistModal && (
        <TemplateChecklistModal template={currentTemplate} onBack={() => setShowChecklistModal(false)} onClose={() => setShowChecklistModal(false)} onGenerate={() => { setShowChecklistModal(false); setShowPlanSummary(false); setNewPlanName(`${currentFloor.model}｜${currentStyle}方案`); setIsGeneratingPlan(true); }} />
      )}
    </div>
  );
}
