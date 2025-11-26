import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter } from 'react-router-dom'; // Included for structure, though we use state routing here for simplicity in single-file logic
import { 
  Menu, 
  Search, 
  ChefHat, 
  RefreshCw,
  X
} from './components/Icons';
import { Loading } from './components/Loading';
import { CategoryPill } from './components/CategoryPill';
import { MealCard } from './components/MealCard';
import { RecipeView } from './components/RecipeView';
import { MealService } from './services/mealService';
import { Category, Meal, MealSummary, ViewState } from './types';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const App = () => {
  // State
  const [viewState, setViewState] = useState<ViewState>(ViewState.HOME);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Beef'); // Default
  const [meals, setMeals] = useState<MealSummary[]>([]);
  const [currentMeal, setCurrentMeal] = useState<Meal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 600);

  // Initial Load
  useEffect(() => {
    const init = async () => {
      try {
        const cats = await MealService.getAllCategories();
        setCategories(cats);
        // Load default category
        loadCategoryMeals('Beef');
      } catch (e) {
        console.error("Failed to init", e);
      }
    };
    init();
  }, []);

  // Search Effect
  useEffect(() => {
    if (debouncedSearch.trim()) {
      handleSearch(debouncedSearch);
    } else if (debouncedSearch === '' && viewState === ViewState.SEARCH_RESULTS) {
       // Reset to home if search cleared
       setViewState(ViewState.HOME);
       loadCategoryMeals(selectedCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const loadCategoryMeals = async (cat: string) => {
    setIsLoading(true);
    try {
      setSelectedCategory(cat);
      const data = await MealService.filterByCategory(cat);
      setMeals(data);
      if (viewState !== ViewState.MEAL_DETAIL) {
        setViewState(ViewState.HOME);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setViewState(ViewState.SEARCH_RESULTS);
    try {
      const results = await MealService.searchMeals(query);
      // Map full meals to summary for grid
      const summaries: MealSummary[] = results.map(m => ({
        idMeal: m.idMeal,
        strMeal: m.strMeal,
        strMealThumb: m.strMealThumb
      }));
      setMeals(summaries);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMealClick = async (id: string) => {
    setIsLoading(true);
    try {
      const meal = await MealService.getMealById(id);
      if (meal) {
        setCurrentMeal(meal);
        setViewState(ViewState.MEAL_DETAIL);
        window.scrollTo(0,0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRandomMeal = async () => {
    setIsLoading(true);
    try {
      const meal = await MealService.getRandomMeal();
      if (meal) {
        setCurrentMeal(meal);
        setViewState(ViewState.MEAL_DETAIL);
        window.scrollTo(0,0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setViewState(searchQuery ? ViewState.SEARCH_RESULTS : ViewState.HOME);
    setCurrentMeal(null);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-orange-600 font-bold text-xl">
              <ChefHat className="w-8 h-8" />
              <span>MealExplorer</span>
            </div>
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          <div className="p-4">
             <button 
                onClick={() => {
                  handleRandomMeal();
                  setIsSidebarOpen(false);
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium"
             >
                <RefreshCw className="w-5 h-5" /> I'm Feeling Hungry
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">Categories</h3>
            {categories.map(cat => (
              <button
                key={cat.idCategory}
                onClick={() => {
                  loadCategoryMeals(cat.strCategory);
                  setSearchQuery('');
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                  ${selectedCategory === cat.strCategory && !searchQuery
                    ? 'bg-orange-50 text-orange-600 font-medium' 
                    : 'text-slate-600 hover:bg-slate-50'
                  }
                `}
              >
                <img src={cat.strCategoryThumb} alt="" className="w-6 h-6 rounded-full object-cover" />
                {cat.strCategory}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 justify-between lg:justify-end gap-4 shrink-0 z-30">
          <button 
            className="lg:hidden p-2 text-slate-500"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search recipes (e.g., 'Arrabiata', 'Pie')..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-orange-500 focus:ring-0 rounded-full transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {process.env.API_KEY ? (
            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               AI Active
            </div>
          ) : (
             <div className="hidden md:flex items-center gap-2 text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
               <span className="w-2 h-2 rounded-full bg-amber-500"></span>
               AI Key Missing
            </div>
          )}
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
          {viewState === ViewState.MEAL_DETAIL && currentMeal ? (
            <RecipeView meal={currentMeal} onBack={handleBack} />
          ) : (
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
              
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800 mb-2">
                  {searchQuery ? `Search Results for "${searchQuery}"` : `${selectedCategory} Meals`}
                </h1>
                <p className="text-slate-500 text-sm">
                  {searchQuery 
                    ? `Found ${meals.length} recipes matching your search.`
                    : `Explore our collection of delicious ${selectedCategory} recipes.`
                  }
                </p>
              </div>

              {/* Horizontal Category Scroll (Mobile Only/Quick Access) */}
              {!searchQuery && (
                <div className="flex lg:hidden gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                  {categories.map(cat => (
                    <CategoryPill 
                      key={cat.idCategory} 
                      category={cat} 
                      isActive={selectedCategory === cat.strCategory}
                      onClick={() => loadCategoryMeals(cat.strCategory)}
                    />
                  ))}
                </div>
              )}

              {isLoading ? (
                <Loading />
              ) : meals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {meals.map(meal => (
                    <MealCard key={meal.idMeal} meal={meal} onClick={handleMealClick} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                  <ChefHat className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">No meals found. Try a different search!</p>
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="mt-4 text-orange-600 font-medium hover:underline"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;