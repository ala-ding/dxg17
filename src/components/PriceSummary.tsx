import React from 'react';
import { pricing } from '../utils/pricing';
import { calculateOrderPricing } from '../utils/orderPricing';
import { PlanItem, UserMembership } from '../types/business';

interface PriceSummaryProps {
  items: any[];
  membership: UserMembership | null;
  className?: string;
}

export default function PriceSummary({ items, membership, className = "" }: PriceSummaryProps) {
  const isProfessional = membership?.member_type === 'professional' || membership?.member_type === 'agent';
  
  const pricingResult = calculateOrderPricing({
    items: items as PlanItem[],
    membership,
    serviceMode: isProfessional ? 'self_service' : 'platform_standard'
  });

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center text-[14px] font-bold text-left">
        <span className="text-white/40">产品原价小计</span>
        <span className="text-white">¥{pricing.formatCurrency(pricingResult.factoryTotal)}</span>
      </div>
      
      {!isProfessional && (
        <div className="flex justify-between items-center text-[14px] font-bold text-left">
          <span className="text-white/40">平台服务费 (预计20%)</span>
          <span className="text-white">¥{pricing.formatCurrency(pricingResult.platformServiceFee)}</span>
        </div>
      )}

      {isProfessional && (
        <div className="flex justify-between items-center text-[14px] font-bold text-left">
          <span className="text-white/40 text-brand">专业会员折扣 (预估)</span>
          <span className="text-brand">-¥{pricing.formatCurrency(pricingResult.factoryTotal - pricingResult.estimatedTotal)}</span>
        </div>
      )}

      <div className="flex justify-between items-center text-[14px] font-bold text-left">
        <span className="text-white/40">物流/发货/安装 (预估区)</span>
        <span className="text-white">¥{pricing.formatCurrency(pricingResult.logisticsEstimatedMin)} - ¥{pricing.formatCurrency(pricingResult.logisticsEstimatedMax)}</span>
      </div>

      <div className="h-px bg-white/10 my-2" />
      <div className="flex justify-between items-center text-[22px] font-black text-left">
        <div className="flex flex-col">
          <span className="text-white">预估总价</span>
          <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">{isProfessional ? '专业自主采购概算' : '平台管家代购概算'}</span>
        </div>
        <span className="text-brand">¥{pricing.formatCurrency(pricingResult.estimatedTotal)}</span>
      </div>
    </div>
  );
}
