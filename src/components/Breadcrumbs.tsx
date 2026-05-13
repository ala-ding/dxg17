import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { FLOORS } from '../constants';

interface BreadcrumbsProps {
  category?: string;
  level?: number | string;
  pageName: string;
}

export default function Breadcrumbs({ category, level, pageName }: BreadcrumbsProps) {
  const floor = typeof level === 'number' || (!isNaN(Number(level)) && level !== "全部") 
    ? FLOORS.find(f => f.level === Number(level)) 
    : null;

  const floorName = floor?.name;
  const floorModel = floor?.model;

  return (
    <nav className="flex items-center gap-2 text-[13px] font-medium text-gray-500 mb-6 flex-wrap">
      <Link 
        to="/ladder" 
        className="flex items-center gap-1.5 hover:text-brand transition-colors group"
      >
        <Home className="w-3.5 h-3.5" />
        <span>首页</span>
      </Link>
      
      <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
      
      {category && (
        <>
          <Link 
            to={(category === '家具天梯' || category === '全屋方案') ? '/ladder' : '/products'} 
            className="text-gray-400 hover:text-brand transition-colors"
          >
            {category === '家具天梯' ? '全屋方案' : category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
        </>
      )}

      {level && level !== "全部" && floorName && floorModel && (
        <>
          <Link 
            to={`/products?level=${level}`}
            className="text-gray-400 hover:text-brand transition-colors"
          >
            DXG {floorModel}｜{floorName}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
        </>
      )}

      <span className="text-gray-900 font-bold">{pageName}</span>
    </nav>
  );
}
