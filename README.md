# TheMealDB Explorer 

A modern, responsive culinary application built with React and TypeScript. This application interacts with TheMealDB API to provide recipes.

Features

- **Recipe Search**: Real-time search with debouncing to find meals by name.
- **Category Browser**: Browse meals by category (Beef, Vegan, Seafood, etc.) via a responsive sidebar.
- **Recipe Details**:
  - Full ingredient list with measurements.
  - Step-by-step cooking instructions.
  - Embedded YouTube cooking tutorials.
- **🤖 AI Chef Assistance**: Integrated with Google's **Gemini 2.5 Flash** model to provide:
  - Appetizing dish descriptions.
  - Professional "Chef's Secrets" to elevate the dish.
  - Sommelier-grade wine and beverage pairings.
- **"I'm Feeling Hungry"**: Random meal generator for inspiration.
- **Smart Caching**: Custom in-memory LRU (Least Recently Used) caching layer to minimize API requests and improve performance.
- **Responsive Design**: Fully responsive UI built with Tailwind CSS, supporting mobile, tablet, and desktop views.

 Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google GenAI SDK (`@google/genai`)
- **Icons**: Lucide React
- **Data Source**: TheMealDB API (Public)

 Architecture

The project follows a clean separation of concerns:

- **`services/`**: Contains the business logic.
  - `mealService.ts`: Handles all interactions with TheMealDB API.
  - `cacheService.ts`: Implements a robust caching mechanism (LRU eviction policy) to act as a client-side web service layer, caching API responses with TTL (Time To Live).
  - `geminiService.ts`: Manages interaction with the Google Gemini API.
- **`components/`**: Reusable UI components (MealCard, CategoryPill, RecipeView, etc.).
- **`types.ts`**: Centralized TypeScript definitions for API responses and application state.

 Getting Started

 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A generic API Key for Google Gemini (AI Studio)

# Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/themealdb-explorer.git
   cd themealdb-explorer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   The application requires a Google Gemini API key to enable the AI features.
   
   Ensure your environment (or `.env` file) has the following variable:
   ```env
   API_KEY=your_google_gemini_api_key
   ```
   *Note: TheMealDB uses a test key (`1`) by default, so no configuration is needed for recipe data.*

4. **Run the application**
   ```bash
   npm start
   ```

# Caching Strategy

To satisfy web service performance requirements locally, the app implements a custom `CacheService`:
- **Storage**: In-memory Map.
- **Eviction**: LRU (Least Recently Used) policy when the size limit (100 items) is reached.
- **TTL**: Data expires after 10 minutes to ensure freshness while reducing network load.

