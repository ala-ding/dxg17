export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  priceRange: string;
  image: string;
  gallery: string[];
  style: string[];
  material: string[];
  space: string[];
  ladderLevel: number;
  ladderName: string;
  budgetLevel: string;
  tags: string[];
  highlights: string[];
  dimensions: string;
  colorOptions: string[];
  rating: number;
  recommendationReason: string;
  pros: string[];
  cons: string[];
  isRecommended: boolean;
  isNew: boolean;
  isHot: boolean;
  
  // New detail fields
  tagline?: string;
  budgetImpact?: {
    percentage: number;
    pressure: '低' | '中' | '高';
    comparison: string;
  };
  aestheticLift?: 'A' | 'B' | 'C';
  landingRisk?: '低' | '中' | '高';
  dependencies?: string[];
  suitableFor?: string[];
  notSuitableFor?: string[];
  usageAdvice?: string;
  maintenance?: string;
  entryRequirements?: string[];
  spaceAdvice?: string;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "sofa-001",
    name: "云感模块布艺沙发",
    category: "沙发",
    brand: "DXG Select",
    price: 3899,
    priceRange: "3000-5000",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800",
    gallery: [],
    style: ["现代简约", "奶油风"],
    material: ["科技布", "高回弹海绵"],
    space: ["客厅", "小户型"],
    ladderLevel: 4,
    ladderName: "舒适日常",
    budgetLevel: "2万-3万",
    tags: ["高性价比", "可拆洗", "小户型友好"],
    highlights: ["坐感偏软但有支撑", "适合日常高频使用", "布套可拆洗"],
    dimensions: "2200mm × 950mm × 780mm",
    colorOptions: ["米白", "浅灰"],
    rating: 4.8,
    recommendationReason: "性价比之选。",
    pros: ["价格友好"],
    cons: ["不适合大客厅"],
    isRecommended: true, isNew: false, isHot: true
  },
  {
    id: "sofa-002",
    name: "大开间宽座真皮沙发",
    category: "沙发",
    brand: "Luxe Home",
    price: 12800,
    priceRange: "10000+",
    image: "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?auto=format&fit=crop&q=80&w=800",
    gallery: [],
    style: ["意式极简"],
    material: ["头层牛皮"],
    space: ["客厅", "大户型"],
    ladderLevel: 8,
    ladderName: "高配生活",
    budgetLevel: "12万-20万",
    tags: ["奢华", "宽大"],
    highlights: ["纳帕皮质", "鹅绒填充"],
    dimensions: "3200mm × 1050mm",
    colorOptions: ["焦糖", "大象灰"],
    rating: 4.9,
    isRecommended: true, isNew: true, isHot: true,
    recommendationReason: "顶层玩家首选", pros: [], cons: []
  },
  {
    id: "sofa-003",
    name: "法式奶油风拉扣沙发",
    category: "沙发",
    brand: "Chateau",
    price: 5600,
    priceRange: "5000-10000",
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800",
    gallery: [],
    style: ["奶油风"],
    material: ["雪尼尔"],
    space: ["客厅"],
    ladderLevel: 5,
    ladderName: "品质生活",
    budgetLevel: "3万-5万",
    tags: ["法式", "温馨"],
    highlights: ["全拉扣工艺", "实木框架"],
    dimensions: "2400mm",
    colorOptions: ["珍珠白"],
    rating: 4.7,
    isRecommended: false, isNew: false, isHot: false,
    recommendationReason: "浪漫派的选择", pros: [], cons: []
  },
  {
    id: "bed-001",
    name: "悬浮式实木双人床",
    category: "床 / 床垫",
    brand: "WoodWorks",
    price: 4200,
    priceRange: "3000-5000",
    image: "https://images.unsplash.com/photo-1505693419173-42b925685a91?auto=format&fit=crop&q=80&w=800",
    gallery: [],
    style: ["原木风", "现代简约"],
    material: ["白橡木"],
    space: ["卧室"],
    ladderLevel: 4,
    ladderName: "舒适日常",
    budgetLevel: "2万-3万",
    tags: ["悬浮感", "实木"],
    highlights: ["内置感应灯带", "加厚排骨架"],
    dimensions: "1800mm × 2000mm",
    colorOptions: ["原木色"],
    rating: 4.8,
    isRecommended: true, isNew: false, isHot: true,
    recommendationReason: "颜值极高", pros: [], cons: []
  }
];

// Re-generating to make it 60 items
const cats = ["沙发", "床 / 床垫", "餐桌椅", "柜类收纳", "灯具", "地毯", "软装", "全屋套系"];
const styles = ["现代简约", "奶油风", "中古风", "意式极简", "轻奢风", "原木风", "北欧风"];
const budgetRanges = ["1000-3000", "3000-5000", "5000-10000", "10000+"];
const images = [
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1505693419173-42b925685a91?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1617806118233-18e16208a50a?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=800"
];

