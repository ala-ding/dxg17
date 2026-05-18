import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Truck, Settings, Palette, MessageSquare, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

export default function ServiceSecurityPage() {
  const sections = [
    { title: "平台标准服务", icon: <ShieldCheck className="w-8 h-8 text-brand" />, content: "面向大众消费者的省心交付模式。包含产品基础核对、物流跟踪、集中发货、标准送装与平台售后对接。", details: ["产品清单准确性核对", "厂家发货状态同步", "物流异常处理", "标准安装指导"] },
    { title: "区域服务商服务", icon: <CheckCircle2 className="w-8 h-8 text-purple-500" />, content: "深度本地化服务模式。由当地入驻的服务商提供上门测量、现场放线、精细化安装及本地极速售后。", details: ["上门二次精准测量", "区域仓储中转", "本地化售后团队", "现场安装技术支持"] },
    { title: "物流运输保障", icon: <Truck className="w-8 h-8 text-blue-500" />, content: "提供从经济到品牌的四级物流矩阵，满足不同预算与时效需求。全链路物流保险覆盖。", details: ["经济/标准/安心/品牌四档可选", "全程物流运费透明", "破损先行赔付", "时效延误补偿"] },
    { title: "送货与安装", icon: <Settings className="w-8 h-8 text-orange-500" />, content: "覆盖全国大多数城市的交付网络。支持家具、窗帘、灯具等全门类专业安装，执行标准化验收。", details: ["送货入户安装", "按次/按项目收费透明", "安装质量回访", "施工现场清理"] },
    { title: "售后与设计保障", icon: <Palette className="w-8 h-8 text-emerald-500" />, content: "除了工厂质保外，平台提供额外的延保与咨询服务。确保所选即所得，风格不走样。", details: ["平台代申请工厂质保", "712小时售后支持", "设计师搭配指导", "环保材料承诺"] }
  ];

  return (
    <main className="min-h-screen bg-[#FDFDFD] text-[#1D1D1F] pt-24 md:pt-32 pb-40 overflow-x-hidden text-left">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="hidden md:block mb-8"><Breadcrumbs items={[{ name: '产品库', path: '/products' }, { name: '服务与保障' }]} /></div>
        
        <header className="mb-16 md:mb-24 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/5 text-brand rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Service & Delivery Standards</div>
          <h1 className="text-[40px] md:text-[64px] font-black tracking-tighter leading-[1.1]">全链路交付<br /><span className="text-brand">服务与保障标准</span></h1>
          <p className="max-w-xl text-[16px] md:text-[18px] text-zinc-500 font-medium leading-relaxed italic">为您打通从工厂生产到用户家中的最后一公里。我们建立了一套严苛的选品与交付标准，确保每一件严选家具都能完美落地。</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {sections.map((section, idx) => (
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} key={idx} className="group bg-white p-8 md:p-12 rounded-[40px] md:rounded-[56px] border border-gray-100 shadow-xl hover:shadow-2xl transition-all h-full flex flex-col">
              <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-10">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-[28px] bg-gray-50 flex items-center justify-center group-hover:bg-brand/10 transition-colors shrink-0">{section.icon}</div>
                <h3 className="text-[20px] md:text-[28px] font-black italic">{section.title}</h3>
              </div>
              <p className="text-[15px] md:text-[17px] text-zinc-600 mb-8 md:mb-10 leading-relaxed font-medium italic">{section.content}</p>
              <ul className="mt-auto space-y-3">
                {section.details.map((detail, dIdx) => (
                  <li key={dIdx} className="flex items-center gap-2 text-[12px] md:text-[13px] font-black text-zinc-400"><ChevronRight className="w-3.5 h-3.5 text-brand" /> {detail}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <section className="mt-20 p-8 md:p-14 bg-zinc-900 rounded-[40px] md:rounded-[64px] text-white flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden relative border border-white/5">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand/10 blur-[100px] pointer-events-none" />
          <div className="relative z-10 lg:flex-1 text-center lg:text-left">
             <h3 className="text-[28px] md:text-[36px] font-black mb-4 italic">对交付标准有疑问？</h3>
             <p className="text-white/40 text-[14px] md:text-[16px] font-medium leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">您可以随时联系我们的交付专家，为您详细解释不同服务模式下的责任边界、收费细则及售后处理流程。</p>
             <button className="w-full sm:w-auto px-10 h-16 bg-brand text-white rounded-[24px] text-[16px] font-black shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">咨询专属顾问 <MessageSquare className="w-5 h-5" /></button>
          </div>
          <div className="relative z-10 w-full lg:w-auto flex flex-col md:flex-row lg:flex-col gap-4">
             {[{ icon: <AlertCircle className="w-6 h-6 text-brand" />, t: '责任边界说明', d: '明确界定工厂、物流、安装与平台权责，发生纠纷时快速定损赔付。' }, { icon: <CheckCircle2 className="w-6 h-6 text-brand" />, t: '节点交接标准', d: '每一个环节都有标准化验收码与交付单，确保权责分明，链路闭环。' }].map((it, i) => (
                <div key={i} className="flex-1 p-6 bg-white/5 rounded-3xl border border-white/5 flex items-start gap-4">
                   <div className="shrink-0 mt-1">{it.icon}</div>
                   <div className="text-left"><p className="text-[15px] font-black mb-1">{it.t}</p><p className="text-[12px] text-white/30 font-bold leading-relaxed">{it.d}</p></div>
                </div>
             ))}
          </div>
        </section>
      </div>
    </main>
  );
}
