import { PlanItem, UserMembership, ServiceProvider, MemberType, ServiceMode } from '../types/business';

interface OrderPricingInput {
  items: PlanItem[];
  membership: UserMembership | null;
  serviceMode: ServiceMode;
  selectedProvider?: ServiceProvider;
  logisticsLevel?: 'none' | 'economic' | 'standard' | '安心' | 'brand';
  afterSalesLevel?: 'none' | 'basic' | '安心' | '尊享';
  installationLevel?: 'none' | 'standard' | 'complex';
  designLevel?: 'none' | 'consulting' | 'single' | 'full';
}

export interface OrderPricingResult {
  factoryTotal: number;
  standardServicePriceTotal: number;
  platformServiceFee: number;
  regionalServiceFee: number;
  afterSalesFee: number;
  logisticsEstimatedMin: number;
  logisticsEstimatedMax: number;
  deliveryInstallationFee: number;
  designServiceFee: number;
  estimatedTotal: number;
  discountTotal: number;
}

export const calculateOrderPricing = ({
  items,
  membership,
  serviceMode,
  selectedProvider,
  logisticsLevel = 'standard',
  afterSalesLevel = 'basic',
  installationLevel = 'standard',
  designLevel = 'none',
}: OrderPricingInput): OrderPricingResult => {
  // 1. Calculate Factory Total (Product only)
  const factoryTotal = items.reduce((sum, item) => {
    const itemPrice = item.product_snapshot?.factory_price || item.product_snapshot?.price || item.unit_price || 0;
    return sum + (itemPrice * item.quantity);
  }, 0);

  // 2. Identify Member Type
  const memberType: MemberType = membership?.member_type || 'consumer';

  // 3. Fulfillment Service Fee
  let platformServiceFee = 0;
  let regionalServiceFee = 0;

  if (serviceMode === 'platform_standard') {
    platformServiceFee = factoryTotal * 0.2; // Default 20%
  } else if (serviceMode === 'regional_provider' && selectedProvider) {
    regionalServiceFee = (factoryTotal * selectedProvider.service_rate) / 100;
  }

  // 4. Logistics
  let logisticsEstimatedMin = 0;
  let logisticsEstimatedMax = 0;
  
  if (logisticsLevel !== 'none') {
    const baseRate = logisticsLevel === 'economic' ? 0.03 : 
                     logisticsLevel === 'standard' ? 0.05 : 
                     logisticsLevel === '安心' ? 0.08 : 0.10;
    logisticsEstimatedMin = factoryTotal * baseRate;
    logisticsEstimatedMax = factoryTotal * (baseRate + 0.05);
  }

  // 5. Installation
  let deliveryInstallationFee = 0;
  if (installationLevel === 'standard') deliveryInstallationFee = 800;
  else if (installationLevel === 'complex') deliveryInstallationFee = 1800;

  // 6. After Sales
  let afterSalesFee = 0;
  if (afterSalesLevel === 'basic') afterSalesFee = 400;
  else if (afterSalesLevel === '安心') afterSalesFee = 800;
  else if (afterSalesLevel === '尊享') afterSalesFee = 1200;

  // 7. Design Service
  let designServiceFee = 0;
  if (designLevel === 'consulting') designServiceFee = 800;
  else if (designLevel === 'single') designServiceFee = 1800;
  else if (designLevel === 'full') designServiceFee = 5000;

  // 8. Group Buy Discount (Only for Professional)
  let discountTotal = 0;
  if (memberType === 'professional') {
    discountTotal = factoryTotal * 0.08; 
  }

  const standardServicePriceTotal = factoryTotal * 1.2;

  const estimatedTotal = factoryTotal + platformServiceFee + regionalServiceFee + afterSalesFee + deliveryInstallationFee + designServiceFee + logisticsEstimatedMin - discountTotal;

  return {
    factoryTotal,
    standardServicePriceTotal,
    platformServiceFee,
    regionalServiceFee,
    afterSalesFee,
    logisticsEstimatedMin,
    logisticsEstimatedMax,
    deliveryInstallationFee,
    designServiceFee,
    estimatedTotal,
    discountTotal,
  };
};
