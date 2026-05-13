/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FloorData, StyleTag, SceneInfo } from './types';

export const FLOORS: FloorData[] = [
  {
    level: 1,
    model: "F1",
    name: "基础配置",
    budget: "1万以内",
    value: "优先配齐高频使用的大件家具，满足基础入住。",
    description: "DXG 全屋配置方案 - 满足基本入住需求",
    people: ["预算紧张", "过渡居住", "出租房或首次简单入住"],
    advice: ["优先选择沙发、床垫、餐桌椅等高频使用产品", "软装可以先做统一色系，再逐步补充"],
    houseType: "127㎡ 三室两厅两卫",
    includes: ["活动家具", "灯具", "窗帘", "地毯", "挂画", "床品", "少量软装"],
    budgetDesc: "不含硬装、家电、定制柜、施工费用"
  },
  {
    level: 2,
    model: "F2",
    name: "标准配置",
    budget: "1-2万",
    value: "基础家具相对完整，兼顾实用和耐看。",
    description: "DXG 全屋配置方案 - 均衡实用选择",
    people: ["刚需购房者", "实用主义家庭", "希望控制预算同时配齐基础家具"],
    advice: ["风格统筹优先，选择大众主流品牌的基础款", "注重耐用度，避开过度装饰"],
    houseType: "127㎡ 三室两厅两卫",
    includes: ["活动家具", "灯具", "窗帘", "地毯", "挂画", "床品", "少量软装"],
    budgetDesc: "不含硬装、家电、定制柜、施工费用"
  },
  {
    level: 3,
    model: "M1",
    name: "实用配置",
    budget: "2-3万",
    value: "三房两厅家具和基础软装较完整，有基本家的氛围。",
    description: "DXG 全屋配置方案 - 高性价比主流推荐",
    people: ["刚入住新家", "追求性价比", "不想太将就的家庭"],
    advice: ["软装饰品比例提升，建立家的包裹感", "关注环保等级和原材料"],
    houseType: "127㎡ 三室两厅两卫",
    includes: ["活动家具", "灯具", "窗帘", "地毯", "挂画", "床品", "少量软装"],
    budgetDesc: "不含硬装、家电、定制柜、施工费用"
  },
  {
    level: 4,
    model: "M2",
    name: "舒适配置",
    budget: "3-5万",
    value: "提升沙发、床垫、餐桌椅等高频家具的舒适度和材质表现。",
    description: "DXG 全屋配置方案 - 体验感明显进阶",
    people: ["追求日常舒适", "改善型小家", "希望家里更体面"],
    advice: ["投资高频使用的家具零件，如真皮/高支棉面料", "软装与灯光深度配合，提升氛围感"],
    houseType: "127㎡ 三室两厅两卫",
    includes: ["活动家具", "灯具", "窗帘", "地毯", "挂画", "床品", "少量软装"],
    budgetDesc: "不含硬装、家电、定制柜、施工费用"
  },
  {
    level: 5,
    model: "P1",
    name: "改善配置",
    budget: "5-10万",
    value: "进入品质改善阶段，材质、工艺、软装完整度明显提升。",
    description: "DXG 全屋配置方案 - 品质生活主力档",
    people: ["品质生活追求者", "对质感有明确要求", "成熟审美体验"],
    advice: ["尝试局部混搭设计师款", "建立色彩与材质的逻辑系统", "注重品牌背书"],
    houseType: "127㎡ 三室两厅两卫",
    includes: ["活动家具", "灯具", "窗帘", "地毯", "挂画", "床品", "少量软装"],
    budgetDesc: "不含硬装、家电、定制柜、施工费用"
  },
  {
    level: 6,
    model: "P2",
    name: "品质配置",
    budget: "10-15万",
    value: "品牌感和设计感提升，空间风格更统一。",
    description: "DXG 全屋配置方案 - 审美与质感的融合",
    people: ["风格爱好者", "希望全屋形成完整审美表达", "资深家装用户"],
    advice: ["引入中高端原创/进口替代品牌", "注重五金与细节工艺", "全屋智能系统兼容性"],
    houseType: "127㎡ 三室两厅两卫",
    includes: ["活动家具", "灯具", "窗帘", "地毯", "挂画", "床品", "少量软装"],
    budgetDesc: "不含硬装、家电、定制柜、施工费用"
  },
  {
    level: 7,
    model: "S1",
    name: "设计配置",
    budget: "15-25万",
    value: "高端国产或设计师家具配置，强调比例、材质和整体审美。",
    description: "DXG 全屋配置方案 - 高阶审美表达",
    people: ["对设计感有明确要求", "追求个性化空间", "高知审美群体"],
    advice: ["不仅是家具，更是室内建筑的一部分", "关注名师作品或具有社交属性的交互家具"],
    houseType: "127㎡ 三室两厅两卫",
    includes: ["活动家具", "灯具", "窗帘", "地毯", "挂画", "床品", "少量软装"],
    budgetDesc: "不含硬装、家电、定制柜、施工费用"
  },
  {
    level: 8,
    model: "S2",
    name: "高阶配置",
    budget: "25-50万",
    value: "国内顶级配置，部分进口单品可选，整体完成度更高。",
    description: "DXG 全屋配置方案 - 奢享生活体验",
    people: ["高阶生活家", "希望获得高端全屋配置体验", "接受高预算弹性"],
    advice: ["预算会因品牌和进口周期产生较大浮动，需深度专业咨询", "国内顶级品牌与部分进口经典单品混搭"],
    houseType: "127㎡ 三室两厅两卫",
    includes: ["活动家具", "灯具", "窗帘", "地毯", "挂画", "床品", "及进口软装"],
    budgetDesc: "因品牌、材质、进口周期产生较大浮动，具体以方案报价为准"
  },
  {
    level: 9,
    model: "X1",
    name: "国际配置",
    budget: "50-100万",
    value: "国际品牌和进口精选配置，强调品牌、设计、材料和工艺。",
    description: "DXG 全屋配置方案 - 国际一线视野",
    people: ["关注国际品牌", "进口家具深度用户", "追求全球一致性体验"],
    advice: ["全线进口品牌配置，强调品牌背书与顶级工艺", "关注家具的长期收藏价值"],
    houseType: "127㎡ 三室两厅两卫",
    includes: ["国际一线大牌家具", "顶级灯饰窗帘", "稀有艺术品"],
    budgetDesc: "包含全案配套服务，具体预算受进口汇率与税费影响"
  },
  {
    level: 10,
    model: "X2",
    name: "顶级配置",
    budget: "100万以上",
    value: "国际高定或私享全案配置，适合定制化、高审美、高预算需求。",
    description: "DXG 全屋配置方案 - 艺术级私享领地",
    people: ["顶级用户", "全案高定需求", "对生活有着极高要求的群体"],
    advice: ["全球溯源选材，空间与家具的艺术化共生", "顶级高定私享服务"],
    houseType: "127㎡ 三室两厅两卫",
    includes: ["全屋国际高定", "收藏级单品", "全案设计与管家式服务"],
    budgetDesc: "私享定制全案，预算无上限，具体以最终全案协议为准"
  }
];

