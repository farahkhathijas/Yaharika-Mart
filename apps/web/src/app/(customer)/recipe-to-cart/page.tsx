'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CookingPot, Search, Plus, ShoppingCart, HelpCircle, Check, AlertCircle, Clock, Heart } from 'lucide-react';
import { api, queryKeys } from '@/lib/api-client';
import { useCartStore } from '@/stores/cartStore';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

const PREDEFINED_RECIPES = [
  {
    name: 'Paneer Butter Masala',
    prepTime: '30 mins',
    calories: '420 kcal',
    ingredients: ['Paneer Fresh', 'Full Cream Milk', 'Amul Butter', 'Tomatoes', 'Onions', 'Ginger Fresh', 'Garlic'],
    text: 'Classic Indian dish made with soft paneer cubes in a rich, creamy tomato-butter gravy. Best served with warm naan.',
  },
  {
    name: 'Vegetable Pulao',
    prepTime: '25 mins',
    calories: '310 kcal',
    ingredients: ['Sona Masoori Rice', 'Potatoes', 'Green Capsicum', 'Carrot', 'Ginger Fresh', 'Sunflower Cooking Oil'],
    text: 'A fragrant rice dish loaded with fresh garden vegetables, mild spices, and seasoned with pure sunflower oil.',
  },
  {
    name: 'Dal Tadka',
    prepTime: '20 mins',
    calories: '280 kcal',
    ingredients: ['Toor Dal', 'Tomatoes', 'Onions', 'Garlic', 'Ghee Pure', 'Tata Salt'],
    text: 'Warm and comforting yellow lentils tempered with ghee, garlic, and aromatic Indian spices.',
  },
];

