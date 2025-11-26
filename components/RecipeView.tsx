import React, { useState, useEffect } from 'react';
import { Meal } from '../types';
import { MealService } from '../services/mealService';
import { GeminiService } from '../services/geminiService';
import { ArrowLeft, Play, Sparkles, MapPin, List, ChefHat } from './Icons';
import ReactMarkdown from 'react-markdown';

interface RecipeViewProps {
  meal: Meal;
  onBack: () => void;
}

export const RecipeView: React.FC<RecipeViewProps> = ({ meal, onBack }) => {
  const [chefTips, setChefTips] = useState<string | null>(null);
  const [isLoadingTips, setIsLoadingTips] = useState(false);
  const ingredients = MealService.parseIngredients(meal);

  const getEmbedUrl = (url: string | null) => {
    if (!url) return null;
    try {
      const videoId = url.split('v=')[1];
      if (!videoId) return null;
      const cleanId = videoId.split('&')[0];
      return `https://www.youtube.com/embed/${cleanId}`;
    } catch (e) {
      return null;
    }
  };

  const handleAskChef = async () => {
    if (chefTips) return; // Already loaded
    setIsLoadingTips(true);
    const tips = await GeminiService.getChefTips(meal);
    setChefTips(tips);
    setIsLoadingTips(false);
  };

  const youtubeUrl = getEmbedUrl(meal.strYoutube);

  return (
    <div className="bg-white min-h-full pb-12 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="relative h-[40vh] md:h-[50vh] w-full">
        <img 
          src={meal.strMealThumb} 
          alt={meal.strMeal} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
          <div className="container mx-auto max-w-5xl">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <ChefHat className="w-4 h-4" /> {meal.strCategory}
              </span>
              <span className="bg-slate-700/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {meal.strArea}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-2 shadow-sm">{meal.strMeal}</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 md:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Ingredients & Video */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <List className="w-5 h-5 text-orange-500" /> Ingredients
              </h2>
              <ul className="space-y-3">
                {ingredients.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm md:text-base border-b border-slate-50 last:border-0 pb-2 last:pb-0">
                    <span className="text-slate-700 font-medium">{item.ingredient}</span>
                    <span className="text-slate-500">{item.measure}</span>
                  </li>
                ))}
              </ul>
            </div>

            {youtubeUrl && (
               <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                 <div className="p-4 border-b border-slate-50">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Play className="w-5 h-5 text-red-500" /> Video Tutorial
                    </h2>
                 </div>
                 <iframe 
                   src={youtubeUrl} 
                   title="Recipe Video"
                   className="w-full aspect-video"
                   allowFullScreen
                 />
               </div>
            )}
          </div>

          {/* Right Column: Instructions & AI */}
          <div className="lg:col-span-2 space-y-6">
             {/* Gemini Chef Card */}
             <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" /> Chef's Intelligence
                  </h2>
                  <p className="text-indigo-600/80 text-sm mt-1">
                    Powered by Gemini AI
                  </p>
                </div>
                {!chefTips && (
                  <button 
                    onClick={handleAskChef}
                    disabled={isLoadingTips}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    {isLoadingTips ? (
                      <>Thinking...</>
                    ) : (
                      <>Get Pro Tips & Pairing</>
                    )}
                  </button>
                )}
              </div>
              
              {chefTips && (
                <div className="prose prose-sm prose-indigo max-w-none bg-white/50 p-4 rounded-lg border border-indigo-100">
                  <ReactMarkdown>{chefTips}</ReactMarkdown>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Instructions</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed whitespace-pre-line">
                {meal.strInstructions}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};