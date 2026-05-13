import React from 'react';
import { motion } from 'motion/react';
import { 
  Armchair, Bed, LayoutGrid, Utensils, 
  Lamp, Waves, Image as ImageIcon, 
  Home, Box, ArrowRight, Grid3X3, Layout
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { name: '沙发', desc: '客厅舒适度的核心大件', icon: <Armchair className="w-6 h-6" />, color: 'bg-orange-50 text-orange-500' },
  { name: '床垫', desc: '影响睡眠体验的关键产品', icon: <Waves className="w-6 h-6" />, color: 'bg-blue-50 text-blue-500' },
  { name: '床', desc: '卧室空间的精神堡垒', icon: <Bed className="w-6 h-6" />, color: 'bg-indigo-50 text-indigo-500' },
  { name: '餐桌椅', desc: '一家人每天都会用到的家具', icon: <Utensils className="w-6 h-6" />, color: 'bg-emerald-50 text-emerald-500' },
  { name: '茶几', desc: '客厅中心的社交焦点', icon: <Box className="w-6 h-6" />, color: 'bg-amber-50 text-amber-500' },
  { name: '灯具', desc: '营造家内氛围的点睛之笔', icon: <Lamp className="w-6 h-6" />, color: 'bg-blue-50 text-blue-600' },
  { name: '窗帘', desc: '调节光影与隐私的柔性面料', icon: <LayoutGrid className="w-6 h-6" />, color: 'bg-cyan-50 text-cyan-500' },
  { name: '地毯', desc: '提升足下触感的升温好物', icon: <Grid3X3 className="w-6 h-6" />, color: 'bg-rose-50 text-rose-500' },
  { name: '挂画', desc: '表达主人审美的艺术符号', icon: <ImageIcon className="w-6 h-6" />, color: 'bg-purple-50 text-purple-500' },
  { name: '收纳柜', desc: '解决居家整洁的实用方案', icon: <Layout className="w-6 h-6" />, color: 'bg-slate-50 text-slate-500' },
  { name: '全屋方案', desc: '按预算直接看整套配置', icon: <Home className="w-6 h-6" />, color: 'bg-brand/10 text-brand' }
];

export default function CategorySelector() {
  const scrollToPreview = () => {
    document.getElementById('house-plan-preview')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="w-full max-w-[1400px] mx-auto py-24 px-10">
      <div className="flex flex-col items-center mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-4"
        >
          <div className="w-8 h-[2px] bg-brand/30" />
          <span className="text-[14px] font-black text-brand uppercase tracking-[0.2em]">按家具类目开始选</span>
          <div className="w-8 h-[2px] bg-brand/30" />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[36px] font-black text-gray-900 tracking-tight"
        >
          从高频家具开始，先看单品，再组合成全屋方案
        </motion.h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {CATEGORIES.map((cat, i) => {
          const isWholeHouse = cat.name === '全屋方案';
          return (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
            >
              {isWholeHouse ? (
                <button 
                  onClick={scrollToPreview}
                  className="w-full text-left glass-card p-6 border-white/60 hover:border-brand/40 hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
                  <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center mb-5 transition-transform group-hover:scale-110`}>
                    {cat.icon}
                  </div>
                  <h3 className="text-[18px] font-black text-gray-900 mb-2">{cat.name}</h3>
                  <p className="text-[13px] text-gray-400 font-bold leading-relaxed">{cat.desc}</p>
                  <div className="mt-4 flex items-center gap-1.5 text-brand text-[12px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                    立即预览 <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              ) : (
                <Link 
                  to={`/products?category=${cat.name === '床 / 床垫' ? '床' : cat.name}`}
                  className="block glass-card p-6 border-white/60 hover:border-brand/40 hover:shadow-xl hover:-translate-y-1 transition-all group"
                >
                  <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center mb-5 transition-transform group-hover:scale-110`}>
                    {cat.icon}
                  </div>
                  <h3 className="text-[18px] font-black text-gray-900 mb-2">{cat.name}</h3>
                  <p className="text-[13px] text-gray-400 font-bold leading-relaxed">{cat.desc}</p>
                </Link>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
