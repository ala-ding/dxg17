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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <div className={`relative min-h-screen w-full bg-[#0a0a0a] selection:bg-brand/20 font-sans overflow-x-hidden ${isAdminArea ? 'min-h-screen' : 'h-auto overflow-visible'}`}>
      <div className="relative z-10 w-full flex flex-col items-center">
        
        {/* Section 1: Navigation Bar */}
        {!isAdminArea && (
          <div className="fixed top-4 md:top-8 z-[500] w-full flex justify-center pointer-events-none px-4 md:px-6">
            <header 
              className={`flex items-center justify-between transition-all duration-300 ease-in-out backdrop-blur-3xl pointer-events-auto border ${
                isLight 
                  ? 'bg-white/80 text-[#1D1D1F] border-black/5 shadow-[0_12px_40px_rgba(0,0,0,0.08)]' 
                  : 'bg-[#141414]/55 text-white border-white/10 shadow-2xl'
              } ${
                isScrolled 
                  ? 'h-[48px] md:h-[52px] rounded-full px-4 gap-4 md:gap-8' 
                  : 'w-[92%] md:w-[95%] max-w-[1400px] h-[50px] md:h-[64px] rounded-full md:rounded-2xl px-4 md:px-8 shadow-sm'
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
                  }}
                  className="flex items-center gap-2 group"
                >
                  <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center font-black text-[10px] md:text-[12px] transition-colors ${isLight ? 'bg-black text-white' : 'bg-white text-black'}`}>DXG</div>
                  {!isScrolled && <span className={`font-black tracking-tight text-[15px] md:text-[18px] transition-colors hidden sm:inline-block ${isLight ? 'text-black' : 'text-white'}`}>底线哥选家具</span>}
                </Link>
              </div>

              {/* Navigation Menu - Desktop */}
              <nav className="hidden md:flex items-center gap-8">
                {navItems.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path}
                    className={`text-[13px] tracking-tight transition-colors ${
                      location.pathname === item.path 
                        ? (isLight ? 'text-black font-bold' : 'text-white font-bold') 
                        : (isLight ? 'text-black/50 hover:text-black font-medium' : 'text-white/50 hover:text-white font-medium')
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2 md:gap-4">
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
                  className={`h-7 md:h-9 px-3 md:px-5 rounded-full text-[10px] md:text-[12px] font-black transition-all hover:scale-105 active:scale-95 ${
                    isLight ? 'bg-black text-white' : 'bg-white text-black'
                  } ${isScrolled ? 'hidden md:block' : 'hidden md:block'}`}
                >
                  新建方案
                </button>
                <Link 
                  to="/profile"
                  className={`h-7 md:h-9 px-2.5 md:px-3 rounded-full flex items-center justify-center gap-1.5 md:gap-2 transition-all border ${isLight ? 'bg-black/5 border-black/5 text-black hover:bg-black/10' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                >
                  <User className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="text-[10px] md:text-[12px] font-black min-[450px]:inline hidden">个人中心</span>
                </Link>
                {/* Mobile Menu Toggle */}
                <button 
                  onClick={() => setIsMenuOpen(true)}
                  className={`md:hidden h-8 w-8 rounded-full flex items-center justify-center border ${
                    isLight ? 'bg-black/5 border-black/5 text-black' : 'bg-white/5 border-white/10 text-white'
                  }`}
                >
                  <Menu className="w-4 h-4" />
                </button>
              </div>
            </header>
          </div>
        )}

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] md:hidden"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-[80%] max-w-[320px] bg-[#0F0F0F]/95 backdrop-blur-2xl z-[1001] md:hidden border-l border-white/10 p-6 flex flex-col"
              >
            <div className="flex justify-between items-center mb-6 md:mb-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-black text-[12px]">DXG</div>
                <span className="font-black text-white text-[18px]">菜单</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="flex flex-col gap-1.5 md:gap-2">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-[16px] md:text-[17px] font-bold py-3 md:py-3 px-4 rounded-2xl flex items-center justify-between group transition-all ${
                    location.pathname === item.path ? 'bg-white/5 text-brand' : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.label}
                  <ChevronRight className={`w-4 h-4 transition-colors ${location.pathname === item.path ? 'text-brand' : 'text-white/10 group-hover:text-white/40'}`} />
                </Link>
              ))}
                  
                  <div className="h-px bg-white/10 my-3 md:my-4 mx-4" />
                  
                  <button 
                    onClick={async () => {
                      setIsMenuOpen(false);
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
                    className="flex items-center justify-between text-[15px] md:text-[17px] font-bold text-brand py-2.5 md:py-3 px-4 rounded-2xl hover:bg-white/5 transition-all group"
                  >
                    <span>新建方案</span>
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-brand/20 flex items-center justify-center">
                      <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5" />
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      const currentPath = location.pathname;
                      const isMatchPage = currentPath === '/match' || currentPath === '/my-plans';
                      if (isMatchPage) {
                        window.dispatchEvent(new CustomEvent('open-ai-assistant'));
                      } else {
                        openModal('newPlan');
                      }
                    }}
                    className="flex items-center justify-between text-[15px] md:text-[17px] font-bold text-white py-2.5 md:py-3 px-4 rounded-2xl hover:bg-white/5 transition-all group mt-1 md:mt-2"
                  >
                    <span>AI 帮我配</span>
                    <Sparkles className="w-4 h-4 text-brand" />
                  </button>
                </nav>

                <div className="mt-auto pt-8">
                  <Link 
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-[24px] border border-white/5"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/40">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[14px] font-black text-white">个人中心</div>
                      <div className="text-[11px] text-white/30">管理您的方案与订单</div>
                    </div>
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

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
          <div className="fixed bottom-6 md:bottom-10 right-4 md:right-12 z-[300] flex flex-col items-end gap-3 md:gap-3.5">
            {/* Back to Top Button (Small Circle) */}
            <AnimatePresence>
              {isScrolledDeep && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: 20 }}
                  className="group/top flex items-center gap-3"
                >
                  <span className="bg-white/90 backdrop-blur-md text-gray-700 px-3 py-1.5 rounded-xl text-[12px] font-black shadow-lg border border-white opacity-0 group-hover/top:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
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
                  <span className="bg-white/90 backdrop-blur-md text-gray-700 px-3 py-1.5 rounded-xl text-[12px] font-black shadow-lg border border-white opacity-0 group-hover/prod:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
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

            {/* AI Assistant Button (Main Button) - Bottom Safe Area Adjustment */}
            <div className="flex flex-col items-end gap-2 group/ai relative md:mb-0 mb-4">
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
                className="h-12 md:h-14 w-12 md:w-auto px-0 md:px-7 md:pl-4 bg-brand text-white rounded-full flex items-center justify-center md:justify-start gap-0 md:gap-3 shadow-2xl shadow-brand/30 hover:scale-105 active:scale-95 transition-all focus:outline-none group"
              >
                <div className="w-9 h-9 md:w-9 md:h-9 bg-white/20 rounded-full flex items-center justify-center shadow-inner shrink-0">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform" />
                </div>
                <span className="hidden md:block text-[15px] font-black tracking-tight">AI帮我看</span>
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
