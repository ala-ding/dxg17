import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Truck, Settings, Palette, MessageSquare, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

export default function ServiceSecurityPage() {
  const sections = [
    {
      title: "平台标准服务",
      icon: <ShieldCheck className="w-8 h-8 text-brand" />,
      content: "面向大众消费者的省心交付模式。包含产品基础核对、物流跟踪、集中发货、标准送装与平台售后对接。",
      details: ["产品清单准确性核对", "厂家发货状态同步", "物流异常处理", "标准安装指导"]
    },
    {
      title: "区域服务商服务",
      icon: <CheckCircle2 className="w-8 h-8 text-purple-500" />,
      content: "深度本地化服务模式。由当地入驻的服务商提供上门测量、现场放线、精细化安装及本地极速售后。",
      details: ["上门二次精准测量", "区域仓储中转", "本地化售后团队", "现场安装技术支持"]
    },
    {
      title: "物流运输保障",
      icon: <Truck className="w-8 h-8 text-blue-500" />,
      content: "提供从经济到品牌的四级物流矩阵，满足不同预算与时效需求。全链路物流保险覆盖。",
      details: ["经济/标准/安心/品牌四档可选", "全程物流运费透明", "破损先行赔付", "时效延误补偿"]
    },
    {
      title: "送货与安装",
      icon: <Settings className="w-8 h-8 text-orange-500" />,
      content: "覆盖全国大多数城市的交付网络。支持家具、窗帘、灯具等全门类专业安装，执行标准化验收。",
      details: ["送货入户安装", "按次/按项目收费透明", "安装质量回访", "施工现场清理"]
    },
    {
      title: "售后与设计保障",
      icon: <Palette className="w-8 h-8 text-emerald-500" />,
      content: "除了工厂质保外，平台提供额外的延保与咨询服务。确保所选即所得，风格不走样。",
      details: ["平台代申请工厂质保", "7x12小时售后支持", "设计师搭配指导", "环保材料承诺"]
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1D1D1F] pb-32">
      <div className="max-w-[1200px] mx-auto px-6 pt-32 text-left">
        <Breadcrumbs items={[{ name: '产品中心', path: '/products' }, { name: '服务与保障' }]} />
        
        <header className="mt-12 mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 text-brand rounded-full text-[12px] font-black uppercase tracking-widest">
            Service & Delivery Standard
          </div>
          <h1 className="text-[48px] md:text-[64px] font-black tracking-tight leading-tight">
            全链路交付<br /><span className="text-brand">服务与保障标准</span>
          </h1>
          <p className="max-w-2xl text-[18px] text-gray-500 font-medium leading-relaxed">
            为您打通从工厂生产到用户家中的最后一公里。我们建立了一套严苛的选品与交付标准，确保每一件严选家具都能完美落地。
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="group bg-white p-12 rounded-[56px] border border-gray-100 shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="flex items-center gap-6 mb-10">
                <div className="w-16 h-16 rounded-[28px] bg-gray-50 flex items-center justify-center transition-colors group-hover:bg-brand/5">
                  {section.icon}
                </div>
                <h3 className="text-[28px] font-black">{section.title}</h3>
              </div>
              
              <p className="text-[17px] text-gray-600 mb-10 leading-relaxed font-medium">
                {section.content}
              </p>

              <ul className="grid grid-cols-1 gap-4">
                {section.details.map((detail, dIdx) => (
                  <li key={dIdx} className="flex items-center gap-3 text-[14px] font-black text-gray-400">
                    <ChevronRight className="w-4 h-4 text-brand" /> {detail}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 p-12 bg-zinc-900 rounded-[56px] text-white flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 blur-[120px] pointer-events-none" />
          <div className="relative z-10 max-w-xl">
             <h3 className="text-[32px] font-black mb-4">对服务标准有疑问？</h3>
             <p className="text-white/40 text-[16px] font-medium leading-relaxed mb-8">
               您可以随时联系我们的交付专家，为您详细解释不同服务模式下的责任边界、收费细则及售后处理流程。
             </p>
             <button className="px-10 py-5 bg-brand text-white rounded-[24px] text-[16px] font-black shadow-2xl shadow-brand/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
               咨询专属顾问 <MessageSquare className="w-5 h-5" />
             </button>
          </div>
          <div className="relative z-10 w-full max-w-xs space-y-6">
             <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-brand" />
                <div>
                   <p className="text-[15px] font-black mb-1">责任边界说明</p>
                   <p className="text-[12px] text-white/40 font-bold">明确界定工厂、物流、安装队与平台四方的权责，发生纠纷时快速定损赔付。</p>
                </div>
             </div>
             <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-brand" />
                <div>
                   <p className="text-[15px] font-black mb-1">节点交接标准</p>
                   <p className="text-[12px] text-white/40 font-bold">每一个中间环节都有标准化的验收码与交付单，确保权责分明。</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
