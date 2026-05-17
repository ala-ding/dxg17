import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  Shield, 
  User, 
  Briefcase, 
  Sparkles, 
  FileText, 
  Search, 
  Users, 
  Zap,
  ChevronRight,
  Hexagon,
  ArrowRight,
  Lock
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
    if (code === 'free') {
      navigate('/products');
      return;
    }
    if (code === 'custom_service') {
      navigate('/custom-service');
      return;
    }
    
    // Check if already active
    if (currentPlan === code) {
      return;
    }

    navigate(`/membership/checkout?plan=${code}`);
  };

  const personalPlans = [
    {
      code: 'free',
      name: '免费用户',
      price: '¥0',
      description: '适合自助了解产品和基础对比',
      features: [
        '浏览产品',
        '查看平台标准服务价',
        '查看基础参数',
        '查看适合/不适合人群',
        '加入方案',
        '基础对比'
      ],
      buttonText: '开始选品',
      theme: 'glass',
      period: '/永久',
      highlight: false
    },
    {
      code: 'consulting',
      name: '咨询会员',
      price: '¥300',
      period: '/月',
      description: '适合正在装修、有清单、有报价、需要选购建议的用户',
      features: [
        '查看成本拆分',
        '上传外部清单',
        '清单审核建议',
        '选购建议',
        '预算判断',
        '替代推荐',
        '基础采购方案建议'
      ],
      limitations: '提供咨询和方案建议，不包含全程代采、跟单、售后和长期项目协调。',
      buttonText: '开通咨询会员',
      theme: 'brand',
      highlight: true
    }
  ];

  const professionalPlans = [
    {
      code: 'professional',
      name: '专业会员',
      price: '¥1999',
      period: '/年',
      description: '适合设计师、软装公司、装修公司和专业采购用户',
      features: [
        '查看专业采购价',
        '查看专业价区间',
        '查看阶梯价参考',
        '查看合约价参考',
        '起订量 / 交期 / 库存状态',
        '查看可定制范围',
        '查看混批规则',
        '下载专业采购清单',
        '下载产品资料包',
        '申请厂家对接',
        '申请查看厂家联系方式'
      ],
      limitations: '厂家联系方式、深度合约价和长期采购协调根据供应商规则、资质和授权决定。',
      buttonText: '开通专业会员',
      theme: 'brand',
      highlight: true
    },
    {
      code: 'custom_service',
      name: '定制服务',
      price: '联系报价',
      period: '/次',
      description: '适合长期采购、项目采购、企业合作和需要人工协调的客户',
      features: [
        '长期采购定向咨询',
        '厂家沟通协调',
        '项目报价整理',
        '多品类组货',
        '项目清单优化',
        '专人跟进',
        '企业定向合作'
      ],
      buttonText: '申请定制服务',
      theme: 'glass',
      highlight: false
    }
  ];

  const currentPlans = activeTab === 'personal' ? personalPlans : professionalPlans;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 border border-brand/20 rounded-full mb-6"
          >
            <Hexagon className="w-4 h-4 text-brand fill-brand/20" />
            <span className="text-brand text-[12px] font-black tracking-widest uppercase">Membership Benefits</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight"
          >
            会员权益中心
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-[18px] max-w-2xl mx-auto font-medium"
          >
            选择适合你的会员等级，解锁更深度、更专业的产品采购能力。
          </motion.p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl flex gap-1 border border-white/10">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-8 py-3 rounded-xl text-[14px] font-black transition-all flex items-center gap-2 ${
                activeTab === 'personal' ? 'bg-white text-black shadow-xl scale-105' : 'text-white/40 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              个人用户
            </button>
            <button
              onClick={() => setActiveTab('professional')}
              className={`px-8 py-3 rounded-xl text-[14px] font-black transition-all flex items-center gap-2 ${
                activeTab === 'professional' ? 'bg-white text-black shadow-xl scale-105' : 'text-white/40 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              专业用户
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          <AnimatePresence mode="wait">
            {currentPlans.map((plan, idx) => (
              <motion.div
                key={plan.code}
                initial={{ opacity: 0, x: activeTab === 'personal' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative flex flex-col p-10 rounded-[40px] border transition-all hover:-translate-y-2 group ${
                  plan.theme === 'brand' 
                    ? 'bg-gradient-to-br from-brand/20 to-brand/5 border-brand/30 shadow-[0_32px_80px_rgba(0,201,190,0.15)]' 
                    : 'bg-[#141414] border-white/10 hover:border-white/20'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute top-8 right-8 px-4 py-1.5 bg-brand text-white text-[10px] font-black rounded-full shadow-lg tracking-widest uppercase">
                    推荐选择
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-[14px] font-black text-brand tracking-widest uppercase mb-4">{plan.name}</h3>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-5xl font-black text-white">{plan.price}</span>
                    <span className="text-white/30 text-[16px] font-bold mb-1.5">{plan?.period}</span>
                  </div>
                  <p className="text-white/50 text-[15px] leading-relaxed font-medium">
                    {plan.description}
                  </p>
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.theme === 'brand' ? 'bg-brand/20 text-brand' : 'bg-white/10 text-white/40'}`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-white/70 text-[14px] font-bold">{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.limitations && (
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 mb-8">
                    <div className="flex gap-2 text-[12px] text-white/30 leading-relaxed italic">
                      <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{plan.limitations}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleActivate(plan.code)}
                  className={`w-full py-5 rounded-2xl font-black text-[16px] transition-all flex items-center justify-center gap-2 group/btn ${
                    currentPlan === plan.code 
                      ? 'bg-transparent border border-white/20 text-white cursor-default'
                      : plan.theme === 'brand'
                        ? 'bg-brand text-white shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-95'
                        : 'bg-white text-black hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  {currentPlan === plan.code ? '当前已拥有' : plan.buttonText}
                  {currentPlan !== plan.code && <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 p-12 bg-[#111111] border border-white/5 rounded-[40px] text-center"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-left">
              <h4 className="text-white font-black text-2xl mb-2">需要深度定制服务？</h4>
              <p className="text-white/40 text-[15px] font-medium">
                如需长期采购咨询、厂家协调、项目跟进或企业定向合作，请联系平台进行定制化报价。
              </p>
            </div>
            <button 
              onClick={() => navigate('/custom-service')}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black text-[14px] transition-all"
            >
              申请定制服务
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
