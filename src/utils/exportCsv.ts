import { UserPlan } from '../types';
import { UserMembership, ServiceMode } from '../types/business';
import { calculateOrderPricing } from './orderPricing';
import { pricing } from './pricing';

interface ExportCsvOptions {
  membership: UserMembership | null;
  serviceMode: ServiceMode;
  logisticsLevel: 'none' | 'economic' | 'standard' | '安心' | 'brand';
  afterSalesLevel: 'none' | 'basic' | '安心' | '尊享';
  installationLevel: 'none' | 'standard' | 'complex';
  designLevel: 'none' | 'consulting' | 'single' | 'full';
}

export const exportPlanCsv = (plan: UserPlan, options: ExportCsvOptions) => {
  const { 
    membership, 
    serviceMode, 
    logisticsLevel, 
    afterSalesLevel, 
    installationLevel, 
    designLevel 
  } = options;

  const allItemsList = (plan.spaces?.flatMap(s => s.items || []) || []).filter(Boolean);
  const pricingResult = calculateOrderPricing({
    items: allItemsList as any,
    membership,
    serviceMode,
    logisticsLevel,
    afterSalesLevel,
    installationLevel,
    designLevel
  });

  const headers = ['序号', '产品名称', '品牌', '分类', '空间', '单体单价', '数量', '小计', '备注'];
  
  // 1. Get physical products
  const allItemsMap = new Map<string, any>();
  plan.spaces.forEach(s => {
    s.items.forEach(item => {
      const key = `${s.name}-${item.id || item.product_id || item.name}`;
      if (allItemsMap.has(key)) {
        const existing = allItemsMap.get(key);
        existing.quantity += (item.quantity || 1);
        existing.total += (item.price * (item.quantity || 1));
      } else {
        allItemsMap.set(key, {
          name: item.name,
          brand: (item as any).brand || 'DXG',
          category: (item as any).category || '家具',
          space: s.name,
          price: item.price,
          quantity: item.quantity || 1,
          total: item.price * (item.quantity || 1),
          note: item.reason || ''
        });
      }
    });
  });

  const productRows = Array.from(allItemsMap.values()).map((item, index) => [
    index + 1,
    item.name,
    item.brand,
    item.category,
    item.space,
    item.price,
    item.quantity,
    item.total,
    item.note
  ]);

  // 2. Service product section
  const serviceSectionHeader = ['', '', '', '', '', '', '', '', ''];
  const serviceTitle = ['服务型产品清单', '', '', '', '', '', '', '', ''];
  const serviceHeaders = ['序号', '服务名称', '选择方案', '类型', '数量', '单价', '小计', '备注'];

  const getServiceLabel = (type: string, val: string) => {
    if (type === 'serviceMode') {
      return val === 'platform_standard' ? '平台标准服务' : val === 'regional_provider' ? '区域服务商服务' : '自助采购';
    }
    if (type === 'logistics') {
      return val === 'none' ? '自有物流/自提' : val === 'economic' ? '经济物流' : val === 'standard' ? '标准物流' : val === '安心' ? '安心物流' : '品牌物流';
    }
    if (type === 'installation') {
      return val === 'none' ? '不上楼不安装' : val === 'standard' ? '标准送装' : '复杂送装';
    }
    if (type === 'afterSales') {
      return val === 'none' ? '不购买额外保障' : val === 'basic' ? '基础保障' : val === '安心' ? '安心保障' : '尊享保障';
    }
    if (type === 'design') {
      return val === 'none' ? '不需要设计' : val === 'consulting' ? '轻咨询' : val === 'single' ? '单空间搭配' : '全案软装设计';
    }
    return val;
  };

  const getServiceDesc = (type: string, val: string) => {
     if (type === 'serviceMode') return val === 'self_service' ? '用户自助完成工厂对接与下单' : '平台深度参与全流程核对与交付保障';
     if (type === 'logistics') return val === 'none' ? '用户自行承担物流运输相关责任' : '预估费用，以最终发货单为准';
     if (type === 'installation') return val === 'none' ? '需用户联系第三方或自行处理' : '专业团队上门服务';
     if (type === 'afterSales') return val === 'none' ? '仅享受厂家基础质保' : '平台额外提供的深度保障服务';
     if (type === 'design') return '专业设计师提供的空间规划与选品建议';
     return '';
  };

  const serviceData = [
    { name: '履约服务费', selection: getServiceLabel('serviceMode', serviceMode), fee: pricingResult.platformServiceFee, desc: getServiceDesc('serviceMode', serviceMode) },
    { name: '物流服务费', selection: getServiceLabel('logistics', logisticsLevel), fee: pricingResult.logisticsEstimatedMin, desc: getServiceDesc('logistics', logisticsLevel) },
    { name: '送货安装费', selection: getServiceLabel('installation', installationLevel), fee: pricingResult.deliveryInstallationFee, desc: getServiceDesc('installation', installationLevel) },
    { name: '售后保障费', selection: getServiceLabel('afterSales', afterSalesLevel), fee: pricingResult.afterSalesFee, desc: getServiceDesc('afterSales', afterSalesLevel) },
    { name: '设计服务费', selection: getServiceLabel('design', designLevel), fee: pricingResult.designServiceFee, desc: getServiceDesc('design', designLevel) }
  ];

  const serviceRows = serviceData.map((svc, index) => [
    index + 1,
    svc.name,
    svc.selection,
    '服务',
    1,
    svc.fee,
    svc.fee,
    svc.desc
  ]);

  // 3. Final Summary
  const summaryRows = [
    ['', '', '', '', '', '', '', '', ''],
    ['实物产品清单小计', '', '', '', '', '', '', `¥${pricing.formatCurrency(pricingResult.factoryTotal)}`, ''],
    ['履约服务费', '', '', '', '', '', '', `¥${pricing.formatCurrency(pricingResult.platformServiceFee)}`, ''],
    ['物流服务费', '', '', '', '', '', '', `¥${pricing.formatCurrency(pricingResult.logisticsEstimatedMin)}`, ''],
    ['送货安装费', '', '', '', '', '', '', `¥${pricing.formatCurrency(pricingResult.deliveryInstallationFee)}`, ''],
    ['售后保障费', '', '', '', '', '', '', `¥${pricing.formatCurrency(pricingResult.afterSalesFee)}`, ''],
    ['设计服务费', '', '', '', '', '', '', `¥${pricing.formatCurrency(pricingResult.designServiceFee)}`, ''],
    ['优惠金额', '', '', '', '', '', '', `¥${pricing.formatCurrency(pricingResult.discountTotal)}`, ''],
    ['预计总费用', '', '', '', '', '', '', `¥${pricing.formatCurrency(pricingResult.estimatedTotal)}`, '']
  ];

  const allRows = [
    headers,
    ...productRows,
    serviceSectionHeader,
    serviceTitle,
    serviceHeaders,
    ...serviceRows,
    ...summaryRows
  ];

  // Robust CSV conversion with quoting
  const csvContent = allRows.map(row => 
    row.map(cell => {
      const stringValue = cell === null || cell === undefined ? '' : String(cell);
      // Escape double quotes and wrap in double quotes
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(",")
  ).join("\n");

  const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `DXG方案清单-${plan.name}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
