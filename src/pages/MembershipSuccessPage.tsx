import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  CheckCircle2, ArrowRight, Sparkles, ShoppingBag, User, LayoutGrid
} from 'lucide-react';

export default function MembershipSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planCode = searchParams.get('plan') || 'consulting';
  
  const planName = {
    consulting: '咨询会员',
    professional: '专业会员'
  }[planCode as 'consulting' | 'professional'] || '咨询会员';

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6 py-32 overflow-x-hidden">
      <div className="max-w-[700px] w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          className="mb-12 relative inline-block"
        >
          <div className="absolute inset-0 bg-brand/30 blur-[60px] rounded-full" />
          <div className="relative w-24 h-24 md:w-32 md:h-32 bg-brand rounded-full flex items-center justify-center shadow-2xl shadow-brand/40">
            <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-white" />
          </div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-2 -right-2 md:-top-4 md:-right-4 w-10 h-10 md:w-12 md:h-12 bg-amber-500 rounded-full flex items-center justify-center shadow-lg"
          >
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="text-[32px] md:text-[48px] font-black text-white mb-4 tracking-tight leading-none italic uppercase">尊贵的{planName}</h1>
          <p className="text-white/40 text-[15px] md:text-[18px] font-medium mb-12 max-w-[400px] mx-auto leading-relaxed italic">
            恭喜！您的账号权益已同步激活。现在，您可以立刻开始探索底线哥的专业选购能力。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16 px-4 md:px-0">
            <button
              onClick={() => navigate('/products')}
              className="group p-8 bg-[#141414] border border-white/5 rounded-[40px] text-left hover:border-brand/40 transition-all shadow-xl"
            >
              <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-white font-black text-[18px] mb-2">进入选品库</h3>
              <p className="text-white/30 text-[13px] font-medium italic">浏览标准服务价与集采细节</p>
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="group p-8 bg-[#141414] border border-white/5 rounded-[40px] text-left hover:border-brand/40 transition-all shadow-xl"
            >
              <div className="w-12 h-12 bg-white/5 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-white font-black text-[18px] mb-2">管理控制台</h3>
              <p className="text-white/30 text-[13px] font-medium italic">管理您的方案、订单与特惠</p>
            </button>
          </div>

          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-brand text-[15px] font-black uppercase tracking-[0.2em] hover:gap-4 transition-all pb-2 md:pb-0">回到首页 <ArrowRight className="w-5 h-5" /></button>
        </motion.div>
      </div>
    </main>
  );
}
