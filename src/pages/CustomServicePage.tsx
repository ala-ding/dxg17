import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Send, MapPin, Phone, MessageSquare, User, Building2, 
  ChevronRight, ShieldCheck, Zap, X, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { customService } from '../services/customService';

export default function CustomServicePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '', phone: '', wechat: '', city: '',
    user_type: '个人用户', service_type: '长期采购咨询',
    budget_range: '', purchase_time: '', description: '',
    has_checklist: false, need_supplier_coordination: false, need_project_followup: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await customService.createCustomServiceRequest(formData);
      setSubmitted(true);
      setTimeout(() => navigate('/profile'), 3000);
    } catch (err) {
      alert('提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full p-10 md:p-12 bg-[#141414] border border-brand/30 rounded-[40px] text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand" />
          <div className="w-20 h-20 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"><CheckCircle2 className="w-10 h-10" /></div>
          <h2 className="text-[28px] md:text-[32px] font-black text-white mb-4">申请已受理</h2>
          <p className="text-white/30 text-[14px] md:text-[16px] font-medium leading-relaxed mb-6 italic">您的定制需求已进入人工审核队列。顾问将在 24 小时内通过电话或微信与您联系。正在自动返回...</p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-24 md:pt-32 pb-40 overflow-x-hidden text-left">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 md:gap-20">
          <div className="flex-1 space-y-12">
            <header>
               <h1 className="text-[36px] md:text-[56px] font-black text-white mb-4 tracking-tighter leading-none italic uppercase">申请定制服务</h1>
               <p className="text-[15px] md:text-[18px] text-white/30 font-medium max-w-xl leading-relaxed italic">针对项目集采、长期合作或复杂组货，提供深度人工配单与厂家直连协调支持。</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-10 md:space-y-16">
               <div className="space-y-8">
                  <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center shadow-inner"><User className="w-4 h-4" /></div><h3 className="text-[18px] font-black text-white">基础身份信息</h3></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                     {[{ label: '姓名', key: 'name', ph: '如何称呼您' }, { label: '手机号', key: 'phone', ph: '保持联系畅通' }, { label: '微信号', key: 'wechat', ph: '便于深度沟通' }, { label: '所在城市', key: 'city', ph: '项目主要落地城市' }].map(f => (
                       <div key={f.key} className="space-y-2">
                          <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-1">{f.label} *</label>
                          <input required value={(formData as any)[f.key]} onChange={e => setFormData({...formData, [f.key]: e.target.value})} className="w-full h-14 bg-[#141414] border border-white/5 rounded-2xl px-6 text-white text-[15px] font-bold outline-none focus:ring-1 ring-brand transition-all" placeholder={f.ph} />
                       </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center shadow-inner"><Building2 className="w-4 h-4" /></div><h3 className="text-[18px] font-black text-white">业务需求详情</h3></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-1">您所在的领域 *</label>
                        <select value={formData.user_type} onChange={e => setFormData({...formData, user_type: e.target.value})} className="w-full h-14 bg-[#141414] border border-white/5 rounded-2xl px-6 text-white text-[15px] font-bold outline-none focus:ring-1 ring-brand appearance-none">
                           {['个人用户', '设计师', '软装公司', '工程采购', '民宿业主', '企业/B端合作'].map(o => <option key={o} value={o} className="bg-[#141414]">{o}</option>)}
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-1">核心需求类型 *</label>
                        <select value={formData.service_type} onChange={e => setFormData({...formData, service_type: e.target.value})} className="w-full h-14 bg-[#141414] border border-white/5 rounded-2xl px-6 text-white text-[15px] font-bold outline-none focus:ring-1 ring-brand appearance-none">
                           {['长期采购咨询', '厂家深度协调', '项目组货报价', '多品牌集散协调', '企业定向直供'].map(o => <option key={o} value={o} className="bg-[#141414]">{o}</option>)}
                        </select>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-1">详细需求说明 *</label>
                     <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={5} className="w-full bg-[#141414] border border-white/5 rounded-2xl p-6 text-white text-[15px] font-bold outline-none focus:ring-1 ring-brand transition-all resize-none italic" placeholder="请简述您的项目情况、预算范围或当前遇到的采购困难..." />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                     {[{ key: 'has_checklist', label: '已有清单' }, { key: 'need_supplier_coordination', label: '需原厂改制' }, { key: 'need_project_followup', label: '需现场跟进' }].map(c => (
                       <label key={c.key} className={`flex items-center gap-3 p-5 rounded-2xl border transition-all cursor-pointer ${ (formData as any)[c.key] ? 'bg-brand/10 border-brand/20' : 'bg-[#141414] border-white/5 opacity-40' }`}>
                          <input type="checkbox" checked={(formData as any)[c.key]} onChange={e => setFormData({...formData, [c.key]: e.target.checked})} className="w-5 h-5 accent-brand" />
                          <span className="text-[14px] font-black text-white">{c.label}</span>
                       </label>
                     ))}
                  </div>
               </div>

               <button disabled={loading} className="w-full py-6 bg-brand text-white rounded-[28px] font-black text-[18px] shadow-2xl shadow-brand/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  {loading ? '提交中...' : <><Send className="w-6 h-6" /> 发送定制申请</>}
               </button>
            </form>
          </div>

          <aside className="lg:w-[400px] shrink-0">
             <div className="sticky top-40 p-8 md:p-12 bg-white/5 border border-white/10 rounded-[40px] md:rounded-[56px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-[50px] pointer-events-none" />
                <Zap className="w-10 h-10 text-brand mb-8" />
                <h3 className="text-[20px] md:text-[24px] font-black text-white mb-6 italic uppercase">Service Benefits</h3>
                <div className="space-y-8">
                   {[
                     { t: '专人 1V1 响应', d: '跳过自助系统，由资深配单员直接对接您的项目。' },
                     { t: '全球组货协调', d: '针对进口、定制或非标件，提供供应链端深度协调。' },
                     { t: '项目颗粒度优化', d: '针对大型项目进行清单归并，挖掘隐藏的集采折扣。' },
                     { t: '产线状态跟踪', d: '提供从打样、排产到品控的实时反馈机制。' }
                   ].map((it, i) => (
                     <div key={i} className="text-left space-y-1">
                        <p className="text-[16px] font-black text-white italic">{it.t}</p>
                        <p className="text-white/30 text-[13px] font-medium leading-relaxed italic">{it.d}</p>
                     </div>
                   ))}
                </div>
                <div className="mt-12 pt-10 border-t border-white/5 text-center">
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 italic leading-relaxed">Direct Channel Support</p>
                   <button className="text-[13px] font-black text-brand underline underline-offset-4">联系微信客服</button>
                </div>
             </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
