import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ShoppingCart, User, LogOut, Menu, X, Sparkles, XCircle, ArrowUp, Heart } from 'lucide-react';
import { UserRole } from '../types';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, cart, logout, searchQuery, setSearchQuery, shippingPolicy, returnsPolicy } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  // Policy Modal State
  const [activePolicy, setActivePolicy] = useState<'shipping' | 'returns' | null>(null);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b-4 border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
                <div className="bg-primary-500 text-white p-3 rounded-2xl transform rotate-3 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                   <Sparkles size={24} />
                </div>
                <span className="font-heading font-bold text-3xl text-primary-600 tracking-tight group-hover:tracking-wide transition-all">WonderLand</span>
              </Link>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
              <input
                type="text"
                placeholder="🔍 Search for fun..."
                className="w-full border-2 border-primary-200 rounded-full py-2 px-5 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all font-medium text-primary-700 bg-white shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="font-heading font-bold text-lg text-gray-600 hover:text-primary-600 transition-colors">Shop</Link>
              
              {user?.role === UserRole.ADMIN && (
                <Link to="/admin" className="font-heading font-bold text-lg text-secondary-600 hover:text-secondary-700 transition-colors bg-secondary-50 px-3 py-1 rounded-xl">Admin</Link>
              )}

              {user && (
                 <Link to="/?wishlist=true" className="relative text-gray-600 hover:text-red-500 transition-colors group" title="My Wishlist">
                    <div className="bg-white p-2 rounded-xl border-2 border-gray-100 group-hover:border-red-200 transition-colors">
                        <Heart size={24} />
                    </div>
                 </Link>
              )}

              <Link to="/cart" className="relative text-gray-600 hover:text-primary-600 transition-colors group">
                <div className="bg-white p-2 rounded-xl border-2 border-gray-100 group-hover:border-primary-300 transition-colors">
                  <ShoppingCart size={24} />
                </div>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-bounce border-2 border-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="flex items-center gap-4">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 bg-primary-50 px-4 py-2 rounded-full border border-primary-100 hover:border-primary-300 hover:bg-primary-100 transition-colors"
                  >
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-6 h-6 rounded-full border-2 border-primary-400 object-cover"
                      />
                    ) : (
                      <User size={20} className="text-primary-400" />
                    )}
                    <span className="text-sm font-bold text-primary-800">{user.name}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="text-gray-400 hover:text-red-500 transition-colors hover:scale-110 transform"
                    title="Logout"
                  >
                    <LogOut size={24} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn-funky bg-primary-500 hover:bg-primary-600 border-primary-700 text-white px-6 py-2 rounded-full font-bold shadow-lg">
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-primary-600 p-2 bg-gray-100 rounded-xl">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full z-50 shadow-xl">
            <div className="px-4 pt-4 pb-6 space-y-3">
              <input
                type="text"
                placeholder="Search..."
                className="w-full border-2 border-gray-200 rounded-xl py-2 px-3 mb-2 focus:border-primary-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-gray-700 font-bold p-2 hover:bg-primary-50 rounded-lg">Shop</Link>
              {user && (
                  <Link to="/?wishlist=true" onClick={() => setIsMenuOpen(false)} className="block text-gray-700 font-bold p-2 hover:bg-red-50 rounded-lg">My Wishlist</Link>
              )}
              <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="block text-gray-700 font-bold p-2 hover:bg-primary-50 rounded-lg flex justify-between">
                Cart
                <span className="bg-accent-500 text-white text-xs rounded-full px-2 py-0.5">{cartCount}</span>
              </Link>
              {user && (
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block text-primary-600 font-bold p-2 hover:bg-primary-50 rounded-lg flex items-center gap-2">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-5 h-5 rounded-full border-2 border-primary-400 object-cover"
                    />
                  ) : (
                    <User size={18} className="text-primary-400" />
                  )}
                  My Profile ({user.name})
                </Link>
              )}
              {user?.role === UserRole.ADMIN && (
                <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block text-secondary-600 font-bold p-2 hover:bg-secondary-50 rounded-lg">Admin Dashboard</Link>
              )}
              {user ? (
                 <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full text-left text-red-500 font-bold p-2 hover:bg-red-50 rounded-lg">Logout</button>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block text-primary-600 font-bold p-2 hover:bg-primary-50 rounded-lg">Login</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>

      {/* Back To Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-28 right-6 bg-white border-2 border-primary-200 text-primary-600 p-3 rounded-full shadow-lg hover:shadow-xl hover:bg-primary-50 transition-all z-30 animate-in fade-in zoom-in duration-300 group"
          aria-label="Back to Top"
        >
          <ArrowUp size={24} className="group-hover:-translate-y-1 transition-transform" />
        </button>
      )}

      {/* Funky Footer */}
      <footer className="bg-white border-t-4 border-secondary-200 mt-auto relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <h3 className="font-heading font-black text-2xl text-primary-600 mb-4 tracking-tight flex items-center gap-2">
                <Sparkles size={20} /> WonderLand
              </h3>
              <p className="text-gray-500 font-medium">Inspiring imagination, one toy at a time. The best selection of curated toys for all ages.</p>
            </div>
            <div>
              <h3 className="font-heading font-bold text-xl text-gray-800 mb-4">Customer Happiness</h3>
              <ul className="space-y-3 font-medium text-gray-500">
                <li>
                  <button onClick={() => setActivePolicy('shipping')} className="hover:text-primary-600 flex items-center gap-2 group">
                     <span className="w-2 h-2 bg-primary-400 rounded-full group-hover:scale-150 transition-transform"></span> Shipping Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePolicy('returns')} className="hover:text-primary-600 flex items-center gap-2 group">
                    <span className="w-2 h-2 bg-primary-400 rounded-full group-hover:scale-150 transition-transform"></span> Returns & Exchanges
                  </button>
                </li>
                <li><Link to="/faq" className="hover:text-primary-600 flex items-center gap-2 group"><span className="w-2 h-2 bg-primary-400 rounded-full group-hover:scale-150 transition-transform"></span> FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-heading font-bold text-xl text-gray-800 mb-4">Join the Club!</h3>
              <p className="text-gray-500 text-sm mb-4 font-medium">Get secret deals and magic updates.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Email address" className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-secondary-400 outline-none" />
                <button className="bg-secondary-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-secondary-500 btn-funky border-secondary-800">Join</button>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t-2 border-gray-100 text-center text-gray-400 text-sm font-medium">
            © {new Date().getFullYear()} WonderLand Toys. Made with ✨ and 🤖.
          </div>
        </div>
      </footer>

      {/* Policy Modal */}
      {activePolicy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 border-4 border-primary-200">
            <button 
              onClick={() => setActivePolicy(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 p-2 rounded-full"
            >
              <XCircle size={24} />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-500">
                {activePolicy === 'shipping' ? <span className="text-3xl">🚀</span> : <span className="text-3xl">🌈</span>}
              </div>
              <h2 className="font-heading font-black text-3xl text-gray-800">
                {activePolicy === 'shipping' ? 'Shipping Policy' : 'Returns & Exchanges'}
              </h2>
            </div>
            
            <div className="bg-yellow-50 p-6 rounded-2xl border-2 border-yellow-100 text-lg text-gray-700 leading-relaxed font-medium">
              {activePolicy === 'shipping' ? shippingPolicy : returnsPolicy}
            </div>

            <div className="mt-8 text-center">
              <button 
                onClick={() => setActivePolicy(null)}
                className="btn-funky bg-secondary-500 text-white px-8 py-3 rounded-full font-bold hover:bg-secondary-600 border-secondary-700"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
