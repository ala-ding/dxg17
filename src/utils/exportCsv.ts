import { UserPlan } from '../types';

export const exportPlanCsv = (plan: UserPlan) => {
  const headers = ['序号', '产品名称', '品牌', '分类', '空间', '单体单价', '数量', '小计', '备注'];
  
  const allItems = plan.spaces.flatMap(s => 
    s.items.map(item => ({
      name: item.name,
      brand: (item as any).brand || 'DXG',
      category: (item as any).category || '家具',
      space: s.name,
      price: item.price,
      quantity: item.quantity || 1,
      total: item.price * (item.quantity || 1),
      note: item.reason || ''
    }))
  );

  const rows = allItems.map((item, index) => [
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

  // Add summary rows
  const productTotal = allItems.reduce((sum, i) => sum + i.total, 0);
  const serviceFee = Math.round(productTotal * 0.05);
  const deliveryFee = productTotal > 0 ? 1500 : 0;
  const grandTotal = productTotal + serviceFee + deliveryFee;

  rows.push(['', '', '', '', '', '', '', '', '']);
  rows.push(['', '产品总额', '', '', '', '', '', productTotal, '']);
  rows.push(['', '服务费(5%)', '', '', '', '', '', serviceFee, '']);
  rows.push(['', '安装配送费', '', '', '', '', '', deliveryFee, '']);
  rows.push(['', '方案总金额', '', '', '', '', '', grandTotal, '']);

  const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
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
