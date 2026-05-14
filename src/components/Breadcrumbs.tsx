import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  isDark?: boolean;
  className?: string;
}

export default function Breadcrumbs({ items, isDark = false, className = "" }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  const textColor = isDark ? 'text-white/42' : 'text-black/38';
  const hoverColor = isDark ? 'hover:text-white/72' : 'hover:text-black/68';
  const separatorColor = isDark ? 'text-white/24' : 'text-black/24';
  const activeColor = isDark ? 'text-white/62' : 'text-black/58';

  return (
    <nav className={`flex items-center gap-2 text-[13px] leading-none mt-9 mb-8 flex-wrap ${className}`}>
      <Link 
        to="/" 
        className={`${textColor} ${hoverColor} transition-all duration-200 shrink-0`}
      >
        首页
      </Link>
      
      {items.length > 2 && (
        <span className={`flex items-center gap-2 md:hidden`}>
          <ChevronRight className={`w-3 h-3 ${separatorColor} shrink-0`} />
          <span className={`${textColor}`}>...</span>
        </span>
      )}

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isMiddle = items.length > 2 && index > 0 && !isLast;
        
        return (
          <React.Fragment key={`${item.name}-${index}`}>
            <div className={`items-center gap-2 ${isMiddle ? 'hidden md:flex' : 'flex'}`}>
              <ChevronRight className={`w-3 h-3 ${separatorColor} shrink-0`} />
              
              {item.path && !isLast ? (
                <Link 
                  to={item.path}
                  className={`${textColor} ${hoverColor} transition-all duration-200 whitespace-nowrap`}
                >
                  {item.name}
                </Link>
              ) : (
                <span className={`${activeColor} font-medium whitespace-nowrap`}>
                  {item.name}
                </span>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
