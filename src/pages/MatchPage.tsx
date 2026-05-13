import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Camera, 
  Edit3, 
  ChevronRight, 
  X, 
  Upload, 
  CheckCircle2, 
  Info, 
  ArrowLeft,
  Layout,
  Layers,
  Palette,
  Users,
  Target,
  History,
  Check,
  ArrowRight,
  Plus,
  Zap,
  ShoppingBag,
  Home,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  TrendingDown,
  ChevronDown,
  Image as ImageIcon,
  Box,
  Share2,
  Maximize2,
  Minus,
  Heart
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { MOCK_PRODUCTS_LIST as MOCK_PRODUCTS } from '../data/products';

import { UserPlan, PlanSpace, PlanProduct, UserMatchProfile, StyleTag } from '../types';

type MatchState = 
  | 'WORKSPACE' 
  | 'PLAN_DETAIL' 
  | 'MANUAL_FILL' 
  | 'UPLOAD_FLOW' 
  | 'PRODUCT_RESULTS' 
  | 'PLAN_RESULTS'
  | 'PROCUREMENT_LIST'
  | 'MOODBOARD_EDITOR'
  | 'PRODUCT_DETAIL'
  | 'PRODUCT_RECOMMENDATIONS';

type WorkspaceTab = 'plans' | 'library' | 'moodboards';
type PlanTab = 'overview' | 'recommendations' | 'list' | 'budget';

