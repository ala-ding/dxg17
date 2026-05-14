
export interface TemplateItem {
  id: string;
  name: string;
  category: string;
  space: string;
  quantity: number;
  unitPrice: number;
  image?: string;
  brand?: string;
  note?: string;
  tags?: string[];
}

export interface PlanTemplate {
  id: string;
  code: string;
  name: string;
  style: string;
  budgetRange: string;
  areaRange: string;
  houseType: string;
  spaces: string[];
  coverImage: string;
  description: string;
  items: TemplateItem[];
}

export const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: 'template-m2-modern',
    code: 'M2',
    name: '品质进阶版｜3-5万｜现代简约 3房2厅软装模板',
    style: '现代简约',
    budgetRange: '3-5万',
    areaRange: '90-120㎡',
    houseType: '三房两厅',
    spaces: ['客厅', '餐厅', '主卧', '次卧', '儿童房/书房', '玄关', '阳台'],
    coverImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2000&auto=format&fit=crop',
    description: '适合刚需家庭的完整软装入门方案，覆盖核心家具、窗帘、灯具、地毯、挂画、绿植与基础摆件。',
    items: [
      // 客厅
      { id: 'm2-living-sofa', name: '现代简约三人位布艺沙发', category: '沙发', space: '客厅', quantity: 1, unitPrice: 3999, brand: 'DXG Select', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1000&auto=format&fit=crop' },
      { id: 'm2-living-coffee-table', name: '圆角岩板茶几', category: '茶几', space: '客厅', quantity: 1, unitPrice: 1299, image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=1000&auto=format&fit=crop' },
      { id: 'm2-living-tv-cabinet', name: '悬浮感电视柜', category: '电视柜', space: '客厅', quantity: 1, unitPrice: 1899, image: 'https://images.unsplash.com/photo-1594913785162-e6783262db80?q=80&w=1000&auto=format&fit=crop' },
      { id: 'm2-living-lounge-chair', name: '单人休闲椅', category: '休闲椅', space: '客厅', quantity: 1, unitPrice: 1299, image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=1000&auto=format&fit=crop' },
      { id: 'm2-living-rug', name: '低饱和几何客厅地毯', category: '地毯', space: '客厅', quantity: 1, unitPrice: 699 },
      { id: 'm2-living-curtain', name: '客厅遮光纱帘组合', category: '窗帘', space: '客厅', quantity: 1, unitPrice: 1800 },
      { id: 'm2-living-floor-lamp', name: '极简落地灯', category: '灯具', space: '客厅', quantity: 1, unitPrice: 499 },
      { id: 'm2-living-art', name: '客厅抽象装饰画组合', category: '挂画', space: '客厅', quantity: 1, unitPrice: 399 },
      { id: 'm2-living-plant', name: '中型绿植与花器', category: '绿植', space: '客厅', quantity: 1, unitPrice: 399 },
      { id: 'm2-living-deco', name: '茶几摆件组合', category: '摆件', space: '客厅', quantity: 1, unitPrice: 299 },
      // 餐厅
      { id: 'm2-dining-table', name: '四人位餐桌', category: '餐桌', space: '餐厅', quantity: 1, unitPrice: 1599, image: 'https://images.unsplash.com/photo-1577489330018-320052a2d4d6?q=80&w=1000&auto=format&fit=crop' },
      { id: 'm2-dining-chair', name: '现代简约餐椅', category: '餐椅', space: '餐厅', quantity: 4, unitPrice: 299 },
      { id: 'm2-dining-pendant', name: '餐厅吊灯', category: '灯具', space: '餐厅', quantity: 1, unitPrice: 599 },
      { id: 'm2-dining-sideboard', name: '薄款餐边柜', category: '餐边柜', space: '餐厅', quantity: 1, unitPrice: 1699 },
      { id: 'm2-dining-art', name: '餐厅小幅挂画', category: '挂画', space: '餐厅', quantity: 1, unitPrice: 199 },
      // 主卧
      { id: 'm2-master-bed', name: '1.8m 软包床', category: '床', space: '主卧', quantity: 1, unitPrice: 2599, image: 'https://images.unsplash.com/photo-1505693419148-43b3586024f1?q=80&w=1000&auto=format&fit=crop' },
      { id: 'm2-master-mattress', name: '1.8m 护脊床垫', category: '床垫', space: '主卧', quantity: 1, unitPrice: 2299 },
      { id: 'm2-master-nightstand', name: '主卧床头柜', category: '床头柜', space: '主卧', quantity: 2, unitPrice: 399 },
      { id: 'm2-master-curtain', name: '主卧遮光窗帘', category: '窗帘', space: '主卧', quantity: 1, unitPrice: 1200 },
      { id: 'm2-master-lamp', name: '主卧床头灯', category: '灯具', space: '主卧', quantity: 2, unitPrice: 199 },
      { id: 'm2-master-bedding', name: '主卧床品四件套', category: '床品', space: '主卧', quantity: 1, unitPrice: 699 },
      { id: 'm2-master-art', name: '主卧床头挂画', category: '挂画', space: '主卧', quantity: 1, unitPrice: 299 },
      // 次卧
      { id: 'm2-second-bed', name: '1.5m 次卧床', category: '床', space: '次卧', quantity: 1, unitPrice: 1799 },
      { id: 'm2-second-mattress', name: '1.5m 次卧床垫', category: '床垫', space: '次卧', quantity: 1, unitPrice: 1499 },
      { id: 'm2-second-nightstand', name: '次卧床头柜', category: '床头柜', space: '次卧', quantity: 1, unitPrice: 299 },
      { id: 'm2-second-curtain', name: '次卧窗帘', category: '窗帘', space: '次卧', quantity: 1, unitPrice: 900 },
      { id: 'm2-second-bedding', name: '次卧床品', category: '床品', space: '次卧', quantity: 1, unitPrice: 499 },
      // 儿童房/书房
      { id: 'm2-study-desk', name: '学习书桌', category: '书桌', space: '儿童房/书房', quantity: 1, unitPrice: 899 },
      { id: 'm2-study-chair', name: '人体工学学习椅', category: '椅子', space: '儿童房/书房', quantity: 1, unitPrice: 699 },
      { id: 'm2-study-bookshelf', name: '开放式书架', category: '书架', space: '儿童房/书房', quantity: 1, unitPrice: 999 },
      { id: 'm2-study-curtain', name: '书房窗帘', category: '窗帘', space: '儿童房/书房', quantity: 1, unitPrice: 800 },
      { id: 'm2-study-table-lamp', name: '护眼台灯', category: '灯具', space: '儿童房/书房', quantity: 1, unitPrice: 299 },
      // 玄关
      { id: 'm2-entry-shoe-cabinet', name: '成品薄款鞋柜', category: '鞋柜', space: '玄关', quantity: 1, unitPrice: 1299 },
      { id: 'm2-entry-mirror', name: '玄关穿衣镜', category: '镜子', space: '玄关', quantity: 1, unitPrice: 299 },
      { id: 'm2-entry-deco', name: '玄关香薰摆件', category: '摆件', space: '玄关', quantity: 1, unitPrice: 199 },
      // 阳台
      { id: 'm2-balcony-chair', name: '阳台休闲椅', category: '休闲椅', space: '阳台', quantity: 2, unitPrice: 399 },
      { id: 'm2-balcony-small-table', name: '阳台小圆几', category: '边几', space: '阳台', quantity: 1, unitPrice: 299 },
      { id: 'm2-balcony-plant', name: '阳台绿植组合', category: '绿植', space: '阳台', quantity: 1, unitPrice: 399 }
    ]
  },
  {
    id: 'template-s1-premium',
    code: 'S1',
    name: '高阶定制版｜15-25万｜理想生活 舒享进阶方案',
    style: '现代简约/奶油风',
    budgetRange: '15-25万',
    areaRange: '90-120㎡',
    houseType: '三房两厅',
    spaces: ['客厅', '餐厅', '主卧', '次卧', '书房', '玄关', '阳台'],
    coverImage: 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?q=80&w=2000&auto=format&fit=crop',
    description: '采用更具质感的品牌家具、全屋定制灯光设计、高端窗帘面料与知名品牌床垫，打造兼具品味与舒适的理想家。',
    items: [
      { id: 's1-living-sofa', name: '意大利真皮转角沙发', category: '沙发', space: '客厅', quantity: 1, unitPrice: 18800, brand: 'DXG Black Label', image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1000&auto=format&fit=crop' },
      { id: 's1-living-coffee-table', name: '天然大理石茶几组合', category: '茶几', space: '客厅', quantity: 1, unitPrice: 6500 },
      { id: 's1-living-chair', name: '设计师款休闲扶手椅', category: '休闲椅', space: '客厅', quantity: 1, unitPrice: 4200 },
      { id: 's1-dining-table', name: '进口岩板伸缩餐桌', category: '餐桌', space: '餐厅', quantity: 1, unitPrice: 7800 },
      { id: 's1-master-bed', name: '大红橡全实木悬浮床', category: '床', space: '主卧', quantity: 1, unitPrice: 9500 },
      { id: 's1-master-mattress', name: '舒达/西屋独立袋装弹簧床垫', category: '床垫', space: '主卧', quantity: 1, unitPrice: 8800 }
      // ... more items would be here
    ]
  },
  {
    id: 'template-x2-luxury',
    code: 'X2',
    name: '臻选收藏版｜100万+｜隐奢御府 顶配全屋方案',
    style: '极简/意式',
    budgetRange: '100万+',
    areaRange: '150㎡+',
    houseType: '四房两厅',
    spaces: ['客厅', '餐厅', '主卧', '次卧', '书房', '衣帽间', '玄关', '阳台'],
    coverImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2000&auto=format&fit=crop',
    description: '殿堂级家居方案，由顶尖设计师款家具、限量艺术挂画、奢侈品级手工地毯与全屋智能软装系统构成。',
    items: [
      { id: 'x2-living-sofa', name: 'Baxter/Minotti 同款意式组合沙发', category: '沙发', space: '客厅', quantity: 1, unitPrice: 125000 },
      { id: 'x2-living-rug', name: '尼泊尔手工真丝地毯', category: '地毯', space: '客厅', quantity: 1, unitPrice: 45000 },
      { id: 'x2-master-bed', name: 'Hästens 同款奢享睡床系统', category: '床', space: '主卧', quantity: 1, unitPrice: 180000 }
      // ... more items would be here
    ]
  }
];