export default function RecipeToCartPage() {
  const { addItem } = useCartStore();
  const [selectedRecipe, setSelectedRecipe] = useState(PREDEFINED_RECIPES[0]);
  const [customText, setCustomText] = useState('');
  const [matchingResults, setMatchingResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const mockMatchIngredients = async (ingredientList: string[]) => {
    setLoading(true);
    setMatchingResults([]);

    // Simulate API search query delay
    setTimeout(() => {
      const results = ingredientList.map((ing) => {
        // Mock finding matching products in the nearest shops
        const price = Math.round(30 + Math.random() * 150);
        const hasStock = Math.random() > 0.15;
        return {
          ingredient: ing,
          matchedProduct: hasStock
            ? {
                _id: `${ing.toLowerCase().replace(/\s+/g, '-')}-id`,
                name: ing,
                price,
                unit: ing.includes('Milk') ? '500 ml' : ing.includes('Oil') ? '1 L' : '500 g',
                shopName: 'Patel Kirana',
                shopId: '1',
                stock: 45,
                version: 0,
              }
            : null,
          substitution: !hasStock
            ? {
                _id: `${ing.toLowerCase().replace(/\s+/g, '-')}-sub-id`,
                name: `${ing} (Organic Alt)`,
                price: Math.round(price * 1.25),
                unit: '500 g',
                shopName: "Sunita's Dairy",
                shopId: '2',
                stock: 20,
                version: 0,
              }
            : null,
        };
      });

      setMatchingResults(results);
      setLoading(false);
      toast.success('Successfully mapped recipe ingredients to local shops!');
    }, 1200);
  };

  useEffect(() => {
    mockMatchIngredients(selectedRecipe.ingredients);
  }, [selectedRecipe]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    // Extract potential food words from custom text (simplified parsing)
    const keywords = ['rice', 'milk', 'paneer', 'butter', 'tomatoes', 'onions', 'garlic', 'dal', 'oil', 'bread'];
    const extracted = keywords.filter((word) => customText.toLowerCase().includes(word));
    
    const capitalized = extracted.map((w) => w.charAt(0).toUpperCase() + w.slice(1));
    
    if (capitalized.length === 0) {
      toast.error('No matching ingredients found in recipe text.');
      return;
    }

    mockMatchIngredients(capitalized);
  };

  const handleAddAll = () => {
    let count = 0;
    matchingResults.forEach((res) => {
      const item = res.matchedProduct || res.substitution;
      if (item) {
        addItem({
          productId: item._id,
          shopId: item.shopId,
          name: item.name,
          price: item.price,
          qty: 1,
          unit: item.unit,
          stock: item.stock,
          version: item.version,
        });
        count++;
      }
    });
    toast.success(`Added ${count} items to your shopping cart! 🛒`);
  };

  const estimatedTotal = matchingResults.reduce((sum, res) => {
    const item = res.matchedProduct || res.substitution;
    return sum + (item ? item.price : 0);
  }, 0);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-5xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold mb-4">
          <CookingPot size={16} />
          Recipe-to-Cart Engine
        </div>
        <h1 className="font-display text-display-md text-foreground mb-3">
          Turn recipes into <span className="text-primary-600">instant shopping lists</span>
        </h1>
        <p className="text-foreground/60 text-lg max-w-xl mx-auto">
          Select a recipe or paste instructions. We automatically find matching ingredients in nearby neighborhood shops.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Predefined List */}
          <div className="card-premium p-5 bg-white space-y-3">
            <h3 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider">Select Predefined Recipe</h3>
            <div className="space-y-2">
              {PREDEFINED_RECIPES.map((recipe) => (
                <button
                  key={recipe.name}
                  onClick={() => setSelectedRecipe(recipe)}
                  className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all ${
                    selectedRecipe.name === recipe.name
                      ? 'border-primary-600 bg-primary-50/30 font-semibold text-primary-900'
                      : 'border-primary-50 hover:bg-primary-50/20 text-foreground/75'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span>{recipe.name}</span>
                    <Clock size={12} className="text-foreground/45" />
                  </div>
                  <p className="text-xs text-foreground/50 line-clamp-1">{recipe.text}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Paste Custom */}
          <div className="card-premium p-5 bg-white space-y-4">
            <h3 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider">Paste Custom Recipe</h3>
            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Paste recipe text here (e.g. Needs milk, butter, onions...)"
                rows={4}
                className="w-full p-3 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
              <button type="submit" className="w-full btn-primary text-xs py-2">
                Extract Ingredients
              </button>
            </form>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-premium p-6 bg-white space-y-6">
            <div className="flex items-center justify-between border-b border-primary-50 pb-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">{selectedRecipe.name}</h2>
                <div className="flex gap-3 text-xs text-foreground/40 mt-1">
                  <span>Prep: {selectedRecipe.prepTime}</span>
                  <span>·</span>
                  <span>Est. Calories: {selectedRecipe.calories}</span>
                </div>
              </div>

              {!loading && matchingResults.length > 0 && (
                <button
                  onClick={handleAddAll}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <ShoppingCart size={13} />
                  Add All to Cart ({formatCurrency(estimatedTotal)})
                </button>
              )}
            </div>

            {/* Matching progress list */}
            {loading ? (
              <div className="space-y-4 py-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-14 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-3" role="region" aria-live="polite">
                {matchingResults.map((res, i) => {
                  const item = res.matchedProduct;
                  const sub = res.substitution;

                  return (
                    <div
                      key={i}
                      className="p-3 border border-primary-50 rounded-xl flex justify-between items-center gap-4 bg-primary-50/10"
                    >
                      <div>
                        <span className="text-xs text-foreground/45 uppercase tracking-wide">Required</span>
                        <p className="font-semibold text-foreground text-sm">{res.ingredient}</p>
                      </div>

                      <div className="text-right">
                        {item ? (
                          <div>
                            <span className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
                              In Stock
                            </span>
                            <p className="text-sm font-semibold text-primary-600 mt-1">
                              {formatCurrency(item.price)} <span className="text-xs text-foreground/40 font-normal">at {item.shopName}</span>
                            </p>
                          </div>
                        ) : sub ? (
                          <div>
                            <span className="text-xs font-semibold text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                              Substituted
                            </span>
                            <p className="text-sm font-semibold text-primary-600 mt-1">
                              {formatCurrency(sub.price)} <span className="text-xs text-foreground/40 font-normal">at {sub.shopName}</span>
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-danger bg-danger/10 px-2 py-0.5 rounded-full">
                            Not Found
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
