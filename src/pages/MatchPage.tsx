import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, ChevronRight, X, Upload, CheckCircle2, ArrowLeft,
  Layout, Layers, Palette, Users, Target, ArrowRight, Plus, Zap,
  ShoppingBag, Home, MessageSquare, AlertCircle, HelpCircle,
  ShieldCheck, TrendingDown, ChevronDown, Box, Heart, Trash2, Edit3,
  RefreshCw
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { planService } from '../services/planService';
import { libraryService } from '../services/libraryService';
import { analyticsService } from '../services/analyticsService';
import { membershipService } from '../services/membershipService';
import { UserMembership } from '../types/business';
import { Plan, Product } from '../types/business';
import PlanDetailView from '../components/PlanDetailView';
import Toast from '../components/Toast';
import ErrorBoundary from '../components/ErrorBoundary';

import AddToPlanModal from '../components/AddToPlanModal';
import EditPlanModal from '../components/EditPlanModal';
import ConfirmDialog from '../components/ConfirmDialog';

type MatchState = 'WORKSPACE' | 'PLAN_DETAIL' | 'UPLOAD_FLOW' | 'MANUAL_FILL';
type WorkspaceTab = 'plans' | 'library';

export default function MatchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [viewState, setViewState] = useState<MatchState>('WORKSPACE');
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('plans');
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [productLibrary, setProductLibrary] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; action?: { label: string; onClick: () => void } } | null>(null);

  const showToast = (message: string, action?: { label: string; onClick: () => void }) => {
    setToast({ message, action });
  };

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchParams] = useSearchParams();
  const planIdFromQuery = searchParams.get('planId');
  const tabFromQuery = searchParams.get('tab');
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<any | null>(null);

  useEffect(() => {
    loadData();
    analyticsService.track('page_view', { page: 'match_page' });

    const openId = location.state?.openPlanId || planIdFromQuery;
    if (openId) {
      setCurrentPlanId(openId);
      setViewState('PLAN_DETAIL');
      if (location.state?.openPlanId) {
        window.history.replaceState({}, document.title);
      }
    } else if (viewState === 'PLAN_DETAIL' && !planIdFromQuery) {
      setViewState('WORKSPACE');
      setCurrentPlanId(null);
    }
  }, [location.state, planIdFromQuery, workspaceTab, viewState]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [m, data] = await Promise.all([
        membershipService.getCurrentUserMembership(),
        planService.getPlans()
      ]);
      setMembership(m);
      setPlans(data);
      if (workspaceTab === 'library') {
        const lib = await libraryService.getLibrary();
        setProductLibrary(lib);
      }
    } finally { setLoading(false); }
  };

  const isProfessional = membership?.member_type === 'professional' || membership?.member_type === 'agent';
  const currentPlan = plans.find(p => p.id === currentPlanId);

  const formatPlanDate = (plan: any) => {
    const raw = plan.updated_at || plan.updatedAt || plan.created_at || plan.createdAt;
    const date = raw ? new Date(raw) : null;
    if (!date || Number.isNaN(date.getTime())) return '刚刚';
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const handleUpdatePlan = async (patch: any) => {
    if (!editingPlan) return;
    try {
      await planService.updatePlan(editingPlan.id, patch);
      await loadData();
      showToast('方案已更新');
      analyticsService.track('update_plan', { plan_id: editingPlan.id });
    } catch (e: any) { showToast(`更新失败: ${e.message || '请稍后重试'}`); }
  };

  const handleDeletePlan = async () => {
    if (!deletingPlan) return;
    try {
      await planService.deletePlan(deletingPlan.id);
      if (currentPlanId === deletingPlan.id) {
        setViewState('WORKSPACE');
        setCurrentPlanId(null);
        navigate(location.pathname);
      }
      await loadData();
      showToast('方案已删除');
      analyticsService.track('delete_plan', { plan_id: deletingPlan.id });
    } catch (e: any) { showToast(`删除失败: ${e.message || '请稍后重试'}`); } finally { setDeletingPlan(null); }
  };

  const handleCreatePlan = async () => {
    try {
      const now = new Date();
      const defaultName = `方案 ${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
      const newPlan = await planService.createPlan({ name: defaultName, area_range: '90-120㎡', spaces: ['客厅', '主卧'], style: '现代简约' });
      setPlans(prev => [newPlan, ...prev]);
      navigate(`?planId=${newPlan.id}`);
      showToast('新方案已创建');
      analyticsService.track('create_plan', { plan_id: newPlan.id });
    } catch (e: any) { showToast(`创建失败: ${e.message}`); }
  };

  const renderWorkspace = () => (
    <div className="w-full max-w-7xl mx-auto px-6 py-10 md:py-16 text-left">
      <header className="mb-12 md:mb-20">
        <h1 className="text-[36px] md:text-[56px] font-black text-white italic tracking-tighter leading-none mb-4 uppercase">My Workspace</h1>
        <p className="text-[14px] md:text-[18px] text-white/30 font-medium italic">管理你的 AI 软装方案与灵感产品库</p>
      </header>

      <div className="flex overflow-x-auto no-scrollbar border-b border-white/5 mb-10 md:mb-16 -mx-6 px-6">
        {[
          { id: 'plans', label: '我的方案', count: plans.length },
          { id: 'library', label: '收藏单品', count: productLibrary.length }
        ].map(tab => (
          <button 
            key={tab.id} onClick={() => setWorkspaceTab(tab.id as any)}
            className={`px-8 py-5 text-[15px] md:text-[17px] font-black transition-all relative whitespace-nowrap ${workspaceTab === tab.id ? 'text-brand' : 'text-white/20 hover:text-white'}`}
          >
            <span className="italic">{tab.label}</span> <span className="ml-2 opacity-30 text-[11px] font-bold">{tab.count}</span>
            {workspaceTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand shadow-[0_0_15px_rgba(0,201,190,0.5)]" />}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {loading ? (
          <div className="py-32 flex items-center justify-center"><RefreshCw className="w-10 h-10 text-white/5 animate-spin" /></div>
        ) : workspaceTab === 'plans' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            <button 
              onClick={handleCreatePlan}
              className="aspect-square md:aspect-[4/5] bg-white/5 border-2 border-dashed border-white/10 rounded-[48px] flex flex-col items-center justify-center gap-6 hover:bg-white/[0.08] hover:border-brand/40 transition-all group scale-100 active:scale-95"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-brand group-hover:text-white transition-all shadow-2xl"><Plus className="w-8 h-8 md:w-10 md:h-10" /></div>
              <div className="text-center px-8">
                <p className="text-[17px] md:text-[20px] font-black text-white mb-2 italic">CREATE NEW PLAN</p>
                <p className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em] leading-relaxed">拍照或上传户型图<br />开始 AI 搭配</p>
              </div>
            </button>

            {plans.map(plan => (
              <div 
                key={plan.id} onClick={() => navigate(`?planId=${plan.id}`)}
                className="bg-[#111] border border-white/5 rounded-[48px] p-8 md:p-10 hover:border-white/10 transition-all cursor-pointer group shadow-2xl relative overflow-hidden flex flex-col justify-between aspect-square md:aspect-[4/5]"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 blur-[80px] pointer-events-none group-hover:bg-brand/10 transition-all" />
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl ${plan.status === 'confirmed' ? 'bg-green-500/10 text-green-400' : 'bg-brand/10 text-brand'}`}>
                     {plan.status === 'confirmed' ? <CheckCircle2 className="w-7 h-7 md:w-8 md:h-8" /> : <Zap className="w-7 h-7 md:w-8 md:h-8" />}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button onClick={(e) => { e.stopPropagation(); setEditingPlan(plan); }} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/20 hover:text-white transition-colors"><Edit3 className="w-5 h-5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); setDeletingPlan(plan); }} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/10 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>

                <div className="relative z-10">
                   <h3 className="text-[24px] md:text-[32px] font-black text-white mb-2 leading-tight tracking-tighter group-hover:text-brand transition-colors line-clamp-2 italic uppercase">{plan.name}</h3>
                   <div className="flex items-center gap-3"><span className="text-[12px] font-black text-white/40 uppercase tracking-widest">{plan.area_range}</span><span className="w-1.5 h-1.5 rounded-full bg-brand" /><span className="text-[12px] font-black text-white/40 uppercase tracking-widest">{plan.style}</span></div>
                </div>

                <div className="flex items-center justify-between pt-10 border-t border-white/5 relative z-10 mt-10">
                  <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] italic">Updated {formatPlanDate(plan)}</div>
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/10 group-hover:text-brand group-hover:bg-brand/5 border border-white/5 transition-all"><ArrowRight className="w-5 h-5" /></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8 pb-12">
            {productLibrary.length === 0 ? (
              <div className="col-span-full py-32 text-center bg-[#111] border border-dashed border-white/5 rounded-[48px]">
                <ShoppingBag className="w-16 h-16 text-white/5 mx-auto mb-6" />
                <p className="text-white/10 font-black text-[15px] uppercase italic tracking-[0.2em]">Your library is empty</p>
              </div>
            ) : (
              productLibrary.map(item => (
                <div 
                  key={item.id} onClick={() => navigate(`/product/${item.id}`)}
                  className="bg-[#111] border border-white/5 rounded-[32px] p-4 md:p-6 hover:bg-[#141414] transition-all cursor-pointer group shadow-2xl flex flex-col"
                >
                  <div className="aspect-square bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 mb-6 overflow-hidden flex items-center justify-center">
                    <img src={item.image || undefined} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" alt="" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] md:text-[15px] font-black text-white line-clamp-1 mb-2 italic uppercase">{item.name}</p>
                    <div className="flex items-center justify-between">
                       <div className="flex flex-col">
                          <p className="text-[14px] md:text-[16px] font-black text-brand italic tracking-tighter leading-none mb-1">¥{(isProfessional ? (item.factory_price || item.price) : (item.standard_service_price || Math.round(item.price * 1.2))).toLocaleString()}</p>
                          <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.15em]">{isProfessional ? 'Factory' : 'Retail'}</p>
                       </div>
                       <button 
                         onClick={(e) => { e.stopPropagation(); setSelectedProduct(item); setIsAddModalOpen(true); }}
                         className="w-8 h-8 md:w-10 md:h-10 bg-white/5 border border-white/10 text-white/30 rounded-xl flex items-center justify-center hover:bg-brand hover:text-white hover:border-brand transition-all active:scale-90"
                       >
                         <Plus className="w-5 h-5" />
                       </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-24 md:pt-32 pb-20 overflow-x-hidden text-left">
      <div className="max-w-7xl mx-auto px-6">
        <Breadcrumbs isDark items={[{ name: '个人中心', path: '/profile' }, { name: '工作台', path: viewState === 'PLAN_DETAIL' ? location.pathname : undefined }, ...(viewState === 'PLAN_DETAIL' && currentPlan ? [{ name: currentPlan.name }] : [])]} />
      </div>
      
      <AnimatePresence mode="wait">
        {viewState === 'WORKSPACE' && (
          <motion.div key="workspace" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
            {renderWorkspace()}
          </motion.div>
        )}

        {viewState === 'PLAN_DETAIL' && currentPlan && (
          <motion.div key="plan_detail" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="w-full max-w-7xl mx-auto px-0 sm:px-4">
            <ErrorBoundary onReset={loadData}>
              <PlanDetailView 
                plan={currentPlan as any} onUpdate={loadData} onToast={showToast}
                onProductClick={(product, tab) => {
                  const productId = product.product_id || product.productId || product.product_snapshot?.id || product.id;
                  navigate(`/product/${productId}`, { state: { from: 'plan-detail', planId: currentPlan.id, fromTab: tab || 'showcase', productSnapshot: product.product_snapshot || product } });
                }}
                onRename={() => setEditingPlan(currentPlan)} onDelete={() => setDeletingPlan(currentPlan)}
                onEditRequirements={() => setEditingPlan(currentPlan)} initialTab={tabFromQuery || undefined}
              />
            </ErrorBoundary>
          </motion.div>
        )}
      </AnimatePresence>

      <EditPlanModal open={!!editingPlan} plan={editingPlan} onClose={() => setEditingPlan(null)} onSave={handleUpdatePlan} />
      <ConfirmDialog 
        open={!!deletingPlan} 
        title="确定删除方案？" 
        description={`方案名：${deletingPlan?.name || '未命名'}\n操作不可撤销。`}
        confirmText="彻底删除" danger onConfirm={handleDeletePlan} onCancel={() => setDeletingPlan(null)} 
      />
      {selectedProduct && <AddToPlanModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} product={selectedProduct} onToast={(msg) => showToast(msg)} onAdded={() => loadData()} />}
      <Toast message={toast?.message || null} action={toast?.action} onClear={() => setToast(null)} />
    </main>
  );
}
