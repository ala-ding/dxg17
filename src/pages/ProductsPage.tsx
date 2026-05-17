import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Breadcrumbs from '../components/Breadcrumbs';
import { 
  ShoppingBag, ArrowRight, X, Heart, Info, CheckCircle2, Star, 
  Layers, Package, Building2, TrendingUp, Search, ArrowUp,
  SlidersHorizontal, ChevronDown, Filter, ArrowUpRight,
  Sparkles, ArrowLeft, LayoutGrid, Sofa, Bed, Table, Archive, 
  Lamp, Waves, Palette, Image as ImageIcon, Box, HelpCircle, MessageSquare,
  RefreshCw
} from 'lucide-react';
import { Product, UserMembership } from '../types/business';
import { productService } from '../services/productService';
import { libraryService } from '../services/libraryService';
import { planService } from '../services/planService';
import { analyticsService } from '../services/analyticsService';
import { membershipService } from '../services/membershipService';
import { authService } from '../services/authService';
import { PLAN_TEMPLATES } from '../data/planTemplates';
import Toast from '../components/Toast';
import AddToPlanModal from '../components/AddToPlanModal';

const CATEGORIES = [
  { name: '沙发/休闲椅', icon: <Sofa className="w-5 h-5" />, judge: '支撑力与面料耐磨度是核心' },
  { name: '床铺/床垫', icon: <Bed className="w-5 h-5" />, judge: '1/3的人生在这里度过' },
  { name: '餐桌/书桌', icon: <Table className="w-5 h-5" />, judge: '材质厚度决定质感' },
  { name: '柜类/收纳', icon: <Archive className="w-5 h-5" />, judge: '五金件是寿命的底线' },
  { name: '灯具/光影', icon: <Lamp className="w-5 h-5" />, judge: '色温比造型更重要' },
  { name: '地毯/窗帘', icon: <Waves className="w-5 h-5" />, judge: '质地决定空间温度' }
];

const SPACES = [
  { id: 'living', name: '客厅', desc: '社交中心，预算的60%建议投入这里', icon: <Sofa className="w-6 h-6" /> },
  { id: 'bedroom', name: '卧室', desc: '纯净睡眠，静音与环保第一优先级', icon: <Bed className="w-6 h-6" /> },
  { id: 'dining', name: '餐厨', desc: '烟火气与动线，材料防污是关键', icon: <Table className="w-6 h-6" /> },
  { id: 'workspace', name: '书房', desc: '专注时刻，光线与人体工学至上', icon: <Archive className="w-6 h-6" /> },
  { id: 'kids', name: '儿童房', desc: '伴随成长，柔性材料与安全圆角', icon: <Waves className="w-6 h-6" /> }
];

const STYLES = ['现代简约', '中古风', '意式极简', '原木风', '北欧风', '轻奢'];

const BUDGET_SERIES = [
  {
    code: 'F',
    priceRange: '2万以内',
    title: '基础入住',
    color: 'bg-[#10b981]',
    desc: '以功能和极简外观为主，适合过渡房或追求极致性价比。',
    focus: '多功能沙发 / 环保板材',
    subLevels: [
      { id: '1', priceRange: '1万以内', title: '极简入门版' },
      { id: '2', priceRange: '1-2万', title: '精选入门版' }
    ]
  },
  {
    code: 'M',
    priceRange: '2-5万',
    title: '实用进阶',
    color: 'bg-[#3b82f6]',
    desc: '外观与品质的平衡点，开始出现实木与高克重面料。',
    focus: '品牌床垫 / 头层牛皮',
    subLevels: [
      { id: '3', priceRange: '2-3万', title: '舒适基础版' },
      { id: '4', priceRange: '3-5万', title: '品质进阶版' }
    ]
  },
  {
    code: 'P',
    priceRange: '5-15万',
    title: '专业设计',
    color: 'bg-[#06b6d4]',
    desc: '追求设计感与特定材质，能呈现明显的风格调性。',
    focus: '真丝地毯 / 意式玻璃件',
    subLevels: [
      { id: '5', priceRange: '5-10万', title: '设计精选版' },
      { id: '6', priceRange: '10-15万', title: '格调生活版' }
    ]
  },
  {
    code: 'S',
    priceRange: '15-50万',
    title: '奢华定制',
    color: 'bg-[#f59e0b]',
    desc: '大厂源头与进口材料，极致的材料表现力。',
    focus: '大漆工艺 / 欧洲原装进口',
    subLevels: [
      { id: '7', priceRange: '15-25万', title: '高阶定制版' },
      { id: '8', priceRange: '25-50万', title: '典雅至尊版' }
    ]
  },
  {
    code: 'X',
    priceRange: '50万以上',
    title: '艺术馆级',
    color: 'bg-[#f43f5e]',
    desc: '非标定制与孤品家具，空间即是作品。',
    focus: '大师孤品 / 石材切割',
    subLevels: [
      { id: '9', priceRange: '50-100万', title: '国际藏家版' },
      { id: '10', priceRange: '100万以上', title: '臻选收藏版' }
    ]
  }
];

