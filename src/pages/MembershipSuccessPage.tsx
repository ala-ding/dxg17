import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  ShoppingBag,
  User,
  LayoutGrid
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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6 py-32">
      <div className="max-w-2xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="mb-12 relative inline-block"
        >
          <div className="absolute inset-0 bg-brand/20 blur-[60px] rounded-full" />
          <div className="relative w-32 h-32 bg-brand rounded-full flex items-center justify-center shadow-2xl shadow-brand/40">
            <CheckCircle2 className="w-16 h-16 text-white" />
          </div>
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.2, 1.2, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-4 -right-4 w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center shadow-lg"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-[48px] font-black text-white mb-4 tracking-tight">尊贵的{planName}</h1>
          <p className="text-white/40 text-[18px] font-medium mb-12 max-w-md mx-auto leading-relaxed">
            恭喜！您的账号权益已成功升级。现在，您可以立刻开始享受专属的采购特权。
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-16">
            <button
              onClick={() => navigate('/products')}
              className="group p-8 bg-zinc-900 border border-white/10 rounded-[32px] text-left hover:border-brand/40 transition-all"
            >
              <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-white font-black text-[18px] mb-2">进入产品库</h3>
              <p className="text-white/30 text-[13px] font-medium">查看标准服务价与集采规则</p>
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="group p-8 bg-zinc-900 border border-white/10 rounded-[32px] text-left hover:border-brand/40 transition-all"
            >
              <div className="w-12 h-12 bg-white/5 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-white font-black text-[18px] mb-2">个人中心</h3>
              <p className="text-white/30 text-[13px] font-medium">查看会员有效期与勋章</p>
            </button>
          </div>

          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-brand text-[15px] font-black uppercase tracking-widest hover:gap-4 transition-all"
          >
            回到首页 <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
