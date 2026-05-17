import { Product, GroupBuyRule, UserMembership } from '../types/business';

export interface GroupBuyCalculationResult {
  standardTotal: number;
  eligibleTotal: number;
  nonEligibleTotal: number;
  discountRate: number;
  discountAmount: number;
  finalEstimatedTotal: number;
  matchedRuleName: string;
}

export function calculateGroupBuyDiscount(
  membership: UserMembership | null,
  items: any[]
): number {
  if (!items || items.length === 0 || membership?.plan_code !== 'professional') {
    return 0;
  }

  // Calculate sum of eligible products
  const eligibleAmount = items.reduce((sum, item) => {
    const product = item.product_snapshot;
    if (product?.allow_group_buy_discount === false) {
      return sum;
    }
    const price = product?.factory_price || item.unit_price || product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  // Group Buy tiers based on current purchase amount
  // 3w+ -> 3%, 10w+ -> 5%, 30w+ -> 8%, 100w+ -> 12%
  if (eligibleAmount >= 1000000) return Math.round(eligibleAmount * 0.12);
  if (eligibleAmount >= 300000) return Math.round(eligibleAmount * 0.08);
  if (eligibleAmount >= 100000) return Math.round(eligibleAmount * 0.05);
  if (eligibleAmount >= 30000) return Math.round(eligibleAmount * 0.03);

  return 0;
}

export const groupBuyPricing = {
  calculateGroupBuyDiscount(
    items: { product: Product; quantity: number }[],
    isProfessional: boolean,
    rules: GroupBuyRule[]
  ): GroupBuyCalculationResult {
    let standardTotal = 0;
    let eligibleTotal = 0;
    let nonEligibleTotal = 0;

    items.forEach(item => {
      const price = item.product.factory_price || item.product.price;
      const subtotal = price * item.quantity;
      standardTotal += subtotal;

      if (item.product.allow_group_buy_discount !== false) {
        eligibleTotal += subtotal;
      } else {
        nonEligibleTotal += subtotal;
      }
    });

    if (!isProfessional) {
      return {
        standardTotal,
        eligibleTotal,
        nonEligibleTotal,
        discountRate: 0,
        discountAmount: 0,
        finalEstimatedTotal: standardTotal,
        matchedRuleName: '普通用户无集采优惠'
      };
    }

    // Filter active rules for professional members and sort by min_order_amount descending
    const activeRules = rules
      .filter(r => r.status === 'active' && r.member_type === 'professional')
      .sort((a, b) => b.min_order_amount - a.min_order_amount);

    // Match the highest rule where eligibleTotal >= min_order_amount
    const matchedRule = activeRules.find(r => eligibleTotal >= r.min_order_amount);

    const discountRate = matchedRule ? matchedRule.discount_rate : 0;
    const discountAmount = Math.round(eligibleTotal * (discountRate / 100));
    const finalEstimatedTotal = standardTotal - discountAmount;

    return {
      standardTotal,
      eligibleTotal,
      nonEligibleTotal,
      discountRate,
      discountAmount,
      finalEstimatedTotal,
      matchedRuleName: matchedRule ? matchedRule.name : '未达集采门槛'
    };
  }
};
