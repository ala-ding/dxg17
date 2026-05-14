import React from 'react';
import { pricing } from '../utils/pricing';

interface PriceSummaryProps {
  productTotal: number;
  className?: string;
}

export default function PriceSummary({ productTotal, className = "" }: PriceSummaryProps) {
  const serviceFee = pricing.calculateServiceFee(productTotal);
  const deliveryFee = pricing.calculateDeliveryFee(productTotal);
  const grandTotal = pricing.calculateGrandTotal(productTotal);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center text-[14px] font-bold">
        <span className="text-white/40">产品概算小计</span>
        <span className="text-white">¥{pricing.formatCurrency(productTotal)}</span>
      </div>
      <div className="flex justify-between items-center text-[14px] font-bold">
        <span className="text-white/40">全案服务费 (5%)</span>
        <span className="text-white">¥{pricing.formatCurrency(serviceFee)}</span>
      </div>
      <div className="flex justify-between items-center text-[14px] font-bold">
        <span className="text-white/40">物流及安装预估</span>
        <span className="text-white">¥{pricing.formatCurrency(deliveryFee)}</span>
      </div>
      <div className="h-px bg-white/10 my-2" />
      <div className="flex justify-between items-center text-[20px] font-black">
        <span className="text-white">方案预估总价</span>
        <span className="text-brand">¥{pricing.formatCurrency(grandTotal)}</span>
      </div>
    </div>
  );
}
