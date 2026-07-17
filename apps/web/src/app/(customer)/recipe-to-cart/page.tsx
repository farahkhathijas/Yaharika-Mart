'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CookingPot, Search, Plus, ShoppingCart, HelpCircle, Check, AlertCircle, Clock, Heart } from 'lucide-react';
import { api, queryKeys } from '@/lib/api-client';
import { useCartStore } from '@/stores/cartStore';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { IProduct, IShop } from '@yaharika/shared-types';

interface MatchedResult {
  ingredient: string;
  matchedProduct: (IProduct & { shopId: IShop | string; shopName: string }) | null;
  substitution: (IProduct & { shopId: IShop | string; shopName: string }) | null;
}

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

  const matchIngredients = async (ingredientList: string[]) => {
    setLoading(true);
    setMatchingResults([]);

    try {
      const results = await Promise.all(
        ingredientList.map(async (ing) => {
          try {
            const response = await api.get<{ items: Array<IProduct & { shopId: IShop }> }>('/products/search', { q: ing, limit: 5 });
            const items = response.data?.items ?? [];
            const inStock = items.find((p) => p.stock > 0);
            const substitute = items.find((p) => p.stock > 0 && p._id !== inStock?._id);

            const enrich = (p: IProduct & { shopId: IShop }) => {
              const shop = p.shopId as IShop;
              return { ...p, shopId: shop._id, shopName: shop.name };
            };

            return {
              ingredient: ing,
              matchedProduct: inStock ? enrich(inStock as IProduct & { shopId: IShop }) : null,
              substitution: !inStock && substitute ? enrich(substitute as IProduct & { shopId: IShop }) : null,
            } as MatchedResult;
          } catch {
            return { ingredient: ing, matchedProduct: null, substitution: null } as MatchedResult;
          }
        })
      );
      setMatchingResults(results);
      const found = results.filter((r) => r.matchedProduct || r.substitution).length;
      if (found === 0) {
        toast.error('No matching ingredients found in nearby shops.');
      } else {
        toast.success(`Found ${found} of ${ingredientList.length} ingredients at local shops!`);
      }
    } catch {
      toast.error('Failed to search for ingredients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    matchIngredients(selectedRecipe.ingredients);
  }, [selectedRecipe]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    // Extract ingredient keywords from custom text
    const keywords = ['rice', 'milk', 'paneer', 'butter', 'tomatoes', 'onions', 'garlic', 'dal', 'oil', 'bread', 'salt', 'sugar', 'tea', 'coffee', 'flour', 'atta', 'cheese', 'eggs', 'chicken', 'fish', 'potatoes', 'onion', 'tomato', 'ginger', 'capsicum', 'carrot', 'spinach', 'ghee', 'dahi', 'yogurt', 'cream', 'chocolate', 'cake', 'biscuit', 'noodles', 'pasta', 'honey', 'jam'];
    const extracted = keywords.filter((word) => customText.toLowerCase().includes(word));
    
    const capitalized = extracted.map((w) => w.charAt(0).toUpperCase() + w.slice(1));
    
    if (capitalized.length === 0) {
      toast.error('No matching ingredients found in recipe text. Try: rice, milk, paneer, tomatoes, onions...');
      return;
    }

    matchIngredients(capitalized);
  };

  const handleAddAll = () => {
    let count = 0;
    matchingResults.forEach((res) => {
      const item = res.matchedProduct || res.substitution;
      if (item) {
        addItem({
          productId: item._id,
          shopId: typeof item.shopId === 'string' ? item.shopId : (item.shopId as IShop)._id,
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
    if (count > 0) {
      toast.success(`Added ${count} items to your shopping cart!`);
    } else {
      toast.error('No items to add.');
    }
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
