import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigationType, useNavigate } from 'react-router-dom';
import { Search, Camera, Sparkles, ChevronRight, Home, ArrowUp, LayoutGrid, User, Menu, X } from 'lucide-react';
import { QUICK_SEARCH_TAGS } from './constants';
import { ModalType, StyleTag } from './types';
import ModalSystem from './components/ModalSystem';
import Toast from './components/Toast';
import { motion, AnimatePresence } from 'motion/react';
import { planService } from './services/planService';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import MatchPage from './pages/MatchPage';
import ProfilePage from './pages/ProfilePage';
import AdminProductsPage from './pages/AdminProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import MembershipPage from './pages/MembershipPage';
import CustomServicePage from './pages/CustomServicePage';
import ServiceSecurityPage from './pages/ServiceSecurityPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminMembershipsPage from './pages/admin/AdminMembershipsPage';
import AdminPermissionsPage from './pages/admin/AdminPermissionsPage';
import AdminCustomServicesPage from './pages/admin/AdminCustomServicesPage';
import AdminSuppliersPage from './pages/admin/AdminSuppliersPage';
import AdminLeadsPage from './pages/admin/AdminLeadsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminPlansPage from './pages/admin/AdminPlansPage';

import MembershipSuccessPage from './pages/MembershipSuccessPage';
import MembershipCheckoutPage from './pages/MembershipCheckoutPage';
import AdminGroupBuyRulesPage from './pages/admin/AdminGroupBuyRulesPage';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const navType = useNavigationType();

  // Scroll to top on PUSH, but not on POP
  useEffect(() => {
    if (navType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, navType]);

  const isProductDetail = location.pathname.startsWith('/product/');
  const [currentLevel, setCurrentLevel] = useState(4);
  const [currentStyle, setCurrentStyle] = useState<StyleTag>('现代简约');

  // Restore state from navigation
  useEffect(() => {
    if (location.state?.fromPreview) {
      if (location.state.returnLevel) setCurrentLevel(location.state.returnLevel);
      if (location.state.returnStyle) setCurrentStyle(location.state.returnStyle);
      
      // If we are returning, make sure we go to the ladder section
      if (location.pathname === '/') {
        setTimeout(() => {
          document.getElementById('house-plan-preview')?.scrollIntoView({ behavior: 'instant' });
        }, 0);
      }
    }
  }, [location.state, location.pathname]);
  const [isLoggedIn] = useState(false);
  const [isMember] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrolledDeep, setIsScrolledDeep] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [navTheme, setNavTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      setIsScrolled(scrollPos > 50);
      setIsScrolledDeep(scrollPos > 500);

      // Nav theme logic
      if (location.pathname === '/products') {
        // Products page starts light, but has a dark section (Budget Tiers)
        // Budget Tiers is roughly between 1500 and 2500 (approximate)
        // For now, let's keep it simple: hero is light, then white section, then black.
        // Actually, let's just check the scroll position. 
        // 0-1500 (Hero + Classification) -> light
        // 1500-2800 (Budget Tiers) -> dark
        // 2800+ (Products listing is white) -> light
        if (scrollPos > 1350 && scrollPos < 2650) {
          setNavTheme('dark');
        } else {
          setNavTheme('light');
        }
      } else {
        // Home and other pages are mostly dark
        setNavTheme('dark');
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    // If routing to /ladder from elsewhere, scroll to that section
    if (location.pathname === '/ladder') {
      setTimeout(() => {
        document.getElementById('house-plan-preview')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location.pathname]);

  const showToast = (msg: string) => setToastMessage(msg);

  const openModal = (type: ModalType, data?: any) => {
    setActiveModal(type);
    setModalData(data);
  };

  const navItems = [
    { label: '所有产品', path: '/products' },
    { label: '全屋灵感', path: '/ladder' },
    { label: '服务与保障', path: '/security' },
    { label: '我的方案', path: '/my-plans' },
    { label: '会员权益', path: '/membership' },
  ];

  const isAdminArea = location.pathname.startsWith('/admin');
  const isHomePage = location.pathname === '/' || location.pathname === '/ladder';

  const isLight = navTheme === 'light';

  return (
    <div className={`relative min-h-screen w-full bg-[#0a0a0a] selection:bg-brand/20 font-sans overflow-x-hidden ${isAdminArea ? 'min-h-screen' : 'h-auto overflow-x-hidden'}`}>
      <div className="relative z-10 w-full flex flex-col items-center">
        
        {/* Section 1: Navigation Bar */}
        {!isAdminArea && (
          <div className="fixed top-2 md:top-8 z-[500] w-full flex justify-center pointer-events-none px-3 md:px-4">
            <header 
              className={`flex items-center justify-between transition-all duration-300 ease-in-out px-4 md:px-6 backdrop-blur-3xl pointer-events-auto border ${
                isLight 
                  ? 'bg-white/80 text-[#1D1D1F] border-black/5 shadow-[0_12px_40px_rgba(0,0,0,0.08)]' 
                  : 'bg-[#141414]/55 text-white border-white/10 shadow-2xl'
              } ${
                isScrolled 
                  ? 'h-[48px] md:h-[52px] rounded-full px-3 md:px-4 gap-2 md:gap-8' 
                  : 'w-full md:w-[95%] max-w-[1400px] h-[56px] md:h-[64px] rounded-2xl md:px-8 shadow-sm'
              }`}
            >
              {/* Brand Section */}
              <div className="flex items-center gap-2 md:gap-3">
                <Link 
                  to="/" 
                  onClick={(e) => {
                    if (isHomePage) {
                      e.preventDefault();
                      document.getElementById('home-page-container')?.scrollTo({ top: 0, behavior: 'smooth' });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 group shrink-0"
                >
                  <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center font-black text-[11px] md:text-[12px] transition-colors ${isLight ? 'bg-black text-white' : 'bg-white text-black'}`}>DXG</div>
                  {(!isScrolled || isMobileMenuOpen) && <span className={`font-medium tracking-tight text-[15px] md:text-[18px] transition-colors truncate max-w-[120px] md:max-w-none ${isLight ? 'text-black' : 'text-white'}`}>底线哥家具</span>}
                </Link>
              </div>

              {/* Navigation Menu - Desktop */}
              <div className="hidden lg:flex items-center gap-8">
                {navItems.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path}
                    className={`text-[13px] tracking-tight transition-colors ${
                      location.pathname === item.path 
                        ? (isLight ? 'text-black font-semibold' : 'text-white font-semibold') 
                        : (isLight ? 'text-black/50 hover:text-black font-medium' : 'text-white/50 hover:text-white font-medium')
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              
              {/* Action - Desktop */}
              <div className="hidden md:flex items-center gap-4">
                <button 
                  onClick={async () => {
                    try {
                      const newPlan = await planService.createPlan({
                        name: '我的全屋搭配方案',
                        area_range: '90-120㎡',
                        style: '现代简约'
                      });
                      navigate(`/my-plans?planId=${newPlan.id}`);
                      showToast('新方案已成功创建');
                    } catch (e) {
                      openModal('newPlan');
                    }
                  }}
                  className={`h-9 px-5 rounded-full text-[12px] font-bold transition-all hover:scale-105 active:scale-95 ${
                    isLight ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  新建方案
                </button>
                <Link 
                  to="/profile"
                  className={`h-9 px-3 rounded-full flex items-center justify-center gap-2 transition-all border ${isLight ? 'bg-black/5 border-black/5 text-black hover:bg-black/10' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                >
                  <User className="w-4 h-4" />
                  <span className="text-[12px] font-bold">个人中心</span>
                </Link>
              </div>

              {/* Mobile Menu Trigger */}
              <div className="flex md:hidden items-center gap-1">
                <Link 
                  to="/profile"
                  className={`p-2 rounded-full transition-all ${isLight ? 'text-black hover:bg-black/5' : 'text-white hover:bg-white/10'}`}
                >
                  <User className="w-5 h-5" />
                </Link>
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={`p-2 rounded-xl transition-all ${isLight ? 'text-black hover:bg-black/5' : 'text-white hover:bg-white/10'}`}
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`fixed top-[64px] md:top-[120px] left-3 right-3 z-[490] backdrop-blur-3xl rounded-[24px] border p-6 flex flex-col gap-5 lg:hidden pointer-events-auto ${
                    isLight ? 'bg-white/95 border-black/5 shadow-2xl' : 'bg-[#141414]/95 border-white/10 shadow-2xl'
                  }`}
                >
                  <div className="flex flex-col gap-4">
                    {navItems.map((item) => (
                      <Link 
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`text-[16px] font-bold transition-colors ${
                          location.pathname === item.path 
                            ? 'text-brand' 
                            : (isLight ? 'text-black' : 'text-white')
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  <div className="h-px bg-white/10 my-1" />
                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={async () => {
                        setIsMobileMenuOpen(false);
                        try {
                          const newPlan = await planService.createPlan({
                            name: '我的全屋搭配方案',
                            area_range: '90-120㎡',
                            style: '现代简约'
                          });
                          navigate(`/my-plans?planId=${newPlan.id}`);
                          showToast('新方案已成功创建');
                        } catch (e) {
                          openModal('newPlan');
                        }
                      }}
                      className="w-full h-12 bg-brand text-white rounded-xl text-[15px] font-black flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" /> 新建 AI 方案
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Section 3: Mid Area - Routes */}
        <div className={`flex-1 w-full flex flex-col ${isAdminArea ? 'mt-0' : 'mt-0'}`}>
          <Routes>
            <Route path="/" element={<HomePage 
              currentLevel={currentLevel} 
              setCurrentLevel={setCurrentLevel}
              currentStyle={currentStyle}
              setCurrentStyle={setCurrentStyle}
              showToast={showToast}
              openModal={openModal}
            />} />
            <Route path="/ladder" element={<HomePage 
              currentLevel={currentLevel} 
              setCurrentLevel={setCurrentLevel}
              currentStyle={currentStyle}
              setCurrentStyle={setCurrentStyle}
              showToast={showToast}
              openModal={openModal}
            />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/my-plans" element={<MatchPage />} />
            <Route path="/match" element={<MatchPage />} />
            <Route path="/checkout/:planId" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/membership" element={<MembershipPage />} />
            <Route path="/membership/checkout" element={<MembershipCheckoutPage />} />
            <Route path="/membership/success" element={<MembershipSuccessPage />} />
            <Route path="/custom-service" element={<CustomServicePage />} />
            <Route path="/security" element={<ServiceSecurityPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/leads" element={<AdminLeadsPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/plans" element={<AdminPlansPage />} />
            <Route path="/admin/group-buy-rules" element={<AdminGroupBuyRulesPage />} />
            <Route path="/admin/memberships" element={<AdminMembershipsPage />} />
            <Route path="/admin/permissions" element={<AdminPermissionsPage />} />
            <Route path="/admin/custom-services" element={<AdminCustomServicesPage />} />
            <Route path="/admin/suppliers" element={<AdminSuppliersPage />} />
          </Routes>
        </div>

        {/* Global floating buttons */}
        {!isAdminArea && (
          <div className="fixed bottom-6 right-4 md:bottom-10 md:right-12 z-[300] flex flex-col items-end gap-3.5">
            {/* Back to Top Button (Small Circle) */}
            <AnimatePresence>
              {isScrolledDeep && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: 20 }}
                  className="group/top flex items-center gap-3"
                >
                  <span className="bg-white/90 backdrop-blur-md text-gray-700 px-3 py-1.5 rounded-xl text-[12px] font-black shadow-lg border border-white opacity-0 md:group-hover/top:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {isProductDetail ? '回到产品概览' : '回到顶部'}
                  </span>
                  <button 
                    onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        document.getElementById('home-page-container')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-10 h-10 md:w-12 md:h-12 bg-white/70 backdrop-blur-xl text-gray-500 rounded-full flex items-center justify-center shadow-lg border border-white/60 hover:scale-110 hover:bg-white hover:text-brand active:scale-90 transition-all focus:outline-none"
                  >
                    <ArrowUp className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Back to Product List (Only on Products Page after scroll) */}
            <AnimatePresence>
              {location.pathname === '/products' && isScrolled && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: 20 }}
                  className="group/prod flex items-center gap-3"
                >
                  <span className="bg-white/90 backdrop-blur-md text-gray-700 px-3 py-1.5 rounded-xl text-[12px] font-black shadow-lg border border-white opacity-0 md:group-hover/prod:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    回到产品列表
                  </span>
                  <button 
                    onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-10 h-10 md:w-12 md:h-12 bg-white/70 backdrop-blur-xl text-gray-700 rounded-full flex items-center justify-center shadow-lg border border-white/60 hover:scale-110 hover:bg-white active:scale-90 transition-all focus:outline-none"
                  >
                    <LayoutGrid className="w-5 h-5 md:w-5.5 md:h-5.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Assistant Button (Main Button) */}
            <div className="flex flex-col items-end gap-2 group/ai relative">
              <button 
                onClick={() => {
                  const currentPath = location.pathname;
                  const isMatchPage = currentPath === '/match' || currentPath === '/my-plans';
                  
                  if (isMatchPage) {
                    // Open Assistant within a plan
                    window.dispatchEvent(new CustomEvent('open-ai-assistant'));
                  } else {
                    // Start new plan via AI assistant
                    openModal('newPlan');
                  }
                }}
                className="h-12 md:h-14 pl-3 md:pl-4 pr-5 md:pr-7 bg-brand text-white rounded-full flex items-center gap-2 md:gap-3 shadow-2xl shadow-brand/30 hover:scale-105 active:scale-95 transition-all focus:outline-none group"
              >
                <div className="w-8 h-8 md:w-9 md:h-9 bg-white/20 rounded-full flex items-center justify-center shadow-inner">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform" />
                </div>
                <span className="text-[13px] md:text-[15px] font-black tracking-tight">AI帮我看</span>
              </button>
            </div>
          </div>
        )}

      </div>

      <ModalSystem 
        type={activeModal} 
        isOpen={!!activeModal} 
        onClose={() => setActiveModal(null)} 
        data={modalData}
        onToast={showToast}
      />
      
      <Toast message={toastMessage} onClear={() => setToastMessage(null)} />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
