/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FloorData {
  level: number;
  model: string;
  name: string;
  budget: string;
  value: string;
  description: string;
  people: string[];
  advice: string[];
  houseType: string;
  includes: string[];
  budgetDesc: string;
}

export interface SceneInfo {
  image: string;
  visual: string;
}

export type StyleTag = 
  | '现代简约' 
  | '中古风' 
  | '意式极简' 
  | '原木风' 
  | '北欧风' 
  | '轻奢'
  | '干净清爽'
  | '温暖自然'
  | '复古有氛围'
  | '高级冷静';

export type ModalType = 
  | 'login' 
  | 'member' 
  | 'productDrawer' 
  | 'searchResult' 
  | 'upload' 
  | 'matchIntro' 
  | 'levelDetail' 
  | 'budgetInfo'
  | 'newPlan'
  | 'planSelection'
  | null;

export interface UploadedImage {
  url: string;
  type: 'FLOOR_PLAN' | 'SITE_PHOTO' | 'STYLE_REF' | 'PRODUCT_REF';
}

export interface UserMatchProfile {
  areaRange?: string;
  spaces?: string[];
  budgetRange?: string;
  styleFeelings?: string[];
  familyNeeds?: string[];
  priorities?: string[];
  uploadedImages?: UploadedImage[];
  aiImageAnalysis?: any;
}

export interface PlanSpace {
  id: string;
  name: string;
  budget: number;
  items: PlanProduct[];
  note: string;
  blueprint?: string;
}

export interface PlanProduct {
  id: string;
  product_id?: string;
  vendor_id?: string;
  name: string;
  price: number;
  type: '必买' | '建议' | '可后补';
  score: number;
  image?: string;
  reason?: string;
  impact?: string;
  warning?: string;
  tags?: string[];
  model?: string;
  specs?: string;
  dimensions?: string;
  material?: string;
  quantity?: number;
  discount?: number; // percentage (e.g., 0.9 for 90%)
  unitPrice?: number;
  unit_price?: number;
  product_snapshot?: any;
}

export interface MoodboardItem {
  id: string;
  productId: string;
  x: number;
  y: number;
  scale: number;
  zIndex: number;
  image: string;
  name: string;
  price: number;
}

export interface Moodboard {
  id: string;
  name: string;
  spaceType: string;
  items: MoodboardItem[];
  createdAt: string;
  updatedAt: string;
  aiAnalysis?: string;
}

export interface UserPlan {
  id: string;
  name: string;
  type: 'ai' | 'manual' | 'inspiration' | 'designer';
  status: 'draft' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  clientName?: string;
  projectName?: string;
  note?: string;
  matchProfile: UserMatchProfile;
  spaces: PlanSpace[];
  budget: {
    range?: string;
    estimatedTotal?: number;
    status?: 'under' | 'reasonable' | 'over';
    furnitureTotal?: number;
    softReserve?: number;
    installationReserve?: number;
  };
  completion: number;
  // New fields for plan requirements
  areaRange?: string;
  budgetLimit?: string;
  preferredStyle?: string;
  style?: string;
  houseType?: string;
  familySize?: string;
  livingNeeds?: string;
  priorities?: string;
  notes?: string;
}
