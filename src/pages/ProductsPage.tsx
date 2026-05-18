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
  { name: '沙发/休闲椅', icon: <Sofa className="w-5 h-5" /> },
  { name: '床铺/床垫', icon: <Bed className="w-5 h-5" /> },
  { name: '餐桌/书桌', icon: <Table className="w-5 h-5" /> },
  { name: '柜类/收纳', icon: <Archive className="w-5 h-5" /> },
  { name: '灯具/光影', icon: <Lamp className="w-5 h-5" /> },
  { name: '地毯/窗帘', icon: <Waves className="w-5 h-5" /> }
];

const SPACES = [
  { id: 'living', name: '客厅', icon: <Sofa className="w-5 h-5" /> },
  { id: 'bedroom', name: '卧室', icon: <Bed className="w-5 h-5" /> },
  { id: 'dining', name: '餐厨', icon: <Table className="w-5 h-5" /> },
  { id: 'workspace', name: '书房', icon: <Archive className="w-5 h-5" /> }
];

const STYLES = ['现代简约', '中古风', '意式极简', '原木风', '北欧风', '轻奢'];

const BUDGET_SERIES = [
  { code: 'F', priceRange: '2万以内', title: '基础入住', color: 'bg-[#10b981]' },
  { code: 'M', priceRange: '2-5万', title: '实用进阶', color: 'bg-[#3b82f6]' },
  { code: 'P', priceRange: '5-15万', title: '专业设计', color: 'bg-[#06b6d4]' },
  { code: 'S', priceRange: '15-50万', title: '奢华定制', color: 'bg-[#f59e0b]' },
  { code: 'X', priceRange: '50万以上', title: '艺术馆级', color: 'bg-[#f43f5e]' }
];

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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fromPlanId = searchParams.get('fromPlan');
  const isRecommendedView = searchParams.get('recommendedOnly') === 'true';
  const fromCaseParam = searchParams.get('fromCase');

  useEffect(() => {
    loadMembership();
    loadProducts();
    analyticsService.track('page_view', { page: 'products_page' });
  }, [selectedSpace, selectedCategory, selectedTier, selectedStyle, searchQuery]);

  const loadMembership = async () => {
    const [m, u] = await Promise.all([membershipService.getCurrentUserMembership(), authService.getCurrentUser()]);
    setMembership(m);
    setUser(u);
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts({
        category: selectedCategory !== '全部' ? selectedCategory : undefined,
        tier: selectedTier !== '全部' ? selectedTier : undefined,
        style: selectedStyle !== '全部' ? selectedStyle : undefined,
        search: searchQuery || undefined
      });
      const spaceFiltered = selectedSpace === '全部' ? data : data.filter(p => p.space?.includes(selectedSpace));
      setProducts(spaceFiltered);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToPreview = () => {
    if (fromPlanId) navigate(`/my-plans?planId=${fromPlanId}`);
    else if (location.state?.fromPreview) navigate('/', { state: { ...location.state, showPlan: true } });
    else navigate('/ladder');
  };

  const clearFilters = () => { setSelectedSpace("全部"); setSelectedCategory("全部"); setSelectedTier("全部"); setSelectedStyle("全部"); setSearchQuery(""); };

  const activeFilters = useMemo(() => {
    const filters = [];
    if (selectedSpace !== "全部") filters.push({ id: 'space', label: selectedSpace, onClear: () => setSelectedSpace("全部") });
    if (selectedCategory !== "全部") filters.push({ id: 'category', label: selectedCategory, onClear: () => setSelectedCategory("全部") });
    if (selectedTier !== "全部") filters.push({ id: 'tier', label: `${selectedTier}系列`, onClear: () => setSelectedTier("全部") });
    if (selectedStyle !== "全部") filters.push({ id: 'style', label: selectedStyle, onClear: () => setSelectedStyle("全部") });
    if (searchQuery) filters.push({ id: 'search', label: searchQuery, onClear: () => setSearchQuery("") });
    return filters;
  }, [selectedSpace, selectedCategory, selectedTier, selectedStyle, searchQuery]);

  const handleJoinPlan = (p: Product) => { setSelectedProductForModal(p); setIsAddModalOpen(true); };
  const handleJoinLibrary = async (p: Product) => {
    try {
      await libraryService.addToLibrary(p.id);
      setToastMessage('已加入灵感图库');
    } catch { setToastMessage('已存在于库中'); }
  };

  return (
    <main className="min-h-screen bg-[#FDFDFD] text-[#1D1D1F] pt-24 md:pt-32 pb-40 overflow-x-hidden text-left">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="hidden md:block mb-10"><Breadcrumbs items={[{ name: '产品库' }]} /></div>

        <header className="mb-12 md:mb-20">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div className="flex-1">
               {(location.state?.fromPreview || fromPlanId) && (
                 <button onClick={handleReturnToPreview} className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-[12px] font-black uppercase"><ArrowLeft className="w-3.5 h-3.5" /> 返回查看方案</button>
               )}
               <h1 className="text-[36px] md:text-[64px] font-black leading-none mb-4 tracking-tighter">探索选品库</h1>
               <div className="flex items-center gap-4">
                  <span className="text-[14px] md:text-[18px] text-gray-400 font-bold italic">{products.length} 款严选单品</span>
                  <div className="px-3 py-1 bg-brand/10 text-brand text-[10px] font-black rounded-full border border-brand/20 uppercase tracking-widest">{membership ? '会员权益已生效' : '游客模式'}</div>
               </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
               <div className="flex-1 md:w-[320px] relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type="text" placeholder="搜索家具..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-12 pl-11 pr-4 bg-gray-50 border-none rounded-xl text-[14px] font-bold outline-none focus:ring-1 ring-brand" />
               </div>
               <button onClick={() => setIsFilterOpen(true)} className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg"><Filter className="w-5 h-5" /></button>
            </div>
          </div>
        </header>

        {isRecommendedView && (
          <div className="mb-12 p-6 bg-brand/5 border border-brand/10 rounded-[32px] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-brand text-white rounded-2xl flex items-center justify-center shrink-0"><Sparkles className="w-6 h-6" /></div>
              <div><h4 className="text-[16px] font-black">AI 推荐清单：{fromCaseParam}</h4><p className="text-[12px] text-brand/60 font-bold">已为您筛选适配当前户型比例的单品</p></div>
            </div>
            <button className="w-full sm:w-auto px-10 h-14 bg-brand text-white rounded-full text-[14px] font-black active:scale-95 transition-all">按此同步生成方案</button>
          </div>
        )}

        <section className="mb-12">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              {activeFilters.map(f => (
                <button key={f.id} onClick={f.onClear} className="flex-shrink-0 flex items-center gap-2 px-4 h-9 bg-gray-100 rounded-full text-[12px] font-black text-gray-500 hover:text-black transition-colors">{f.label} <X className="w-3.5 h-3.5" /></button>
              ))}
              {activeFilters.length > 0 && <button onClick={clearFilters} className="text-[12px] font-black text-red-500 ml-2 whitespace-nowrap">重置全部</button>}
            </div>
        </section>

        {loading ? (
          <div className="py-40 flex items-center justify-center"><RefreshCw className="w-10 h-10 text-brand animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
            <AnimatePresence mode="popLayout">
              {products.map((p) => (
                <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="group flex flex-col bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all overflow-hidden h-full">
                  <Link to={`/product/${p.id}`} className="aspect-[4/3] bg-gray-50 overflow-hidden relative">
                    <img src={p.image || null} className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-110" alt={p.name} />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md text-white text-[9px] font-black rounded-md uppercase tracking-widest">{p.brand}</div>
                  </Link>
                  <div className="p-6 md:p-8 flex flex-col flex-1 text-left">
                    <div className="flex items-center gap-2 mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><span>{p.category}</span></div>
                    <h3 className="text-[16px] md:text-[18px] font-black text-zinc-900 leading-tight mb-4 flex-1 line-clamp-2">{p.name}</h3>
                    <div className="mt-auto">
                       <p className="text-[20px] md:text-[24px] font-black text-zinc-900 mb-6 italic leading-none">¥{p.price.toLocaleString()}</p>
                       <div className="flex gap-2">
                         <button onClick={() => handleJoinPlan(p)} className="flex-1 h-12 bg-zinc-900 text-white rounded-xl text-[12px] font-black active:scale-95 transition-all">加入方案</button>
                         <button onClick={() => handleJoinLibrary(p)} className="w-12 h-12 bg-zinc-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-brand/10 hover:text-brand transition-colors"><Heart className="w-5 h-5" /></button>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {products.length === 0 && (
              <div className="col-span-full py-40 flex flex-col items-center text-gray-200">
                 <Package className="w-16 h-16 mb-4" /><p className="text-[18px] font-black italic">未适配到符合条件的选品</p>
              </div>
            )}
          </div>
        )}

        <section className="mt-24 pt-24 border-t border-gray-100">
           <h3 className="text-[20px] md:text-[24px] font-black text-zinc-900 mb-10">快速筛选标签</h3>
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {SPACES.map(s => (
                <button key={s.id} onClick={() => setSelectedSpace(s.name)} className={`p-6 rounded-[24px] border flex flex-col items-start gap-4 transition-all ${selectedSpace === s.name ? 'bg-brand/5 border-brand ring-1 ring-brand' : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'}`}>
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedSpace === s.name ? 'bg-brand text-white' : 'bg-gray-50 text-gray-500'}`}>{s.icon}</div>
                   <span className={`text-[15px] font-black ${selectedSpace === s.name ? 'text-zinc-900' : 'text-zinc-500'}`}>{s.name}空间</span>
                </button>
              ))}
           </div>
        </section>
      </div>

      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFilterOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]" />
            <motion.div initial={window.innerWidth > 768 ? { x: '100%' } : { y: '100%' }} animate={window.innerWidth > 768 ? { x: 0 } : { y: 0 }} exit={window.innerWidth > 768 ? { x: '100%' } : { y: '100%' }} className="fixed bottom-0 md:top-0 right-0 w-full md:w-[460px] h-[85vh] md:h-screen bg-white z-[1001] shadow-2xl flex flex-col rounded-t-[40px] md:rounded-none overflow-hidden text-left">
               <div className="p-8 md:p-10 flex justify-between items-center border-b border-gray-50">
                  <h2 className="text-[22px] md:text-[26px] font-black italic">高级筛选</h2>
                  <button onClick={() => setIsFilterOpen(false)} className="w-11 h-11 bg-gray-50 rounded-full flex items-center justify-center text-gray-400"><X className="w-6 h-6" /></button>
               </div>
               <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-12 no-scrollbar pb-32">
                  <section className="space-y-4">
                     <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">空间定位 / Space</span>
                     <div className="flex flex-wrap gap-2">
                        {["全部", ...SPACES.map(s => s.name)].map(s => <button key={s} onClick={() => setSelectedSpace(s)} className={`px-5 py-2.5 rounded-xl text-[14px] font-black transition-all ${selectedSpace === s ? 'bg-zinc-900 text-white shadow-xl' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>{s}</button>)}
                     </div>
                  </section>
                  <section className="space-y-4">
                     <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">预算体系 / Budget</span>
                     <div className="grid grid-cols-2 gap-3">
                        {[{ code: '全部', title: '全档位', color: 'bg-gray-400' }, ...BUDGET_SERIES].map(s => <button key={s.code} onClick={() => setSelectedTier(s.code)} className={`p-5 rounded-2xl border transition-all flex flex-col items-start gap-3 ${selectedTier === s.code ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xl' : 'bg-white border-gray-100 hover:border-gray-200'}`}><div className={`w-3 h-3 rounded-full ${s.color}`} /><span className="text-[14px] font-black italic">{s.code} {s.title}</span></button>)}
                     </div>
                  </section>
                  <section className="space-y-4">
                     <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">审美调性 / Style</span>
                     <div className="grid grid-cols-2 gap-3">
                        {["全部", ...STYLES].map(s => <button key={s} onClick={() => setSelectedStyle(s)} className={`p-4 rounded-xl border text-[14px] font-black transition-all ${selectedStyle === s ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-gray-100 hover:border-gray-200'}`}>{s}</button>)}
                     </div>
                  </section>
               </div>
               <div className="p-8 border-t border-gray-50 bg-gray-50/50 flex gap-4">
                  <button onClick={clearFilters} className="flex-1 h-14 bg-white text-zinc-400 rounded-2xl font-black border border-gray-100">重置</button>
                  <button onClick={() => setIsFilterOpen(false)} className="flex-[2] h-14 bg-zinc-900 text-white rounded-2xl font-black shadow-xl">完成筛选</button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AddToPlanModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} product={selectedProductForModal} onToast={(msg) => setToastMessage(msg)} prioritizedPlanId={fromPlanId || undefined} />
      <Toast message={toastMessage} onClear={() => setToastMessage(null)} />
    </main>
  );
}
