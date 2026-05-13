import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Breadcrumbs from '../components/Breadcrumbs';
import { 
  ShoppingBag, ArrowRight, X, Heart, Info, CheckCircle2, Star, 
  Layers, Package, Building2, TrendingUp, Search, ArrowUp,
  SlidersHorizontal, ChevronDown, Filter, ArrowUpRight,
  Sparkles, ArrowLeft, LayoutGrid, Sofa, Bed, Table, Archive, 
  Lamp, Waves, Palette, Image as ImageIcon, Box, HelpCircle, MessageSquare
} from 'lucide-react';
import { MOCK_PRODUCTS_LIST as MOCK_PRODUCTS, Product } from '../data/products';
import { FLOORS } from '../constants';

const SPACES = [
  { id: 'living', name: '客厅', icon: <Sofa className="w-5 h-5" />, desc: '决定生活底色的核心社交区。' },
  { id: 'bedroom', name: '卧室', icon: <Bed className="w-5 h-5" />, desc: '优先级最高的私密深睡补给站。' },
  { id: 'dining', name: '餐厅', icon: <Table className="w-5 h-5" />, desc: '家人情感连接与能量交换的中心。' },
  { id: 'study', name: '书房', icon: <Archive className="w-5 h-5" />, desc: '生产力输出与自我沉淀的静谧角。' },
  { id: 'kids', name: '儿童房', icon: <Box className="w-5 h-5" />, desc: '陪伴成长与想象力自由生长的天地。' },
  { id: 'all', name: '全屋软装', icon: <Waves className="w-5 h-5" />, desc: '统一材质与灯光，完成风格闭环。' }
];

const CATEGORIES = [
  { name: '沙发', icon: <Sofa className="w-5 h-5" />, judge: '决定客厅舒适度的第一件家具，坐感永远优先于造型。' },
  { name: '床 / 床垫', icon: <Bed className="w-5 h-5" />, judge: '每天使用时间最长，这档钱不建议压 BUDGET。' },
  { name: '餐桌椅', icon: <Table className="w-5 h-5" />, judge: '适合 4-6 人家庭，桌面材质耐用度比造型更重要。' },
  { name: '柜类收纳', icon: <Archive className="w-5 h-5" />, judge: '视觉统一度的关键，低存在感才是高级感。' },
  { name: '灯具', icon: <Lamp className="w-5 h-5" />, judge: '不是照亮空间，而是决定空间的明暗层次。' },
  { name: '窗帘', icon: <Waves className="w-5 h-5" />, judge: '影响隐私与光线，是建立空间氛围的半堵墙。' },
  { name: '地毯', icon: <Palette className="w-5 h-5" />, judge: '视觉核心的“地基”，能吸音也能让家具更聚拢。' },
  { name: '挂画', icon: <ImageIcon className="w-5 h-5" />, judge: '墙面的“眼影”，如果不确定就选大幅留白款。' }
];

const BUDGET_TIERS = [
  { id: 'F', name: 'F 先住起来', desc: '先把基础居住功能补齐，核心是性价比与耐用度。', items: '沙发 / 床垫 / 基础照明', suitable: '预算有限、急需入住或打算后续分批补充的家庭。', color: 'bg-blue-50 text-blue-600' },
  { id: 'M', name: 'M 实用舒适', desc: '开始从“能住”进入“住得舒服”，把钱花在刀刃上。', items: '主沙发 / 床垫 / 全屋窗帘 / 主灯', suitable: '预算均衡，希望在客厅和卧室有质感提升的改善家庭。', color: 'bg-emerald-50 text-emerald-600' },
  { id: 'P', name: 'P 改善品质', desc: '多数家庭推荐，开始形成完整的空间风格与材质统一。', items: '全屋家具 / 灯光层次 / 窗帘 / 地毯', suitable: '对审美有明确要求，追求落地效果与风格完整度的家庭。', color: 'bg-amber-50 text-amber-600' },
  { id: 'S', name: 'S 高阶质感', desc: '更适合对长期居住质感有要求的家庭。', items: '全案高定 / 材质管理 / 品牌家具', suitable: '有品牌认知，对细节、光控和材质颗粒度极度挑剔的屋主。', color: 'bg-purple-50 text-purple-600' },
  { id: 'X', name: 'X 国际高配', desc: '接近高端生活方式，追求审美与身份感。', items: '大师单品 / 艺术珍藏 / 全屋智能', suitable: '顶级审美视野，应对社交、接待及艺术鉴赏场景的家庭。', color: 'bg-zinc-100 text-zinc-900' }
];

