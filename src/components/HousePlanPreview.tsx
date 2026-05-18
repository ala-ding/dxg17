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
  const [isEvaluating, setIsEvaluating] = useState(false);
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

  const handleLevelChange = (newLevel: number) => { if (newLevel >= 1 && newLevel <= 10) setCurrentLevel(newLevel); };
  const triggerRubberBand = (dir: 'top' | 'bottom') => { setRubberBand(dir); setTimeout(() => setRubberBand(null), 300); };
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');

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
    const handleWheel = (e: WheelEvent) => {
      if (!isHovered) return;
      e.preventDefault();
      const now = Date.now();
      if (now - lastScrollTime.current < 800) return;
      if (e.deltaY > 20) {
        if (currentLevel === 1) triggerRubberBand('top');
        else handleLevelChange(currentLevel - 1);
        lastScrollTime.current = now;
      } else if (e.deltaY < -20) {
        if (currentLevel === 10) triggerRubberBand('bottom');
        else handleLevelChange(currentLevel + 1);
        lastScrollTime.current = now;
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentLevel, isHovered]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden text-left">
      <AnimatePresence mode="wait">
        <motion.div key={currentStyle+currentLevel} initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} className="absolute inset-0 z-0 bg-cover bg-center blur-[100px] scale-110 pointer-events-none" style={{ backgroundImage: `url("${SCENE_IMAGES[currentStyle][currentLevel].image}")` }} />
      </AnimatePresence>

      <motion.div animate={rubberBand === 'top' ? { y: 20 } : rubberBand === 'bottom' ? { y: -20 } : { y: 0 }} className="relative z-10 w-full h-full md:max-w-[90vw] md:max-h-[85vh] flex items-center justify-center pointer-events-none">
        <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className="relative w-full h-full md:rounded-[48px] overflow-hidden shadow-2xl border border-white/5 pointer-events-auto">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={currentLevel + currentStyle} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.8 }} className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${SCENE_IMAGES[currentStyle][currentLevel].image}")` }}>
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Style Toggle */}
      <div className="absolute top-20 md:top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 p-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl max-w-[calc(100vw-32px)] overflow-x-auto no-scrollbar">
         {STYLE_TAGS.map(style => (
           <button key={style} onClick={() => setCurrentStyle(style as StyleTag)} className={`h-8 md:h-10 px-4 md:px-6 rounded-full text-[12px] md:text-[13px] font-black transition-all whitespace-nowrap ${currentStyle === style ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}>{style}</button>
         ))}
      </div>

      {/* Info Meta */}
      <motion.div key={currentLevel+currentStyle+'meta'} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="fixed md:absolute bottom-8 md:bottom-20 left-6 md:left-20 z-50 pointer-events-auto">
        <div className="flex flex-col gap-4 md:gap-6">
           <div className="flex items-center gap-4 md:gap-6">
              <h2 className="text-[32px] md:text-[64px] font-black tracking-tighter leading-none text-white italic">{currentFloor.budget}</h2>
              <div className="h-8 md:h-12 w-px bg-white/10" />
              <div className="flex flex-col">
                 <span className="text-[14px] md:text-[18px] font-black text-brand uppercase tracking-[0.2em]">{budgetLevelMap[currentFloor.budget]?.title || currentFloor.name}</span>
                 <span className="text-[10px] md:text-[11px] font-medium text-white/30 uppercase tracking-widest">{budgetLevelMap[currentFloor.budget]?.subtitle || currentFloor.value}</span>
              </div>
           </div>
           
           <div className="flex flex-wrap items-center gap-2 md:gap-4 max-w-[calc(100vw-48px)] overflow-x-auto no-scrollbar pb-2">
              <button onClick={() => togglePanel('plan')} className="px-5 md:px-8 h-10 md:h-12 bg-white text-black rounded-full text-[12px] md:text-[14px] font-black shadow-2xl active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap">方案概览 <ChevronRight className="w-4 h-4" /></button>
              <button onClick={() => setShowChecklistModal(true)} className="px-5 md:px-8 h-10 md:h-12 bg-brand text-white rounded-full text-[12px] md:text-[14px] font-black shadow-2xl active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap">完整清单 <ShoppingBag className="w-4 h-4" /></button>
              <button onClick={() => togglePanel('details')} className={`flex items-center gap-2 px-4 h-9 md:h-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-[12px] whitespace-nowrap transition-all ${showDetails ? 'bg-brand/20 text-brand border-brand/20' : 'text-white'}`}><Info className="w-3.5 h-3.5" /> 空间权重</button>
              <button onClick={() => togglePanel('ai')} className={`flex items-center gap-2 px-4 h-9 md:h-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-[12px] whitespace-nowrap transition-all ${showAI ? 'bg-brand/20 text-brand border-brand/20' : 'text-white'}`}><Sparkles className="w-3.5 h-3.5" /> AI 点评</button>
           </div>
        </div>
      </motion.div>

      {/* Panels */}
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
