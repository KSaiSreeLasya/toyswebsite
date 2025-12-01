import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { CATEGORIES } from '../constants';
import { Star, ShoppingBag, ArrowRight, Heart, BellRing, X } from 'lucide-react';
import { Product } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';

const ProductList: React.FC = () => {
  const { products, addToCart, searchQuery, user, toggleWishlist } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(15000);
  const [expandCategories, setExpandCategories] = useState(false);
  const location = useLocation();
  const showWishlistOnly = new URLSearchParams(location.search).get('wishlist') === 'true';
  const categoryDisplayLimit = 6;

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = p.price <= priceRange;
      const matchesWishlist = showWishlistOnly ? user?.wishlist?.includes(p.id) : true;
      
      return matchesCategory && matchesSearch && matchesPrice && matchesWishlist;
    });
  }, [products, selectedCategory, searchQuery, priceRange, showWishlistOnly, user?.wishlist]);

  // Combine default constants with any new categories created by admin
  const allCategories = useMemo(() => {
    const productCategories = products.map(p => p.category);
    return Array.from(new Set([...CATEGORIES, ...productCategories]));
  }, [products]);

  return (
    <div className="space-y-12">
      {/* Wishlist Header */}
      {showWishlistOnly && (
         <div className="bg-red-50 border-2 border-red-100 p-8 rounded-[2.5rem] mb-12 flex flex-col items-center justify-center text-center animate-in slide-in-from-top-4">
             <Heart size={48} className="text-red-500 fill-red-500 mb-4 animate-bounce-slow" />
             <h1 className="text-4xl font-heading font-black text-gray-800 mb-2">My Wishlist</h1>
             <p className="text-gray-600 max-w-lg">Your personal collection of favorite toys! Keep track of what you love.</p>
             <button 
                onClick={() => window.history.back()}
                className="mt-6 flex items-center gap-2 text-gray-500 hover:text-gray-800 font-bold"
             >
                <X size={16} /> Close Wishlist
             </button>
         </div>
      )}

      {/* Hero Section */}
      {!searchQuery && selectedCategory === 'All' && !showWishlistOnly && (
        <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-2xl shadow-primary-200 mb-16 transform transition-all hover:scale-[1.01]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          {/* Fun blobs */}
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl"></div>

          <div className="relative z-10 px-8 py-20 md:px-16 md:py-24 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl space-y-6">
              <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-md border border-white/30 shadow-lg inline-block">✨ New Collection</span>
              <h1 className="text-5xl md:text-7xl font-heading font-black leading-tight drop-shadow-sm">
                Where Imagination <br/><span className="text-yellow-300">Comes to Play!</span>
              </h1>
              <p className="text-xl opacity-90 font-medium leading-relaxed max-w-md">Discover the world's most creative toys. From building blocks to cuddling bears, we have joy for every age.</p>
              <button 
                onClick={() => {
                  document.getElementById('shop-grid')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white text-secondary-600 px-10 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all mt-6 inline-flex items-center gap-3 btn-funky border-gray-200 text-lg"
              >
                Start Shopping <ArrowRight size={20} />
              </button>
            </div>
            <div className="hidden md:block animate-bounce-slow">
               {/* Decorative Abstract Icon */}
               <div className="w-80 h-80 bg-white/10 rounded-full backdrop-blur-md border-4 border-white/20 flex items-center justify-center shadow-2xl transform rotate-6 hover:rotate-12 transition-all duration-500">
                 <ShoppingBag size={120} className="text-white drop-shadow-lg" />
               </div>
            </div>
          </div>
        </div>
      )}

      <div id="shop-grid" className="flex flex-col md:flex-row gap-10">
        {/* Filters Sidebar */}
        <div className="w-full md:w-72 space-y-8 flex-shrink-0">
          <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-gray-100 sticky top-28">
            <h3 className="font-heading font-bold text-xl mb-6 text-gray-800">🔮 Filter Magic</h3>
            
            <div className="mb-8">
              <h4 className="font-bold text-sm text-gray-400 mb-4 uppercase tracking-wide">Category</h4>
              <div className="space-y-2">
                {allCategories.slice(0, expandCategories ? allCategories.length : categoryDisplayLimit).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`block w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all ${selectedCategory === cat ? 'bg-primary-500 text-white shadow-md transform scale-105' : 'text-gray-500 hover:bg-gray-50 hover:pl-6'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {allCategories.length > categoryDisplayLimit && (
                <button
                  onClick={() => setExpandCategories(!expandCategories)}
                  className="mt-4 w-full text-center text-sm font-bold text-primary-600 hover:text-primary-700 py-2 px-4 rounded-xl hover:bg-primary-50 transition-colors"
                >
                  {expandCategories ? '▼ View Less' : '▶ View More'}
                </button>
              )}
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-400 mb-4 uppercase tracking-wide flex justify-between">
                Max Price <span className="text-gray-800">₹{priceRange}</span>
              </h4>
              <input 
                type="range" 
                min="0" 
                max="20000" 
                value={priceRange} 
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-3 bg-gray-100 rounded-full appearance-none cursor-pointer accent-secondary-500 hover:accent-secondary-400"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2 font-bold">
                  <span>₹0</span>
                  <span>₹20,000+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center mb-8 gap-4">
             <h2 className="text-3xl font-heading font-black text-gray-800">
               {searchQuery ? `Search Results for "${searchQuery}"` : showWishlistOnly ? '' : `${selectedCategory} Toys`}
             </h2>
             <span className="text-sm font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{filteredProducts.length} items found</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border-4 border-dashed border-gray-200">
              <div className="text-6xl mb-4">🧸</div>
              <p className="text-gray-500 text-xl font-bold">
                  {showWishlistOnly 
                    ? "Your wishlist is empty! Go find some treasures." 
                    : "No magical toys found matching your criteria."}
              </p>
              {!showWishlistOnly && (
                <button onClick={() => {setPriceRange(20000); setSelectedCategory('All');}} className="text-primary-600 font-bold mt-2 hover:underline">Clear Filters</button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAdd={() => addToCart(product)} 
                    onToggleWishlist={() => toggleWishlist(product.id)}
                    isWishlisted={user?.wishlist?.includes(product.id) || false}
                    userLoggedIn={!!user}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ProductCardProps {
    product: Product;
    onAdd: () => void;
    onToggleWishlist: () => void;
    isWishlisted: boolean;
    userLoggedIn: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd, onToggleWishlist, isWishlisted, userLoggedIn }) => {
  const navigate = useNavigate();
  const isOutOfStock = product.stock <= 0;

  const handleWishlistClick = () => {
      if (!userLoggedIn) {
          navigate('/login');
      } else {
          onToggleWishlist();
      }
  };

  const handleNotifyMe = () => {
      alert(`You'll be notified when "${product.name}" is back in stock!`);
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden border-2 border-gray-100 hover:border-primary-200 card-pop h-full flex flex-col shadow-sm relative group">
      {/* Wishlist Button */}
      <button 
        onClick={handleWishlistClick}
        className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm hover:scale-110 transition-transform"
      >
        <Heart 
            size={20} 
            className={`transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}`} 
        />
      </button>

      {/* Stock Badge */}
      {isOutOfStock && (
        <div className="absolute top-4 left-4 z-10 bg-gray-800/90 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
            Out of Stock
        </div>
      )}

      <div className="relative h-56 overflow-hidden bg-gray-50 p-4 flex items-center justify-center">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className={`w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500 drop-shadow-md rounded-2xl ${isOutOfStock ? 'grayscale opacity-70' : ''}`} 
        />
        {!isOutOfStock && (
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-black text-gray-800 flex items-center gap-1 shadow-sm border border-gray-100">
            <Star size={14} className="fill-yellow-400 text-yellow-400" /> {product.rating}
            </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-primary-500 bg-primary-50 px-2 py-1 rounded-md uppercase tracking-wider">{product.category}</p>
          </div>
          <h3 className="font-heading font-bold text-xl text-gray-800 leading-tight mb-3 line-clamp-2">{product.name}</h3>
          <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed font-medium">{product.description}</p>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <span className="text-2xl font-heading font-black text-gray-900">₹{product.price.toFixed(2)}</span>
          
          {isOutOfStock ? (
            <button 
                onClick={handleNotifyMe}
                className="flex items-center gap-1 text-xs font-bold text-primary-600 bg-primary-50 px-3 py-2 rounded-xl hover:bg-primary-100 transition-colors"
            >
                <BellRing size={14} /> Notify Me
            </button>
          ) : (
            <button 
                onClick={onAdd}
                className="bg-gray-900 hover:bg-primary-600 text-white p-3.5 rounded-2xl transition-all shadow-md active:scale-95 group"
                title="Add to Cart"
            >
                <ShoppingBag size={20} className="group-hover:animate-wiggle" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
