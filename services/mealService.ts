import { Meal, Category, MealSummary, ApiParsedIngredient } from '../types';
import { apiCache } from './cacheService';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Helper to handle API response structure
const fetchJson = async <T>(url: string): Promise<T> => {
  const cached = apiCache.get<T>(url);
  if (cached) return cached;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      apiCache.set(url, data);
      return data;
    } catch (e) {
      console.error(`Invalid JSON received from ${url}. Response preview:`, text.substring(0, 100));
      throw new Error('Invalid API response (not JSON)');
    }
  } catch (error) {
    console.error(`Fetch failed for ${url}:`, error);
    throw error;
  }
};

export const MealService = {
  searchMeals: async (query: string): Promise<Meal[]> => {
    if (!query) return [];
    const data = await fetchJson<{ meals: Meal[] }>(`${BASE_URL}/search.php?s=${encodeURIComponent(query)}`);
    return data.meals || [];
  },

  getMealById: async (id: string): Promise<Meal | null> => {
    const data = await fetchJson<{ meals: Meal[] }>(`${BASE_URL}/lookup.php?i=${id}`);
    return data.meals ? data.meals[0] : null;
  },

  getRandomMeal: async (): Promise<Meal | null> => {
    // Don't cache random meals to ensure randomness
    try {
      const response = await fetch(`${BASE_URL}/random.php`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) throw new Error('API Error');
      const text = await response.text();
      const data = JSON.parse(text);
      return data.meals ? data.meals[0] : null;
    } catch (e) {
      console.error("Failed to fetch random meal", e);
      return null;
    }
  },

  getAllCategories: async (): Promise<Category[]> => {
    const data = await fetchJson<{ categories: Category[] }>(`${BASE_URL}/categories.php`);
    return data.categories || [];
  },

  filterByCategory: async (category: string): Promise<MealSummary[]> => {
    const data = await fetchJson<{ meals: MealSummary[] }>(`${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);
    return data.meals || [];
  },

  // Helper: Extract ingredients from flat structure
  parseIngredients: (meal: Meal): ApiParsedIngredient[] => {
    const ingredients: ApiParsedIngredient[] = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = (meal as any)[`strIngredient${i}`];
      const measure = (meal as any)[`strMeasure${i}`];
      
      if (ingredient && ingredient.trim() !== '') {
        ingredients.push({
          ingredient: ingredient.trim(),
          measure: measure ? measure.trim() : '',
        });
      }
    }
    return ingredients;
  }
};