import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ChevronRight, 
  X, 
  Upload, 
  CheckCircle2, 
  ArrowLeft,
  Layout,
  Layers,
  Palette,
  Users,
  Target,
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
  Box,
  Heart,
  Trash2,
  Edit3
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { planService } from '../services/planService';
import { libraryService } from '../services/libraryService';
import { analyticsService } from '../services/analyticsService';
import { Plan, Product } from '../types/business';
import PlanDetailView from '../components/PlanDetailView';
import Toast from '../components/Toast';
import ErrorBoundary from '../components/ErrorBoundary';

import AddToPlanModal from '../components/AddToPlanModal';
import EditPlanModal from '../components/EditPlanModal';
import ConfirmDialog from '../components/ConfirmDialog';

type MatchState = 
  | 'WORKSPACE' 
  | 'PLAN_DETAIL' 
  | 'UPLOAD_FLOW' 
  | 'MANUAL_FILL';

type WorkspaceTab = 'plans' | 'library';

export default function MatchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [viewState, setViewState] = useState<MatchState>('WORKSPACE');
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('plans');
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [productLibrary, setProductLibrary] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

    // Handle openPlanId from location state or URL params
    const openId = location.state?.openPlanId || planIdFromQuery;
    if (openId) {
      setCurrentPlanId(openId);
      setViewState('PLAN_DETAIL');
      // Clear location state if present
      if (location.state?.openPlanId) {
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, planIdFromQuery, workspaceTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await planService.getPlans();
      setPlans(data);
      
      if (workspaceTab === 'library') {
        const lib = await libraryService.getLibrary();
        setProductLibrary(lib);
      }
    } finally {
      setLoading(false);
    }
  };

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
      setToastMessage('方案已更新');
      analyticsService.track('update_plan', { plan_id: editingPlan.id });
    } catch (e: any) {
      setToastMessage(`更新失败: ${e.message || '请稍后重试'}`);
    }
  };

  const handleDeletePlan = async () => {
    if (!deletingPlan) return;
    try {
      await planService.deletePlan(deletingPlan.id);
      if (currentPlanId === deletingPlan.id) {
        setViewState('WORKSPACE');
        setCurrentPlanId(null);
      }
      await loadData();
      setToastMessage('方案已删除');
      analyticsService.track('delete_plan', { plan_id: deletingPlan.id });
    } catch (e: any) {
      setToastMessage(`删除失败: ${e.message || '请稍后重试'}`);
    } finally {
      setDeletingPlan(null);
    }
  };

  const handleCreatePlan = async () => {
    try {
      const now = new Date();
      const defaultName = `方案 ${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
      const newPlan = await planService.createPlan({
        name: defaultName,
        area_range: '90-120㎡',
        spaces: ['客厅', '主卧'],
        style: '现代简约'
      });
      
      setPlans(prev => [newPlan, ...prev]);
      setCurrentPlanId(newPlan.id);
      setViewState('PLAN_DETAIL');
      setToastMessage('新方案已创建');
      analyticsService.track('create_plan', { plan_id: newPlan.id });
    } catch (e: any) {
      setToastMessage(`创建失败: ${e.message}`);
    }
  };

  const renderWorkspace = () => (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12 text-left">
        <h1 className="text-[48px] font-black text-white mb-4 tracking-tight">我的搭配工作台</h1>
        <p className="text-[18px] text-white/40 font-medium">在这里管理你的所有 AI 方案和灵感资产</p>
      </header>

      <div className="flex border-b border-white/10 mb-12">
        {[
          { id: 'plans', label: '我的方案', count: plans.length },
          { id: 'library', label: '灵感产品库', count: productLibrary.length }
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
            onClick={handleCreatePlan}
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
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-[60px] pointer-events-none" />
              <div className="flex items-center justify-between mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${plan.status === 'confirmed' ? 'bg-green-500/10 text-green-400' : 'bg-brand/10 text-brand'}`}>
                  {plan.status === 'confirmed' ? <CheckCircle2 className="w-7 h-7" /> : <Zap className="w-7 h-7" />}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPlan(plan);
                    }}
                    className="p-2 text-white/30 hover:text-brand hover:bg-white/10 rounded-xl transition-all"
                    aria-label="编辑方案"
                    title="编辑方案"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingPlan(plan);
                    }}
                    className="p-2.5 text-white/30 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all group/trash"
                    aria-label="删除方案"
                    title="删除方案"
                  >
                    <Trash2 className="w-5 h-5 group-hover/trash:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
              <h3 className="text-[24px] font-black text-white mb-2 leading-tight group-hover:text-brand transition-colors">{plan.name}</h3>
              <p className="text-[14px] text-white/40 font-bold mb-8">
                {plan.area_range} · {plan.style}
              </p>
              <div className="flex items-center justify-between pt-8 border-t border-white/5">
                <div className="text-[11px] font-black text-white/20 uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full">
                  更新于 {formatPlanDate(plan)}
                </div>
                <button className="text-[13px] font-black text-white/20 hover:text-white transition-colors flex items-center gap-1.5">
                  方案详情 <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {workspaceTab === 'library' && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {productLibrary.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <ShoppingBag className="w-16 h-16 text-white/5 mx-auto mb-4" />
              <p className="text-white/20 font-bold">灵感库空空如也，去产品详情页添加吧</p>
            </div>
          ) : (
            productLibrary.map(item => (
              <div 
                key={item.id} 
                className="bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 hover:bg-white/10 transition-all cursor-pointer group shadow-xl"
                onClick={() => navigate(`/product/${item.id}`)}
              >
                <div className="aspect-square bg-white rounded-2xl p-4 mb-4">
                  <img src={item.image} className="w-full h-full object-contain" alt="" />
                </div>
                <p className="text-[14px] font-black text-white group-hover:text-brand transition-colors mb-1 truncate">{item.name}</p>
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-bold text-brand">¥{item.price.toLocaleString()}</p>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(item);
                        setIsAddModalOpen(true);
                      }}
                      className="flex items-center gap-1 px-2 py-1 bg-brand text-white rounded-lg text-[9px] font-black uppercase tracking-wider hover:scale-105 transition-all shadow-lg shadow-brand/20"
                    >
                      <Plus className="w-2.5 h-2.5" /> 加入清单
                    </button>
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        await libraryService.removeProductFromLibrary(item.id);
                        setProductLibrary(prev => prev.filter(i => i.id !== item.id));
                        setToastMessage('已从灵感库移除');
                        analyticsService.track('remove_from_library', { product_id: item.id });
                      }}
                      className="p-1 text-white/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {selectedProduct && (
        <AddToPlanModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          product={selectedProduct}
          onToast={(msg) => setToastMessage(msg)}
        />
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <Breadcrumbs 
          isDark={true}
          className="mb-2"
          items={[
            { name: '个人中心', path: '/profile' },
            { name: '我的方案', path: viewState === 'PLAN_DETAIL' ? '/my-plans' : undefined },
            ...(viewState === 'PLAN_DETAIL' && currentPlan ? [{ name: currentPlan.name }] : [])
          ]} 
        />
      </div>
      
      <AnimatePresence mode="wait">
        {viewState === 'WORKSPACE' && (
          <motion.div
            key="workspace"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderWorkspace()}
          </motion.div>
        )}

        {viewState === 'PLAN_DETAIL' && currentPlan && (
          <motion.div
            key="plan_detail"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full max-w-7xl mx-auto px-4"
          >
            <div className="mb-8">
              <button 
                onClick={() => setViewState('WORKSPACE')}
                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors font-bold text-[13px]"
              >
                <ArrowLeft className="w-4 h-4" /> 返回工作台
              </button>
            </div>
            <ErrorBoundary onReset={loadData}>
              <PlanDetailView 
                plan={currentPlan as any} 
                onUpdate={loadData}
                onToast={(msg) => setToastMessage(msg)}
                onProductClick={(product, tab) => {
                  const productId = product.product_id || product.productId || product.product_snapshot?.id || product.id;
                  navigate(`/product/${productId}`, {
                    state: {
                      from: 'plan-detail',
                      planId: currentPlan.id,
                      fromTab: tab || 'showcase',
                      productSnapshot: product.product_snapshot || product
                    }
                  });
                }}
                onRename={() => setEditingPlan(currentPlan)}
                onDelete={() => setDeletingPlan(currentPlan)}
                onEditRequirements={() => setEditingPlan(currentPlan)}
                initialTab={tabFromQuery || undefined}
              />
            </ErrorBoundary>
          </motion.div>
        )}
      </AnimatePresence>

      <EditPlanModal
        open={!!editingPlan}
        plan={editingPlan}
        onClose={() => setEditingPlan(null)}
        onSave={handleUpdatePlan}
      />

      <ConfirmDialog
        open={!!deletingPlan}
        title="确定删除这个方案吗？"
        description={`方案名称：${deletingPlan?.name || '未命名方案'}\n删除后不可恢复。`}
        confirmText="确认删除"
        danger
        onConfirm={handleDeletePlan}
        onCancel={() => setDeletingPlan(null)}
      />

      <AddToPlanModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        product={selectedProduct}
        onAdded={(planName) => {
          setToastMessage(`已添加到方案: ${planName}`);
          loadData(); // Refresh and potentially clear status
        }}
      />

      <Toast 
        message={toastMessage} 
        onClear={() => setToastMessage(null)} 
      />
    </main>
  );
}
