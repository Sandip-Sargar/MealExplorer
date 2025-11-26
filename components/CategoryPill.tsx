import React from 'react';
import { Category } from '../types';

interface CategoryPillProps {
  category: Category;
  isActive: boolean;
  onClick: () => void;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({ category, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200
        whitespace-nowrap flex-shrink-0
        ${isActive 
          ? 'bg-orange-500 text-white border-orange-600 shadow-md transform scale-105' 
          : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50'
        }
      `}
    >
      <img 
        src={category.strCategoryThumb} 
        alt={category.strCategory} 
        className="w-6 h-6 object-cover rounded-full"
      />
      <span className="font-medium text-sm">{category.strCategory}</span>
    </button>
  );
};