const ALL_SUB_LEVELS = BUDGET_SERIES.flatMap(s => s.subLevels);

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || "");
  const [selectedSpace, setSelectedSpace] = useState(searchParams.get('space') || "全部");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "全部");
  const [selectedTier, setSelectedTier] = useState(searchParams.get('level') || "全部");
  const [selectedStyle, setSelectedStyle] = useState(searchParams.get('style') || "全部");
  
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [user, setUser] = useState<any>(null);
  
  const [spaceMenuOpen, setSpaceMenuOpen] = useState(false);
  const [budgetMenuOpen, setBudgetMenuOpen] = useState(false);
  const [aiPickerOpen, setAiPickerOpen] = useState(false);
  
  const [selectedSeries, setSelectedSeries] = useState<typeof BUDGET_SERIES[0] | null>(null);
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  
  const fromCaseParam = searchParams.get('fromCase');
  const isRecommendedView = searchParams.get('recommendedOnly') === 'true';
  const fromPlanId = searchParams.get('fromPlan');
  const fromPlanName = searchParams.get('fromPlanName');
  
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Add to plan modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadMembership();
    loadProducts();
    analyticsService.track('page_view', { page: 'products_page' });
  }, [selectedSpace, selectedCategory, selectedTier, selectedStyle, searchQuery]);

  const loadMembership = async () => {
    const [m, u] = await Promise.all([
      membershipService.getCurrentUserMembership(),
      authService.getCurrentUser()
    ]);
    setMembership(m);
    setUser(u);
  };

  const loadProducts = async () => {
    try {
      setLoading(true);

      // Check if viewing a template case
      if (fromCaseParam && isRecommendedView) {
        const template = PLAN_TEMPLATES.find(t => t.code === fromCaseParam);
        if (template) {
          const templateProducts: Product[] = template.items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.unitPrice,
            image: item.image || 'https://images.unsplash.com/photo-1538688506041-e89bda532a88?w=800&q=80',
            category: item.category,
            brand: item.brand || '推荐款',
            level: template.id.substring(0, 1),
            style: [template.style],
            space: [item.space],
            description: item.note || ''
          } as unknown as Product));
          
          setProducts(templateProducts);
          return;
        }
      }

      const data = await productService.getProducts({
        category: selectedCategory !== '全部' ? selectedCategory : undefined,
        tier: selectedTier !== '全部' ? selectedTier : undefined,
        style: selectedStyle !== '全部' ? selectedStyle : undefined,
        search: searchQuery || undefined
      });

      const spaceFiltered = selectedSpace === '全部' 
        ? data 
        : data.filter(p => p.space?.includes(selectedSpace));

      setProducts(spaceFiltered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const space = searchParams.get('space');
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const style = searchParams.get('style');
    const q = searchParams.get('q');

    if (space) setSelectedSpace(space);
    if (category) setSelectedCategory(category);
    if (level) setSelectedTier(level);
    if (style) setSelectedStyle(style);
    if (q) setSearchQuery(q);

    const openDrawer = searchParams.get('openDrawer');
    if (openDrawer === 'space') setSpaceMenuOpen(true);
    if (openDrawer === 'budget') setBudgetMenuOpen(true);
    if (openDrawer === 'ai') setAiPickerOpen(true);
  }, [searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      const productsSection = document.getElementById('products-section');
      if (productsSection) {
        const rect = productsSection.getBoundingClientRect();
        setShowStickyBar(rect.top <= 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleReturnToPreview = () => {
    if (fromPlanId) {
      navigate(`/my-plans?planId=${fromPlanId}`);
    } else if (location.state?.fromPreview) {
      navigate('/', { 
        state: { ...location.state, showPlan: true }
      });
    } else {
      navigate('/ladder');
    }
  };

  const clearFilters = () => {
    setSelectedSpace("全部");
    setSelectedCategory("全部");
    setSelectedTier("全部");
    setSelectedStyle("全部");
    setSearchQuery("");
  };

  const activeFilters = useMemo(() => {
    const filters = [];
    if (selectedSpace !== "全部") filters.push({ id: 'space', label: selectedSpace, onClear: () => setSelectedSpace("全部") });
    if (selectedCategory !== "全部") filters.push({ id: 'category', label: selectedCategory, onClear: () => setSelectedCategory("全部") });
    
    if (selectedTier !== "全部") {
      const series = BUDGET_SERIES.find(s => s.code === selectedTier);
      const subLevel = ALL_SUB_LEVELS.find(l => l.id === selectedTier);
      
      const label = series 
        ? `${series.code}系列 (${series.priceRange})` 
        : subLevel 
          ? `${subLevel.priceRange} (${subLevel.title})`
          : selectedTier;
          
      filters.push({ id: 'tier', label: label, onClear: () => setSelectedTier("全部") });
    }
    
    if (selectedStyle !== "全部") filters.push({ id: 'style', label: selectedStyle, onClear: () => setSelectedStyle("全部") });
    if (searchQuery) filters.push({ id: 'search', label: `“${searchQuery}”`, onClear: () => setSearchQuery("") });
    return filters;
  }, [selectedSpace, selectedCategory, selectedTier, selectedStyle, searchQuery]);

  const handleJoinPlan = (p: Product) => {
    setSelectedProductForModal(p);
    setIsAddModalOpen(true);
    analyticsService.track('click_add_to_plan', { product_id: p.id });
  };

  const handleJoinLibrary = async (p: Product) => {
    try {
      const success = await libraryService.addToLibrary(p.id);
      if (success) {
        setToastMessage('已加入灵感产品库！');
        analyticsService.track('add_to_library', { product_id: p.id });
      } else {
        setToastMessage('系统异常，请稍后重试。');
      }
    } catch (e) {
      setToastMessage('已存在于灵感库中。');
    }
  };

  const isProfessional = membership?.member_type === 'professional';
  const isAgent = membership?.member_type === 'agent';
  const isConsulting = membership?.member_type === 'consulting';
  const isGuest = !user;

  const getMembershipStatus = () => {
    if (isGuest) return { type: 'guest', text: '登录后可保存方案、收藏产品并查看会员权益。', action: '登录 / 了解会员' };
    if (isAgent) return { type: 'agent', text: '区域服务商模式：当前展示平台供货价，可用于客户方案和本地服务报价。' };
    if (isProfessional) return { type: 'professional', text: '专业会员模式：已解锁专业采购价、阶梯价和起订量说明。' };
    if (isConsulting) return { type: 'consulting', text: '咨询会员模式：已解锁专属咨询顾问服务。' };
    return { type: 'consumer', text: '当前价格为“平台标准服务价”。', hint: '包含产品基础核对与平台标准服务' };
  };

  const membershipStatus = getMembershipStatus();

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1D1D1F] pb-32">
      <div className="max-w-[1720px] mx-auto px-6 md:px-12 pt-24 text-left">
        <Breadcrumbs 
          items={[
            { name: isRecommendedView ? '匹配方案建议' : '全部产品' },
            ...(isRecommendedView ? [{ name: `适配：${fromCaseParam}` }] : [])
          ]} 
        />

        {/* 1. Header Section - Title & Quick Filters */}
        <div className="mt-12 mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="max-w-2xl">
                {(location.state?.fromPreview || fromPlanId) && (
                  <button 
                    onClick={handleReturnToPreview}
                    className="mb-8 inline-flex items-center gap-2.5 px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-[13px] font-black transition-all"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> {fromPlanId ? '返回方案' : '返回方案预览'}
                  </button>
                )}
                <h1 className="text-[48px] md:text-[64px] font-black leading-[1.1] tracking-tight mb-6">探索所有产品</h1>
                <p className="text-[16px] md:text-[18px] text-gray-500 font-bold max-w-xl">
                  共发现 {products.length} 款严选家具。所有价格均为“平台标准服务价”。
                </p>
                {fromPlanName && (
                  <div className="mt-4 flex items-center gap-2 text-[14px] text-brand font-black">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                    正在为「{fromPlanName}」添加产品
                  </div>
                )}
                <div className="mt-6 flex flex-wrap gap-4">
                  {membershipStatus.type === 'consumer' || membershipStatus.type === 'guest' ? (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-[13px] font-bold text-gray-500 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {membershipStatus.text}
                      </div>
                      <button 
                        onClick={() => navigate('/membership')}
                        className="text-[13px] font-black text-brand hover:underline flex items-center gap-1"
                      >
                        了解会员价 <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className={`flex items-center gap-2 text-[13px] font-bold px-4 py-2 rounded-full border ${
                      membershipStatus.type === 'agent' ? 'text-purple-600 bg-purple-50 border-purple-100' :
                      membershipStatus.type === 'professional' ? 'text-brand bg-brand/5 border-brand/10' :
                      membershipStatus.type === 'consulting' ? 'text-blue-600 bg-blue-50 border-blue-100' :
                      'text-gray-600 bg-gray-50 border-gray-100'
                    }`}>
                      <Sparkles className="w-4 h-4" /> {membershipStatus.text}
                    </div>
                  )}
                </div>
              </div>
            
            <div className="flex items-center gap-6 text-[14px]">
              <span className="text-gray-400 font-black">不知道怎么选？</span>
              <div className="flex gap-4 relative">
                <div className="relative">
                  <button 
                    onClick={() => setSpaceMenuOpen(!spaceMenuOpen)} 
                    className={`text-brand hover:underline font-black transition-all ${spaceMenuOpen ? 'opacity-50' : ''}`}
                  >
                    {selectedSpace !== '全部' ? `空间：${selectedSpace}` : '按空间看'}
                  </button>
                  <AnimatePresence>
                    {spaceMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setSpaceMenuOpen(false)} />
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 mt-4 w-48 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                        >
                          <div className="p-2">
                             {SPACES.map(s => (
                               <button 
                                 key={s.id}
                                 onClick={() => { setSelectedSpace(s.name); setSpaceMenuOpen(false); }}
                                 className="w-full px-6 py-3 text-left text-[13px] font-black hover:bg-gray-50 rounded-2xl transition-colors"
                               >
                                 {s.name}
                               </button>
                             ))}
                             <button 
                               onClick={() => { setSelectedSpace('全部'); setSpaceMenuOpen(false); }}
                               className="w-full px-6 py-3 text-left text-[13px] font-black text-gray-400 hover:bg-gray-50 rounded-2xl transition-colors border-t border-gray-50"
                             >
                               全屋产品
                             </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <div className="w-px h-4 bg-gray-100" />
                
                <div className="relative">
                  <button 
                    onClick={() => setBudgetMenuOpen(!budgetMenuOpen)} 
                    className={`text-brand hover:underline font-black transition-all ${budgetMenuOpen ? 'opacity-50' : ''}`}
                  >
                    {selectedTier !== '全部' ? `预算：${BUDGET_SERIES.find(s => s.code === selectedTier)?.priceRange || '已选'}` : '按预算看'}
                  </button>
                  <AnimatePresence>
                    {budgetMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setBudgetMenuOpen(false)} />
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 mt-4 w-60 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                        >
                          <div className="p-2">
                             {BUDGET_SERIES.map(s => (
                               <button 
                                 key={s.code}
                                 onClick={() => { setSelectedTier(s.code); setBudgetMenuOpen(false); }}
                                 className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 rounded-2xl transition-colors"
                               >
                                 <div className="flex flex-col">
                                   <span className="text-[13px] font-black">{s.priceRange}</span>
                                   <span className="text-[10px] text-gray-400 font-bold">{s.title}</span>
                                 </div>
                                 <div className={`w-2 h-2 rounded-full ${s.color}`} />
                               </button>
                             ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <div className="w-px h-4 bg-gray-100" />
                
                <button onClick={() => setAiPickerOpen(true)} className="text-brand hover:underline font-black flex items-center gap-1">
                  让 AI 帮我选 <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-12">
            <div className={`p-4 bg-white border border-gray-100 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex flex-col lg:flex-row items-center gap-4 transition-all ${showStickyBar ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
              <div className="flex-1 w-full relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-brand transition-colors" />
                <input 
                  type="text"
                  placeholder="搜索沙发、床、灯具或风格..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-16 pl-14 pr-6 bg-gray-50/50 border-none rounded-[24px] text-[15px] font-bold focus:ring-2 focus:ring-brand/10 transition-all outline-none"
                />
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto h-16">
                <div className="relative group/select flex-1 lg:flex-none">
                  <select 
                    value={selectedSpace}
                    onChange={(e) => setSelectedSpace(e.target.value)}
                    className="w-full lg:w-40 h-full pl-6 pr-10 bg-gray-50/50 hover:bg-gray-100 rounded-[24px] text-[14px] font-black border-none focus:ring-2 focus:ring-brand/10 cursor-pointer appearance-none transition-all"
                  >
                    <option value="全部">全部空间</option>
                    {SPACES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none transition-transform group-hover/select:translate-y-[-40%]" />
                </div>

                <div className="relative group/select flex-1 lg:flex-none">
                  <select 
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="w-full lg:w-40 h-full pl-6 pr-10 bg-gray-50/50 hover:bg-gray-100 rounded-[24px] text-[14px] font-black border-none focus:ring-2 focus:ring-brand/10 cursor-pointer appearance-none transition-all"
                  >
                    <option value="全部">全部预算</option>
                    {BUDGET_SERIES.map(s => <option key={s.code} value={s.code}>{s.priceRange}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none transition-transform group-hover/select:translate-y-[-40%]" />
                </div>

                <button 
                  onClick={() => setIsFilterOpen(true)}
                  className="h-full px-8 bg-black text-white rounded-[24px] text-[14px] font-black flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-xl shadow-black/10"
                >
                  <Filter className="w-4 h-4" /> 高级筛选
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isRecommendedView && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-[1720px] mx-auto px-6 md:px-12 mb-12"
        >
          <div className="p-6 bg-brand/10 border border-brand/20 rounded-[32px] flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[80px] pointer-events-none" />
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-brand text-white flex items-center justify-center shadow-xl shadow-brand/20">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="text-left">
                <h4 className="text-[18px] font-black text-gray-900">正在查看：{fromCaseParam} 方案推荐清单</h4>
                <p className="text-[13px] text-brand/80 font-bold">已基于该案例的 {selectedStyle} 风格与预算档位为您精选</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full sm:w-auto">
              <button 
                onClick={async () => {
                  const template = PLAN_TEMPLATES.find(t => t.code === fromCaseParam);
                  if (template) {
                    try {
                      const newPlan = await planService.createPlanFromTemplate(template.id);
                      setToastMessage('方案生成成功！已跳转至工作台');
                      navigate(`/my-plans?planId=${newPlan.id}`);
                    } catch (error: any) {
                      setToastMessage(`生成失败，请检查模板数据`);
                    }
                  }
                }}
                className="w-full sm:w-auto px-8 h-14 bg-brand text-white hover:scale-105 active:scale-95 rounded-full text-[15px] font-black transition-all shadow-xl shadow-brand/20 flex items-center justify-center gap-2"
              >
                按这套生成我的方案 <CheckCircle2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('recommendedOnly');
                  url.searchParams.delete('fromCase');
                  navigate(url.pathname + url.search);
                }}
                className="w-full sm:w-auto px-8 h-14 bg-white/50 hover:bg-white text-gray-400 hover:text-black rounded-full text-[14px] font-black transition-all border border-gray-100 flex items-center justify-center"
              >
                查看全库产品
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. Sticky Product Toolbar */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-[100px] left-0 right-0 z-[400] px-6 hidden md:flex justify-center pointer-events-none"
          >
            <div className={`p-3 bg-white/80 backdrop-blur-3xl border border-black/5 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] pointer-events-auto flex items-center gap-3 w-full max-w-5xl`}>
               <div className="px-6 border-r border-gray-100 hidden lg:block">
                  <span className="text-[13px] font-black whitespace-nowrap text-left block">全部产品</span>
                  <p className="text-[10px] text-gray-400 font-bold">{products.length} 款严选</p>
               </div>
               
               <div className="flex-1 relative group">
                  <input 
                    type="text"
                    placeholder="搜索沙发、床、灯具..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    className="w-full h-11 pl-11 pr-4 bg-gray-50 border-none rounded-[18px] text-[13px] font-bold focus:ring-2 focus:ring-brand/10 transition-all outline-none"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand transition-colors" />
               </div>

               <div className="flex items-center gap-2">
                  <select 
                    value={selectedSpace}
                    onChange={(e) => setSelectedSpace(e.target.value)}
                    className="h-11 px-6 bg-gray-50/50 hover:bg-gray-100 rounded-[18px] text-[12px] font-black border-none focus:ring-0 cursor-pointer transition-all appearance-none"
                  >
                    <option value="全部">全部空间</option>
                    {SPACES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                  <select 
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="h-11 px-6 bg-gray-50/50 hover:bg-gray-100 rounded-[18px] text-[12px] font-black border-none focus:ring-0 cursor-pointer transition-all appearance-none"
                  >
                    <option value="全部">全部预算</option>
                    {BUDGET_SERIES.map(s => <option key={s.code} value={s.code}>{s.priceRange}</option>)}
                  </select>
                  <button 
                    onClick={() => setIsFilterOpen(true)}
                    className="h-11 px-6 bg-black text-white rounded-[18px] text-[12px] font-black flex items-center gap-2 hover:bg-zinc-800 transition-all"
                  >
                    <Filter className="w-3.5 h-3.5" /> 筛选
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section id="products-section" className="max-w-[1720px] mx-auto px-6 md:px-12 py-12 bg-white scroll-mt-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
             <RefreshCw className="w-12 h-12 text-brand animate-spin" />
             <p className="mt-4 text-gray-400 font-bold">正在搜寻全球好物...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-8 mb-12">
              <div className="flex items-center justify-between">
                <h2 className="text-[28px] font-black tracking-tight">全部产品</h2>
                <div className="flex items-center gap-4">
                  <select className="bg-transparent border-none text-[14px] font-bold focus:ring-0 cursor-pointer text-gray-500">
                    <option>默认推荐</option>
                    <option>价格从低到高</option>
                    <option>价格从高到低</option>
                    <option>最新上市</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <AnimatePresence>
                    {activeFilters.map(filter => (
                      <motion.div 
                        key={`${filter.id}-${filter.label}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-100/80 text-gray-900 rounded-full text-[13px] font-black border border-gray-100"
                      >
                        {filter.label}
                        <button onClick={filter.onClear} className="hover:bg-gray-200 p-0.5 rounded-full transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                </AnimatePresence>
                {activeFilters.length > 0 && (
                  <button 
                    onClick={clearFilters}
                    className="text-[13px] font-black text-gray-400 hover:text-red-500 transition-colors ml-4"
                  >
                    清空并重置
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 text-left">
              <AnimatePresence mode="popLayout">
                {products.map((product) => (
                  <motion.div
                    layout
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="group relative flex flex-col bg-white rounded-[56px] border border-gray-50 shadow-sm hover:shadow-4xl hover:border-brand/40 overflow-hidden transition-all h-full"
                  >
                    <Link to={`/product/${product.id}`} className="block relative h-[340px] overflow-hidden bg-gray-50">
                      <img src={product.image || null} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={product.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    
                    <div className="p-8 flex flex-col flex-1">
                      <Link to={`/product/${product.id}`} className="mb-6 block group-hover:no-underline text-left">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em]">{product.brand}</span>
                           <span className="w-1 h-1 rounded-full bg-gray-200" />
                           <span className="text-[11px] text-brand/60 font-black">{product.category}</span>
                        </div>
                        <h3 className="text-[20px] font-black text-gray-800 leading-tight group-hover:text-brand transition-colors mb-2">{product.name}</h3>
                        <div className="mt-auto flex items-end justify-between">
                          <div className="text-[22px] font-black text-gray-900">
                             <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">
                               {isProfessional ? '已解锁出厂结算价' : isAgent ? '服务商结算价' : '平台标准服务价'}
                             </span>
                             ¥{(isProfessional ? (product.factory_price || product.price) : isAgent ? (product.agent_price || product.price) : (product.standard_service_price || product.price)).toLocaleString()}
                          </div>
                          {!isProfessional && !isAgent && (
                            <button 
                              onClick={(e) => { e.preventDefault(); navigate('/membership'); }}
                              className="text-[10px] font-black text-brand hover:underline"
                            >
                              了解专业采购价
                            </button>
                          )}
                        </div>
                      </Link>
                      
                      <div className="flex gap-2 mt-4">
                        <button 
                          onClick={(e) => { e.preventDefault(); handleJoinPlan(product); }}
                          className="flex-1 h-12 bg-brand text-white rounded-2xl text-[13px] font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          加入我的方案
                        </button>
                        <button 
                          onClick={(e) => { e.preventDefault(); handleJoinLibrary(product); }}
                          className="w-12 h-12 bg-gray-50 border border-gray-100 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                        >
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-40 text-center gap-8">
                <div className="w-32 h-32 rounded-full bg-gray-50 flex items-center justify-center text-gray-200">
                    <Search className="w-16 h-16" />
                </div>
                <div className="space-y-3">
                    <h3 className="text-[28px] font-black">未找到对应家具</h3>
                    <p className="text-gray-400 text-[16px] max-w-sm">
                      试试放宽筛选条件，或者直接问 AI 应该如何在这档预算内选购。
                    </p>
                </div>
                <button onClick={clearFilters} className="px-10 py-4 bg-brand text-white rounded-full font-black shadow-xl shadow-brand/20">
                    重置所有筛选
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* 4. Moved Novice Guides - Selection Guide Section */}
      <section className="bg-gray-50 py-32 border-t border-gray-100 overflow-hidden">
        <div className="max-w-[1720px] mx-auto px-6 md:px-12">
          <div className="text-center mb-24">
             <h2 className="text-[14px] font-black text-brand uppercase tracking-[0.4em] mb-6">Selection Guide</h2>
             <h3 className="text-[42px] font-black mb-4 tracking-tight text-gray-900">选购指南：不知道如何开始？</h3>
             <p className="text-gray-400 text-[18px] font-medium">按空间、按预算，我们将复杂的选购流程拆解为清晰的决策路径</p>
          </div>

          <div id="classification" className="mb-40">
            <div className="flex items-center gap-3 mb-16">
               <div className="w-2 h-8 bg-brand rounded-full" />
               <h4 className="text-[28px] font-black">按空间规划入住</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {SPACES.map((space) => (
                <motion.div 
                  key={space.id}
                  whileHover={{ y: -8 }}
                  onClick={() => { setSelectedSpace(space.name); document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="group relative p-8 bg-white border border-gray-100 rounded-[40px] shadow-sm hover:shadow-2xl hover:border-brand/20 transition-all cursor-pointer flex flex-col items-start text-left"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand group-hover:text-white transition-all mb-8">
                    {space.icon}
                  </div>
                  <h3 className="text-[20px] font-black mb-3">{space.name}</h3>
                  <p className="text-[14px] text-gray-400 leading-relaxed font-medium mb-6 line-clamp-2">{space.desc}</p>
                  <div className="mt-auto flex items-center gap-2 text-brand font-black text-[13px] opacity-0 group-hover:opacity-100 transition-all">
                    浏览产品 <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div id="tiers">
            <div className="flex items-center gap-3 mb-16">
               <div className="w-2 h-8 bg-black rounded-full" />
               <h4 className="text-[28px] font-black">按预算档位决策</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {BUDGET_SERIES.map((series) => (
                <motion.div 
                  key={series.code}
                  whileHover={{ y: -8 }}
                  onClick={() => {
                    setSelectedSeries(series);
                    setIsSeriesModalOpen(true);
                  }}
                  className="group bg-white border border-gray-100 p-8 rounded-[40px] flex flex-col cursor-pointer hover:shadow-2xl transition-all text-left"
                >
                  <div className={`w-14 h-14 rounded-2xl ${series.color} flex items-center justify-center text-[20px] font-black mb-8 shadow-lg text-white`}>
                    {series.code}
                  </div>
                  <div className="mb-4">
                    <div className="text-[28px] font-black text-gray-900 leading-tight mb-1">
                      {series.priceRange}
                    </div>
                    <h3 className="text-[20px] font-extrabold text-gray-500">{series.title}</h3>
                  </div>
                  <p className="text-[14px] text-gray-400 leading-relaxed mb-8 flex-1">{series.desc}</p>
                  <button className="w-full py-4 rounded-2xl bg-gray-50 group-hover:bg-black group-hover:text-white font-black text-[14px] transition-all flex items-center justify-center gap-2 text-gray-400">
                    浏览此档产品 <ArrowUpRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Expert Judgment Entry Points */}
      <section className="bg-white py-32">
        <div className="max-w-[1720px] mx-auto px-6 md:px-12">
          <div className="flex items-center gap-3 mb-12">
             <div className="w-2 h-8 bg-brand rounded-full" />
             <h3 className="text-[22px] font-black uppercase tracking-tight">按品类探索 / 决策建议</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {CATEGORIES.map((cat) => (
              <div 
                key={cat.name}
                onClick={() => { setSelectedCategory(cat.name); document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="p-8 bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-200 rounded-[40px] transition-all cursor-pointer group hover:shadow-xl text-left"
              >
                <div className="flex items-center gap-5 mb-5">
                  <div className="w-12 h-12 rounded-[20px] bg-white flex items-center justify-center text-gray-400 shadow-sm transition-all group-hover:scale-110 group-hover:text-brand">
                    {cat.icon}
                  </div>
                </div>
                <span className="text-[17px] font-black mb-3 block">{cat.name}</span>
                <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                  {cat.judge}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Professional Footer */}
      <footer className="bg-white py-40 border-t border-gray-100 flex flex-col items-center text-center px-6">
        <div className="max-w-3xl">
           <h2 className="text-[48px] font-black mb-8 tracking-tight text-gray-900">不仅仅是家具库</h2>
           <p className="text-[20px] text-gray-400 font-medium mb-16 leading-relaxed">
             将心仪的家具加入“我的方案”，让 AI 帮助你实时计算预算、匹配颜色并检查户型适配度。
           </p>
           <Link 
            to="/ladder"
            className="inline-flex items-center gap-4 px-12 py-6 bg-brand text-white rounded-full font-black text-[18px] shadow-2xl shadow-brand/20 hover:scale-105 active:scale-95 transition-all"
           >
             立即开始方案定制 <ArrowRight className="w-5 h-5" />
           </Link>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[1001] shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                 <h2 className="text-[24px] font-black">筛选产品</h2>
                 <button onClick={() => setIsFilterOpen(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-all">
                   <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-12">
                 <div className="space-y-6">
                    <h3 className="text-[11px] font-black text-brand uppercase tracking-widest text-left">按空间</h3>
                    <div className="flex flex-wrap gap-2">
                       {["全部", ...SPACES.map(s => s.name)].map(s => (
                         <button key={s} onClick={() => setSelectedSpace(s)} className={`px-5 py-2.5 rounded-full text-[13px] font-black border transition-all ${selectedSpace === s ? 'bg-brand text-white border-brand' : 'border-gray-100 text-gray-500 hover:border-gray-300'}`}>{s}</button>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-6">
                    <h3 className="text-[11px] font-black text-brand uppercase tracking-widest text-left">按预算系列</h3>
                    <div className="grid grid-cols-3 gap-2">
                       {["全部", ...BUDGET_SERIES.map(s => s.code + '系列')].map(t => (
                         <button key={t} onClick={() => setSelectedTier(t === "全部" ? "全部" : t.charAt(0))} className={`py-3 rounded-2xl text-[14px] font-black border transition-all ${selectedTier === (t === "全部" ? "全部" : t.charAt(0)) ? 'bg-black text-white border-black' : 'border-gray-100 text-gray-500 hover:border-gray-300'}`}>{t}</button>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-6">
                    <h3 className="text-[11px] font-black text-brand uppercase tracking-widest text-left">按品类</h3>
                    <div className="grid grid-cols-2 gap-2">
                       {CATEGORIES.map(cat => (
                         <button key={cat.name} onClick={() => setSelectedCategory(cat.name)} className={`py-3 px-4 rounded-2xl text-[13px] font-black border transition-all text-left flex items-center gap-3 ${selectedCategory === cat.name ? 'bg-black text-white border-black' : 'border-gray-100 text-gray-500 hover:border-gray-300'}`}>
                           <span className="opacity-50">{cat.icon}</span>{cat.name}
                         </button>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-6">
                    <h3 className="text-[11px] font-black text-brand uppercase tracking-widest text-left">设计风格</h3>
                    <div className="grid grid-cols-2 gap-2">
                       {STYLES.map(style => (
                         <button key={style} onClick={() => setSelectedStyle(style)} className={`py-3 px-4 rounded-2xl text-[13px] font-black border transition-all ${selectedStyle === style ? 'bg-black text-white border-black' : 'border-gray-100 text-gray-500 hover:border-gray-300'}`}>{style}</button>
                       ))}
                    </div>
                 </div>
              </div>
              <div className="p-8 border-t border-gray-100 grid grid-cols-2 gap-4 bg-gray-50/50">
                 <button onClick={clearFilters} className="py-4 bg-white border border-gray-200 rounded-2xl text-[15px] font-black hover:bg-gray-100 transition-all">清空已选</button>
                 <button onClick={() => setIsFilterOpen(false)} className="py-4 bg-brand text-white rounded-2xl text-[15px] font-black hover:scale-[1.02] transition-all">查看 {products.length} 件产品</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSearchFocused && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSearchFocused(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[1000]"
            />
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed top-32 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-[32px] shadow-4xl z-[1001] p-8 border border-gray-100"
            >
              <div className="flex items-center gap-4 mb-8">
                <Search className="w-6 h-6 text-brand" />
                <input 
                  autoFocus
                  type="text"
                  placeholder="搜索沙发、床、灯具、现代简约..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none text-[20px] font-black focus:ring-0 placeholder:text-gray-300"
                />
                <button onClick={() => setIsSearchFocused(false)}><X className="w-6 h-6 text-gray-400 hover:text-black" /></button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI Picker Drawer */}
      <AnimatePresence>
        {aiPickerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setAiPickerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[2000]"
            />
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-white z-[2001] shadow-2xl flex flex-col"
            >
               <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-[20px] font-black text-left">AI 智能选品建议</h2>
                      <p className="text-[12px] text-gray-400 font-bold text-left">按需求匹配最佳方案</p>
                    </div>
                  </div>
                  <button onClick={() => setAiPickerOpen(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100">
                    <X className="w-5 h-5" />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-10 space-y-12">
                  <div className="space-y-6">
                    <h4 className="text-[14px] font-black text-left">你想布置哪个空间？</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {SPACES.map(s => (
                        <button 
                          key={s.id} 
                          onClick={() => setSelectedSpace(s.name)}
                          className={`p-6 border rounded-3xl text-left transition-all group ${selectedSpace === s.name ? 'bg-brand/10 border-brand/40 shadow-brand/10' : 'bg-gray-50 border-transparent hover:bg-brand/5 hover:border-brand/20'}`}
                        >
                          <div className={`mb-3 ${selectedSpace === s.name ? 'text-brand' : 'text-gray-400 group-hover:text-brand'}`}>{s.icon}</div>
                          <div className={`font-black text-[15px] ${selectedSpace === s.name ? 'text-brand' : ''}`}>{s.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[14px] font-black text-left">你的预算大概是多少？</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {BUDGET_SERIES.map(series => (
                        <button 
                          key={series.code} 
                          onClick={() => setSelectedTier(series.code)}
                          className={`p-5 border rounded-3xl text-left transition-all ${selectedTier === series.code ? 'bg-brand/10 border-brand/40 shadow-brand/10' : 'bg-gray-50 border-transparent hover:bg-brand/5 hover:border-brand/20'}`}
                        >
                          <div className={`font-black text-[15px] ${selectedTier === series.code ? 'text-brand' : ''}`}>{series.priceRange}</div>
                          <div className="text-[11px] text-gray-400 font-bold">{series.title}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[14px] font-black text-left">你有特殊的偏好吗？</h4>
                    <div className="flex flex-wrap gap-2">
                      {['中古风', '现代极简', '奶油风', '适合小户型', '有宠物', '有小孩', '需要耐脏', '大师经典'].map(tag => (
                        <button key={tag} className="px-5 py-2.5 bg-gray-50 hover:bg-brand text-gray-600 hover:text-white rounded-full text-[13px] font-black transition-all">
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
               </div>

               <div className="p-10 border-t border-gray-100 bg-gray-50/50">
                  <button 
                    onClick={() => {
                      setAiPickerOpen(false);
                      setToastMessage('AI 已为您筛选出最佳推荐产品');
                      document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full h-16 bg-brand text-white rounded-3xl text-[16px] font-black shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    生成推荐结果 <ArrowRight className="w-5 h-5" />
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Series Modal */}
      <AnimatePresence>
        {isSeriesModalOpen && selectedSeries && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSeriesModalOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-3xl z-[1500]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[1601] flex items-center justify-center p-6 pointer-events-none"
            >
              <div className="bg-[#0F0F0F] border border-white/10 rounded-[48px] w-full max-w-2xl overflow-hidden pointer-events-auto shadow-2xl">
                <div className="p-10 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-white/5 mx-auto flex items-center justify-center text-[32px] font-black mb-6">{selectedSeries.code}</div>
                  <h2 className="text-[32px] font-black text-white mb-2">选择你的预算档位</h2>
                  <p className="text-white/40 text-[16px]">{selectedSeries.code} 系列 · {selectedSeries.title}</p>
                </div>
                <div className="p-10 pt-0 space-y-4">
                  {selectedSeries.subLevels.map((level) => (
                    <button key={level.id} onClick={() => { setSelectedTier(level.id); setIsSeriesModalOpen(false); document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' }); }} className="w-full p-8 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-[32px] text-left transition-all group flex items-center justify-between">
                      <div>
                        <div className="text-[28px] font-black text-white mb-1">{level.priceRange}</div>
                        <div className="text-[15px] font-bold text-white/50">{level.title}</div>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-brand group-hover:text-white group-hover:scale-110 transition-all"><ArrowRight className="w-6 h-6" /></div>
                    </button>
                  ))}
                  <button onClick={() => setIsSeriesModalOpen(false)} className="w-full py-4 text-white/20 hover:text-white font-bold transition-all mt-4">返回</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AddToPlanModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        product={selectedProductForModal}
        onToast={(msg) => setToastMessage(msg)}
        prioritizedPlanId={fromPlanId || undefined}
      />
      <Toast message={toastMessage} onClear={() => setToastMessage(null)} />
    </div>
  );
}