const MOCK_PLANS: UserPlan[] = [
  {
    id: 'p1',
    name: '意式极简全屋搭配',
    type: 'ai',
    status: 'in_progress',
    createdAt: '2024-05-20',
    updatedAt: '2024-05-22',
    completion: 86,
    matchProfile: {
      areaRange: '90-120㎡',
      spaces: ['客厅', '主卧'],
      budgetRange: '8-15万',
      styleFeelings: ['意式极简'],
      familyNeeds: ['有孩子'],
      uploadedImages: [
        { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800', type: 'SITE_PHOTO' }
      ]
    },
    spaces: [
      {
        id: 's1',
        name: '客厅',
        budget: 45000,
        note: '追求通透感与金属质感的平衡。',
        items: [
          { id: 'item1', name: '真皮沙发 S1', price: 8900, type: '必买', score: 92, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400' },
          { id: 'item2', name: '极简岩板茶几', price: 2400, type: '必买', score: 88, image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=400' }
        ]
      }
    ],
    budget: { 
      range: '8-15万',
      estimatedTotal: 125000, 
      status: 'reasonable',
      furnitureTotal: 85000,
      softReserve: 25000,
      installationReserve: 15000
    }
  }
];

const MOCK_LIBRARY: PlanProduct[] = [
  { id: 'l1', name: '中古风边柜', price: 3200, type: '建议', score: 85, image: 'https://images.unsplash.com/photo-1595428774223-ef04a127a271?auto=format&fit=crop&q=80&w=400', tags: ['实木', '收纳'] },
  { id: 'l2', name: '包豪斯单人椅', price: 1800, type: '建议', score: 94, image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=400', tags: ['经典', '设计'] }
];

const STEPS = [
  {
    id: 1,
    title: '你家大概多大？',
    description: '面积会影响家具尺寸、预算档位和空间压迫感判断。',
    options: ['60㎡以下', '60-90㎡', '90-120㎡', '120-160㎡', '160㎡以上', '我不确定'],
    field: 'areaRange' as keyof UserMatchProfile,
    icon: <Layout className="w-6 h-6" />,
    feedback: (val: string) => `已记录：${val}。我会优先考虑不会压空间的家具尺寸。`
  },
  {
    id: 2,
    title: '你想配置哪些空间？',
    description: '您可以先选最关注的，支持多选。',
    options: ['客厅', '卧室', '餐厅', '书房', '儿童房', '阳台', '全屋软装'],
    field: 'spaces' as keyof UserMatchProfile,
    icon: <Layers className="w-6 h-6" />,
    multi: true
  },
  {
    id: 3,
    title: '你的家具预算大概是多少？',
    description: '不确定也没关系，我们可以先按中等预算帮你估算。',
    options: ['1-3万', '3-5万', '5-8万', '8-15万', '15-30万', '30万以上', '还没想好'],
    field: 'budgetRange' as keyof UserMatchProfile,
    icon: <Target className="w-6 h-6" />,
    feedback: (val: string) => `已记录：${val}。我会优先避开明显超预算的产品。`
  },
  {
    id: 4,
    title: '你更喜欢家的哪种感觉？',
    description: '先选一个最触动你的感觉。',
    options: ['干净清爽', '温暖自然', '高质感但不张扬', '复古有氛围', '高级冷静', '轻奢精致', '还不确定'],
    field: 'styleFeelings' as keyof UserMatchProfile,
    icon: <Palette className="w-6 h-6" />,
    multi: true,
    feedback: (val: string[]) => val && val.length > 0 ? `已记录：${val[0]}。我会优先匹配更符合这种审美的材质和色调。` : null
  },
  {
    id: 5,
    title: '家里有什么特别需要考虑的吗？',
    description: '我们会根据成员情况调整安全性、耐用度和收纳建议。',
    options: ['有小孩', '有老人', '有宠物', '经常会客', '在家办公', '需要大量收纳', '租房/短住', '长期自住'],
    field: 'familyNeeds' as keyof UserMatchProfile,
    icon: <Users className="w-6 h-6" />,
    multi: true,
    feedback: (val: any) => val && val.includes && val.includes('有宠物') ? '已记录。我会更关注耐磨、易清洁和不易勾丝的材质。' : null
  },
  {
    id: 6,
    title: '选家具时，你最在意什么？',
    description: '这会影响 AI 推荐产品的排序。（最多选3个）',
    options: ['控制预算', '整体好看', '住得舒服', '好打理', '空间显大', '品质耐用', '快速配齐'],
    field: 'priorities' as keyof UserMatchProfile,
    icon: <Target className="w-6 h-6" />,
    multi: true,
    limit: 3
  }
];

export default function MatchPage() {
  const [viewState, setViewState] = useState<MatchState>('WORKSPACE');
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('plans');
  const [activePlanTab, setActivePlanTab] = useState<'showcase' | 'products' | 'analysis'>('showcase');
  
  const [plans, setPlans] = useState<UserPlan[]>(() => {
    const saved = localStorage.getItem('user_plans');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return MOCK_PLANS;
      }
    }
    return MOCK_PLANS;
  });

  const [productLibrary, setProductLibrary] = useState<PlanProduct[]>(() => {
    const saved = localStorage.getItem('product_library');
    return saved ? JSON.parse(saved) : MOCK_LIBRARY;
  });

  const [moodboards, setMoodboards] = useState<any[]>(() => {
    const saved = localStorage.getItem('moodboards');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [previousViewState, setPreviousViewState] = useState<MatchState>(viewState);
  const [sourceInspiration, setSourceInspiration] = useState<any>(null);
  const [isSkippingData, setIsSkippingData] = useState(false);
  
  const [manualStep, setManualStep] = useState(1);
  const [uploadStep, setUploadStep] = useState(1);
  const [isAiIdentifying, setIsAiIdentifying] = useState(false);
  const [completeness, setCompleteness] = useState(65);
  const [showTip, setShowTip] = useState<string | null>(null);
  const [productMode, setProductMode] = useState<'visual' | 'details'>('visual');
  const [planMode, setPlanMode] = useState<'visual' | 'list'>('visual');
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [showDecoratorModal, setShowDecoratorModal] = useState(false);
  const [decoratorForm, setDecoratorForm] = useState({ name: '', phone: '', note: '' });
  const [isRefilling, setIsRefilling] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [formData, setFormData] = useState<UserMatchProfile>(() => {
    const saved = localStorage.getItem('user_profile');
    return saved ? JSON.parse(saved) : {
      areaRange: '',
      spaces: [],
      budgetRange: '',
      styleFeelings: [],
      familyNeeds: [],
      priorities: [],
      uploadedImages: []
    };
  });

  useEffect(() => {
    localStorage.setItem('user_profile', JSON.stringify(formData));
    
    // Calculate completeness
    let score = 0;
    if (formData.areaRange) score += 15;
    if (formData.spaces.length > 0) score += 15;
    if (formData.budgetRange) score += 15;
    if (formData.styleFeelings.length > 0) score += 15;
    if (formData.familyNeeds.length > 0) score += 15;
    if (formData.priorities.length > 0) score += 15;
    if (formData.uploadedImages?.length || 0 > 0) score += 10;
    setCompleteness(score);
  }, [formData]);

  const currentPlan = plans.find(p => p.id === currentPlanId) || plans[0];

  const handleJoinLibrary = (product: any) => {
    const saved = localStorage.getItem('product_library');
    const library = saved ? JSON.parse(saved) : productLibrary;
    if (!library.find((p: any) => p.id === product.id)) {
      const newList = [...library, product];
      setProductLibrary(newList);
      localStorage.setItem('product_library', JSON.stringify(newList));
      alert('已将该产品加入产品库，作为未来搭配板素材。');
    } else {
      alert('产品已在库中。');
    }
  };

  const handleProductClick = (id: number) => {
    setPreviousViewState(viewState);
    setSelectedProductId(id);
    setViewState('PRODUCT_DETAIL');
  };

  const handleAddToPlan = (product: any) => {
    const saved = localStorage.getItem('user_plans');
    const plansArr = saved ? JSON.parse(saved) : plans;
    
    // Check if we are currently viewing a plan or have a current plan ID
    if (currentPlanId) {
      const updatedPlans = plansArr.map((p: any) => {
        if (p.id === currentPlanId) {
          const products = p.products || [];
          if (!products.find((item: any) => item.id === product.id)) {
            return { ...p, products: [...products, product] };
          }
        }
        return p;
      });
      setPlans(updatedPlans);
      localStorage.setItem('user_plans', JSON.stringify(updatedPlans));
      const planName = plansArr.find((p: any) => p.id === currentPlanId)?.name;
      alert(`已成功加入我的方案：${planName}`);
    } else if (plansArr.length > 0) {
      // In a real app this would open a modal, for prototype we alert
      const pNames = plansArr.map((p: any) => p.name).join('\n');
      if (confirm(`选择加入方案：\n${pNames}\n\n点击确定加入第一个方案，取消则进入创建流程。`)) {
        const updatedPlans = plansArr.map((p: any, i: number) => {
          if (i === 0) {
            const products = p.products || [];
            return { ...p, products: [...products, product] };
          }
          return p;
        });
        setPlans(updatedPlans);
        localStorage.setItem('user_plans', JSON.stringify(updatedPlans));
        alert(`已加入方案：${plansArr[0].name}`);
      } else {
        setViewState('UPLOAD_FLOW');
      }
    } else {
      if (confirm('当前没有活跃方案，是否立即新建一个方案？')) {
        setViewState('UPLOAD_FLOW');
      }
    }
  };

  const handleExportExcel = () => {
    // Generate CSV content from real plan data
    const headers = ['序号', '名称', '空间', '产品型号', '尺寸', '售价', '折扣', '优惠价', '数量', '小计'];
    const rows = currentPlan.spaces.flatMap((space, sIdx) => 
      space.items.map((item, iIdx) => {
        const globalIndex = currentPlan.spaces.slice(0, sIdx).reduce((acc, s) => acc + s.items.length, 0) + iIdx + 1;
        const discount = 0.85;
        const discountedPrice = Math.round(item.price * discount);
        return [
          globalIndex,
          item.name,
          space.name,
          `${item.id.toUpperCase()}-v1`,
          '1200*600*750',
          item.price,
          '8.5折',
          discountedPrice,
          1,
          discountedPrice
        ];
      })
    );
    
    // Simple CSV generator
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${currentPlan.name}_全案选品清单.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('表格导出成功！正在为您下载 CSV 报价格式...');
  };

  const handleConsultService = () => {
    alert('已为您联系专属软装顾问：李经理 (138-xxxx-xxxx)\n咨询号：AI-PLAN-001\n\n顾问将在 5 分钟内通过站内信或电话回访您的方案需求。');
  };

  const renderWorkspace = () => (
    <div className="w-full max-w-7xl mx-auto px-4">
      <header className="mb-12 text-left">
        <h1 className="text-[48px] font-black text-white mb-4 tracking-tight">我的搭配工作台</h1>
        <p className="text-[18px] text-white/40 font-medium">在这里管理你的所有 AI 方案和灵感资产</p>
      </header>

      <div className="flex border-b border-white/10 mb-12">
        {[
          { id: 'plans', label: '我的方案', count: plans.length },
          { id: 'library', label: '灵感产品库', count: productLibrary.length },
          { id: 'moodboards', label: '搭配板', count: moodboards.length }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setWorkspaceTab(tab.id as any)}
            className={`px-8 py-5 text-[16px] font-black transition-all relative ${workspaceTab === tab.id ? 'text-brand' : 'text-white/30 hover:text-white'}`}
          >
            {tab.label}
            <span className="ml-2 opacity-30 text-[13px]">{tab.count}</span>
            {workspaceTab === tab.id && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-brand" />
            )}
          </button>
        ))}
      </div>

      {workspaceTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <button 
            onClick={() => {
              const newId = `p${Date.now()}`;
              setCurrentPlanId(newId);
              setViewState('UPLOAD_FLOW');
              setUploadStep(1);
            }}
            className="h-[360px] bg-white/5 border-2 border-dashed border-white/10 rounded-[40px] flex flex-col items-center justify-center gap-4 hover:bg-white/[0.08] hover:border-brand/40 transition-all group"
          >
            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-brand group-hover:text-white transition-all shadow-xl">
              <Plus className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="text-[18px] font-black text-white mb-1">新建 AI 搭配方案</p>
              <p className="text-[13px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">拍照或上传户型图开始</p>
            </div>
          </button>

          {plans.map(plan => (
            <div 
              key={plan.id}
              onClick={() => {
                setCurrentPlanId(plan.id);
                setViewState('PLAN_DETAIL');
              }}
              className="bg-[#1A1A1A] border border-white/5 rounded-[40px] p-8 text-left hover:border-white/20 transition-all cursor-pointer group shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-[60px]" />
              <div className="flex items-center justify-between mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${plan.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-brand/10 text-brand'}`}>
                  {plan.status === 'completed' ? <CheckCircle2 className="w-7 h-7" /> : <Zap className="w-7 h-7" />}
                </div>
                <div className="text-[11px] font-black text-white/20 uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full">
                  {plan.updatedAt}
                </div>
              </div>
              <h3 className="text-[24px] font-black text-white mb-2 leading-tight group-hover:text-brand transition-colors">{plan.name}</h3>
              <p className="text-[14px] text-white/40 font-bold mb-8">
                {plan.matchProfile.areaRange} · {plan.matchProfile.spaces.join('/')} · 匹配度 {plan.completion}%
              </p>
              <div className="flex items-center justify-between pt-8 border-t border-white/5">
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-[#1A1A1A] bg-white/10" />
                  ))}
                </div>
                <button className="text-[13px] font-black text-white/20 hover:text-white transition-colors flex items-center gap-1.5">
                  详情 <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {workspaceTab === 'library' && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {productLibrary.map(item => (
            <div key={item.id} className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:bg-white/10 transition-all cursor-pointer group shadow-xl">
               <div className="aspect-square bg-white rounded-2xl p-4 mb-4">
                 <img src={item.image} className="w-full h-full object-contain" alt="" />
               </div>
               <p className="text-[14px] font-black text-white group-hover:text-brand transition-colors mb-1 truncate">{item.name}</p>
               <p className="text-[12px] font-bold text-brand">¥{item.price.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderManualFill = () => {
    const step = STEPS[manualStep - 1];
    
    return (
      <div className="w-full max-w-3xl">
        <header className="mb-12 text-center">
           <div className="flex items-center justify-between mb-8">
             <button 
               onClick={() => {
                 if (manualStep > 1) setManualStep(manualStep - 1);
                 else setViewState(isRefilling ? 'PLAN_DETAIL' : 'WORKSPACE');
               }} 
               className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"
             >
               <ArrowLeft className="w-5 h-5" /> 返回
             </button>
             <div className="flex-1 flex justify-center">
               <div className="flex gap-2">
                 {STEPS.map(s => (
                   <div key={s.id} className={`w-1.5 h-1.5 rounded-full ${s.id === manualStep ? 'bg-brand' : 'bg-white/10'}`} />
                 ))}
               </div>
             </div>
             <div className="w-20" />
           </div>
           <div className="w-20 h-20 rounded-[28px] bg-brand/10 text-brand flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-brand/20">
             {step.icon}
           </div>
           <h2 className="text-[36px] font-black text-white mb-4 tracking-tight">{step.title}</h2>
           <p className="text-[17px] text-white/40 font-medium">{step.description}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-12">
          {step.options.map(opt => {
            const isSelected = step.multi 
              ? (formData[step.field] as string[]).includes(opt)
              : formData[step.field] === opt;
            
            return (
              <button 
                key={opt}
                onClick={() => {
                  let newVal: any;
                  if (step.multi) {
                    const current = (formData[step.field] as string[]) || [];
                    newVal = isSelected 
                      ? current.filter(c => c !== opt)
                      : [...current, opt];
                  } else {
                    newVal = opt;
                  }
                  setFormData({ ...formData, [step.field]: newVal });
                  
                  if (!step.multi) {
                    if (manualStep < STEPS.length) setManualStep(manualStep + 1);
                    else {
                      if (isRefilling) setViewState('PLAN_DETAIL');
                      else setViewState('PLAN_RESULTS');
                    }
                  }
                }}
                className={`p-6 rounded-[28px] text-left border-2 transition-all flex items-center justify-between ${isSelected ? 'bg-brand/10 border-brand text-brand shadow-xl' : 'bg-[#1A1A1A] border-white/5 text-white hover:border-white/20'}`}
              >
                <span className="text-[16px] font-black">{opt}</span>
                {isSelected && <Check className="w-5 h-5" />}
              </button>
            );
          })}
        </div>

        {step.multi && (formData[step.field] as string[]).length > 0 && (
          <button 
            onClick={() => {
              if (manualStep < STEPS.length) setManualStep(manualStep + 1);
              else {
                if (isRefilling) setViewState('PLAN_DETAIL');
                else setViewState('PLAN_RESULTS');
              }
            }}
            className="w-full py-5 bg-white text-black rounded-[32px] text-[16px] font-black shadow-xl"
          >
            继续下一步
          </button>
        )}
      </div>
    );
  };

  const renderUploadFlow = () => {
    if (uploadStep === 1) {
      return (
        <div className="w-full max-w-3xl flex flex-col items-center">
            <header className="mb-12 text-center">
              <button onClick={() => setViewState('PLAN_DETAIL')} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mx-auto mb-10">
                <ArrowLeft className="w-5 h-5" /> 返回
              </button>
              <h2 className="text-[36px] font-black text-white mb-4 tracking-tight">你想让 AI 先看什么？</h2>
              <p className="text-[17px] text-white/40 font-medium">可以只上传一张，也可以多传几张。先上传一张也能开始。</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
              {[
                { id: 'FLOOR_PLAN', title: '户型图', desc: '用于判断空间结构、面积和动线' },
                { id: 'SITE_PHOTO', title: '现场照片', desc: '用于判断采光、墙地面、已有家具' },
                { id: 'STYLE_REF', title: '喜欢风格图', desc: '用于判断审美偏好、色调和材质' }
              ].map(type => (
                <button 
                  key={type.id}
                  onClick={() => setUploadStep(2)}
                  className="p-8 bg-[#1A1A1A] border border-white/5 rounded-[32px] text-left hover:border-brand/40 transition-all group"
                >
                  <h3 className="text-[20px] font-black text-white mb-2 group-hover:text-brand">{type.title}</h3>
                  <p className="text-[13px] text-white/30 font-bold leading-relaxed">{type.desc}</p>
                </button>
              ))}
            </div>

            <button 
              onClick={() => {
                setViewState('MANUAL_FILL');
                setManualStep(1);
              }}
              className="text-[14px] font-black text-white/30 hover:text-white transition-colors"
            >
              暂时没有图片，改为快速填写
            </button>
        </div>
      );
    }

    if (uploadStep === 2) {
      return (
        <div className="w-full max-w-3xl flex flex-col items-center">
            <header className="mb-12 text-center w-full">
               <div className="flex items-center justify-between mb-8">
                 <button onClick={() => setUploadStep(1)} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
                   <ArrowLeft className="w-5 h-5" /> 返回
                 </button>
                 <span className="text-[13px] font-black text-brand uppercase tracking-widest">Step 2: Upload</span>
                 <div className="w-5" />
               </div>
               <h2 className="text-[36px] font-black text-white mb-4 tracking-tight">上传图片</h2>
               <p className="text-[17px] text-white/40 font-medium">拖拽图片到这里，或点击上传。</p>
            </header>

            <div className="w-full h-80 rounded-[40px] border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-10 bg-white/5 hover:bg-white/[0.08] hover:border-brand/40 transition-all cursor-pointer group" onClick={() => {
               setIsAiIdentifying(true);
               setTimeout(() => {
                 setIsAiIdentifying(false);
                 setFormData({ ...formData, uploadedImages: [...(formData.uploadedImages || []), { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800', type: 'SITE_PHOTO' }] });
               }, 2000);
            }}>
               {isAiIdentifying ? (
                 <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 rounded-full border-4 border-brand/20 border-t-brand animate-spin" />
                    <p className="text-[18px] font-black text-brand animate-pulse">AI 正在看图...</p>
                 </div>
               ) : (
                 <>
                   <div className="w-20 h-20 rounded-[28px] bg-white/5 flex items-center justify-center text-white/20 mb-6 group-hover:bg-brand/10 group-hover:text-brand transition-all">
                      <Upload className="w-8 h-8" />
                   </div>
                   <p className="text-[18px] font-black text-white mb-2">点击或拖拽上传</p>
                   <p className="text-[13px] font-bold text-white/20">支持 JPG / PNG / WebP</p>
                 </>
               )}
            </div>

            <div className="mt-8 flex gap-4 overflow-x-auto w-full py-2 px-4 no-scrollbar">
              {formData.uploadedImages?.map((img, idx) => (
                 <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                   <img src={img.url} className="w-full h-full object-cover" alt="" />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                     <CheckCircle2 className="w-6 h-6 text-brand" />
                   </div>
                 </div>
              ))}
            </div>
            
            {(formData.uploadedImages?.length || 0) > 0 && !isAiIdentifying && (
               <button 
                 onClick={() => setUploadStep(3)}
                 className="mt-12 px-12 py-5 bg-brand text-white rounded-3xl text-[16px] font-black shadow-xl"
               >
                 完成上传
               </button>
            )}
        </div>
      );
    }

    if (uploadStep === 3) {
      return (
        <div className="w-full max-w-3xl flex flex-col items-center">
          <header className="mb-12 text-center">
            <div className="w-20 h-20 rounded-[24px] bg-brand text-white flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-brand/20">
              <Sparkles className="w-10 h-10" />
            </div>
            <h2 className="text-[36px] font-black text-white mb-4 tracking-tight">AI 看到了一些关键信息</h2>
            <p className="text-[17px] text-white/40 font-medium">这些信息将被用于生成你的定制方案。</p>
          </header>
          
          <button 
             onClick={() => setViewState('PLAN_DETAIL')}
             className="px-12 py-5 bg-white text-black rounded-[32px] text-[16px] font-black shadow-xl"
          >
            进入并更新我的方案
          </button>
        </div>
      );
    }
  };

  const renderPlanDetail = () => {
    const completenessInfo = "资料非常详尽，AI 已经为你锁定了最合适的搭配方向。";
    const handleEditField = (stepId: number) => {
      setManualStep(stepId);
      setIsRefilling(true);
      setViewState('MANUAL_FILL');
    };

    const isConfirmed = currentPlan.status === 'completed';

    return (
      <div className="w-full max-w-7xl mx-auto px-4">
        {/* Header with Breadcrumbs & Actions */}
        <header className="mb-10 text-left">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <nav className="flex items-center gap-3">
                <button onClick={() => setViewState('WORKSPACE')} className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors font-bold text-[13px]">
                  我的方案
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-white/10" />
                <span className="text-white/20 font-bold text-[13px]">{currentPlan.name}</span>
              </nav>
              <div className="flex items-center gap-4">
                 <h2 className="text-[42px] font-black text-white tracking-tight leading-tight">{currentPlan.name}</h2>
                 <div className="flex items-center gap-3">
                   <span className={`px-4 py-1.5 rounded-full text-[12px] font-black uppercase tracking-wider ${
                     currentPlan.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                     currentPlan.status === 'in_progress' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                     'bg-white/5 text-white/40 border border-white/10'
                   }`}>
                     {currentPlan.status === 'completed' ? '已完成' : currentPlan.status === 'in_progress' ? '进行中' : '草稿'}
                   </span>
                   {isSkippingData && (
                     <span className="px-4 py-1.5 bg-brand/5 text-brand/60 rounded-full text-[12px] font-black border border-brand/10 italic">
                       自由选品模式
                     </span>
                   )}
                 </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
               {isConfirmed ? (
                 <div className="flex items-center gap-3">
                   <button 
                     onClick={() => alert('方案已锁定，如需修改请联系跟单')}
                     className="px-8 py-4 bg-white/5 border border-white/10 text-white/40 rounded-2xl text-[15px] font-black cursor-not-allowed"
                   >
                     方案已锁定
                   </button>
                   <button 
                     onClick={() => setShowDecoratorModal(true)}
                     className="px-8 py-4 bg-brand text-white rounded-2xl text-[15px] font-black hover:scale-105 transition-all shadow-xl brand-glow"
                   >
                     交付跟单处理
                   </button>
                 </div>
               ) : (
                 <button 
                   onClick={() => {
                     // Confirm logic
                     const updatedPlans = plans.map(p => 
                       p.id === currentPlanId ? { ...p, status: 'completed' as const, updatedAt: new Date().toISOString().split('T')[0] } : p
                     );
                     setPlans(updatedPlans);
                     localStorage.setItem('user_plans', JSON.stringify(updatedPlans));
                     alert('方案清单已确认！已转为正式采购清单。');
                   }}
                   className="px-8 py-4 bg-white text-black rounded-2xl text-[15px] font-black hover:scale-105 transition-all shadow-xl"
                 >
                   确认并生成采购清单
                 </button>
               )}
            </div>
          </div>
        </header>

        {/* Unified Plan Tabs */}
        <div className="flex border-b border-white/10 mb-10 overflow-x-auto no-scrollbar">
          {[
            { id: 'showcase', label: '方案展示' },
            { id: 'products', label: '选品清单' },
            { id: 'analysis', label: '方案概览与分析' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActivePlanTab(tab.id as any)}
              className={`px-8 py-4 text-[16px] font-black transition-all relative whitespace-nowrap ${activePlanTab === tab.id ? 'text-brand' : 'text-white/40 hover:text-white pb-5'}`}
            >
              {tab.label}
              {activePlanTab === tab.id && (
                <motion.div layoutId="activePlanTabLine" className="absolute bottom-0 left-0 right-0 h-1 bg-brand" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Rendering */}
        <div className="w-full">
          {activePlanTab === 'showcase' && (
            <div className="space-y-10">
              {/* Collage Showcase: AI Interior Simulation */}
              <div className="relative aspect-[16/9] bg-[#1A1A1A] rounded-[48px] overflow-hidden shadow-2xl border border-white/5 group">
                <img 
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000" 
                  className="w-full h-full object-cover opacity-80"
                  alt="AI Interior Simulation"
                />
                
                {/* AI Overlay Layer: Product Hotspots */}
                <div className="absolute inset-0 z-10 p-12">
                   {/* Mock Hotspots representing added products */}
                   <div className="absolute top-[45%] left-[30%] group/dot">
                      <div className="w-8 h-8 rounded-full bg-brand/80 backdrop-blur-md border border-white/50 flex items-center justify-center animate-pulse cursor-pointer">
                        <ShoppingBag className="w-4 h-4 text-white" />
                      </div>
                      <div className="absolute top-10 left-0 bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 opacity-0 group-hover/dot:opacity-100 transition-opacity whitespace-nowrap z-20">
                         <p className="text-[14px] font-black text-white">意式真皮沙发 S1</p>
                         <p className="text-[12px] text-brand font-bold">¥8,900</p>
                      </div>
                   </div>
                   
                   <div className="absolute top-[35%] right-[25%] group/dot">
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center cursor-pointer">
                        <ShoppingBag className="w-4 h-4 text-white" />
                      </div>
                      <div className="absolute top-10 right-0 bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 opacity-0 group-hover/dot:opacity-100 transition-opacity whitespace-nowrap z-20">
                         <p className="text-[14px] font-black text-white">云感落地灯</p>
                         <p className="text-[12px] text-white/40 font-bold">¥1,200</p>
                      </div>
                   </div>
                </div>

                {/* AI Design Info Overlay */}
                <div className="absolute top-12 left-12 z-20">
                    <div className="bg-black/60 backdrop-blur-2xl px-6 py-4 rounded-[28px] border border-white/10 text-left">
                       <div className="flex items-center gap-3 mb-1">
                          <Sparkles className="w-5 h-5 text-brand" />
                          <span className="text-[13px] font-black text-white/40 uppercase tracking-widest">AI Space Simulation</span>
                       </div>
                       <h3 className="text-[24px] font-bold text-white italic font-serif">Aura of Minimalist</h3>
                    </div>
                </div>

                {/* Bottom Stats */}
                <div className="absolute bottom-12 left-12 z-20 flex flex-col items-start">
                  <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-4 rounded-3xl border border-white/5 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center shadow-lg">
                      <Palette className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="text-[14px] font-black text-white">方案完整度</p>
                      <p className="text-[12px] text-white/40 font-bold">已关联 {currentPlan.spaces.flatMap(s => s.items).length} 件单品</p>
                    </div>
                  </div>
                  <h2 className="text-[36px] font-black text-white leading-tight drop-shadow-2xl">追求通透感与金属质感的平衡</h2>
                </div>
              </div>

              {/* Composition Grid: Associated Products */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="bg-[#1A1A1A] border border-white/5 rounded-[40px] p-10 h-[400px] flex flex-col text-left">
                    <h4 className="text-[12px] font-black text-white/20 uppercase tracking-widest mb-8">搭配色盘 / Color Palette</h4>
                    <div className="flex-1 flex flex-col justify-center gap-6">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-full bg-[#5D5C43] shadow-[0_0_30px_rgba(93,92,67,0.3)] border-2 border-white/10"></div>
                          <div className="text-left">
                            <p className="font-black text-white text-[16px]">苔藓绿</p>
                            <p className="text-white/30 text-[11px] font-mono tracking-widest">#5D5C43</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-full bg-[#D7C4A5] shadow-[0_0_30px_rgba(215,196,165,0.3)] border-2 border-white/10"></div>
                          <div className="text-left">
                            <p className="font-black text-white text-[16px]">暖沙色</p>
                            <p className="text-white/30 text-[11px] font-mono tracking-widest">#D7C4A5</p>
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="md:col-span-2 bg-[#1A1A1A] border border-white/5 rounded-[40px] p-10 h-[400px] flex flex-col text-left">
                    <div className="flex items-center justify-between mb-8">
                       <h4 className="text-[12px] font-black text-white/20 uppercase tracking-widest">清单内容关联 / Items Linked</h4>
                       <span className="text-[12px] font-bold text-white/40">点击可查看产品详情及报价</span>
                    </div>
                    <div className="flex flex-wrap gap-6 justify-center flex-1 items-center">
                       {currentPlan.spaces.flatMap(s => s.items).slice(0, 7).map((p, i) => (
                         <div 
                           key={i} 
                           id={`atmosphere-item-${p.id}`}
                           onClick={() => handleProductClick(p.id)}
                           className="w-32 h-32 bg-white/5 border border-white/10 rounded-[32px] p-4 shadow-xl hover:bg-white/[0.08] transition-all hover:-translate-y-2 cursor-pointer group/item flex items-center justify-center relative"
                         >
                            <img src={p.image} className="w-full h-full object-contain filter group-hover/item:brightness-110" alt={p.name} />
                            
                            {/* Shopping Cart Style Icon Overlay */}
                            <div className="absolute top-2 right-2 w-8 h-8 bg-brand rounded-xl flex items-center justify-center text-white scale-0 group-hover/item:scale-100 transition-transform shadow-lg z-10">
                               <ShoppingBag className="w-4 h-4" />
                            </div>
                            
                            <div className="absolute inset-x-3 bottom-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 opacity-0 group-hover/item:opacity-100 transition-opacity">
                               <p className="text-[10px] font-black text-white truncate">¥{p.price.toLocaleString()}</p>
                            </div>
                         </div>
                       ))}
                       <div 
                         onClick={() => setViewState('PRODUCT_RESULTS')}
                         className="w-32 h-32 bg-brand/5 border-2 border-dashed border-brand/20 rounded-[32px] flex items-center justify-center text-brand cursor-pointer hover:bg-brand/10 transition-colors group"
                       >
                          <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform" />
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activePlanTab === 'products' && (
            <div className="space-y-12">
               {/* Export Actions */}
               <div className="flex justify-between items-center bg-[#1A1A1A] border border-white/10 p-6 rounded-[32px]">
                  <div className="flex items-center gap-6">
                     <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-brand rounded-full"></span>
                        <span className="text-[14px] font-black text-white">报价有效期至：2026-06-30</span>
                     </div>
                     <div className="h-6 w-px bg-white/10"></div>
                     <span className="text-[14px] font-medium text-white/40">结算汇率：1.00 (CNY)</span>
                  </div>
                  <button 
                    onClick={handleExportExcel}
                    className="px-8 py-3 bg-white text-black rounded-full font-black text-[14px] hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" /> 导出成 Excel 表格
                  </button>
               </div>

               {/* Main Quotation Table */}
               <div className="bg-[#1A1A1A] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                  <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                    <h3 className="text-[20px] font-black text-white text-left uppercase tracking-widest">全案选品物料清单 / Quotation Detail</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px] border-collapse min-w-[1200px]">
                      <thead>
                        <tr className="bg-black/40 border-b border-white/10 text-white/30 font-black">
                          <th className="px-4 py-6 border-r border-white/5 text-center">序号</th>
                          <th className="px-4 py-6 border-r border-white/5 text-left">名称</th>
                          <th className="px-4 py-6 border-r border-white/5 text-left">空间位置</th>
                          <th className="px-4 py-6 border-r border-white/5 text-left">产品型号</th>
                          <th className="px-4 py-6 border-r border-white/5 text-center">图片</th>
                          <th className="px-4 py-6 border-r border-white/5 text-left">尺寸(长*宽*高)</th>
                          <th className="px-4 py-6 border-r border-white/5 text-left">材质说明</th>
                          <th className="px-4 py-6 border-r border-white/5 text-right">售价(元)</th>
                          <th className="px-4 py-6 border-r border-white/5 text-center">结算折扣</th>
                          <th className="px-4 py-6 border-r border-white/5 text-right">优惠价(元)</th>
                          <th className="px-4 py-6 border-r border-white/5 text-center">数量</th>
                          <th className="px-4 py-6 text-right">小计(元)</th>
                        </tr>
                      </thead>
                      <tbody className="text-white/60">
                        {currentPlan.spaces.flatMap((space, sIdx) => 
                          space.items.map((item, iIdx) => {
                            const globalIndex = currentPlan.spaces.slice(0, sIdx).reduce((acc, s) => acc + s.items.length, 0) + iIdx + 1;
                            const discount = 0.85; // Fixed 8.5折 for prototype
                            const discountedPrice = Math.round(item.price * discount);
                            const qty = 1; // Default
                            const rowTotal = discountedPrice * qty;
                            
                            return (
                              <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                <td className="px-4 py-6 border-r border-white/5 text-center font-mono">{globalIndex}</td>
                                <td className="px-4 py-6 border-r border-white/5 font-black text-white">{item.name}</td>
                                <td className="px-4 py-6 border-r border-white/5">
                                  <div className="flex flex-col gap-1">
                                    <span className="font-bold">{space.name}</span>
                                    <div className="w-16 h-10 bg-white/5 rounded-md border border-white/5 group-hover:border-brand/20">
                                      {/* Mock blueprint thumbnail */}
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Maximize2 className="w-3 h-3 opacity-20" />
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-6 border-r border-white/5 font-mono text-white/30">{item.id.toUpperCase()}-v1</td>
                                <td className="px-4 py-6 border-r border-white/5">
                                  <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 p-2 mx-auto">
                                    <img src={item.image} className="w-full h-full object-contain" alt="" />
                                  </div>
                                </td>
                                <td className="px-4 py-6 border-r border-white/5 text-white/30">1200*600*750mm</td>
                                <td className="px-4 py-6 border-r border-white/5">高密度环保板材，水性烤漆工艺</td>
                                <td className="px-4 py-6 border-r border-white/5 text-right font-mono">¥{item.price.toLocaleString()}</td>
                                <td className="px-4 py-6 border-r border-white/5 text-center text-brand font-black">8.5折</td>
                                <td className="px-4 py-6 border-r border-white/5 text-right font-black text-white">¥{discountedPrice.toLocaleString()}</td>
                                <td className="px-4 py-6 border-r border-white/5 text-center font-black">1</td>
                                <td className="px-4 py-6 text-right font-black text-white">¥{rowTotal.toLocaleString()}</td>
                              </tr>
                            );
                          })
                        )}
                        
                        {/* Service Charges */}
                        <tr className="bg-white/[0.03] font-bold">
                          <td colSpan={11} className="px-8 py-5 text-right border-r border-white/5">物流及搬运费用统计</td>
                          <td className="px-4 py-5 text-right text-white">¥2,000</td>
                        </tr>
                        <tr className="bg-white/[0.03] font-bold">
                          <td colSpan={11} className="px-8 py-5 text-right border-r border-white/5">专业安装及现场成品保护费</td>
                          <td className="px-4 py-5 text-right text-white">¥1,500</td>
                        </tr>
                        
                        {/* Final Balance */}
                        <tr className="bg-brand text-white font-black text-[16px]">
                          <td colSpan={11} className="px-8 py-6 text-right border-r border-white/10">应付总计 / GRAND TOTAL</td>
                          <td className="px-4 py-6 text-right">
                            ¥{(currentPlan.spaces.reduce((acc, s) => acc + s.items.reduce((sum, i) => sum + Math.round(i.price * 0.85), 0), 0) + 3500).toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
               </div>

               {/* Summary Card (Image 4 Style) */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-[#1A1A1A] border border-white/10 rounded-[40px] p-10 text-left">
                     <h3 className="text-[20px] font-black text-white mb-8">全案软装清单汇总</h3>
                     <table className="w-full">
                        <thead>
                           <tr className="border-b border-white/10 text-white/20 text-[11px] font-black uppercase tracking-widest">
                              <th className="py-4 text-left">品类</th>
                              <th className="py-4 text-center">件数 (件/组)</th>
                              <th className="py-4 text-right">结算金额 (元)</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-[15px] font-bold">
                           <tr>
                              <td className="py-6 text-white/40">窗帘及遮阳系统</td>
                              <td className="py-6 text-center text-white">4</td>
                              <td className="py-6 text-right text-brand">¥3,321</td>
                           </tr>
                           <tr>
                              <td className="py-6 text-white/40">活动家具/灯饰/地毯/挂画</td>
                              <td className="py-6 text-center text-white">{currentPlan.spaces.reduce((acc, s) => acc + s.items.length, 0)}</td>
                              <td className="py-6 text-right text-brand">¥{currentPlan.spaces.reduce((acc, s) => acc + s.items.reduce((sum, i) => sum + Math.round(i.price * 0.85), 0), 0).toLocaleString()}</td>
                           </tr>
                           <tr>
                              <td className="py-6 text-white/40">物流及现场服务</td>
                              <td className="py-6 text-center text-white">-</td>
                              <td className="py-6 text-right text-brand">¥3,500</td>
                           </tr>
                           <tr className="text-[20px] font-black border-t-2 border-white/10">
                              <td className="py-8 text-white">实际支付合计数</td>
                              <td className="py-8 text-center text-white/30 text-[14px]">
                                {currentPlan.spaces.reduce((acc, s) => acc + s.items.length, 0) + 4} 件
                              </td>
                              <td className="py-8 text-right text-brand">
                                ¥{(currentPlan.spaces.reduce((acc, s) => acc + s.items.reduce((sum, i) => sum + Math.round(i.price * 0.85), 0), 0) + 3321 + 3500).toLocaleString()}
                              </td>
                           </tr>
                        </tbody>
                     </table>
                  </div>

                  <div className="bg-brand rounded-[40px] p-10 flex flex-col justify-between text-left relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[100px] pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
                     <div className="relative z-10">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand mb-8 shadow-xl">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-[32px] font-black text-white leading-tight mb-4">报价单已锁定</h3>
                        <p className="text-white/70 text-[16px] font-medium leading-relaxed max-w-sm">
                           您当前的搭配方案已进入报价锁定期，系统已自动申请品牌合伙人折扣 (8.5折)，并包含了全套的专业安装售后服务。
                        </p>
                     </div>
                     <div className="relative z-10 flex gap-4 mt-12">
                        <button className="flex-1 py-5 bg-white text-black rounded-3xl font-black text-[16px] shadow-2xl hover:scale-105 active:scale-95 transition-all">立即下定锁定库存</button>
                        <button 
                          onClick={handleConsultService}
                          className="px-8 py-5 bg-black text-white rounded-3xl font-black text-[16px] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                        >
                          咨询客服
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activePlanTab === 'analysis' && (
            <div className="space-y-8 pb-32">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-8">
                  <div className="bg-[#1A1A1A] border border-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group/card text-left">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[100px] pointer-events-none" />
                    <div className="flex items-center justify-between mb-10">
                      <h3 className="text-[20px] font-black text-white flex items-center gap-3">
                        <Target className="w-6 h-6 text-brand" /> 方案概览数据
                      </h3>
                      {!isConfirmed && (
                         <button onClick={() => setViewState('MANUAL_FILL')} className="text-[13px] font-black text-white/30 hover:text-white transition-colors">修改基础资料</button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
                       {[
                         { label: '面积', value: currentPlan.area, icon: <Maximize2 className="w-5 h-5 text-brand" /> },
                         { label: '预算范围', value: currentPlan.budget.range, icon: <ShieldCheck className="w-5 h-5 text-brand" /> },
                         { label: '配置空间', value: currentPlan.spaces.map(s => s.name).join(' / '), icon: <Layers className="w-5 h-5 text-brand" /> },
                         { label: '装修风格', value: currentPlan.style, icon: <Palette className="w-5 h-5 text-brand" /> }
                       ].map((item, idx) => (
                         <div key={idx} className="space-y-2">
                           <p className="text-[11px] font-black text-white/20 uppercase tracking-widest">{item.label}</p>
                           <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-brand">
                                {item.icon}
                             </div>
                             <p className="text-[18px] font-black text-white">{item.value}</p>
                           </div>
                         </div>
                       ))}
                    </div>
                  </div>

                  {/* AI Diagnosis */}
                  <div className="bg-[#1A1A1A] border border-white/5 rounded-[48px] p-12 text-left shadow-2xl">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-16 h-16 rounded-[24px] bg-brand text-white flex items-center justify-center shadow-2xl shadow-brand/20">
                          <Sparkles className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="text-[28px] font-black text-white">AI 方案完整度诊断</h3>
                          <p className="text-white/40 text-[15px] font-medium font-mono uppercase tracking-widest">Diagnostics Report v2.4</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                          <div className="space-y-4">
                              <h4 className="text-[13px] font-black text-brand uppercase tracking-widest">亮点分析</h4>
                              <ul className="space-y-4">
                                {[
                                  '整体色感搭配均衡，视觉温度适中',
                                  '核心家具（沙发、床）选型符合人体工学需求',
                                  '预算分配覆盖了必填项目，无明显溢出'
                                ].map((l, i) => (
                                  <li key={i} className="flex items-center gap-3 text-[15px] text-white/80 font-medium bg-white/5 p-4 rounded-2xl">
                                    <Check className="w-5 h-5 text-emerald-500" /> {l}
                                  </li>
                                ))}
                              </ul>
                          </div>
                        </div>
                        <div className="space-y-8">
                          <div className="space-y-4">
                              <h4 className="text-[13px] font-black text-orange-400 uppercase tracking-widest">潜在优化点</h4>
                              <ul className="space-y-4">
                                {[
                                  '餐厅空间动线稍显紧凑，建议缩小餐桌尺寸',
                                  '主卧采光识别为朝北，目前的深色柜类可能压抑',
                                  '建议增加 1-2 件软装亮色点缀，打破沉闷感'
                                ].map((l, i) => (
                                  <li key={i} className="flex items-center gap-3 text-[15px] text-white/80 font-medium bg-white/5 p-4 rounded-2xl">
                                    <AlertCircle className="w-5 h-5 text-orange-400" /> {l}
                                  </li>
                                ))}
                              </ul>
                          </div>
                        </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                  <div className="bg-[#1A1A1A] border border-white/10 rounded-[40px] p-10 flex flex-col items-center text-center">
                    <div className="shrink-0 relative mb-8">
                      <div className="w-40 h-40 rounded-full border-[12px] border-white/5 flex flex-col items-center justify-center">
                         <span className="text-[42px] font-black text-brand leading-none">92</span>
                         <span className="text-[11px] font-black text-white/40 uppercase tracking-widest mt-2">Match Score</span>
                      </div>
                      <svg className="absolute inset-0 w-40 h-40 -rotate-90">
                         <circle cx="80" cy="80" r="72" fill="transparent" stroke="#FF5733" strokeWidth="12" strokeDasharray="452.39" strokeDashoffset="36" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[24px] font-black text-white">匹配度极高</h4>
                      <p className="text-[14px] text-white/40 leading-relaxed font-medium">
                        当前的方案选择高度契合你的「{formData.styleFeelings?.[0] || '意式极简'}」审美，且完美解决了「{formData.familyNeeds?.[0] || '核心'}」需求。
                      </p>
                    </div>
                  </div>

                  <div className="bg-brand rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden text-left">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-[60px]" />
                     <h4 className="text-[20px] font-black mb-3">预算与指标对比</h4>
                     <p className="text-[14px] font-medium opacity-70 mb-8 leading-relaxed">
                       当前总预算 ¥{currentPlan.budget.estimatedTotal.toLocaleString()}，优于同类方案 15% 的开支。
                     </p>
                     <div className="space-y-4">
                        <div className="p-4 bg-white/10 rounded-2xl">
                           <div className="flex justify-between items-center text-[13px] font-black mb-2">
                              <span>预算执行率</span>
                              <span>85%</span>
                           </div>
                           <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                              <div className="h-full bg-white w-[85%]" />
                           </div>
                        </div>
                        <div className="p-4 bg-white/10 rounded-2xl">
                           <div className="flex justify-between items-center text-[13px] font-black mb-2">
                              <span>资料完整度</span>
                              <span>{completeness}%</span>
                           </div>
                           <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                              <div className="h-full bg-white w-[65%]" />
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProductResults = () => {
    // Mock data based on profile with images
    const products = [
      { id: 1, name: '现代简约布艺床 B3', price: 4800, score: 92, group: '最适合', tags: ['尺寸轻巧', '米灰色', '圆角'], reason: '尺寸精巧且颜色干净，非常符合你的小户型限制和清爽审美。', impact: '约占卧室预算 18%，压力适中。', warning: '如果需要更大收纳空间，建议选带抽屉版。', image: 'https://images.unsplash.com/photo-1505693419148-da1971932811?auto=format&fit=crop&q=80&w=800' },
      { id: 2, name: '意式真皮沙发 S1', price: 8900, score: 88, group: '推荐', tags: ['高脚设计', '耐磨皮', '老人友好'], reason: '支撑性好且高脚设计方便扫地机器人，适合家里有老人和猫的情况。', impact: '客厅核心单品，预算投入重点。', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800' },
      { id: 3, name: '岩板餐桌 A2', price: 2600, score: 85, group: '预算友好', tags: ['防刮', '易打理'], reason: '针对你的“好打理”核心关注点，岩板材质耐磨且耐热。', image: 'https://images.unsplash.com/photo-1530018607912-eff2df114f11?auto=format&fit=crop&q=80&w=800' },
      { id: 4, name: '中古感实木书架', price: 1800, score: 95, group: '审美提升', tags: ['书房', '原木'], reason: '提升空间气质的绝佳单品，完美契合你的风格偏好。', image: 'https://images.unsplash.com/photo-1594913785162-e678ac052ddd?auto=format&fit=crop&q=80&w=800' },
      { id: 5, name: '超大体量科技布床', price: 5600, score: 62, group: '需要谨慎', tags: ['较大', '容易沉重'], reason: '尺寸偏大可能会让不满 60㎡ 的卧室感到拥窄。', warning: '请务必实测卧室尺寸，预留 60cm 动线空间。', image: 'https://images.unsplash.com/photo-1505693333550-a213e9ec36a5?auto=format&fit=crop&q=80&w=800' }
    ];

    return (
      <div className="w-full max-w-6xl text-left">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
           <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setViewState('WORKSPACE')} className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors font-bold text-[13px]">
                  我的方案
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-white/10" />
                <button onClick={() => setViewState('PLAN_DETAIL')} className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors font-bold text-[13px]">
                  方案详情
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-white/10" />
                <span className="text-white/20 font-bold text-[13px]">适合你的产品</span>
              </div>
              <h1 className="text-[42px] font-black text-white mb-3 tracking-tight leading-tight">适合你的产品</h1>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-[12px] font-black px-3 py-1 bg-white/5 text-white/40 rounded-full">{formData.areaRange || '全部面积'}</span>
                <span className="text-[12px] font-black px-3 py-1 bg-brand/10 text-brand rounded-full">{formData.budgetRange || '全预算段'}</span>
                <span className="text-[12px] font-black px-3 py-1 bg-white/5 text-white/40 rounded-full">{formData.styleFeelings?.[0] || '通用风格'}</span>
              </div>
           </div>
           <div className="flex items-center gap-6">
              <div className="flex p-1.5 bg-white/5 rounded-2xl">
                <button 
                  onClick={() => setProductMode('visual')}
                  className={`px-6 py-2.5 rounded-xl text-[13px] font-black transition-all ${productMode === 'visual' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                >
                  视觉优先
                </button>
                <button 
                  onClick={() => setProductMode('details')}
                  className={`px-6 py-2.5 rounded-xl text-[13px] font-black transition-all ${productMode === 'details' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                >
                  参数模式
                </button>
              </div>
              <button 
                onClick={() => setViewState('PLAN_RESULTS')}
                className="px-8 py-4 bg-brand text-white rounded-3xl text-[15px] font-black hover:scale-105 transition-all shadow-2xl"
              >
                生成全屋方案
              </button>
           </div>
        </header>

        {productMode === 'visual' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(p => (
              <div key={p.id} className="relative h-[580px] group cursor-pointer" onClick={() => handleProductClick(p.id)}>
                <div 
                  className={`h-full bg-[#1A1A1A] border p-0 rounded-[40px] flex flex-col shadow-2xl overflow-hidden transition-all ${p.group === '需要谨慎' ? 'border-yellow-500/10 hover:border-yellow-500/30' : 'border-white/5 hover:border-brand/40'}`}
                >
                  <div className="h-[320px] w-full relative overflow-hidden">
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                      <span className="px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-[11px] font-black text-white uppercase tracking-widest">{p.group}</span>
                    </div>
                    <div className="absolute top-6 right-6">
                      <div className="w-14 h-14 bg-brand rounded-2xl flex flex-col items-center justify-center text-white shadow-xl">
                        <span className="text-[18px] font-black leading-none">{p.score}</span>
                        <span className="text-[8px] font-black uppercase opacity-60">MATCH</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="text-[24px] font-black text-white mb-2 leading-tight">{p.name}</h3>
                    <p className="text-[18px] font-black text-brand mb-6">¥{p.price.toLocaleString()}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-auto">
                      {p.tags.map(t => <span key={t} className="text-[10px] font-black bg-white/5 px-2.5 py-1 text-white/40 rounded-lg">{t}</span>)}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={(e) => {
                           e.stopPropagation();
                           handleProductClick(p.id);
                        }}
                        className="flex-1 py-4 bg-white/5 text-white/60 rounded-2xl text-[13px] font-black hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-1.5"
                      >
                        详情
                      </button>
                      <button 
                        onClick={(e) => {
                           e.stopPropagation();
                           handleAddToPlan(p);
                        }}
                        className="flex-[1.5] py-4 bg-brand text-white rounded-2xl text-[13px] font-black shadow-lg"
                      >
                        加入我的方案
                      </button>
                      <button 
                        onClick={(e) => {
                           e.stopPropagation();
                           handleJoinLibrary(p);
                        }}
                        className="w-14 py-4 bg-white/5 text-white/40 rounded-2xl flex items-center justify-center hover:text-red-400 transition-all"
                        title="加入产品库"
                      >
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {products.map(p => (
              <div key={p.id} className="bg-[#1A1A1A] border border-white/5 rounded-[40px] overflow-hidden flex flex-col md:flex-row shadow-2xl">
                <div className="w-full md:w-80 h-64 md:h-auto shrink-0 relative bg-white/5">
                   <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                   <div className="absolute top-4 right-4 w-12 h-12 bg-brand rounded-xl flex items-center justify-center text-white font-black text-[15px]">{p.score}</div>
                </div>
                <div className="flex-1 p-8 md:p-10 flex flex-col md:flex-row gap-10">
                   <div className="flex-1 space-y-6 text-left">
                      <div>
                        <h3 className="text-[28px] font-black text-white mb-1">{p.name}</h3>
                        <p className="text-[15px] text-white/30 font-bold">¥{p.price.toLocaleString()} · {p.group}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                          <Target className="w-3.5 h-3.5 text-brand" /> 匹配推荐理由
                        </label>
                        <p className="text-[15px] text-white/70 font-medium leading-relaxed">{p.reason}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {p.tags.map(t => <span key={t} className="px-3 py-1.5 bg-white/5 rounded-xl text-[12px] font-bold text-white/40">{t}</span>)}
                      </div>
                   </div>
                   <div className="w-full md:w-64 space-y-6 border-l border-white/5 md:pl-10">
                      <div className="space-y-2 text-left">
                        <label className="text-[11px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                          <ShoppingBag className="w-3.5 h-3.5 text-brand" /> 预算控制
                        </label>
                        <p className="text-[15px] text-brand font-black">{p.impact}</p>
                      </div>
                      {p.warning && (
                        <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl text-left">
                           <p className="text-[12px] text-yellow-500/80 font-bold leading-relaxed flex gap-2">
                             <AlertCircle className="w-4 h-4 shrink-0" />
                             {p.warning}
                           </p>
                        </div>
                      )}
                      <div className="flex gap-4">
                        <button 
                          onClick={() => {
                            handleAddToPlan(p);
                          }}
                          className="flex-1 py-4 bg-brand text-white rounded-[24px] text-[15px] font-black shadow-xl"
                        >
                          加入我的方案
                        </button>
                        <button 
                          onClick={() => handleJoinLibrary(p)}
                          className="px-6 py-4 bg-white/5 text-white/40 rounded-[24px] hover:text-red-400 font-black flex items-center justify-center gap-2 transition-all"
                        >
                          <Heart className="w-5 h-5" /> 加入产品库
                        </button>
                      </div>
                      <button 
                        onClick={() => handleProductClick(p.id)}
                        className="w-full py-4 bg-white/5 text-white/40 rounded-[24px] text-[13px] font-black hover:text-white transition-all mt-3"
                      >
                        查看详细参数
                      </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderPlanResults = () => {
    const spaces = [
      { id: '1', name: '卧室方案', budget: 18200, items: [
        { name: '现代简约布艺床', price: 4800, type: '必买', score: 92, image: 'https://images.unsplash.com/photo-1505693419148-da1971932811?auto=format&fit=crop&q=80&w=400' },
        { name: '极致支撑床垫', price: 3200, type: '必买', score: 95, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=400' },
        { name: '轻盈拼色衣柜', price: 8600, type: '必买', score: 85, image: 'https://images.unsplash.com/photo-1595428774223-ef04a127a271?auto=format&fit=crop&q=80&w=400' },
        { name: '米色遮光窗帘', price: 1600, type: '建议', score: 88, image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=400' }
      ], note: '卧室优先保证睡眠质量，且避免过于厚重的体量压迫。', moodboard: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=800' },
      { id: '2', name: '客厅方案', budget: 12600, items: [
        { name: '真皮沙发 S1', price: 8900, type: '必买', score: 90, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400' },
        { name: '超薄岩板电视柜', price: 2800, type: '必买', score: 82, image: 'https://images.unsplash.com/photo-1601056644916-0046bc320f77?auto=format&fit=crop&q=80&w=400' },
        { name: '装饰画 / 地毯', price: 900, type: '建议', score: 94, image: 'https://images.unsplash.com/photo-1579541814924-49fef17c5be5?auto=format&fit=crop&q=80&w=400' }
      ], note: '客厅是全家的中心，由于你有养宠物，沙发特意选了耐刮擦皮质。', moodboard: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800' }
    ];

    return (
      <div className="w-full max-w-6xl text-left">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
           <div>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setViewState('WORKSPACE')} className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors font-bold text-[13px]">
                  我的方案
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-white/10" />
                <button onClick={() => setViewState('PLAN_DETAIL')} className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors font-bold text-[13px]">
                  方案详情
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-white/10" />
                <span className="text-white/20 font-bold text-[13px]">全屋方案建议</span>
              </div>
              <h1 className="text-[42px] font-black text-white mb-3 tracking-tight leading-tight">全屋方案建议</h1>
              <p className="text-[17px] text-white/40 font-medium">这是一版基于当前资料生成的初步方案。总预算控制良好，且针对具体成员做了优化。</p>
           </div>
           <div className="flex p-1.5 bg-white/5 rounded-2xl">
              <button 
                onClick={() => setPlanMode('visual')}
                className={`px-6 py-2.5 rounded-xl text-[13px] font-black transition-all ${planMode === 'visual' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                视觉优先
              </button>
              <button 
                onClick={() => setPlanMode('list')}
                className={`px-6 py-2.5 rounded-xl text-[13px] font-black transition-all ${planMode === 'list' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                选品模式
              </button>
           </div>
        </header>

        {/* Visual Showcase (Moodboard) */}
        {planMode === 'visual' && (
          <div className="mb-16 w-full h-[500px] relative rounded-[48px] overflow-hidden group shadow-2xl border border-white/5">
             <img 
               src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1600" 
               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
               alt="Moodboard" 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12">
                <div className="max-w-2xl">
                   <span className="px-4 py-1.5 bg-brand text-white rounded-full text-[12px] font-black uppercase tracking-widest mb-6 inline-block">全屋软装提案：{formData.styleFeelings?.[0] || '默认风格'}</span>
                   <h2 className="text-[48px] font-black text-white mb-4 leading-tight">在每一个清晨，<br/>感受克制与质感的共生。</h2>
                   <p className="text-[18px] text-white/60 font-medium">此方案以高分子纹理、岩板与极简金属为核心骨架，营造出一种“安静的奢华感”。</p>
                </div>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
           <div className="lg:col-span-8 space-y-10">
              {spaces.map(space => (
                <div key={space.id} className="bg-[#1A1A1A] border border-white/10 rounded-[48px] overflow-hidden shadow-2xl transition-all hover:border-white/20">
                   {planMode === 'visual' ? (
                     <div className="flex flex-col md:flex-row h-full md:h-[450px]">
                        <div className="w-full md:w-1/2 relative bg-[#0a0a0a]">
                          <img src={space.moodboard} className="w-full h-full object-cover" alt={space.name} />
                          <div className="absolute top-8 left-8">
                            <h3 className="text-[32px] font-black text-white drop-shadow-2xl">{space.name}</h3>
                          </div>
                        </div>
                        <div className="w-full md:w-1/2 p-10 flex flex-col">
                           <div className="flex-1 space-y-6">
                              <p className="text-[15px] text-white/60 font-medium leading-relaxed italic">“{space.note}”</p>
                              
                              <div className="space-y-4 pt-4 border-t border-white/5">
                                 <p className="text-[11px] font-black text-white/20 uppercase tracking-widest">核心单品搭配图</p>
                                 <div className="flex gap-3">
                                   {space.items.slice(0, 3).map((item, i) => (
                                     <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border border-white/10">
                                       <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                     </div>
                                   ))}
                                   {space.items.length > 3 && (
                                     <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center text-[13px] font-black text-white/20">
                                       +{space.items.length - 3}
                                     </div>
                                   )}
                                 </div>
                              </div>
                           </div>

                           <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                              <div>
                                 <p className="text-[11px] font-black text-white/20 uppercase tracking-widest">预计预算</p>
                                 <p className="text-[24px] font-black text-white">¥{space.budget.toLocaleString()}</p>
                              </div>
                              <button 
                                onClick={() => setPlanMode('list')}
                                className="px-6 py-3 bg-white text-black rounded-2xl text-[13px] font-black hover:scale-105 transition-all"
                              >
                                查看清单
                              </button>
                           </div>
                        </div>
                     </div>
                   ) : (
                     <div className="p-10">
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex flex-col gap-1">
                             <h3 className="text-[28px] font-black text-white">{space.name}</h3>
                             <p className="text-[14px] text-white/30 font-bold">预计空间价 ¥{space.budget.toLocaleString()} · {space.items.length} 个配置项</p>
                          </div>
                          <button className="p-3 bg-white/5 rounded-2xl text-white/40 hover:text-brand transition-colors"><Plus className="w-6 h-6" /></button>
                        </div>
                        
                        <div className="space-y-4">
                          {space.items.map(item => (
                            <div key={item.name} className="flex items-center justify-between p-6 bg-white/5 rounded-[28px] border border-white/5 group hover:bg-white/[0.08] transition-all cursor-pointer">
                               <div className="flex items-center gap-6">
                                 <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg border border-white/5">
                                   <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                 </div>
                                 <div>
                                    <div className="flex items-center gap-3 mb-1">
                                       <p className="text-[17px] font-black text-white">{item.name}</p>
                                       <span className={`px-2 py-0.5 rounded text-[10px] font-black ${item.type === '必买' ? 'bg-brand/20 text-brand' : 'bg-blue-500/20 text-blue-400'}`}>{item.type}</span>
                                    </div>
                                    <p className="text-[13px] text-white/30 font-bold">¥{item.price.toLocaleString()} · 匹配度 {item.score}%</p>
                                 </div>
                               </div>
                               <button className="px-4 py-2 bg-white/5 text-white/40 rounded-xl text-[12px] font-black hover:bg-brand/10 hover:text-brand transition-all">替换</button>
                            </div>
                          ))}
                        </div>
                     </div>
                   )}
                </div>
              ))}
           </div>

           <div className="lg:col-span-4 space-y-8">
              <div className="p-10 bg-brand rounded-[48px] shadow-2xl text-white">
                 <p className="text-[13px] font-black text-white/40 uppercase tracking-widest mb-2">预估全屋方案价</p>
                 <p className="text-[48px] font-black leading-none mb-4">¥36,800</p>
                 <div className="flex items-center gap-2 mb-12">
                   <ShieldCheck className="w-4 h-4" />
                   <span className="text-[14px] font-black opacity-80">在 {formData.budget || '全预算段'} 内 · 控制优良</span>
                 </div>
                 
                 <div className="space-y-6 pt-10 border-t border-white/10">
                    <div className="flex justify-between items-center">
                       <span className="text-[14px] font-bold opacity-70">必买项 (7件)</span>
                       <span className="text-[14px] font-black">¥30,200</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[14px] font-bold opacity-70">建议配置 (3件)</span>
                       <span className="text-[14px] font-black">¥5,600</span>
                    </div>
                 </div>

                 <button className="w-full py-6 mt-12 bg-white text-black rounded-[32px] text-[16px] font-black shadow-xl hover:scale-105 active:scale-95 transition-all">一键保存我的方案</button>
                 <button className="w-full mt-4 flex items-center justify-center gap-2 text-[13px] font-black opacity-60 hover:opacity-100 transition-opacity"><TrendingDown className="w-4 h-4" /> 尝试降配版</button>
              </div>

              <div className="p-10 bg-[#1A1A1A] border border-white/10 rounded-[48px] shadow-2xl">
                 <h4 className="text-[20px] font-black text-white mb-8">AI 深度分析：为什么这样搭？</h4>
                 <div className="space-y-8 text-left">
                    <div className="flex gap-4">
                       <div className="w-3 h-3 bg-brand rounded-full shrink-0 mt-1.5 shadow-[0_0_10px_brand]" />
                       <p className="text-[14px] text-white/60 leading-relaxed font-medium">由于你有面积在 60㎡ 以下的限制，方案中所有床架和沙发都采用了“高脚/悬空”结构，保持视觉通透。</p>
                    </div>
                    <div className="flex gap-4">
                       <div className="w-3 h-3 bg-brand rounded-full shrink-0 mt-1.5" />
                       <p className="text-[14px] text-white/60 leading-relaxed font-medium">选用了干净的米灰色系，能有效反射光线。书房增加了中古原木风点缀，增加审美差异化。</p>
                    </div>
                    <div className="flex gap-4">
                       <div className="w-3 h-3 bg-brand rounded-full shrink-0 mt-1.5" />
                       <p className="text-[14px] text-white/60 leading-relaxed font-medium">家庭成员包含老人，所有核心坐卧家具都额外增加了硬质支撑点，方便起身和长期坐卧。</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  };

  const renderProcurementList = () => {
    const allProducts = currentPlan.spaces.flatMap(s => s.items.map(i => ({ ...i, spaceName: s.name })));
    const totals = {
      items: allProducts.length,
      must: allProducts.filter(p => p.type === '必买').reduce((sum, p) => sum + p.price, 0),
      suggest: allProducts.filter(p => p.type === '建议').reduce((sum, p) => sum + p.price, 0),
      total: allProducts.reduce((sum, p) => sum + p.price, 0)
    };

    return (
      <div className="w-full max-w-6xl">
        <header className="mb-10 text-left px-4">
           <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setViewState('WORKSPACE')} className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors font-bold text-[13px]">
                我的方案中心
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-white/10" />
              <button onClick={() => setViewState('PLAN_DETAIL')} className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors font-bold text-[13px]">
                方案详情
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-white/10" />
              <span className="text-white/20 font-bold text-[13px]">采购清单</span>
           </div>
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-[42px] font-black text-white tracking-tight leading-tight">采购清单</h1>
                <p className="text-[17px] text-white/40 font-medium">基于当前方案生成，可用于自行联系厂家或交给跟单确认。</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => alert('正在准备导出文件...')}
                  className="px-6 py-4 bg-white/5 text-white rounded-2xl font-black text-[14px]"
                >
                  导出 PDF / Excel
                </button>
                <button 
                  onClick={() => setShowDecoratorModal(true)}
                  className="px-10 py-4 bg-brand text-white rounded-2xl font-black text-[15px] shadow-xl"
                >
                  交给跟单获取完整报价
                </button>
              </div>
           </div>
        </header>

        {/* Totals Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 px-4 text-left">
           {[
             { label: '产品总数', val: `${totals.items} 件`, icon: Box },
             { label: '必买项金额', val: `¥${totals.must.toLocaleString()}`, color: 'text-brand' },
             { label: '建议项金额', val: `¥${totals.suggest.toLocaleString()}`, color: 'text-blue-400' },
             { label: '预计总金额', val: `¥${totals.total.toLocaleString()}`, color: 'text-white' },
           ].map((stat, i) => (
             <div key={i} className="bg-[#1A1A1A] border border-white/5 p-8 rounded-[32px]">
                <p className="text-[11px] font-black text-white/20 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={`text-[24px] font-black ${stat.color || 'text-white'}`}>{stat.val}</p>
             </div>
           ))}
        </div>

        <div className="px-4 pb-20">
           <div className="bg-[#1A1A1A] border border-white/5 rounded-[40px] overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-8 py-6 text-[12px] font-black text-white/20 uppercase tracking-widest">产品信息</th>
                    <th className="px-8 py-6 text-[12px] font-black text-white/20 uppercase tracking-widest">分类/空间</th>
                    <th className="px-8 py-6 text-[12px] font-black text-white/20 uppercase tracking-widest">单价/数量</th>
                    <th className="px-8 py-6 text-[12px] font-black text-white/20 uppercase tracking-widest">小计</th>
                    <th className="px-8 py-6 text-[12px] font-black text-white/20 uppercase tracking-widest">匹配建议</th>
                    <th className="px-8 py-6 text-[12px] font-black text-white/20 uppercase tracking-widest">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allProducts.map(p => (
                    <tr key={p.id} className="group hover:bg-white/[0.01] transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shrink-0">
                              <img src={p.image} className="w-full h-full object-cover" alt="" />
                           </div>
                           <div>
                             <p className="text-[16px] font-black text-white mb-1 leading-tight">{p.name}</p>
                             <p className="text-[12px] text-white/20 font-bold">厂家信息：待跟单确认</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col gap-1">
                            <span className="text-[13px] font-bold text-white/60">{p.spaceName}</span>
                            <span className="text-[11px] text-white/20 font-medium">家具</span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col gap-1">
                            <span className="text-[14px] font-black text-white">¥{p.price.toLocaleString()}</span>
                            <span className="text-[11px] text-white/30 font-bold">x 1</span>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-brand font-black text-[16px]">¥{p.price.toLocaleString()}</td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col gap-2">
                            <span className={`w-fit px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${p.type === '必买' ? 'bg-brand/10 text-brand' : 'bg-blue-500/10 text-blue-400'}`}>
                               {p.type}
                            </span>
                            <p className="text-[12px] text-white/40 font-medium max-w-[200px] leading-relaxed truncate group-hover:whitespace-normal group-hover:overflow-visible group-hover:h-auto overflow-hidden h-4 transition-all">匹配当前极简风格，建议选择。</p>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex gap-2">
                           <button className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-all"><HelpCircle className="w-4 h-4" /></button>
                           <button className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-red-400 transition-all"><X className="w-4 h-4" /></button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      </div>
    );
  };

  const renderProductDetail = () => {
    // Mock product detail
    const product = {
      id: selectedProductId,
      name: '意式极简真皮沙发 S1',
      price: 8900,
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1200',
      description: '这款真皮沙发采用了顶级纳帕皮，触感细腻。高脚设计方便扫地机器人出入，深受现代家庭喜爱。',
       specs: [
        { label: '材质', value: '纳帕皮 / 高回弹海绵' },
        { label: '尺寸', value: '220 x 95 x 85 cm' },
        { label: '产地', value: '广东佛山' }
      ]
    };

    return (
      <div className="w-full max-w-4xl px-4">
        <header className="mb-8 flex items-center justify-between">
           <button 
             onClick={() => setViewState(previousViewState)}
             className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"
           >
             <ArrowLeft className="w-5 h-5" /> 返回
           </button>
           <button className="p-3 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all">
             <Share2 className="w-5 h-5" />
           </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
           <div className="aspect-square bg-white rounded-[48px] overflow-hidden shadow-2xl">
              <img src={product.image} className="w-full h-full object-cover" alt="" />
           </div>
           <div className="flex flex-col">
              <span className="text-[12px] font-black text-brand uppercase tracking-widest mb-2">家具 / 客厅</span>
              <h1 className="text-[36px] font-black text-white mb-2 leading-tight">{product.name}</h1>
              <p className="text-[28px] font-black text-brand mb-8">¥{product.price.toLocaleString()}</p>
              
              <div className="space-y-6 mb-10">
                 <p className="text-[15px] text-white/60 leading-relaxed font-medium">{product.description}</p>
                 <div className="grid grid-cols-2 gap-4">
                    {product.specs.map((s, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[11px] font-black text-white/20 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className="text-[14px] font-bold text-white/80">{s.value}</p>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="flex gap-4 mt-auto">
                 <button 
                   onClick={() => {
                     
                     handleAddToPlan(product);
                   }}
                   className="flex-1 py-5 bg-white text-black rounded-2xl text-[15px] font-black shadow-xl"
                 >
                   加入我的方案
                 </button>
                 <button 
                   onClick={() => {
                     setProductLibrary([...productLibrary, { id: Date.now(), name: product.name, price: product.price, image: product.image, category: 'Sofa' }]);
                     alert('已加入产品库');
                   }}
                   className="flex-1 py-5 bg-white/5 border border-white/10 text-white rounded-2xl text-[15px] font-black hover:bg-white/10 transition-all"
                 >
                   加入产品库
                 </button>
              </div>
           </div>
        </div>
      </div>
    );
  };

  const renderMoodboardEditor = () => {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] z-[800] flex flex-col pt-[100px]">
        <header className="h-16 bg-[#111] border-b border-white/5 flex items-center justify-between px-8 shrink-0">
           <div className="flex items-center gap-6">
             <button onClick={() => setViewState('WORKSPACE')} className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
             </button>
             <div className="h-6 w-px bg-white/5" />
             <input type="text" defaultValue="未命名搭配板" className="bg-transparent border-none outline-none text-white font-black text-[18px]" />
           </div>
           <div className="flex gap-4">
              <button className="px-6 py-2.5 bg-white/5 text-white/60 rounded-xl text-[13px] font-black">AI 自动整理</button>
              <button className="px-6 py-2.5 bg-brand text-white rounded-xl text-[13px] font-black shadow-lg">保存并导出</button>
              <button onClick={() => setViewState('PLAN_DETAIL')} className="px-6 py-2.5 bg-blue-500 text-white rounded-xl text-[13px] font-black shadow-lg">转为正式方案</button>
           </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
           {/* Sidebar: Library */}
           <div className="w-80 bg-[#111] border-r border-white/5 flex flex-col p-6 overflow-y-auto no-scrollbar">
              <div className="mb-8 text-left">
                 <h4 className="text-[12px] font-black text-white/20 uppercase tracking-widest mb-4">我的产品素材</h4>
                 <div className="grid grid-cols-2 gap-4">
                    {productLibrary.map(item => (
                      <div key={item.id} className="aspect-square bg-white rounded-2xl p-4 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform">
                         <img src={item.image} className="w-full h-full object-contain" alt="" />
                      </div>
                    ))}
                 </div>
              </div>
              <p className="text-[12px] text-white/20 font-bold text-center mt-auto">拖拽图片进入画布</p>
           </div>

           {/* Canvas */}
           <div className="flex-1 bg-[#151515] relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              
              <div className="w-[800px] h-[600px] bg-white/[0.02] border border-white/5 rounded-3xl relative">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 text-white/10">
                    <ImageIcon className="w-16 h-16" />
                    <p className="text-[18px] font-black">搭配画布</p>
                 </div>
              </div>

              {/* Float Controls */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 h-14 bg-[#111] border border-white/10 rounded-2xl flex items-center px-4 gap-4 shadow-2xl">
                 <button className="p-2 text-white/40 hover:text-white"><Maximize2 className="w-4 h-4" /></button>
                 <div className="h-6 w-px bg-white/10" />
                 <button className="p-2 text-white/40 hover:text-white"><Plus className="w-4 h-4" /></button>
                 <span className="text-[12px] font-black text-white/20">100%</span>
                 <button className="p-2 text-white/40 hover:text-white"><Minus className="w-4 h-4" /></button>
                 <div className="h-6 w-px bg-white/10" />
                 <button className="p-2 text-white/40 hover:text-white"><History className="w-4 h-4" /></button>
              </div>
           </div>

           {/* Right Panel: AI & Info */}
           <div className="w-72 bg-[#111] border-l border-white/5 p-6 flex flex-col gap-8 overflow-y-auto no-scrollbar text-left">
              <div className="space-y-4">
                 <h4 className="text-[12px] font-black text-white/20 uppercase tracking-widest">空间设置</h4>
                 <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-12 text-[14px] text-white">
                    <option>客厅</option>
                    <option>卧室</option>
                    <option>餐厅</option>
                 </select>
              </div>
              <div className="space-y-4">
                 <h4 className="text-[12px] font-black text-white/20 uppercase tracking-widest flex items-center justify-between">
                    AI 建议反馈
                    <span className="loading-dots">...</span>
                 </h4>
                 <div className="p-6 bg-brand/5 border border-brand/10 rounded-[28px]">
                    <Sparkles className="w-5 h-5 text-brand mb-3" />
                    <p className="text-[13px] text-white/60 leading-relaxed font-medium">
                       检测到已添加 3 件意式极简家具，风格高度统一。建议增加一件暖色地毯来中和灰度。
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center px-6 pt-40 pb-20 bg-[#0a0a0a] overflow-x-hidden selection:bg-brand selection:text-white">
      <AnimatePresence mode="wait">
        <motion.div 
          key={viewState}
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.02, y: -10 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full flex flex-col items-center"
        >
          {viewState === 'WORKSPACE' && renderWorkspace()}
          {viewState === 'PLAN_DETAIL' && renderPlanDetail()}
          {viewState === 'MANUAL_FILL' && renderManualFill()}
          {viewState === 'UPLOAD_FLOW' && renderUploadFlow()}
          {viewState === 'PRODUCT_RESULTS' && renderProductResults()}
          {viewState === 'PLAN_RESULTS' && renderPlanResults()}
          {viewState === 'PROCUREMENT_LIST' && renderProcurementList()}
          {viewState === 'MOODBOARD_EDITOR' && renderMoodboardEditor()}
          {viewState === 'PRODUCT_DETAIL' && renderProductDetail()}
        </motion.div>
      </AnimatePresence>

      {/* Floating AI Assistant Button */}
      <button 
        onClick={() => {
          if (viewState === 'WORKSPACE' && !currentPlanId) {
            setViewState('MANUAL_FILL');
            setManualStep(1);
          } else {
            setShowAiAssistant(true);
          }
        }}
        className="fixed bottom-10 right-10 w-20 h-20 bg-brand rounded-full flex items-center justify-center text-white shadow-[0_20px_50px_rgba(255,69,0,0.4)] z-[699] hover:scale-110 active:scale-95 transition-all group"
      >
        <Sparkles className="w-8 h-8 group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-4 -right-2 bg-white text-black px-3 py-1 rounded-full text-[10px] font-black shadow-lg">AI 帮我看</div>
      </button>

      {/* AI Assistant Overlay */}
      <AnimatePresence>
        {showAiAssistant && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowAiAssistant(false)}
               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[700]"
            />
            <motion.div 
               initial={{ opacity: 0, y: 100, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 100, scale: 0.95 }}
               className="fixed bottom-28 right-8 w-[360px] bg-[#1a1a1a] border border-white/10 rounded-[40px] shadow-2xl z-[701] overflow-hidden"
            >
               <div className="p-8 bg-brand text-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      <span className="text-[12px] font-black uppercase tracking-widest opacity-60">AI 搭配助手</span>
                    </div>
                    <button onClick={() => setShowAiAssistant(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <h3 className="text-[24px] font-black">想让我帮你怎么改？</h3>
               </div>
               <div className="p-4 space-y-2">
                  {[
                    { label: 'AI 帮我优化当前方案', icon: <Zap className="w-5 h-5" /> },
                    { label: 'AI 帮我补充资料', icon: <Layers className="w-5 h-5" /> },
                    { label: 'AI 帮我换风格', icon: <Palette className="w-5 h-5" /> },
                    { label: 'AI 帮我降预算', icon: <TrendingDown className="w-5 h-5" /> },
                    { label: 'AI 帮我重新推荐产品', icon: <ShoppingBag className="w-5 h-5" /> },
                    { label: 'AI 帮我生成全屋方案', icon: <Home className="w-5 h-5" /> },
                  ].map((opt, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        setShowAiAssistant(false);
                        // Trigger logic
                        if (opt.label.includes('生成')) setViewState('PLAN_RESULTS');
                        if (opt.label.includes('产品')) setViewState('PRODUCT_RESULTS');
                        if (opt.label.includes('参数') || opt.label.includes('资料')) {
                           setViewState('MANUAL_FILL');
                           setIsRefilling(true);
                           setManualStep(1);
                        }
                      }}
                      className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl text-left transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-brand/10 group-hover:text-brand transition-all">
                        {opt.icon}
                      </div>
                      <span className="text-[14px] font-black text-white/60 group-hover:text-white transition-colors">{opt.label}</span>
                    </button>
                  ))}
               </div>
               <div className="p-6 bg-black/20 border-t border-white/5">
                  <p className="text-[12px] text-white/30 font-medium text-center">AI 已根据当前档案进行了预加载</p>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Submit to Decorator Modal */}
      <AnimatePresence>
        {showDecoratorModal && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowDecoratorModal(false)}
               className="fixed inset-0 bg-black/80 backdrop-blur-md z-[900]"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#1A1A1A] border border-white/10 rounded-[48px] p-12 shadow-[0_50px_100px_rgba(0,0,0,0.8)] z-[901] text-left"
            >
               <h3 className="text-[32px] font-black text-white mb-4 tracking-tight">提交给跟单管家</h3>
               <p className="text-[15px] text-white/40 font-medium leading-relaxed mb-10">
                 管家将为你确认规格、颜色、库存、周期、替代款、运输安装和最终报价。
               </p>

               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-white/20 uppercase tracking-widest px-4">姓名</label>
                    <input 
                      type="text" 
                      placeholder="如何称呼你"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 h-14 text-white font-bold placeholder:text-white/10"
                      value={decoratorForm.name}
                      onChange={(e) => setDecoratorForm({ ...decoratorForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-white/20 uppercase tracking-widest px-4">联系电话</label>
                    <input 
                      type="tel" 
                      placeholder="管家联系你的唯一方式"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 h-14 text-white font-bold placeholder:text-white/10"
                      value={decoratorForm.phone}
                      onChange={(e) => setDecoratorForm({ ...decoratorForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[11px] font-black text-white/20 uppercase tracking-widest px-4">备注要求</label>
                    <textarea 
                      placeholder="例如：希望尽快采购，或者需要调整颜色..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 h-32 text-white font-bold placeholder:text-white/10 resize-none"
                      value={decoratorForm.note}
                      onChange={(e) => setDecoratorForm({ ...decoratorForm, note: e.target.value })}
                    />
                  </div>
               </div>

               <button 
                  onClick={() => {
                    alert('已收到你的需求，管家将尽快与你联系！');
                    setShowDecoratorModal(false);
                  }}
                  className="w-full py-5 bg-brand text-white rounded-2xl text-[16px] font-black mt-10 shadow-xl shadow-brand/20"
               >
                 确认提交
               </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
