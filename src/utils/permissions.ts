export function maskPrice(value: any, hasPermission: boolean, label: string = '专业会员可见') {
  if (hasPermission) return value;
  return label;
}

export function getNoPermissionText(field: string): string {
  const map: Record<string, string> = {
    'professional_price': '专业会员可见',
    'cost_breakdown': '咨询会员可见',
    'supplier_contact': '申请后查看',
    'tier_price': '专业会员可见',
    'lead_time': '专业会员可见',
    'moq': '专业会员可见'
  };
  return map[field] || '开通会员可见';
}

export function getMembershipUpgradePath(permissionCode: string): string {
  if (permissionCode.includes('professional') || permissionCode.includes('supplier')) {
    return '/membership?tab=professional';
  }
  return '/membership?tab=personal';
}
