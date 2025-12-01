import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Star, ShoppingBag, Zap, Heart, ArrowLeft, Check, X } from 'lucide-react';
import Swal from 'sweetalert2';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, addToCart, user, toggleWishlist } = useStore();
  const [quantity, setQuantity] = useState(1);

  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🧸</div>
          <h1 className="text-3xl font-heading font-bold text-gray-800 mb-2">Product Not Found</h1>
          <p className="text-gray-500 mb-6">The product you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isWishlisted = user?.wishlist?.includes(product.id) || false;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      Swal.fire({
        icon: 'error',
        title: 'Out of Stock',
        text: 'This product is currently out of stock.',
        confirmButtonColor: '#7c3aed',
      });
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }

    Swal.fire({
      icon: 'success',
      title: 'Added to Cart!',
      text: `${quantity} × ${product.name} has been added to your cart.`,
      confirmButtonColor: '#10b981',
    });

    setQuantity(1);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      Swal.fire({
        icon: 'error',
        title: 'Out of Stock',
        text: 'This product is currently out of stock.',
        confirmButtonColor: '#7c3aed',
      });
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }

    Swal.fire({
      icon: 'success',
      title: 'Proceeding to Checkout',
      text: `${quantity} × ${product.name} added to cart. Proceeding to checkout...`,
      confirmButtonColor: '#10b981',
    }).then(() => {
      navigate('/cart');
    });
  };

  const handleWishlist = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    toggleWishlist(product.id);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) setQuantity(quantity + 1);
  };

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-bold transition-colors"
      >
        <ArrowLeft size={20} /> Back to Shop
      </button>

      {/* Product Detail Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl p-8 md:p-12 shadow-lg border-2 border-gray-100">
        {/* Product Image Section */}
        <div className="flex flex-col gap-6">
          <div className="relative bg-gray-50 rounded-3xl overflow-hidden flex items-center justify-center min-h-96 border-2 border-gray-100">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className={`w-full h-full object-contain p-8 drop-shadow-lg ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
            />
            
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-gray-800 text-white px-6 py-3 rounded-2xl font-bold text-lg">
                  Out of Stock
                </div>
              </div>
            )}

            <button 
              onClick={handleWishlist}
              className="absolute top-6 right-6 bg-white/90 backdrop-blur-md p-3.5 rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <Heart 
                size={24} 
                className={`transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}`} 
              />
            </button>
          </div>

          {/* Product Badge Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-primary-50 rounded-2xl p-4 text-center border-2 border-primary-200">
              <div className="text-2xl mb-2">⭐</div>
              <div className="text-sm font-bold text-primary-700">Rating</div>
              <div className="text-xl font-heading font-black text-primary-900">{product.rating}</div>
            </div>
            <div className="bg-secondary-50 rounded-2xl p-4 text-center border-2 border-secondary-200">
              <div className="text-2xl mb-2">📦</div>
              <div className="text-sm font-bold text-secondary-700">In Stock</div>
              <div className="text-xl font-heading font-black text-secondary-900">{product.stock}</div>
            </div>
            <div className="bg-accent-50 rounded-2xl p-4 text-center border-2 border-accent-200">
              <div className="text-2xl mb-2">🏷️</div>
              <div className="text-sm font-bold text-accent-700">Category</div>
              <div className="text-lg font-heading font-black text-accent-900 truncate">{product.category}</div>
            </div>
          </div>
        </div>

        {/* Product Info Section */}
        <div className="flex flex-col gap-8">
          {/* Header Info */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-heading font-black text-gray-900 leading-tight mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold text-gray-700">{product.rating} out of 5</span>
                  </div>
                  <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                    {product.category}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-lg leading-relaxed font-medium">
              {product.description}
            </p>
          </div>

          {/* Price Section */}
          <div className="space-y-2">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Price</div>
            <div className="text-5xl font-heading font-black text-gray-900">
              ₹{product.price.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500 font-medium">
              {product.stock > 0 ? (
                <span className="text-green-600 font-bold flex items-center gap-2">
                  <Check size={16} /> In Stock - Available for immediate purchase
                </span>
              ) : (
                <span className="text-red-600 font-bold flex items-center gap-2">
                  <X size={16} /> Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="space-y-3">
              <div className="text-sm font-bold text-gray-700 uppercase tracking-wider">Quantity</div>
              <div className="flex items-center gap-4 bg-gray-100 p-2 rounded-2xl w-fit">
                <button 
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="bg-white px-4 py-2 rounded-lg font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  −
                </button>
                <div className="text-2xl font-heading font-black text-gray-900 min-w-12 text-center">
                  {quantity}
                </div>
                <button 
                  onClick={increaseQuantity}
                  disabled={quantity >= product.stock}
                  className="bg-white px-4 py-2 rounded-lg font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button 
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex-1 flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95"
            >
              <ShoppingBag size={22} /> Add to Cart
            </button>
            <button 
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="flex-1 flex items-center justify-center gap-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95 btn-funky border-primary-800"
            >
              <Zap size={22} /> Buy Now
            </button>
          </div>

          {/* Product Features */}
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 border-2 border-primary-100 space-y-3">
            <h3 className="font-bold text-gray-800 text-lg mb-4">Why Choose This?</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700 font-medium">High-quality materials and safe for children</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700 font-medium">Fast and secure shipping</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700 font-medium">30-day money-back guarantee</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700 font-medium">Excellent customer support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
