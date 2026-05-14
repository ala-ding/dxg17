import { PlanProduct } from '../types';

export const pricing = {
  calculateProductTotal(items: PlanProduct[]): number {
    return items.reduce((sum, item) => {
      if (!item) return sum;
      const price = Number(item.price ?? item.unitPrice ?? (item as any).unit_price ?? 0);
      const quantity = Number(item.quantity ?? 1);
      return sum + (price * quantity);
    }, 0);
  },

  calculateServiceFee(productTotal: number): number {
    // 5% service fee
    return Math.round(productTotal * 0.05);
  },

  calculateDeliveryFee(productTotal: number): number {
    // Basic logic: free over 5000, else 1500
    if (productTotal === 0) return 0;
    return productTotal > 5000 ? 0 : 1500;
  },

  calculateGrandTotal(productTotal: number): number {
    return productTotal + this.calculateServiceFee(productTotal) + this.calculateDeliveryFee(productTotal);
  },

  formatCurrency(amount: number): string {
    return amount.toLocaleString('zh-CN');
  }
};
