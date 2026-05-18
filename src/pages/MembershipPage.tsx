import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, Shield, User, Briefcase, Sparkles, FileText, 
  Search, Users, Zap, ChevronRight, Hexagon, ArrowRight, Lock
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { membershipService } from '../services/membershipService';

export default function MembershipPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'professional' ? 'professional' : 'personal';
  const [activeTab, setActiveTab] = useState<'personal' | 'professional'>(initialTab);
  const [currentPlan, setCurrentPlan] = useState<string>('free');

  useEffect(() => {
    membershipService.getCurrentUserMembership().then(m => {
      if (m) setCurrentPlan(m.plan_code);
    });
  }, []);

  const handleActivate = async (code: string) => {
    if (code === 'free') { navigate('/products'); return; }
    if (code === 'custom_service') { navigate('/custom-service'); return; }
    if (currentPlan === code) return;
    navigate(`/membership/checkout?plan=${code}`);
  };

  const personalPlans = [
    { code: 'free', name: '免费用户', price: '¥0', description: '适合对比与基础了解', features: ['浏览产品', '查看标准服务价', '基础参数', '加入方案'], buttonText: '开始选品', theme: 'glass', period: '', highlight: false },
    { code: 'consulting', name: '咨询会员', price: '¥300', period: '/月', description: '适合正在装修、有清单报价的用户', features: ['查看成本拆分', '外部清单审核', '进阶选购建议', '预算避坑指导'], buttonText: '开通咨询', theme: 'brand', highlight: true }
  ];

  const professionalPlans = [
    { code: 'professional', name: '专业会员', price: '¥1999', period: '/年', description: '适合设计师与专业采购', features: ['查看出厂采购价', '阶梯价/交期参考', '产品资料包下载', '厂家联系协调'], buttonText: '开通专业版', theme: 'brand', highlight: true },
    { code: 'custom_service', name: '定制服务', price: '联系支持', description: '适合企业合作、长期大宗采购', features: ['组货定向评估', '项目报价核实', '专人全案跟进', '企业直供协议'], buttonText: '申请咨询', theme: 'glass', highlight: false }
  ];

  const currentPlans = activeTab === 'personal' ? personalPlans : professionalPlans;

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-24 md:pt-32 pb-40 overflow-x-hidden text-left">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-12 md:mb-20">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 border border-brand/20 rounded-full mb-6">
            <Hexagon className="w-3.5 h-3.5 text-brand" /><span className="text-brand text-[10px] md:text-[11px] font-black tracking-[0.2em] uppercase">Membership Center</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[36px] md:text-[56px] font-black text-white mb-4 tracking-tight leading-none">会员权益中心</motion.h1>
          <p className="text-[14px] md:text-[18px] text-white/30 font-medium max-w-2xl mx-auto italic">根据您的业务深度，解锁不同层级的出厂底价与咨询能力。</p>
        </div>

        <div className="flex justify-center mb-10 md:mb-16">
          <div className="p-1 md:p-1.5 bg-white/5 border border-white/5 rounded-2xl md:rounded-3xl flex items-center w-full md:w-auto">
            <button onClick={() => setActiveTab('personal')} className={`flex-1 md:flex-none px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl text-[14px] md:text-[15px] font-black transition-all ${activeTab === 'personal' ? 'bg-white text-black shadow-2xl scale-[1.02]' : 'text-white/30 hover:text-white'}`}>个人用户</button>
            <button onClick={() => setActiveTab('professional')} className={`flex-1 md:flex-none px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl text-[14px] md:text-[15px] font-black transition-all ${activeTab === 'professional' ? 'bg-white text-black shadow-2xl scale-[1.02]' : 'text-white/30 hover:text-white'}`}>专业用户</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          <AnimatePresence mode="wait">
            {currentPlans.map((plan, i) => (
              <motion.div 
                key={plan.code} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.1 }}
                className={`relative p-8 md:p-12 rounded-[40px] md:rounded-[56px] border flex flex-col transition-all hover:-translate-y-1 ${plan.theme === 'brand' ? 'bg-brand/10 border-brand/20 shadow-2xl shadow-brand/10' : 'bg-[#141414] border-white/5 hover:border-white/10'}`}
              >
                {plan.highlight && <div className="absolute top-8 right-8 px-3 py-1 bg-brand text-white text-[9px] font-black rounded-full tracking-widest uppercase">热选</div>}
                <div className="mb-10">
                   <h3 className="text-[12px] md:text-[13px] font-black text-brand tracking-[0.2em] uppercase mb-4">{plan.name}</h3>
                   <div className="flex items-end gap-2 mb-4">
                      <span className="text-[40px] md:text-[56px] font-black text-white leading-none italic">{plan.price}</span>
                      <span className="text-[14px] md:text-[16px] text-white/20 font-bold mb-2">{plan.period}</span>
                   </div>
                   <p className="text-[14px] md:text-[15px] text-white/40 font-medium leading-relaxed italic">{plan.description}</p>
                </div>
                <div className="space-y-4 md:space-y-5 flex-1 mb-12">
                   {plan.features.map((f, fi) => (
                     <div key={fi} className="flex items-start gap-4">
                        <div className={`mt-1 flex items-center justify-center shrink-0 w-5 h-5 rounded-full ${plan.theme === 'brand' ? 'bg-brand text-white' : 'bg-white/10 text-white/30'}`}><Check className="w-3 h-3" /></div>
                        <span className="text-[14px] md:text-[15px] font-bold text-white/70">{f}</span>
                     </div>
                   ))}
                </div>
                <button onClick={() => handleActivate(plan.code)} className={`w-full py-5 md:py-6 rounded-2xl md:rounded-3xl text-[16px] md:text-[18px] font-black transition-all active:scale-95 flex items-center justify-center gap-3 ${currentPlan === plan.code ? 'bg-white/5 text-white/20 border border-white/5' : plan.theme === 'brand' ? 'bg-brand text-white shadow-xl shadow-brand/20' : 'bg-white text-black'}`}>
                   {currentPlan === plan.code ? '当前已生效' : plan.buttonText}
                   {currentPlan !== plan.code && <ArrowRight className="w-5 h-5" />}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mt-16 md:mt-24 p-8 md:p-14 bg-white/5 border border-white/5 rounded-[40px] md:rounded-[56px] text-left">
           <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
              <div>
                 <h4 className="text-[20px] md:text-[24px] font-black text-white mb-3">专属定制采购权益</h4>
                 <p className="text-[14px] md:text-[16px] text-white/30 font-medium max-w-2xl leading-relaxed italic">如需全案选购评估、项目大宗采购或长期产线协调，请申请我们的定制化顾问跟进服务。</p>
              </div>
              <button onClick={() => navigate('/custom-service')} className="w-full lg:w-auto px-10 py-5 bg-white/5 hover:bg-brand text-white rounded-2xl font-black text-[15px] transition-all border border-white/10 hover:border-brand shadow-2xl">申请定制支持</button>
           </div>
        </motion.div>
      </div>
    </main>
  );
}
