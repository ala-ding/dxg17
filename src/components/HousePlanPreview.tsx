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
  const location = useLocation();
  const [showDetails, setShowDetails] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showPlanSummary, setShowPlanSummary] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showEntryHint, setShowEntryHint] = useState(false);
  const [hoveredEntry, setHoveredEntry] = useState<'budget' | 'ai' | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const lastScrollTime = useRef(0);
  const [rubberBand, setRubberBand] = useState<'top' | 'bottom' | null>(null);
  
  const currentFloor = FLOORS.find(f => f.level === currentLevel) || FLOORS[3];
  
  // Find current template based on model code
  const currentTemplate = PLAN_TEMPLATES.find(t => t.code === currentFloor.model) || PLAN_TEMPLATES[0];

  // AI Content Generator
  const getAIContent = () => {
    const levelKey = currentLevel <= 3 ? 'F' : currentLevel <= 6 ? 'M' : currentLevel <= 8 ? 'P' : currentLevel <= 9 ? 'S' : 'X';
    
    const adviceMap: Record<string, string> = {
      F: "这档先别追求风格，先把床、灯和基础收纳做好。",
      M: "这档别急着买装饰，先把沙发、床垫和窗帘做好。",
      P: "如果预算允许，P 档通常比 M 档更容易做出完整效果。",
      S: "这一档不要只买贵单品，要把灯光、窗帘和材质一起考虑。",
      X: "高配不是堆品牌，关键是比例、材质和全屋系统感。"
    };

    const assessmentMap: Record<string, string> = {
      F: "适合先控制总预算，把基础居住功能补齐。优先保证床、基础收纳和基础照明，装饰类内容后置。需要注意空间完成度和风格感较弱。",
      M: "开始从“能住”进入“住得舒服”。预算优先放在沙发、床垫、窗帘和主灯等高频使用项。需要注意风格统一度还没有到完整阶段。",
      P: "多数家庭比较稳的改善档。开始有完整风格表达，家具、灯光和软装之间不再像单品拼凑。比 M 档更容易落地出效果。",
      S: "更适合对长期居住质感有要求的家庭。预算花在材质、比例、灯光系统和细节控制上。不建议只单独升级几个贵单品。",
      X: "接近完整高端生活方式方案。预算主要花在品牌、工艺、稀缺单品和全屋系统感上。追求长期审美和接待场景表现。"
    };

    const styleStrengths: Record<StyleTag, string[]> = {
      "现代简约": ["线条清爽容错率高", "后期软装宽容度大", "显大且通透"],
      "中古风": ["单品气质极强", "木色温润有故事感", "氛围感拉满"],
      "意式极简": ["比例考究显高级", "材质质感穿透力强", "视觉焦点明确"],
      "原木风": ["视觉极其解压", "空间亲和力极高", "视觉极其温暖"],
      "北欧风": ["小户型扩容神器", "实用主义天花板", "色彩搭配灵活"],
      "轻奢": ["高级质感触手可及", "灯光表现力极佳", "档次感建立迅速"],
      "干净清爽": ["视觉极其解压", "空间亲和力极高", "视觉通透"],
      "温暖自然": ["视觉极其温暖", "温馨感拉满", "材质亲和"],
      "复古有氛围": ["单品气质极强", "木色温润有故事感", "氛围感拉满"],
      "高级冷静": ["比例考究显高级", "材质质感穿透力强", "视觉焦点明确"]
    };

    const levelStrengths: Record<string, string[]> = {
      F: ["极高性价比入住", "核心睡眠有保障", "预算压力极小"],
      M: ["主空间舒适度质变", "配置均衡无短板", "高频单品耐用"],
      P: ["风格实现度完整", "灯光层次丰富", "材质显著升级"],
      S: ["细节颗粒度极高", "全屋高定闭环", "极致感官体验"],
      X: ["顶级材质统治力", "大师单品入场", "身份感与艺术值"]
    };

    const levelNeeds: Record<string, string[]> = {
      F: ["灯光氛围较差", "风格感建立不足", "材质感较均质"],
      M: ["风格统一度尚可", "细节溢价不明显", "艺术性点缀缺失"],
      P: ["需要搭配进阶灯控", "材质管理要求高", "色彩平衡需精准"],
      S: ["维护成本略高", "对灯光调校有要求", "单次升级难度大"],
      X: ["审美门槛较高", "后期改动余地小", "交付周期相对长"]
    };

    const styleAdvice: Record<StyleTag, string> = {
      "现代简约": "强调克制和留白，重点控制材质数量，不要堆装饰。",
      "中古风": "优先保证沙发、边柜和灯具的品质，避免廉价仿古件。",
      "意式极简": "要把钱集中在沙发、地毯和主灯上，撑起空旷感。",
      "原木风": "注意木色统一，木色不一会让空间显得凌乱。",
      "北欧风": "避免做成廉价样板间，用少量高质量软装拉升质感。",
      "轻奢": "不要堆金色线条，高级感来自石材和灯光的自然映射。",
      "干净清爽": "强调克制和留白，重点控制材质数量，不要堆装饰。",
      "温暖自然": "强调家的温馨感，选用柔和的色调和亲肤的材质。",
      "复古有氛围": "注重氛围灯光的运用，加入有年代感的装饰单品。",
      "高级冷静": "保持色调的纯净，用材质的对比来丰富空间的层次感。"
    };

    return {
      title: "AI 点评这套",
      subtitle: `${currentFloor.model} · ${currentFloor.budget} · ${currentStyle}`,
      dixiange: adviceMap[levelKey],
      assessment: assessmentMap[levelKey] + " " + styleAdvice[currentStyle],
      strengths: [...levelStrengths[levelKey], ...styleStrengths[currentStyle]].slice(0, 3),
      needs: levelNeeds[levelKey],
      add: currentLevel < 5 ? ['主沙发材质', '主卧床垫', '全屋窗帘'] : ['氛围感水墨挂画', '大师级单品', '全案智能灯控'],
      sub: ['装饰品摆件', '部分地毯', '次卧软装包']
    };
  };

  const aiContent = getAIContent();

  // Mutual exclusion: Opening one closes others
  const togglePanel = (target: 'details' | 'ai' | 'plan') => {
    if (target === 'details') {
      setShowDetails(!showDetails);
      setShowAI(false);
      setShowPlanSummary(false);
    } else if (target === 'ai') {
      setShowAI(!showAI);
      setShowDetails(false);
      setShowPlanSummary(false);
    } else if (target === 'plan') {
      setShowPlanSummary(!showPlanSummary);
      setShowDetails(false);
      setShowAI(false);
    }
  };

  // Logic for budget allocation display
  const budgetAllocation = currentLevel <= 3 ? [
    { label: '核心活动家具', value: 75, color: '#00B6AD', desc: '沙发、基础睡眠、餐桌椅' },
    { label: '灯饰照明', value: 10, color: '#60A5FA', desc: '全屋主照明灯具' },
    { label: '窗帘软装', value: 10, color: '#818CF8', desc: '全屋基础遮光窗帘套组' },
    { label: '装饰挂画', value: 5, color: '#9CA3AF', desc: '基础点缀装饰' },
  ] : currentLevel <= 7 ? [
    { label: '核心活动家具', value: 60, color: '#00B6AD', desc: '高频家具升舱，强化舒适度' },
    { label: '灯光与窗帘', value: 25, color: '#60A5FA', desc: '开始影响空间氛围与遮蔽感' },
    { label: '软装统一度', value: 10, color: '#818CF8', desc: '摆脱单品拼凑，风格化初显' },
    { label: '地毯床品', value: 5, color: '#A78BFA', desc: '触感层面的细节补足' },
  ] : [
    { label: '设计与材质', value: 45, color: '#00B6AD', desc: '为设计溢价、进口材料及工艺买单' },
    { label: '全场景灯光', value: 20, color: '#60A5FA', desc: '实现多场景智能灯光联动' },
    { label: '高定软装', value: 20, color: '#818CF8', desc: '材质深度交互与私属定制' },
    { label: '收藏品/硬核软装', value: 15, color: '#A78BFA', desc: '提升空间艺术颗粒度' },
  ];

  // AI Evaluation Logic
  useEffect(() => {
    if (showAI) {
      setIsEvaluating(true);
      const timer = setTimeout(() => setIsEvaluating(false), 400);
      return () => clearTimeout(timer);
    }
  }, [currentLevel, currentStyle, showAI]);

  // Handle return state to show plan summary
  useEffect(() => {
    if (location.state?.showPlan) {
      setShowPlanSummary(true);
      // Clear the state to avoid showing it again on refresh
      navigate(location.pathname, { replace: true, state: { ...location.state, showPlan: false } });
    }
  }, [location.state, navigate, location.pathname]);

  // Show entry hint on mount
  useEffect(() => {
    const timer = setTimeout(() => setShowEntryHint(true), 1500);
    const hideTimer = setTimeout(() => setShowEntryHint(false), 5000);
    return () => { clearTimeout(timer); clearTimeout(hideTimer); };
  }, []);

  const handleLevelChange = (newLevel: number) => {
    if (newLevel >= 1 && newLevel <= 10) {
      if (newLevel !== currentLevel && navigator.vibrate) {
        try {
          navigator.vibrate(8);
        } catch (e) {
          // Ignore vibration errors
        }
      }
      setCurrentLevel(newLevel);
    }
  };

  // Mobile wheel drag handling
  const wheelRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startLevel = useRef(0);

  useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel) return;

    const onTouchStart = (e: TouchEvent) => {
      isDragging.current = true;
      startY.current = e.touches[0].clientY;
      startLevel.current = currentLevel;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      if (e.cancelable) e.preventDefault(); // Stop page scroll
      
      const deltaY = startY.current - e.touches[0].clientY;
      const stepHeight = 24; // Precision for 260px container
      const levelDelta = Math.round(deltaY / stepHeight);
      const nextLevel = Math.max(1, Math.min(10, startLevel.current + levelDelta));
      
      if (nextLevel !== currentLevel) {
        handleLevelChange(nextLevel);
      }
    };

    const onTouchEnd = () => {
      isDragging.current = false;
    };

    wheel.addEventListener('touchstart', onTouchStart, { passive: false });
    wheel.addEventListener('touchmove', onTouchMove, { passive: false });
    wheel.addEventListener('touchend', onTouchEnd);

    return () => {
      wheel.removeEventListener('touchstart', onTouchStart);
      wheel.removeEventListener('touchmove', onTouchMove);
      wheel.removeEventListener('touchend', onTouchEnd);
    };
  }, [currentLevel]);

  const triggerRubberBand = (dir: 'top' | 'bottom') => {
    setRubberBand(dir);
    setTimeout(() => setRubberBand(null), 300);
  };

  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');

  const generatePlanFromCase = async () => {
    try {
      const name = newPlanName || `${currentFloor.model} ${currentStyle}全屋方案 - ${new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }).replace('/', '月')}日`;
      
      const newPlan = await planService.createPlanFromTemplate(currentTemplate.id, {
        name
      });

      // Show toast and navigate
      showToast('方案生成成功，已导入全部模板清单');
      setIsGeneratingPlan(false);
      navigate(`/my-plans?planId=${newPlan.id}`);
    } catch (error: any) {
      console.error(error);
      showToast(`生成失败，请检查模板数据`);
    }
  };

  const goToLevelProducts = (level: number) => {
    // Navigate with parameters for filtering
    const style = currentStyle;
    const model = currentFloor.model;
    navigate(`/products?level=${level}&style=${style}&fromCase=${model}`, { 
      state: { 
        returnLevel: currentLevel, 
        returnStyle: currentStyle,
        fromPreview: true,
        recommendedOnly: true
      } 
    });
    showToast(`正在进入：${model} 方案推荐清单`);
  };

  // Close panels on Esc key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDetails(false);
        setShowAI(false);
        setShowPlanSummary(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Scroll Interaction
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isHovered) return;

      // Always prevent default when hovered to block page scroll
      e.preventDefault();
      
      const now = Date.now();
      if (now - lastScrollTime.current < 800) return;

      const atFirst = currentLevel === 1;
      const atLast = currentLevel === 10;

      if (e.deltaY > 20) {
        if (atFirst) {
          triggerRubberBand('top');
        } else {
          handleLevelChange(currentLevel - 1);
        }
        lastScrollTime.current = now;
      } else if (e.deltaY < -20) {
        if (atLast) {
          triggerRubberBand('bottom');
        } else {
          handleLevelChange(currentLevel + 1);
        }
        lastScrollTime.current = now;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentLevel, isHovered]);

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden"
    >
      {/* Background Ambience */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentStyle + currentLevel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat blur-[100px] scale-110 pointer-events-none"
          style={{ backgroundImage: `url("${SCENE_IMAGES[currentStyle][currentLevel].image}")` }}
        />
      </AnimatePresence>

      {/* Main Cinematic Viewport - Clicking here closes panels */}
      <motion.div 
        animate={
          rubberBand === 'top' ? { y: 20 } : rubberBand === 'bottom' ? { y: -20 } : { y: 0 }
        }
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative z-10 w-full h-full max-w-[90vw] max-h-[85vh] flex items-center justify-center pointer-events-none"
      >
        <div 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => { setShowDetails(false); setShowAI(false); }}
          className="relative w-full h-full rounded-[48px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] border border-white/10 pointer-events-auto cursor-default"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={currentLevel + currentStyle}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url("${SCENE_IMAGES[currentStyle][currentLevel].image}")` }}
            >
              {/* Depth Overlays */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-0 scale-[1.02] hover:scale-100 transition-transform duration-[4s]" />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Floating UI Layers */}
      
      {/* Central Floating Meta */}
      <motion.div 
        key={currentLevel + currentStyle + 'meta'}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-10 md:bottom-20 left-6 md:left-20 z-50 pointer-events-auto w-[calc(100%-100px)] md:w-auto"
      >
        <div className="flex flex-col gap-4 md:gap-4 text-left">
           <div className="flex items-center gap-4 md:gap-6">
              <h2 className="text-[44px] md:text-[64px] font-black tracking-tighter leading-none text-white">{currentFloor.budget}</h2>
              <div className="h-8 md:h-10 w-px bg-white/20" />
              <div className="flex flex-col">
                 <span className="text-[18px] md:text-[20px] font-black text-brand uppercase tracking-wider">
                   {budgetLevelMap[currentFloor.budget]?.title || currentFloor.name}
                 </span>
                 <span className="text-[13px] md:text-[12px] font-medium text-white/40 uppercase tracking-[0.2em]">
                   {budgetLevelMap[currentFloor.budget]?.subtitle || currentFloor.value}
                 </span>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
                <motion.div 
                  animate={{ 
                    y: (showDetails || showAI) ? 120 : 0,
                    opacity: (showDetails || showAI) ? 0.2 : 1,
                    scale: (showDetails || showAI) ? 0.9 : 1
                  }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 w-full md:w-auto"
                >
                    <button 
                      onClick={() => togglePanel('plan')}
                      className="px-8 h-[52px] md:h-14 bg-white text-black rounded-full text-[15px] md:text-[16px] font-black shadow-2xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
                    >
                      查看方案概览 <ChevronRight className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setShowChecklistModal(true)}
                      className="px-8 h-[46px] md:h-12 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full text-[14px] font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                    >
                      查看完整清单 <ShoppingBag className="w-4 h-4 text-white/60" />
                    </button>
                    <div className="relative group/per hidden md:block ml-2">
                    <button 
                      onClick={() => openModal('matchIntro')}
                      className="px-8 h-12 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full text-[14px] font-bold hover:bg-white/20 transition-all"
                    >
                      AI 帮我看
                    </button>
                    <div className="absolute top-[-44px] left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-lg text-[10px] text-white/60 whitespace-nowrap opacity-0 group-hover/per:opacity-100 transition-opacity pointer-events-none border border-white/10">
                       上传户型和预算，生成你的专属配置方案
                    </div>
                  </div>
              </motion.div>
           </div>

           <motion.div 
             animate={{ 
               y: (showDetails || showAI) ? 50 : 0,
               opacity: (showDetails || showAI) ? 0 : 1,
               pointerEvents: (showDetails || showAI) ? 'none' : 'auto'
             }}
             transition={{ duration: 0.4 }}
             className="flex items-center gap-3 md:gap-4 mt-2 md:mt-6 relative"
           >
              {/* Initial Hint Tooltip - Hidden on mobile */}
              <AnimatePresence>
                {showEntryHint && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute -top-16 left-0 bg-white text-black px-4 py-2 rounded-2xl text-[12px] font-bold shadow-2xl z-[60] hidden md:flex flex-col pointer-events-none"
                  >
                    <span>想知道这档适不适合你？</span>
                    <span className="text-[10px] text-black/60">点击查看预算分配和 AI 点评</span>
                    <div className="absolute -bottom-1 left-6 w-2 h-2 bg-white rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Budget Capsule */}
              <div className="relative flex-1 md:flex-none">
                <button 
                  onClick={() => togglePanel('details')} 
                  onMouseEnter={() => setHoveredEntry('budget')}
                  onMouseLeave={() => setHoveredEntry(null)}
                  className={`flex items-center justify-center gap-2 px-4 md:px-5 h-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full transition-all hover:bg-white/10 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(255,255,255,0.05)] w-full md:w-auto ${showDetails ? 'ring-2 ring-brand/50 bg-white/10' : ''}`}
                >
                   <Info className={`w-3.5 h-3.5 ${showDetails ? 'text-brand' : 'text-white/60'}`} />
                   <span className="text-[12px] md:text-[13px] font-medium tracking-wide">预算分配</span>
                </button>
              </div>

              {/* AI Review Capsule */}
              <div className="relative flex-1 md:flex-none">
                <button 
                  onClick={() => togglePanel('ai')} 
                  onMouseEnter={() => setHoveredEntry('ai')}
                  onMouseLeave={() => setHoveredEntry(null)}
                  className={`flex items-center justify-center gap-2 px-4 md:px-5 h-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full transition-all hover:bg-white/10 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,182,173,0.1)] w-full md:w-auto ${showAI ? 'ring-2 ring-brand/50 bg-white/10' : ''}`}
                >
                   <Sparkles className={`w-3.5 h-3.5 ${showAI ? 'text-brand' : 'text-white/60'}`} />
                   <span className="text-[12px] md:text-[13px] font-medium tracking-wide">AI 点评</span>
                </button>
              </div>
           </motion.div>
        </div>
      </motion.div>

      {/* Budget Tuner Rail (Right) - Desktop Version */}
      <div className="hidden md:flex absolute right-12 top-1/2 -translate-y-1/2 z-50 flex-col items-center gap-3">
         <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-4 [writing-mode:vertical-lr]">Budget Levels</span>
         <div className="w-[1px] h-[300px] bg-white/10 relative">
            <div className="absolute top-0 bottom-0 left-[-4px] right-[-4px] flex flex-col justify-between py-2">
               {FLOORS.slice().reverse().map(f => (
                 <button 
                   key={f.level}
                   onClick={() => handleLevelChange(f.level)}
                   className={`group relative flex items-center justify-center transition-all h-8 ${f.level === currentLevel ? 'scale-125' : 'hover:scale-110'}`}
                 >
                   <div className={`w-2 h-2 rounded-full border transition-all ${f.level === currentLevel ? 'bg-white border-white scale-110' : 'bg-transparent border-white/20 group-hover:border-white/40'}`} />
                   
                   {f.level === currentLevel && (
                     <motion.div 
                        layoutId="active-dot-ring"
                        className="absolute w-5 h-5 rounded-full border border-brand/50 blur-[1px]"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                   )}
                   
                   <span className={`absolute right-8 text-[11px] font-black whitespace-nowrap transition-all tracking-tight ${f.level === currentLevel ? 'text-brand translate-x-0 opacity-100' : 'text-white/20 translate-x-2 opacity-0'}`}>
                     {f.budget}
                   </span>
                 </button>
               ))}
            </div>
         </div>
      </div>

      {/* Budget Ladder Wheel - Mobile Version (Localized to this section) */}
      <div 
        className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 z-[60] flex flex-col items-center select-none"
      >
        <div 
          ref={wheelRef}
          className="relative w-[38px] h-[260px] bg-[#141414]/32 backdrop-blur-[18px] saturate-[140%] border border-white/14 rounded-full flex flex-col items-center justify-between py-6 shadow-2xl"
        >
          {FLOORS.slice().reverse().map((f) => {
            const isActive = f.level === currentLevel;
            return (
              <button
                key={f.level}
                onClick={() => handleLevelChange(f.level)}
                className="relative w-full h-5 flex items-center justify-center"
              >
                <div className="absolute inset-0 z-0" /> {/* Larger touch target */}
                <motion.div 
                  animate={{ 
                    scale: isActive ? 1.4 : 1,
                    backgroundColor: isActive ? '#00B6AD' : 'rgba(255,255,255,0.14)',
                    boxShadow: isActive ? '0 0 12px rgba(0,182,173,0.6)' : 'none'
                  }}
                  className={`${isActive ? 'w-2.5 h-2.5' : 'w-1.5 h-1.5'} rounded-full transition-all duration-300`}
                />
                
                {isActive && (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute right-10 py-1.5 px-3 bg-brand/90 backdrop-blur-md rounded-lg whitespace-nowrap shadow-xl"
                  >
                    <span className="text-[12px] font-black text-white">{f.budget}</span>
                    <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-brand/90 rotate-45 rounded-sm" />
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>
        <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.2em] mt-3 [writing-mode:vertical-lr]">Scroll</span>
      </div>

      {/* Style Toggle (Top Center) - Scrollable Horizontal Tabs */}
      <div 
        className="
          absolute top-20 md:top-24 left-1/2 -translate-x-1/2 z-50 
          flex items-center gap-1.5 p-1.5 md:p-2 bg-black/45 backdrop-blur-xl 
          border border-white/20 rounded-full
          shadow-[0_10px_40px_rgba(0,0,0,0.35)]
          w-[calc(100vw-32px)] md:w-auto overflow-x-auto scrollbar-hide
        "
      >
         {STYLE_TAGS.map(style => (
           <button 
             key={style}
             onClick={() => setCurrentStyle(style as StyleTag)}
             className={`
               h-8 md:h-11 px-4 md:px-6 rounded-full text-[13px] md:text-[14px] font-bold transition-all whitespace-nowrap flex items-center justify-center
               ${currentStyle === style 
                 ? 'bg-white text-black shadow-lg' 
                 : 'text-white/90 hover:bg-white/15 hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'
               }
             `}
           >
             {style}
           </button>
         ))}
      </div>

      {/* Slide-out Panels */}

      {/* Plan Summary Panel (Center Overlay) - Responsive Grid */}
      <AnimatePresence>
        {showPlanSummary && (
          <div className="absolute inset-0 z-[150] flex items-center justify-center p-4 md:p-8 bg-black/40 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="w-full max-w-[900px] bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[32px] md:rounded-[48px] overflow-hidden shadow-2xl p-6 md:p-10 flex flex-col md:flex-row gap-6 md:gap-10 overflow-y-auto max-h-[92vh] md:max-h-none"
             >
                <div className="w-full md:w-[360px] aspect-video md:h-full md:aspect-auto rounded-[20px] md:rounded-[32px] overflow-hidden border border-white/10 shrink-0">
                   <img src={SCENE_IMAGES[currentStyle][currentLevel].image || null} className="w-full h-full object-cover" alt="Plan" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between overflow-hidden">
                   <div className="flex flex-col gap-4 md:gap-6">
                      <div className="flex justify-between items-start">
                         <div>
                            <h3 className="text-[24px] md:text-[32px] font-medium leading-tight mb-1 md:mb-2">{currentTemplate.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 md:gap-3">
                               <span className="text-[12px] md:text-[14px] text-brand font-mono">{currentTemplate.budgetRange}</span>
                               <div className="w-1 h-1 rounded-full bg-white/20" />
                               <span className="text-[12px] md:text-[14px] text-white/40">{currentTemplate.style}</span>
                               <div className="w-1 h-1 rounded-full bg-white/20 hidden md:block" />
                               <span className="text-[12px] md:text-[14px] text-white/40">{currentTemplate.areaRange}</span>
                            </div>
                         </div>
                         <button onClick={() => setShowPlanSummary(false)} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                            <X className="w-4 md:w-5 h-4 md:h-5" />
                         </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-y-6 gap-x-8">
                         <div>
                            <span className="text-[9px] md:text-[10px] text-white/20 uppercase tracking-[0.2em] block mb-2 md:mb-3 font-bold">涵盖空间</span>
                            <div className="flex flex-wrap gap-1.5 md:gap-2">
                               {currentTemplate.spaces.map(s => <span key={s} className="px-2.5 py-1 bg-white/5 rounded-lg text-[11px] md:text-[12px] text-white/60">{s}</span>)}
                            </div>
                         </div>
                         <div>
                            <span className="text-[9px] md:text-[10px] text-white/20 uppercase tracking-[0.2em] block mb-2 md:mb-3 font-bold">产品总数</span>
                            <span className="text-[14px] md:text-[16px] font-mono text-white/80 tracking-tight">{currentTemplate.items.length} 件软装单品</span>
                         </div>
                         <div className="md:col-span-2">
                            <div className="flex justify-between items-center mb-2 md:mb-3">
                               <span className="text-[9px] md:text-[10px] text-white/20 uppercase tracking-[0.2em] block font-bold">案例清单预览</span>
                               <span className="text-[11px] md:text-[10px] text-brand font-bold">总计: ¥{currentTemplate.items.reduce((sum, i) => sum + (i.unitPrice || 0) * (i.quantity || 1), 0).toLocaleString()}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto max-h-[100px] md:max-h-[120px] scrollbar-hide">
                               {currentTemplate.items.slice(0, 6).map((item, idx) => (
                                 <div key={idx} className="flex items-center justify-between gap-2 text-white/40 text-[11px] md:text-[12px] bg-white/5 px-3 py-2 rounded-xl">
                                    <div className="flex items-center gap-2 truncate whitespace-nowrap overflow-hidden">
                                       <div className="w-1 h-1 rounded-full bg-brand shrink-0" />
                                       <span className="truncate">{item.name}</span>
                                    </div>
                                    <span className="text-white/20 shrink-0">x{item.quantity}</span>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="flex flex-col gap-3 pt-6 md:pt-8 bg-black/5 md:bg-transparent px-2 md:px-0">
                      <button 
                        onClick={() => {
                          setShowPlanSummary(false);
                          setNewPlanName(`${budgetLevelMap[currentFloor.budget]?.title || currentFloor.name}｜${currentFloor.budget}｜${currentStyle}方案`);
                          setIsGeneratingPlan(true);
                        }}
                        className="w-full h-12 md:h-14 bg-white text-black rounded-full font-black text-[15px] hover:scale-[1.01] transition-transform shadow-xl flex items-center justify-center gap-2"
                      >
                         <CheckCircle2 className="w-4 h-4" /> 按这套生成我的方案
                      </button>
                      <button 
                        onClick={() => setShowChecklistModal(true)}
                        className="w-full h-11 md:h-14 bg-white/5 text-white/40 rounded-full font-bold text-[13px] md:text-[14px] hover:bg-white/10 transition-all border border-white/5 md:border-white/10"
                      >
                         查看完整物料清单
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Generate From Case Modal - Responsive */}
      <AnimatePresence>
        {isGeneratingPlan && (
          <div 
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-md"
            onClick={() => setIsGeneratingPlan(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#1A1A1A] border border-white/10 rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsGeneratingPlan(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-[20px] md:text-[24px] font-black text-white mb-2">生成我的方案</h3>
              <p className="text-[13px] md:text-[14px] text-white/40 mb-6 md:mb-8 leading-relaxed">
                系统将基于 <span className="text-brand">{currentFloor.model} {currentStyle}</span> 案例创建一个独立方案，之后你可以自由修改选品。
              </p>
              
              <div className="space-y-4 md:space-y-6 mb-8 md:mb-10">
                <div className="space-y-2">
                  <label className="text-[11px] md:text-[12px] font-black text-white/20 uppercase tracking-widest px-1">方案名称</label>
                  <input 
                    type="text"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    placeholder="请输入方案名称"
                    className="w-full h-12 md:h-14 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-5 md:px-6 text-white text-[14px] md:text-[15px] focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all font-bold"
                  />
                </div>
                
                <div className="bg-white/5 p-4 rounded-xl md:rounded-2xl flex flex-col gap-2">
                  <div className="flex justify-between text-[12px] md:text-[13px]">
                    <span className="text-white/40">参考预算</span>
                    <span className="text-brand font-black">{currentFloor.budget}</span>
                  </div>
                  <div className="flex justify-between text-[12px] md:text-[13px]">
                    <span className="text-white/40">风格档位</span>
                    <span className="text-white font-bold">{currentStyle} / {currentFloor.model}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 md:gap-4">
                <button 
                  onClick={() => setIsGeneratingPlan(false)}
                  className="flex-1 h-12 md:h-14 bg-white/5 text-white/40 rounded-full font-bold text-[14px] md:text-[15px] hover:bg-white/10 transition-all"
                >
                  取消
                </button>
                <button 
                  onClick={generatePlanFromCase}
                  className="flex-1 h-12 md:h-14 bg-brand text-white rounded-full font-bold text-[14px] md:text-[15px] hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-brand/20"
                >
                  确认生成
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Left Panel: Budget Breakdown - Responsive */}
      <AnimatePresence>
        {showDetails && (
          <>
            <div className="fixed inset-0 bg-black/40 z-[90] md:hidden" onClick={() => setShowDetails(false)} />
            <motion.div 
              initial={{ x: -100, opacity: 0, y: '-50%' }}
              animate={{ x: 0, opacity: 1, y: '-50%' }}
              exit={{ x: -100, opacity: 0, y: '-50%' }}
              className="absolute left-1/2 -translateX-1/2 md:left-8 md:translate-x-0 top-1/2 z-[100] w-[92vw] md:w-[460px] p-6 md:p-10 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[32px] md:rounded-[40px] shadow-2xl overflow-y-auto h-[80vh] md:max-h-[85vh] scrollbar-hide"
              style={{ left: window.innerWidth < 768 ? '50%' : '', transform: window.innerWidth < 768 ? 'translate(-50%, -50%)' : 'translate(0, -50%)' }}
            >
            <div className="flex justify-between items-start mb-6 md:mb-8">
               <div>
                  <h3 className="text-[22px] md:text-[26px] font-medium">这档钱花在哪</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                     <span className="text-[11px] md:text-[12px] text-brand uppercase font-mono tracking-widest">{currentFloor.model}</span>
                     <div className="w-1 h-1 rounded-full bg-white/20" />
                     <span className="text-[11px] md:text-[12px] text-white/60 font-medium">{currentFloor.budget}</span>
                     <div className="w-1 h-1 rounded-full bg-white/20 hidden md:block" />
                     <span className="text-[11px] md:text-[12px] text-white/40 font-medium hidden md:block">{currentStyle}</span>
                  </div>
               </div>
               <button onClick={() => setShowDetails(false)} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                  <X className="w-4 md:w-5 h-4 md:h-5" />
               </button>
            </div>

            <div className="space-y-8 md:space-y-10 pb-20 md:pb-24">
               {/* Tier Conclusion Card - Redesigned to be the main highlight */}
               <div className="p-5 md:p-6 bg-white/5 rounded-[24px] md:rounded-[32px] border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 md:w-1.5 h-full bg-brand/60" />
                  <span className="text-[9px] md:text-[10px] text-white/20 uppercase tracking-[0.2em] block mb-2 md:mb-3 font-bold">档位结论</span>
                  <p className="text-[14px] md:text-[17px] leading-relaxed text-white font-medium">
                     {currentLevel <= 3 
                        ? `这一档开始从“能住”进入“住得省心”。预算不再只补基础件，而是开始拉升整体空间的统一性。` 
                        : currentLevel <= 7 
                        ? `这一档开始从“舒适”进入“品质”。${currentFloor.budget}的预算足以拉升主空间材质的高高级感。` 
                        : `进入“藏家级”配置。为了极致的风格统一度和材质溢价买单，追求设计在感官上的完整闭环。`}
                  </p>
               </div>

               {/* Budget Allocation Bars */}
               <div>
                  <span className="text-[10px] md:text-[11px] text-white/20 uppercase tracking-[0.3em] border-b border-white/10 block pb-2 mb-6 md:mb-8 font-bold">预算重心</span>
                  <div className="space-y-6 md:space-y-8">
                     {budgetAllocation.map((item) => (
                        <div key={item.label} className="space-y-2.5 md:space-y-3">
                           <div className="flex justify-between items-end">
                              <div>
                                <span className="text-[13px] md:text-[14px] text-white/80 font-medium block">{item.label}</span>
                                <span className="text-[10px] md:text-[11px] text-white/40 mt-1 block">{item.desc}</span>
                              </div>
                              <span className="text-[11px] md:text-[12px] font-mono text-white/40">{item.value}%</span>
                           </div>
                           <div className="h-1 md:h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${item.value}%` }}
                                 transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                                 className="h-full rounded-full"
                                 style={{ backgroundColor: item.color }}
                              />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* This Stage New Additions */}
               <div>
                  <span className="text-[10px] md:text-[11px] text-white/20 uppercase tracking-[0.3em] border-b border-white/10 block pb-2 mb-4 font-bold">本档新增</span>
                  <div className="grid grid-cols-1 gap-3">
                     {[
                        currentLevel <= 3 ? "基础会客功能全套件" : currentLevel <= 7 ? "客餐厅核心材质升舱" : "全屋高定系统化呈现",
                        currentLevel <= 3 ? "主卧遮光帘与主照明" : currentLevel <= 7 ? "全场景灯光控制系统" : "大牌单品/艺术挂画入场",
                        currentLevel <= 3 ? "餐厅全金属骨架家具" : currentLevel <= 7 ? "卧室亲肤级环保面料" : "顶级真皮及稀有石材",
                     ].map((point, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 text-white/70">
                           <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                           <span className="text-[12px] md:text-[14px]">{point}</span>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Diff Cards */}
               <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                     <span className="text-[9px] md:text-[10px] text-white/30 uppercase tracking-widest block mb-1">相比低一档</span>
                     <p className="text-[11px] md:text-[12px] text-white/60 leading-relaxed">
                        {currentLevel <= 1 ? "无更低方案" : "多的是舒适度与完整度。"}
                     </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                     <span className="text-[9px] md:text-[10px] text-white/30 uppercase tracking-widest block mb-1">相比高一档</span>
                     <p className="text-[11px] md:text-[12px] text-white/60 leading-relaxed">
                        {currentLevel >= 10 ? "已是顶配方案" : "少的是明确风格、材质统一。"}
                     </p>
                  </div>
               </div>

               {/* Trade-off Recommendations */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="p-5 bg-brand/5 rounded-[24px] md:rounded-3xl border border-brand/20">
                     <span className="text-[10px] md:text-[11px] text-brand uppercase tracking-widest block mb-3 font-bold">建议保留</span>
                     <div className="space-y-2">
                        {['主沙发', '主卧床垫', '全屋窗帘', '客厅主灯'].map(item => (
                          <div key={item} className="text-[12px] md:text-[13px] text-white/70">{item}</div>
                        ))}
                     </div>
                  </div>
                  <div className="p-5 bg-white/5 rounded-[24px] md:rounded-3xl border border-white/5">
                     <span className="text-[10px] md:text-[11px] text-white/20 uppercase tracking-widest block mb-3 font-bold">可以延后</span>
                     <div className="space-y-2">
                        {['装饰挂画', '部分地毯', '次卧软装', '氛围小灯'].map(item => (
                          <div key={item} className="text-[12px] md:text-[13px] text-white/40 underline decoration-white/10 underline-offset-4">{item}</div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* Budget Panel Fixed Switch Dock */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 pt-8 md:pt-10 bg-gradient-to-t from-black via-black/90 to-transparent z-10">
               <div className="flex gap-2 md:gap-3 p-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
                  <button 
                    onClick={() => togglePanel('details')}
                    className={`flex-1 h-10 md:h-12 rounded-full flex items-center justify-center gap-1.5 md:gap-2 text-[12px] md:text-[13px] font-bold transition-all ${showDetails ? 'bg-white text-black' : 'text-white/40 hover:bg-white/5'}`}
                  >
                    <Info className="w-3.5 md:w-4 h-3.5 md:h-4" /> 预算分配
                  </button>
                  <button 
                    onClick={() => togglePanel('ai')}
                    className={`flex-1 h-10 md:h-12 rounded-full flex items-center justify-center gap-1.5 md:gap-2 text-[12px] md:text-[13px] font-bold transition-all ${showAI ? 'bg-white text-black' : 'text-white/40 hover:bg-white/5'}`}
                  >
                    <Sparkles className="w-3.5 md:w-4 h-3.5 md:h-4" /> AI 点评
                  </button>
               </div>
            </div>
          </motion.div>
        </>
        )}
      </AnimatePresence>

      {/* Right Panel: AI Strategic Review - Responsive */}
      <AnimatePresence>
        {showAI && (
          <>
            <div className="fixed inset-0 bg-black/40 z-[90] md:hidden" onClick={() => setShowAI(false)} />
            <motion.div 
              initial={{ x: 100, opacity: 0, y: '-50%' }}
              animate={{ opacity: 1, x: 0, y: '-50%' }}
              exit={{ x: 100, opacity: 0, y: '-50%' }}
              className="absolute left-1/2 -translateX-1/2 md:right-8 md:translate-x-0 md:left-auto top-1/2 z-[100] w-[92vw] md:w-[460px] p-6 md:p-10 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[32px] md:rounded-[40px] shadow-2xl overflow-y-auto h-[80vh] md:max-h-[85vh] scrollbar-hide"
              style={{ left: window.innerWidth < 768 ? '50%' : '', right: window.innerWidth < 768 ? 'auto' : '2rem', transform: window.innerWidth < 768 ? 'translate(-50%, -50%)' : 'translate(0, -50%)' }}
            >
            <div className="flex justify-between items-start mb-6 md:mb-8">
               <div className="flex items-center gap-3">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-brand/20 flex items-center justify-center">
                    <Sparkles className="w-4 md:w-5 h-4 md:h-5 text-brand" />
                  </div>
                  <div>
                    <h3 className="text-[20px] md:text-[26px] font-medium text-white">{aiContent.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] md:text-[10px] text-brand uppercase tracking-[0.2em] font-bold">{aiContent.subtitle}</span>
                    </div>
                  </div>
               </div>
               <button onClick={() => setShowAI(false)} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                  <X className="w-4 md:w-5 h-4 md:h-5" />
               </button>
            </div>

            <AnimatePresence mode="wait">
               {isEvaluating ? (
                 <motion.div 
                   key="evaluating"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="h-[350px] md:h-[400px] flex flex-col items-center justify-center gap-6"
                 >
                    <div className="relative">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-brand/10" />
                      <div className="absolute inset-0 w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-t-brand animate-spin" />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                       <span className="text-[13px] md:text-[14px] text-white/60 font-medium animate-pulse">正在重新评估当前方案...</span>
                       <span className="text-[9px] md:text-[10px] text-white/20 font-mono tracking-widest uppercase">Analyzing Spatial Data</span>
                    </div>
                 </motion.div>
               ) : (
                 <motion.div 
                   key="content"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                   className="space-y-8 md:space-y-10 pb-20 md:pb-24"
                 >
                    {/* Bottom Line Bro One Liner */}
                    <div className="p-5 md:p-6 bg-white/5 rounded-[24px] md:rounded-[32px] border border-white/10 relative overflow-hidden group">
                       <div className="absolute top-0 left-0 w-1 md:w-1.5 h-full bg-brand" />
                       <div className="flex items-center gap-2 mb-2 md:mb-3">
                         <span className="text-[9px] md:text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">底线哥一句话</span>
                         <MessageSquare className="w-3 h-3 text-white/20" />
                       </div>
                       <p className="text-[15px] md:text-[17px] leading-relaxed text-white font-medium italic">
                          “{aiContent.dixiange}”
                       </p>
                    </div>

                    {/* Integrated Summary */}
                    <div>
                       <span className="text-[10px] md:text-[11px] text-white/20 uppercase tracking-[0.3em] border-b border-white/10 block pb-2 mb-6 font-bold">综合判断</span>
                       <p className="text-[14px] md:text-[15px] text-white/70 leading-relaxed font-light">
                          {aiContent.assessment}
                       </p>
                    </div>

                    {/* General Evaluation Scores */}
                    <div className="grid grid-cols-2 gap-3">
                       {[
                         { label: '预算效率', score: 92 },
                         { label: '舒适提升', score: currentLevel * 10 > 100 ? 98 : currentLevel * 10 },
                         { label: '风格完整', score: currentLevel > 6 ? 90 : 70 },
                         { label: '配套统一度', score: currentLevel > 4 ? 85 : 60 }
                       ].map(s => (
                         <div key={s.label} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-[10px] md:text-[11px] text-white/30 block mb-1">{s.label}</span>
                            <div className="flex items-baseline gap-1">
                               <span className="text-[18px] md:text-[20px] font-mono text-white/80">{s.score}</span>
                               <span className="text-[9px] md:text-[10px] text-white/40">/100</span>
                            </div>
                         </div>
                       ))}
                    </div>

                    {/* Strengths */}
                    <div>
                       <span className="text-[10px] md:text-[11px] text-brand/60 uppercase tracking-[0.3em] border-b border-brand/10 block pb-2 mb-4 font-bold">当前优势</span>
                       <div className="space-y-3">
                          {aiContent.strengths.map((item, i) => (
                             <div key={i} className="flex gap-3 text-[13px] md:text-[14px] text-white/70 items-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand/40" />
                                <span>{item}</span>
                             </div>
                          ))}
                       </div>
                    </div>

                    {/* Points to Note */}
                    <div>
                       <span className="text-[10px] md:text-[11px] text-orange-400/60 uppercase tracking-[0.3em] border-b border-orange-400/10 block pb-2 mb-4 font-bold">需要注意</span>
                       <div className="space-y-3">
                          {aiContent.needs.map((item, i) => (
                             <div key={i} className="flex gap-3 text-[13px] md:text-[14px] text-white/50 items-start">
                                <span className="text-orange-400/60 mt-1">•</span>
                                <span>{item}</span>
                             </div>
                          ))}
                       </div>
                    </div>

                    {/* Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                       <div className="p-5 bg-brand/5 rounded-[24px] md:rounded-3xl border border-brand/20">
                          <span className="text-[10px] md:text-[11px] text-brand uppercase tracking-widest block mb-3 font-bold">如果加预算</span>
                          <div className="space-y-2">
                             {aiContent.add.map(s => <div key={s} className="text-[12px] text-white underline underline-offset-4 decoration-brand/20">{s}</div>)}
                          </div>
                       </div>
                       <div className="p-5 bg-white/5 rounded-[24px] md:rounded-3xl border border-white/5">
                          <span className="text-[10px] md:text-[11px] text-white/20 uppercase tracking-widest block mb-3 font-bold">如果减预算</span>
                          <div className="space-y-2">
                             {aiContent.sub.map(s => <div key={s} className="text-[12px] text-white/30">{s}</div>)}
                          </div>
                       </div>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
            
            {/* Panel Common Fixed Switch Dock */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 pt-8 md:pt-10 bg-gradient-to-t from-black via-black/90 to-transparent z-10">
               <div className="flex gap-2 md:gap-3 p-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
                  <button 
                    onClick={() => togglePanel('details')}
                    className={`flex-1 h-10 md:h-12 rounded-full flex items-center justify-center gap-1.5 md:gap-2 text-[12px] md:text-[13px] font-bold transition-all ${showDetails ? 'bg-white text-black' : 'text-white/40 hover:bg-white/5'}`}
                  >
                    <Info className="w-3.5 md:w-4 h-3.5 md:h-4" /> 预算分配
                  </button>
                  <button 
                    onClick={() => togglePanel('ai')}
                    className={`flex-1 h-10 md:h-12 rounded-full flex items-center justify-center gap-1.5 md:gap-2 text-[12px] md:text-[13px] font-bold transition-all ${showAI ? 'bg-white text-black' : 'text-white/40 hover:bg-white/5'}`}
                  >
                    <Sparkles className="w-3.5 md:w-4 h-3.5 md:h-4" /> AI 点评
                  </button>
               </div>
            </div>
          </motion.div>
        </>
        )}
      </AnimatePresence>

      {/* Floating Status (Bottom Corner) - Responsive */}
      <div className="absolute bottom-6 md:bottom-10 right-6 md:right-10 z-[120] text-right pointer-events-none">
         <motion.div
           key={currentStyle + currentLevel + 'status-meta'}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.6 }}
         >
           <span className="text-[9px] md:text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">DXG_SPATIAL_STAGE</span>
           <div className="text-[14px] md:text-[16px] font-medium text-white/50 mt-1 flex items-center justify-end gap-2 md:gap-3">
              <span className="tracking-tight">{currentStyle}</span>
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <span className="font-mono text-white/80">{currentFloor.budget}</span>
           </div>
         </motion.div>
      </div>

      {/* Checklist Preview Modal */}
      {showChecklistModal && (
        <TemplateChecklistModal
          template={currentTemplate}
          onBack={() => setShowChecklistModal(false)}
          onClose={() => setShowChecklistModal(false)}
          onGenerate={() => {
            setShowChecklistModal(false);
            setShowPlanSummary(false);
            setNewPlanName(`${budgetLevelMap[currentFloor.budget]?.title || currentFloor.name}｜${currentFloor.budget}｜${currentStyle}方案`);
            setIsGeneratingPlan(true);
          }}
        />
      )}
    </div>
  );
}