const STYLES = ["现代简约", "中古风", "意式极简", "原木风", "北欧风", "轻奢"];

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpace, setSelectedSpace] = useState("全部");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [selectedTier, setSelectedTier] = useState("全部");
  const [selectedStyle, setSelectedStyle] = useState("全部");
  const [isScrolled, setIsScrolled] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      setIsScrolled(scrollPos > 200);
      
      // Sticky bar logic - show when we reach products section
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
    if (location.state?.fromPreview) {
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
    if (selectedTier !== "全部") filters.push({ id: 'tier', label: `${selectedTier} 档`, onClear: () => setSelectedTier("全部") });
    if (selectedStyle !== "全部") filters.push({ id: 'style', label: selectedStyle, onClear: () => setSelectedStyle("全部") });
    if (searchQuery) filters.push({ id: 'search', label: `“${searchQuery}”`, onClear: () => setSearchQuery("") });
    return filters;
  }, [selectedSpace, selectedCategory, selectedTier, selectedStyle, searchQuery]);

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(p => {
      const matchSpace = selectedSpace === "全部" || p.space?.includes(selectedSpace);
      const matchCategory = selectedCategory === "全部" || p.category === selectedCategory || (selectedCategory === "床 / 床垫" && (p.category === "床" || p.category === "床垫"));
      const matchTier = selectedTier === "全部" || (
        selectedTier === 'F' ? p.ladderLevel <= 3 :
        selectedTier === 'M' ? (p.ladderLevel > 3 && p.ladderLevel <= 6) :
        selectedTier === 'P' ? (p.ladderLevel > 6 && p.ladderLevel <= 8) :
        selectedTier === 'S' ? (p.ladderLevel === 9) :
        p.ladderLevel === 10
      );
      const matchStyle = selectedStyle === "全部" || p.style?.includes(selectedStyle);
      const matchSearch = !searchQuery || 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSpace && matchCategory && matchTier && matchStyle && matchSearch;
    });
  }, [selectedSpace, selectedCategory, selectedTier, selectedStyle, searchQuery]);

  const handleJoinPlan = (p: Product) => {
    const saved = localStorage.getItem('user_plans');
    const plans = saved ? JSON.parse(saved) : [];
    const currentPlanId = localStorage.getItem('current_plan_id');
    
    if (currentPlanId) {
      const updatedPlans = plans.map((plan: any) => {
        if (plan.id === currentPlanId) {
          const products = plan.products || [];
          if (!products.find((item: any) => item.id === p.id)) {
            return { ...plan, products: [...products, p] };
          }
        }
        return plan;
      });
      localStorage.setItem('user_plans', JSON.stringify(updatedPlans));
      const planName = plans.find((pl: any) => pl.id === currentPlanId)?.name;
      alert(`已成功加入我的方案：${planName}`);
    } else if (plans.length > 0) {
      if (confirm(`选择加入方案：${plans[0].name}？`)) {
        const updatedPlans = plans.map((plan: any, i: number) => {
          if (i === 0) {
             const products = plan.products || [];
             return { ...plan, products: [...products, p] };
          }
          return plan;
        });
        localStorage.setItem('user_plans', JSON.stringify(updatedPlans));
        alert(`已加入方案：${plans[0].name}`);
      }
    } else {
      if (confirm('当前没有活跃方案，是否立即新建一个方案？')) {
        navigate('/match');
      }
    }
  };

  const handleJoinLibrary = (p: Product) => {
    const library = JSON.parse(localStorage.getItem('product_library') || '[]');
    if (!library.find((item: any) => item.id === p.id)) {
      localStorage.setItem('product_library', JSON.stringify([...library, p]));
      alert('已加入灵感产品库！');
    } else {
      alert('产品已在库中。');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1D1D1F] pb-32">
      {/* 0. Sticky Product Toolbar */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-[100px] left-0 right-0 z-[400] px-6 hidden md:flex justify-center pointer-events-none"
          >
            <div className="w-full max-w-5xl h-16 bg-white/80 backdrop-blur-3xl border border-black/5 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] pointer-events-auto flex items-center px-4 gap-4">
               <div className="pl-4 pr-6 border-r border-gray-100 hidden lg:block">
                  <span className="text-[13px] font-black whitespace-nowrap">探索所有产品</span>
                  <p className="text-[10px] text-gray-400 font-bold">{filteredProducts.length} 款严选</p>
               </div>
               
               {/* Mini Search */}
               <div className="flex-1 relative">
                  <input 
                    type="text"
                    placeholder="搜索沙发、床、灯具..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    className="w-full h-10 pl-10 pr-4 bg-gray-50 border-none rounded-full text-[13px] font-medium focus:ring-2 focus:ring-brand/20 transition-all"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               </div>

               {/* Quick Selects */}
               <div className="flex items-center gap-2">
                  <select 
                    value={selectedSpace}
                    onChange={(e) => setSelectedSpace(e.target.value)}
                    className="h-10 px-4 bg-gray-50/50 hover:bg-gray-100 rounded-full text-[12px] font-black border-none focus:ring-0 cursor-pointer transition-all"
                  >
                    <option value="全部">全部空间</option>
                    {SPACES.filter(s => s.id !== 'all').map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                  <select 
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="h-10 px-4 bg-gray-50/50 hover:bg-gray-100 rounded-full text-[12px] font-black border-none focus:ring-0 cursor-pointer transition-all"
                  >
                    <option value="全部">全部预算</option>
                    {["F", "M", "P", "S", "X"].map(t => <option key={t} value={t}>{t} 档</option>)}
                  </select>
                  <button 
                    onClick={() => setIsFilterOpen(true)}
                    className="h-10 px-5 bg-black text-white rounded-full text-[12px] font-black flex items-center gap-2 hover:bg-zinc-800 transition-all"
                  >
                    <Filter className="w-3.5 h-3.5" /> 筛选
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[1001] shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                 <h2 className="text-[24px] font-black">筛选产品</h2>
                 <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-all"
                 >
                   <X className="w-5 h-5" />
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-12">
                 {/* Filter Sections */}
                 <div className="space-y-6">
                    <h3 className="text-[11px] font-black text-brand uppercase tracking-widest">按空间</h3>
                    <div className="flex flex-wrap gap-2">
                       {["全部", ...SPACES.map(s => s.name)].map(s => (
                         <button 
                          key={s}
                          onClick={() => setSelectedSpace(s)}
                          className={`px-5 py-2.5 rounded-full text-[13px] font-black border transition-all ${selectedSpace === s ? 'bg-brand text-white border-brand' : 'border-gray-100 text-gray-500 hover:border-gray-300'}`}
                         >
                           {s}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h3 className="text-[11px] font-black text-brand uppercase tracking-widest">按预算档位</h3>
                    <div className="grid grid-cols-3 gap-2">
                       {["全部", "F", "M", "P", "S", "X"].map(t => (
                         <button 
                          key={t}
                          onClick={() => setSelectedTier(t)}
                          className={`py-3 rounded-2xl text-[14px] font-black border transition-all ${selectedTier === t ? 'bg-black text-white border-black' : 'border-gray-100 text-gray-500 hover:border-gray-300'}`}
                         >
                           {t} {t !== "全部" && "档"}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h3 className="text-[11px] font-black text-brand uppercase tracking-widest">按品类</h3>
                    <div className="grid grid-cols-2 gap-2">
                       {CATEGORIES.map(cat => (
                         <button 
                          key={cat.name}
                          onClick={() => setSelectedCategory(cat.name)}
                          className={`py-3 px-4 rounded-2xl text-[13px] font-black border transition-all text-left flex items-center gap-3 ${selectedCategory === cat.name ? 'bg-black text-white border-black' : 'border-gray-100 text-gray-500 hover:border-gray-300'}`}
                         >
                           <span className="opacity-50">{cat.icon}</span>
                           {cat.name}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h3 className="text-[11px] font-black text-brand uppercase tracking-widest">设计风格</h3>
                    <div className="grid grid-cols-2 gap-2">
                       {STYLES.map(style => (
                         <button 
                          key={style}
                          onClick={() => setSelectedStyle(style)}
                          className={`py-3 px-4 rounded-2xl text-[13px] font-black border transition-all ${selectedStyle === style ? 'bg-black text-white border-black' : 'border-gray-100 text-gray-500 hover:border-gray-300'}`}
                         >
                           {style}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h3 className="text-[11px] font-black text-brand uppercase tracking-widest">家有特殊成员</h3>
                    <div className="flex flex-wrap gap-2">
                       {["有孩子", "有宠物", "容易清洁", "小户型", "长期居住"].map(tag => (
                         <button 
                          key={tag}
                          className="px-5 py-2.5 border border-gray-100 rounded-full text-[13px] font-bold text-gray-400 hover:border-gray-300 transition-all"
                         >
                           {tag}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="p-8 border-t border-gray-100 grid grid-cols-2 gap-4 bg-gray-50/50">
                 <button onClick={clearFilters} className="py-4 bg-white border border-gray-200 rounded-2xl text-[15px] font-black hover:bg-gray-100 transition-all">
                    清空已选
                 </button>
                 <button onClick={() => setIsFilterOpen(false)} className="py-4 bg-brand text-white rounded-2xl text-[15px] font-black hover:scale-[1.02] transition-all">
                    查看 {filteredProducts.length} 件产品
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchFocused && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchFocused(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[1000]"
            />
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
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
                <button onClick={() => setIsSearchFocused(false)}>
                  <X className="w-6 h-6 text-gray-400 hover:text-black" />
                </button>
              </div>

              <div className="space-y-6">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">常用搜索建议</h3>
                <div className="flex flex-wrap gap-2">
                  {["沙发", "床垫", "客厅灯", "M2 客厅", "现代简约沙发", "适合小户型"].map(tag => (
                    <button 
                      key={tag}
                      onClick={() => { setSearchQuery(tag); setIsSearchFocused(false); }}
                      className="px-6 py-3 bg-gray-50 hover:bg-brand hover:text-white rounded-full text-[14px] font-black transition-all"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 1. Header Hero - Apple Style */}
      <section className="relative h-[85vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden bg-white">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-4xl"
        >
          {location.state?.fromPreview && (
            <button 
              onClick={handleReturnToPreview}
              className="mb-10 inline-flex items-center gap-2.5 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-full text-[14px] font-black transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> 返回方案预览
            </button>
          )}
          <h2 className="text-[14px] font-black text-brand uppercase tracking-[0.4em] mb-8">ALL PRODUCTS</h2>
          <h1 className="text-[64px] md:text-[96px] font-black leading-[1] tracking-tight mb-8">
            不是更多选择，<br />
            是更容易选对。
          </h1>
          <p className="text-[18px] md:text-[24px] text-gray-500 font-medium max-w-2xl mx-auto mb-16 leading-relaxed">
            按空间、预算和风格重新组织家具选择，从沙发、床、餐桌到灯具软装，快速找到适合你家的产品。
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <button 
              onClick={() => document.getElementById('classification')?.scrollIntoView({ behavior: 'smooth' })} 
              className="px-12 py-5.5 bg-[#1D1D1F] text-white rounded-full font-black text-[17px] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20"
            >
              按空间看
            </button>
            <button 
              onClick={() => document.getElementById('tiers')?.scrollIntoView({ behavior: 'smooth' })} 
              className="px-12 py-5.5 bg-gray-100 text-gray-900 rounded-full font-black text-[17px] hover:scale-105 active:scale-95 transition-all"
            >
              按预算看
            </button>
          </div>
        </motion.div>
        
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(circle, #2dd4bf 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </section>

      {/* 2. Classification Grid - Categories as Entries */}
      <section id="classification" className="max-w-[1720px] mx-auto px-6 md:px-12 py-32 border-t border-gray-100">
        <div className="text-center mb-24">
          <h2 className="text-[42px] font-black mb-4 tracking-tight">在这里，选对你的第一个大件</h2>
          <p className="text-gray-400 text-[18px] font-medium">六大空间系统，覆盖全屋软装每一处决策点</p>
        </div>

        {/* Space Navigation Clusters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {SPACES.map((space) => (
            <motion.div 
              key={space.id}
              whileHover={{ y: -12 }}
              onClick={() => { setSelectedSpace(space.name); document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="group relative p-10 bg-white border border-gray-100 rounded-[48px] shadow-sm hover:shadow-3xl hover:border-brand/30 transition-all cursor-pointer overflow-hidden flex flex-col items-start"
            >
              <div className="w-16 h-16 rounded-[24px] bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand group-hover:text-white transition-all mb-8 shadow-sm">
                {space.icon}
              </div>
              <h3 className="text-[24px] font-black mb-3">{space.name}</h3>
              <p className="text-[15px] text-gray-400 leading-relaxed font-medium mb-6">{space.desc}</p>
              <div className="mt-auto flex items-center gap-2 text-brand font-black text-[14px] opacity-0 group-hover:opacity-100 transition-all">
                进入库中筛选 <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Expert Judgment Entry Points */}
        <div className="pt-12 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-12">
             <div className="w-2 h-8 bg-brand rounded-full" />
             <h3 className="text-[22px] font-black uppercase tracking-tight">按品类探索 / 决策建议</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat) => (
              <div 
                key={cat.name}
                onClick={() => { setSelectedCategory(cat.name); document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="p-8 bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-200 rounded-[40px] transition-all cursor-pointer group hover:shadow-xl"
              >
                <div className="flex items-center gap-5 mb-5">
                  <div className="w-12 h-12 rounded-[20px] bg-white flex items-center justify-center text-gray-400 shadow-sm transition-all group-hover:scale-110 group-hover:text-brand">
                    {cat.icon}
                  </div>
                  <span className="text-[18px] font-black">{cat.name}</span>
                </div>
                <div className="relative">
                  <MessageSquare className="absolute -left-1 -top-1 w-4 h-4 text-brand/20" />
                  <p className="text-[14px] text-gray-500 font-medium leading-relaxed pl-5">
                    {cat.judge}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Budget Tiers System */}
      <section id="tiers" className="bg-[#111111] text-white py-40 px-6 overflow-hidden">
        <div className="max-w-[1720px] mx-auto">
          <div className="max-w-3xl mb-24">
            <h2 className="text-[56px] font-black mb-6 tracking-tight">预算分配的秘密</h2>
            <p className="text-gray-400 text-[20px] leading-relaxed">
              我们根据全球数万个交付样本，将家具配置划分为五个专业层级。了解每一档的“投入重点”，比单纯看价格更有价值。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {BUDGET_TIERS.map((tier) => (
              <motion.div 
                key={tier.id}
                whileHover={{ y: -16 }}
                onClick={() => { setSelectedTier(tier.id); document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="group bg-white/5 border border-white/10 p-10 rounded-[56px] flex flex-col cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all h-full"
              >
                <div className={`w-16 h-16 rounded-[28px] ${tier.color} flex items-center justify-center text-[24px] font-black mb-10 shadow-2xl transition-transform group-hover:scale-110`}>
                  {tier.id}
                </div>
                <h3 className="text-[26px] font-black mb-5">{tier.name}</h3>
                <p className="text-[15px] text-white/50 leading-relaxed mb-10 flex-1">{tier.desc}</p>
                <div className="space-y-8 mb-10">
                  <div className="bg-white/5 p-5 rounded-[24px] border border-white/5">
                    <span className="text-[11px] text-brand uppercase tracking-widest block mb-2 font-black">优先看</span>
                    <p className="text-[14px] font-black text-white/90">{tier.items}</p>
                  </div>
                  <div className="px-5">
                    <p className="text-[13px] text-white/30 leading-relaxed font-medium">{tier.suitable}</p>
                  </div>
                </div>
                <button className="w-full py-5 rounded-[24px] bg-white/10 hover:bg-white hover:text-black font-black text-[15px] transition-all flex items-center justify-center gap-2">
                  浏览此档家具 <ArrowUpRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Product Grid & Real Sifting */}
      <section id="products-section" className="max-w-[1720px] mx-auto px-6 md:px-12 py-32 bg-white scroll-mt-24">
        <div className="flex flex-col gap-12 mb-16 px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="max-w-2xl">
              <h2 className="text-[48px] font-black mb-4 tracking-tighter">探索所有产品</h2>
              <div className="flex items-center gap-3 text-gray-400 font-bold">
                 <Package className="w-5 h-5 text-brand" />
                 <span>共发现 {filteredProducts.length} 款严选家具</span>
                 <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                 <span className="text-brand">正在按当前筛选展示</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
                {/* Search Trigger */}
                <button 
                  onClick={() => setIsSearchFocused(true)}
                  className="group flex items-center gap-3 px-6 h-14 bg-gray-50 border border-transparent hover:border-brand/20 hover:bg-white rounded-[22px] transition-all"
                >
                   <Search className="w-5 h-5 text-gray-400 group-hover:text-brand" />
                   <span className="text-gray-400 font-black text-[15px] group-hover:text-black">搜索沙发、床、灯具或风格...</span>
                </button>

                <button 
                  onClick={() => setIsFilterOpen(true)}
                  className="px-8 h-14 bg-black text-white rounded-[22px] text-[15px] font-black flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
                >
                  <Filter className="w-4 h-4" /> 高级筛选
                </button>
            </div>
          </div>

          {/* Active Filter Chips */}
          <div className="flex flex-wrap items-center gap-3">
             <AnimatePresence>
                {activeFilters.map(filter => (
                  <motion.div 
                    key={`${filter.id}-${filter.label}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-brand/5 border border-brand/20 text-brand rounded-full text-[13px] font-black"
                  >
                    {filter.label}
                    <button onClick={filter.onClear} className="hover:bg-brand/10 p-0.5 rounded-full transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
             </AnimatePresence>
             {activeFilters.length > 0 && (
               <button 
                onClick={clearFilters}
                className="text-[13px] font-black text-gray-400 hover:text-red-500 transition-colors ml-2"
               >
                 清空全部
               </button>
             )}
          </div>
        </div>

        {/* Product Cards with "Expert Judgment" footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-12">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="group relative flex flex-col bg-white rounded-[56px] border border-gray-50 shadow-sm hover:shadow-4xl hover:border-brand/40 overflow-hidden transition-all h-full"
              >
                {/* Visual Area */}
                <div className="relative h-[340px] overflow-hidden bg-gray-50">
                  <img src={product.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Badges */}
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className="px-4 py-1.5 bg-white/95 backdrop-blur-md rounded-[14px] text-[11px] font-black shadow-sm text-gray-900 border border-white/50">
                      {product.style[0]}
                    </span>
                    <span className="px-4 py-1.5 bg-brand text-white rounded-[14px] text-[11px] font-black shadow-lg shadow-brand/20">
                      适配 P{product.ladderLevel} / {product.space[0]}
                    </span>
                  </div>
                  
                  {/* Quick Action Overlay */}
                  <div className="absolute bottom-6 left-6 right-6 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="flex gap-2">
                       <button 
                        onClick={(e) => { e.preventDefault(); handleJoinPlan(product); }}
                        className="flex-1 h-12 bg-brand text-white rounded-2xl text-[13px] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                       >
                         加入我的方案
                       </button>
                       <button 
                         onClick={(e) => { e.preventDefault(); handleJoinLibrary(product); }}
                         className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-2xl flex items-center justify-center shadow-2xl hover:bg-white/20 transition-all"
                       >
                         <Heart className="w-5 h-5" />
                       </button>
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-8 flex flex-col flex-1">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em]">{product.brand}</span>
                       <span className="w-1 h-1 rounded-full bg-gray-200" />
                       <span className="text-[11px] text-brand/60 font-black">{product.category}</span>
                    </div>
                    <h3 className="text-[20px] font-black text-gray-800 leading-tight group-hover:text-brand transition-colors mb-2">{product.name}</h3>
                    {searchQuery && (
                      <div className="flex items-center gap-1 mb-4 text-[12px] font-bold text-brand bg-brand/5 px-2 py-0.5 rounded-md self-start">
                        <Search className="w-3 h-3" /> 符合 “{searchQuery}”
                      </div>
                    )}
                    <div className="text-[24px] font-black text-gray-900 mt-auto">
                       ¥{product.price.toLocaleString()}
                       <span className="text-[12px] text-gray-400 font-bold ml-2 uppercase">RMB</span>
                    </div>
                  </div>
                  
                  {/* Bottom Line Bro Judgment Section */}
                  <div className="mt-auto pt-8 border-t border-gray-50">
                    <div className="relative p-5 bg-gray-50/50 rounded-[32px] border border-transparent group-hover:border-brand/10 transition-colors">
                       <div className="absolute -left-2 top-4 w-1 h-6 bg-brand/40 rounded-full" />
                       <span className="text-[10px] text-brand font-black uppercase tracking-widest block mb-3">底线哥判断</span>
                       <p className="text-[13px] text-gray-500 leading-relaxed font-medium italic">
                         “{product.recommendationReason || "这款设计在 P-级方案中是绝对的 C 位首选，坐感与视觉平衡度极高。”"}
                       </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
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
             <button onClick={() => setSelectedTier("全部")} className="px-10 py-4 bg-brand text-white rounded-full font-black shadow-xl shadow-brand/20">
                重置预算档位
             </button>
          </div>
        )}
      </section>

      {/* 6. Professional Footer Decision Center */}
      <footer className="bg-gray-50 py-40 border-t border-gray-100">
        <div className="max-w-[1720px] mx-auto px-12 grid grid-cols-1 lg:grid-cols-2 gap-32">
          <div className="max-w-xl">
             <h3 className="text-[42px] font-black mb-10 tracking-tight leading-tight">这不是普通的产品库，<br />是一个帮家庭做决策的系统。</h3>
             <p className="text-gray-500 text-[18px] leading-relaxed mb-12">
               在这里，每一件家具都被赋予了明确的空间意义与预算层级。我们不根据销量推荐，只根据“适配度”和“生活质量”推荐。如果你感到迷茫，请直接进入 AI 评估。
             </p>
             <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col">
                  <span className="text-brand font-black text-[28px]">A+</span>
                  <p className="text-gray-400 text-[14px] font-bold">同品类品质严控标准</p>
                </div>
                <div className="flex flex-col">
                  <span className="text-brand font-black text-[28px]">10+</span>
                  <p className="text-gray-400 text-[14px] font-bold">全屋家具配置方案层级</p>
                </div>
             </div>
          </div>
          
          <div className="bg-[#1D1D1F] p-16 rounded-[64px] text-white flex flex-col justify-center relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-80 h-80 bg-brand/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
             <div className="relative z-10">
               <Sparkles className="w-12 h-12 text-brand mb-8" />
               <h4 className="text-[32px] font-black mb-6">如果你还是不知道怎么选？</h4>
               <p className="text-white/40 text-[16px] leading-relaxed mb-12 font-medium">
                 告诉 AI 你的装修预算、家庭成员构成以及对风格的模糊偏好。我们将从这 60+ 核心 SKU 中，为你生成 1 套独属于你家的必买清单。
               </p>
               <button className="px-12 py-5.5 bg-brand text-white rounded-full font-black text-[17px] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand/30">
                  开启 AI 帮我筛产品
               </button>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
