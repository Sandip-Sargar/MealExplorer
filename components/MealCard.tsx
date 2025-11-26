import React from 'react';
import { MealSummary } from '../types';

interface MealCardProps {
  meal: MealSummary;
  onClick: (id: string) => void;
}

export const MealCard: React.FC<MealCardProps> = ({ meal, onClick }) => {
  return (
    <div 
      onClick={() => onClick(meal.idMeal)}
      className="group bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={meal.strMealThumb} 
          alt={meal.strMeal} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <span className="text-white font-medium text-sm">View Recipe</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-800 line-clamp-1 group-hover:text-orange-600 transition-colors">
          {meal.strMeal}
        </h3>
      </div>
    </div>
  );
};