export const STYLE_TAGS: string[] = [
  "现代简约",
  "中古风",
  "意式极简",
  "原木风",
  "北欧风",
  "轻奢"
];

export const QUICK_SEARCH_TAGS: string[] = [
  "沙发",
  "床垫",
  "餐桌椅",
  "中古风",
  "意式极简",
  "高性价比",
  "环保优先",
  "小户型"
];

// Mock Scene Images Mapping
export const SCENE_IMAGES: Record<StyleTag, Record<number, SceneInfo>> = {
  "现代简约": {
    1: { image: "https://images.unsplash.com/photo-1594913785162-e678ac052ddd?auto=format&fit=crop&q=80&w=800", visual: "简单布艺沙发、白墙" },
    2: { image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800", visual: "基础家具、满足刚需" },
    3: { image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800", visual: "浅灰方案、视觉统一" },
    4: { image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800", visual: "米白舒适中心" },
    5: { image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800", visual: "质感单椅、金属灯" },
    6: { image: "https://images.unsplash.com/photo-1616486341353-c5833af9cc18?auto=format&fit=crop&q=80&w=800", visual: "完整多空间组合" },
    7: { image: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=800", visual: "设计感沙发、高级灰" },
    8: { image: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&q=80&w=800", visual: "大平层配置、模块沙发" },
    9: { image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800", visual: "经典藏品、艺术陈列" },
    10: { image: "https://images.unsplash.com/photo-1613545325278-f24b0cae1224?auto=format&fit=crop&q=80&w=800", visual: "全案高定、艺术空间" }
  },
  "中古风": {
    1: { image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=800", visual: "基础木色" },
    2: { image: "https://images.unsplash.com/photo-1505691938895-1758d7eaa511?auto=format&fit=crop&q=80&w=800", visual: "胡桃木小柜" },
    3: { image: "https://images.unsplash.com/photo-1517543110731-ee43e6015b63?auto=format&fit=crop&q=80&w=800", visual: "复古餐椅" },
    4: { image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=800", visual: "中古沙发" },
    5: { image: "https://images.unsplash.com/photo-1513519247388-4e28371ea973?auto=format&fit=crop&q=80&w=800", visual: "皮质单椅" },
    6: { image: "https://images.unsplash.com/photo-1567016432779-094069958ad5?auto=format&fit=crop&q=80&w=800", visual: "全屋胡桃木" },
    7: { image: "https://images.unsplash.com/photo-1581412001602-7042f450c77a?auto=format&fit=crop&q=80&w=800", visual: "意式中古" },
    8: { image: "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=800", visual: "大空间复古" },
    9: { image: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&q=80&w=800", visual: "中古单品收藏" },
    10: { image: "https://images.unsplash.com/photo-1617104551722-3b2d51384400?auto=format&fit=crop&q=80&w=800", visual: "私宅全案中古" }
  },
  "意式极简": {
    1: { image: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&q=80&w=800", visual: "黑白灰基础" },
    2: { image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=800", visual: "意式沙发" },
    3: { image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800", visual: "石材搭配" },
    4: { image: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=800", visual: "低矮模块" },
    5: { image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800", visual: "顶级皮质" },
    6: { image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800", visual: "意式庄园" },
    7: { image: "https://images.unsplash.com/photo-1600607687940-c52af0b439f3?auto=format&fit=crop&q=80&w=800", visual: "漂浮感沙发" },
    8: { image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&q=80&w=800", visual: "大尺度空间" },
    9: { image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?auto=format&fit=crop&q=80&w=800", visual: "意式极奢" },
    10: { image: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=800", visual: "顶级全案" }
  },
  "原木风": {
    1: { image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=800", visual: "浅木桌椅" },
    2: { image: "https://images.unsplash.com/photo-1544450547-55077a288960?auto=format&fit=crop&q=80&w=800", visual: "原木基础" },
    3: { image: "https://images.unsplash.com/photo-1519710192539-7475514e397e?auto=format&fit=crop&q=80&w=800", visual: "自然光木质" },
    4: { image: "https://images.unsplash.com/photo-1510711925727-59b4ac668a6f?auto=format&fit=crop&q=80&w=800", visual: "森林感客厅" },
    5: { image: "https://images.unsplash.com/photo-1549497538-3012255d9a81?auto=format&fit=crop&q=80&w=800", visual: "藤编细节" },
    6: { image: "https://images.unsplash.com/photo-1513519247388-4e28371ea973?auto=format&fit=crop&q=80&w=800", visual: "日系治愈" },
    7: { image: "https://images.unsplash.com/photo-1600585152220-901c3f78a16b?auto=format&fit=crop&q=80&w=800", visual: "极简原木大宅" },
    8: { image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800", visual: "巨量原木" },
    9: { image: "https://images.unsplash.com/photo-1600585154542-630263625f9b?auto=format&fit=crop&q=80&w=800", visual: "原木大师作品" },
    10: { image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=800", visual: "顶级庄园全案" }
  },
  "北欧风": {
    1: { image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800", visual: "北欧基础" },
    2: { image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=800", visual: "温馨沙发" },
    3: { image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=800", visual: "北欧餐厅" },
    4: { image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800", visual: "经典居中" },
    5: { image: "https://images.unsplash.com/photo-1556911220-e150213ff152?auto=format&fit=crop&q=80&w=800", visual: "北欧名椅" },
    6: { image: "https://images.unsplash.com/photo-1616486341353-c5833af9cc18?auto=format&fit=crop&q=80&w=800", visual: "全屋配色" },
    7: { image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800", visual: "高级北欧风" },
    8: { image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=800", visual: "采光大宅" },
    9: { image: "https://images.unsplash.com/photo-1600566752734-2a052ff10409?auto=format&fit=crop&q=80&w=800", visual: "收藏家系列" },
    10: { image: "https://images.unsplash.com/photo-1600566752355-3979ff69a3bc?auto=format&fit=crop&q=80&w=800", visual: "私宅高定" }
  },
  "轻奢": {
    1: { image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800", visual: "金属基础" },
    2: { image: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=800", visual: "精致灯饰" },
    3: { image: "https://images.unsplash.com/photo-1600607687940-c52af0b439f3?auto=format&fit=crop&q=80&w=800", visual: "大理石氛围" },
    4: { image: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=800", visual: "皮沙发轻奢" },
    5: { image: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&q=80&w=800", visual: "奢石手工" },
    6: { image: "https://images.unsplash.com/photo-1616137422495-1e9e46e2aa77?auto=format&fit=crop&q=80&w=800", visual: "轻奢全案" },
    7: { image: "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=800", visual: "意式极奢" },
    8: { image: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&q=80&w=800", visual: "酒店式空间" },
    9: { image: "https://images.unsplash.com/photo-1617104551722-3b2d51384400?auto=format&fit=crop&q=80&w=800", visual: "限定藏品" },
    10: { image: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&q=80&w=800", visual: "顶级庄园" }
  },
  "干净清爽": {
    1: { image: "https://images.unsplash.com/photo-1594913785162-e678ac052ddd?auto=format&fit=crop&q=80&w=800", visual: "简单布艺沙发、白墙" },
    2: { image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800", visual: "基础家具、满足刚需" },
    3: { image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800", visual: "浅灰方案、视觉统一" },
    4: { image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800", visual: "米白舒适中心" },
    5: { image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800", visual: "质感单椅、金属灯" },
    6: { image: "https://images.unsplash.com/photo-1616486341353-c5833af9cc18?auto=format&fit=crop&q=80&w=800", visual: "完整多空间组合" },
    7: { image: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=800", visual: "设计感沙发、高级灰" },
    8: { image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800", visual: "全能型现代家" },
    9: { image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800", visual: "进阶高定感空间" },
    10: { image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800", visual: "顶级生活画卷" }
  },
  "温暖自然": {
    1: { image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800", visual: "基础家具" },
    2: { image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800", visual: "温暖米色系" },
    3: { image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800", visual: "自然材质" },
    4: { image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800", visual: "温馨起居" },
    5: { image: "https://images.unsplash.com/photo-1616486341353-c5833af9cc18?auto=format&fit=crop&q=80&w=800", visual: "舒适中心" },
    6: { image: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=800", visual: "阳光午后" },
    7: { image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800", visual: "温馨客厅" },
    8: { image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800", visual: "极简温馨" },
    9: { image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800", visual: "大平层温暖风" },
    10: { image: "https://images.unsplash.com/photo-1594913785162-e678ac052ddd?auto=format&fit=crop&q=80&w=800", visual: "自然度假感" }
  },
  "复古有氛围": {
    1: { image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800", visual: "复古氛围" },
    2: { image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800", visual: "旧时光" },
    3: { image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800", visual: "木质格调" },
    4: { image: "https://images.unsplash.com/photo-1616486341353-c5833af9cc18?auto=format&fit=crop&q=80&w=800", visual: "书香气息" },
    5: { image: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=800", visual: "氛围拉满" },
    6: { image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800", visual: "艺术空间" },
    7: { image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800", visual: "沉静时刻" },
    8: { image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800", visual: "品质复古" },
    9: { image: "https://images.unsplash.com/photo-1594913785162-e678ac052ddd?auto=format&fit=crop&q=80&w=800", visual: "灵动生活" },
    10: { image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800", visual: "深度搭配" }
  },
  "高级冷静": {
    1: { image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800", visual: "冷静空间" },
    2: { image: "https://images.unsplash.com/photo-1594913785162-e678ac052ddd?auto=format&fit=crop&q=80&w=800", visual: "质感至上" },
    3: { image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800", visual: "极简高级" },
    4: { image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800", visual: "冷色调美学" },
    5: { image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800", visual: "理性结构" },
    6: { image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800", visual: "克制设计" },
    7: { image: "https://images.unsplash.com/photo-1616486341353-c5833af9cc18?auto=format&fit=crop&q=80&w=800", visual: "艺术光影" },
    8: { image: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=800", visual: "深邃空间" },
    9: { image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800", visual: "大平层冷静风" },
    10: { image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800", visual: "顶级冷静美学" }
  }
};