const generateMore = (count: number): Product[] => {
  const result: Product[] = [...MOCK_PRODUCTS];
  for (let i = 0; i < count; i++) {
    const cat = cats[i % cats.length];
    const style = styles[i % styles.length];
    const level = (i % 10) + 1;
    const price = 800 + (level * 1500) + (i * 120);
    let priceRange = "1000-3000";
    if (price > 10000) priceRange = "10000+";
    else if (price > 5000) priceRange = "5000-10000";
    else if (price > 3000) priceRange = "3000-5000";

    const catJudgments: Record<string, string[]> = {
      "沙发": ["这类沙发适合小开间客厅，坐感优先，风格不抢戏。", "模块化设计让布局更自由，适合需要灵活变动的家庭。", "坐深很大，适合喜欢‘窝’在沙发里看电影的人。"],
      "床 / 床垫": ["床垫不建议压预算，这件比多数装饰更影响长期体验。", "悬浮感设计能让卧室视觉更通透，扫地机器人无死角。", "靠背厚实，适合有睡前阅读习惯的屋主。"],
      "灯具": ["这盏灯适合作为空间视觉中心，但低层高户型要慎选。", "光影层次感极强，适合作为氛围补充，不建议作为唯一光源。", "极简到极致，适合不想让灯具抢走家具风采的装修。"],
      "餐桌椅": ["桌面材质比造型更重要，这款耐磨耐高温表现极佳。", "圆桌能拉近家人距离，适合餐厅开间稍大的户型。", "轻量化设计，适合餐厅面积局促但追求设计感的家庭。"],
      "柜类收纳": ["视觉统一度的关键，这种低存在感的设计才是高级感。", "拉手设计很讲究，适合追求触感细节控的屋主。"],
      "地毯": ["视觉核心的‘地基’，这款短毛极好打理且不粘尘。", "大面积色块能让零散的家具聚拢，提升空间氛围。"],
      "窗帘": ["影响隐私、光线和整体完成度，建议搭配电动轨道。", "克重足够，垂坠感极佳，是空间高级感的保障。"],
      "软装": ["细节决定成败，这一组能瞬间点亮被忽视的角落。", "哪怕是小挂画，也要讲究画框的材质与留白比例。"]
    };

    const randomJudgment = catJudgments[cat] ? catJudgments[cat][i % catJudgments[cat].length] : "精选优质材料，融合现代审美与实用性。";

    result.push({
      id: `gen-prod-${i}`,
      name: `${style}${cat}系列 P${i+1}`,
      category: cat,
      brand: `DXG Brand ${i % 4 + 1}`,
      price,
      priceRange,
      image: images[i % images.length],
      gallery: [],
      style: [style],
      material: ["环保板材", "精选海绵"],
      space: [["客厅", "卧室", "餐厅", "书房"][(i % 4)]],
      ladderLevel: level,
      ladderName: `方案层级 ${level}`,
      budgetLevel: `${Math.floor(price/1000)}k-${Math.floor(price/1000)+2}k`,
      tags: ["高颜值", "爆款", "限时优选"].slice(0, (i % 3) + 1),
      highlights: ["精选材质", "极简设计"],
      dimensions: "标准规格",
      colorOptions: ["米色", "灰色", "胡桃色"],
      rating: +(4.2 + (Math.random() * 0.8)).toFixed(1),
      recommendationReason: randomJudgment,
      pros: ["设计感强"],
      cons: ["无"],
      isRecommended: i % 4 === 0,
      isNew: i % 6 === 0,
      isHot: i % 5 === 0,
      tagline: cat === '沙发' ? "让客厅先舒服起来。" : cat === '灯具' ? "光影层级，决定空间深度。" : "定义生活的质感基准。",
      budgetImpact: {
        percentage: 15 + (i % 10),
        pressure: i % 3 === 0 ? '低' : i % 3 === 1 ? '中' : '高',
        comparison: `同类均价约 ¥${Math.floor(price * 0.9)} - ¥${Math.floor(price * 1.2)}`
      },
      aestheticLift: i % 3 === 0 ? 'A' : 'B',
      landingRisk: i % 4 === 0 ? '中' : '低',
      dependencies: cat === '沙发' ? ["地毯", "窗帘"] : ["配套边几"],
      suitableFor: ["100-140㎡ 客厅", "极简风格控", "追求坐感体验"],
      notSuitableFor: ["超小户型", "重工业风装饰"],
      usageAdvice: "建议搭配浅色棉麻地毯以增强空间呼吸感。",
      maintenance: "皮质面料需每季度使用专用护理剂，避开阳光直射。",
      entryRequirements: ["电梯门宽 ≥ 85cm", "玄关转角空间充足"],
      spaceAdvice: "建议摆放在客厅中心位置，保留至少 80cm 通道宽度。"
    });
  }
  return result;
};

export const MOCK_PRODUCTS_LIST = generateMore(56);
