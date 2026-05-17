import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Send, 
  MapPin, 
  Phone, 
  MessageSquare, 
  User, 
  Building2, 
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { customService } from '../services/customService';

export default function CustomServicePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    wechat: '',
    city: '',
    user_type: '个人用户',
    service_type: '长期采购咨询',
    budget_range: '',
    purchase_time: '',
    description: '',
    has_checklist: false,
    need_supplier_coordination: false,
    need_project_followup: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await customService.createCustomServiceRequest(formData);
      setSubmitted(true);
      setTimeout(() => navigate('/profile'), 3000);
    } catch (err) {
      alert('提交失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-12 bg-[#141414] border border-brand/30 rounded-[40px] text-center shadow-[0_32px_80px_rgba(0,201,190,0.1)]"
        >
          <div className="w-20 h-20 bg-brand/20 text-brand rounded-full flex items-center justify-center mx-auto mb-8">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">申请已提交</h2>
          <p className="text-white/40 text-[16px] font-medium leading-relaxed mb-8">
            平台会根据你的需求进行评估，并在 24 小时内联系你。正在为你跳转至个人中心...
          </p>
          <div className="w-12 h-1 bg-brand/20 rounded-full mx-auto overflow-hidden">
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-full h-full bg-brand"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_400px] gap-12">
          {/* Left Column: Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-12">
              <h1 className="text-5xl font-black text-white mb-6">申请定制服务</h1>
              <p className="text-white/40 text-[18px] font-medium max-w-xl">
                提供你的具体需求，平台将根据服务内容和沟通成本为你提供专属定制报价。
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Section */}
              <div className="p-8 bg-white/5 border border-white/5 rounded-[32px] space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <h3 className="text-white font-black">基础联系信息</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[12px] font-black text-white/40 uppercase ml-1">姓名 *</label>
                    <input 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none"
                      placeholder="如何称呼你"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-black text-white/40 uppercase ml-1">手机号 *</label>
                    <input 
                      required
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none"
                      placeholder="保持联系畅通"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-black text-white/40 uppercase ml-1">微信号</label>
                    <input 
                      value={formData.wechat}
                      onChange={e => setFormData({...formData, wechat: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none"
                      placeholder="便于详细沟通"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-black text-white/40 uppercase ml-1">城市</label>
                    <input 
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none"
                      placeholder="项目所在地"
                    />
                  </div>
                </div>
              </div>

              {/* Requirement Section */}
              <div className="p-8 bg-white/5 border border-white/5 rounded-[32px] space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-white font-black">服务需求详情</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[12px] font-black text-white/40 uppercase ml-1">用户类型 *</label>
                    <select 
                      value={formData.user_type}
                      onChange={e => setFormData({...formData, user_type: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none appearance-none"
                    >
                      {['个人用户', '设计师', '软装工作室', '装修公司', '民宿/酒店采购', '企业采购', '其他'].map(opt => (
                        <option key={opt} value={opt} className="bg-[#1a1a1a]">{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-black text-white/40 uppercase ml-1">服务需求类型 *</label>
                    <select 
                      value={formData.service_type}
                      onChange={e => setFormData({...formData, service_type: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none appearance-none"
                    >
                      {['长期采购咨询', '厂家沟通协调', '项目报价整理', '多品类组货', '项目清单优化', '供应商筛选', '企业定向合作', '其他'].map(opt => (
                        <option key={opt} value={opt} className="bg-[#1a1a1a]">{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-black text-white/40 uppercase ml-1">具体需求说明 *</label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none resize-none"
                    placeholder="请详细描述你的项目情况和需要平台提供的具体服务内容..."
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4 pt-4">
                  {[
                    { key: 'has_checklist', label: '已有清单' },
                    { key: 'need_supplier_coordination', label: '需要厂家协调' },
                    { key: 'need_project_followup', label: '需要项目跟进' }
                  ].map(check => (
                    <label key={check.key} className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                      <input 
                        type="checkbox"
                        checked={(formData as any)[check.key]}
                        onChange={e => setFormData({...formData, [check.key]: e.target.checked})}
                        className="w-5 h-5 rounded-lg accent-brand"
                      />
                      <span className="text-[14px] font-bold text-white/80">{check.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                disabled={loading}
                className="w-full py-6 bg-brand text-white rounded-[32px] font-black text-[18px] shadow-2xl shadow-brand/20 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-3"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    提交定制服务申请
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Right Column: Info */}
          <div className="space-y-8">
            <div className="p-8 bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/20 rounded-[40px] sticky top-32 shadow-2xl shadow-brand/10">
              <Zap className="w-10 h-10 text-brand mb-6" />
              <h3 className="text-2xl font-black text-white mb-4">定制服务优势</h3>
              <div className="space-y-6">
                {[
                  { title: '专人跟进', desc: '平台资深顾问全程陪同，协调多方进度' },
                  { title: '复杂组货', desc: '多品类、多区域家具统一集采与报价整理' },
                  { title: '厂家深度协调', desc: '包括改制建议、库存插单及现场异常处理' },
                  { title: '项目清单优化', desc: '根据预算深度挖掘高性价比替代方案' }
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <p className="font-black text-white text-[15px]">{item.title}</p>
                    <p className="text-white/40 text-[13px] font-medium leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
