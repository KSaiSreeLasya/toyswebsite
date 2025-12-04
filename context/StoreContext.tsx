import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, User, UserRole, Order, AdminPermission, PaymentConfig } from '../types';
import { INITIAL_PRODUCTS } from '../constants';
import { signUp, signIn, signOut } from '../services/supabaseService';
import { syncProductsToDatabase, getProductsFromDatabase } from '../services/productService';
import { addToCartDatabase, removeFromCartDatabase, updateCartQuantityDatabase, getCartFromDatabase, clearCartDatabase } from '../services/cartService';
import { createOrderInDatabase, getOrdersFromDatabase } from '../services/orderService';
import { generateUUID } from '../utils/uuid';

interface StoreContextType {
  user: User | null;
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  teamMembers: User[];
  shippingPolicy: string;
  returnsPolicy: string;
  paymentConfig: PaymentConfig;
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  placeOrder: () => void;
  addTeamMember: (member: User) => void;
  removeTeamMember: (id: string) => void;
  toggleWishlist: (productId: string) => void;
  updateUserCoins: (coinDelta: number) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setShippingPolicy: (policy: string) => void;
  setReturnsPolicy: (policy: string) => void;
  updatePaymentConfig: (config: PaymentConfig) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // User accounts storage
  const [userAccounts, setUserAccounts] = useState<Array<{ email: string; password: string; role: UserRole }>>([]);
  
  // Policies State
  const [shippingPolicy, setShippingPolicy] = useState(
    "🚀 Rocket-Fast Shipping! We blast off your order within 24 hours. Usually arrives in 2-3 fun-filled days!"
  );
  const [returnsPolicy, setReturnsPolicy] = useState(
    "🌈 Happiness Guarantee! If it doesn't spark pure joy, send it back within 30 days for a pot of gold (full refund)."
  );

  // Payment Config State
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    stripePublishableKey: '',
    razorpayKeyId: '',
    paypalClientId: ''
  });

  // Persist data in localStorage and sync with Supabase
  useEffect(() => {
    const isValidUUID = (id: string): boolean => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(id);
    };

    const initializeData = async () => {
      try {
        const storedCart = localStorage.getItem('wl_cart');
        const storedOrders = localStorage.getItem('wl_orders');
        const storedProducts = localStorage.getItem('wl_products');
        const storedShipping = localStorage.getItem('wl_shipping');
        const storedReturns = localStorage.getItem('wl_returns');
        const storedTeam = localStorage.getItem('wl_team');
        const storedPayment = localStorage.getItem('wl_payment_config');
        const storedAccounts = localStorage.getItem('wl_accounts');

        // Clean up invalid user data from old sessions
        let parsedUser = null;
        const storedUser = localStorage.getItem('wl_user');
        if (storedUser) {
          try {
            parsedUser = JSON.parse(storedUser);
            if (parsedUser && parsedUser.id && !isValidUUID(parsedUser.id)) {
              console.log('Clearing cached user with invalid UUID:', parsedUser.id);
              localStorage.removeItem('wl_user');
              localStorage.removeItem('wl_cart');
              parsedUser = null;
            }
          } catch (e) {
            console.error('Error parsing stored user:', e);
            localStorage.removeItem('wl_user');
            localStorage.removeItem('wl_cart');
            parsedUser = null;
          }
        }

        if (parsedUser) setUser(parsedUser);
        if (storedCart) setCart(JSON.parse(storedCart));
        if (storedOrders) setOrders(JSON.parse(storedOrders));
        if (storedShipping) setShippingPolicy(storedShipping);
        if (storedReturns) setReturnsPolicy(storedReturns);
        if (storedTeam) setTeamMembers(JSON.parse(storedTeam));
        if (storedPayment) setPaymentConfig(JSON.parse(storedPayment));
        if (storedAccounts) setUserAccounts(JSON.parse(storedAccounts));

        // Seed products on first load (if empty)
        try {
          const dbProducts = await getProductsFromDatabase();
          if (dbProducts.length === 0) {
            console.log('📦 Database is empty, attempting to seed products...');
            try {
              const seedResponse = await fetch('/api/seed-products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              });

              let seedData = { success: false, skipped: false };
              if (seedResponse.ok) {
                try {
                  const contentType = seedResponse.headers.get('content-type');
                  if (contentType && contentType.includes('application/json')) {
                    seedData = await seedResponse.json();
                  } else {
                    const text = await seedResponse.text();
                    console.warn('⚠️ Seed response is not JSON:', text);
                  }
                } catch (parseError) {
                  console.error('Failed to parse seed response:', parseError);
                }
              }

              console.log('📦 Seed response:', seedData);

              // Try to reload products from database after seeding
              const reloadedProducts = await getProductsFromDatabase();
              if (reloadedProducts.length > 0) {
                console.log('✅ Products loaded from database:', reloadedProducts.length);
                setProducts(reloadedProducts);
                localStorage.setItem('wl_products', JSON.stringify(reloadedProducts));
              } else {
                // Database is still empty (Supabase not configured or seeding skipped)
                console.log('✅ Using local products (Supabase not configured)');
                setProducts(INITIAL_PRODUCTS);
                localStorage.setItem('wl_products', JSON.stringify(INITIAL_PRODUCTS));
              }
            } catch (seedError) {
              console.warn('⚠️ Seed request failed, using local products:', seedError);
              setProducts(INITIAL_PRODUCTS);
              localStorage.setItem('wl_products', JSON.stringify(INITIAL_PRODUCTS));
            }
          } else {
            console.log('✅ Products loaded from database:', dbProducts.length);
            setProducts(dbProducts);
            localStorage.setItem('wl_products', JSON.stringify(dbProducts));
          }
        } catch (err) {
          console.log('⚠️ Error syncing products, using local:', err);
          if (storedProducts) {
            setProducts(JSON.parse(storedProducts));
          } else {
            setProducts(INITIAL_PRODUCTS);
            localStorage.setItem('wl_products', JSON.stringify(INITIAL_PRODUCTS));
          }
        }

        // Admin setup is handled during deployment via backend
        // No need to fetch during app initialization
      } catch (err) {
        console.error('Data initialization error:', err);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    localStorage.setItem('wl_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (user) {
      // Save user-specific orders
      const userOrdersKey = `wl_orders_${user.id}`;
      localStorage.setItem(userOrdersKey, JSON.stringify(orders));
    } else {
      // If no user is logged in, save to global key (for anonymous browsing)
      localStorage.setItem('wl_orders', JSON.stringify(orders));
    }
  }, [orders, user]);

  useEffect(() => {
    localStorage.setItem('wl_products', JSON.stringify(products));
  }, [products]);
  
  useEffect(() => {
    localStorage.setItem('wl_shipping', shippingPolicy);
  }, [shippingPolicy]);
  
  useEffect(() => {
    localStorage.setItem('wl_returns', returnsPolicy);
  }, [returnsPolicy]);

  useEffect(() => {
    localStorage.setItem('wl_team', JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    localStorage.setItem('wl_payment_config', JSON.stringify(paymentConfig));
  }, [paymentConfig]);

  useEffect(() => {
    localStorage.setItem('wl_accounts', JSON.stringify(userAccounts));
  }, [userAccounts]);

  // Persist User (and their wishlist) whenever user state changes
  useEffect(() => {
    if (user) {
        localStorage.setItem('wl_user', JSON.stringify(user));
    } else {
        localStorage.removeItem('wl_user');
    }
  }, [user]);

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      // Validate inputs
      if (!email || !password) {
        return { success: false, error: 'Email and password are required.' };
      }

      // Sign in with Supabase
      const result = await signIn(email, password, role);

      if (!result.success) {
        return { success: false, error: result.error || 'Invalid credentials. Please try again.' };
      }

      // Check if user exists in team members (for Admin role)
      const existingTeamMember = role === UserRole.ADMIN
        ? teamMembers.find(m => m.email.toLowerCase() === email.toLowerCase())
        : null;

      let permissions: AdminPermission[] = [];

      if (role === UserRole.ADMIN) {
        if (existingTeamMember) {
          permissions = existingTeamMember.permissions || [];
        } else {
          permissions = ['DASHBOARD', 'PRODUCTS', 'POLICIES', 'TEAM'];
        }
      }

      // Try to recover a customer's previous session
      const storedUserStr = localStorage.getItem('wl_user');
      let previousWishlist: string[] = [];
      if (storedUserStr) {
          const stored = JSON.parse(storedUserStr);
          if (stored.email === email) {
              previousWishlist = stored.wishlist || [];
          }
      }

      const storedUserStr2 = localStorage.getItem('wl_user');
      let previousCoinBalance = 74;
      if (storedUserStr2) {
          const stored = JSON.parse(storedUserStr2);
          if (stored.email === email) {
              previousCoinBalance = stored.coinBalance || 74;
          }
      }

      const newUser: User = existingTeamMember || {
        id: result.user?.id || generateUUID(),
        name: result.user?.name || email.split('@')[0],
        email,
        role,
        permissions,
        wishlist: previousWishlist,
        coinBalance: previousCoinBalance
      };

      setUser(newUser);

      // Load user's cart from Supabase
      try {
        const dbCart = await getCartFromDatabase(newUser.id);
        if (dbCart.length > 0) {
          setCart(dbCart);
          localStorage.setItem('wl_cart', JSON.stringify(dbCart));
        }
      } catch (err) {
        console.log('Error loading cart from database:', err);
      }

      // Load user's orders from localStorage (user-specific)
      try {
        const userOrdersKey = `wl_orders_${newUser.id}`;
        const storedUserOrders = localStorage.getItem(userOrdersKey);
        if (storedUserOrders) {
          const userOrders = JSON.parse(storedUserOrders);
          setOrders(userOrders);
        } else {
          // Check if orders exist in old global key and migrate them if they belong to this user
          const globalOrdersStr = localStorage.getItem('wl_orders');
          if (globalOrdersStr) {
            const globalOrders = JSON.parse(globalOrdersStr);
            const userSpecificOrders = globalOrders.filter((order: Order) => order.userId === newUser.id);
            if (userSpecificOrders.length > 0) {
              setOrders(userSpecificOrders);
              localStorage.setItem(userOrdersKey, JSON.stringify(userSpecificOrders));
            }
          }
        }
      } catch (err) {
        console.log('Error loading user orders:', err);
      }

      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'An unexpected error occurred during login.' };
    }
  };

  const signup = async (email: string, password: string, role: UserRole) => {
    // Validate inputs
    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    // Sign up with Supabase
    const result = await signUp(email, password, role);

    if (!result.success) {
      return { success: false, error: result.error || 'Signup failed. Please try again.' };
    }

    // Automatically log in after signup
    return login(email, password, role);
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setCart([]);
    setOrders([]);
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return; // Prevent adding out of stock
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      let newCart: CartItem[];
      if (existing) {
        newCart = prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      } else {
        newCart = [...prev, { ...product, quantity: 1 }];
      }

      // Sync to Supabase if user is logged in
      if (user) {
        const cartItem = newCart.find(item => item.id === product.id);
        if (cartItem) {
          addToCartDatabase(user.id, cartItem).catch(err => console.log('Error syncing to DB:', err));
        }
      }

      return newCart;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = prev.filter(item => item.id !== productId);

      // Sync to Supabase if user is logged in
      if (user) {
        removeFromCartDatabase(user.id, productId).catch(err => console.log('Error syncing to DB:', err));
      }

      return newCart;
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => {
      const newCart = prev.map(item => item.id === productId ? { ...item, quantity } : item);

      // Sync to Supabase if user is logged in
      if (user) {
        updateCartQuantityDatabase(user.id, productId, quantity).catch(err => console.log('Error syncing to DB:', err));
      }

      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);

    // Clear from Supabase if user is logged in
    if (user) {
      clearCartDatabase(user.id).catch(err => console.log('Error clearing cart from DB:', err));
    }
  };

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const addTeamMember = (member: User) => {
    setTeamMembers(prev => [...prev, member]);
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
  };

  const toggleWishlist = (productId: string) => {
    if (!user) return;
    setUser(prev => {
        if (!prev) return null;
        const currentWishlist = prev.wishlist || [];
        const newWishlist = currentWishlist.includes(productId)
            ? currentWishlist.filter(id => id !== productId)
            : [...currentWishlist, productId];

        return { ...prev, wishlist: newWishlist };
    });
  };

  const updateUserCoins = (coinDelta: number) => {
    if (!user) return;
    setUser(prev => {
        if (!prev) return null;
        const currentCoins = prev.coinBalance || 74;
        const newBalance = Math.max(0, currentCoins + coinDelta);
        return { ...prev, coinBalance: newBalance };
    });
  };

  const updatePaymentConfig = (config: PaymentConfig) => {
    setPaymentConfig(config);
  };

  const placeOrder = async (coinsUsed: number = 0) => {
    if (!user) {
      throw new Error('User not logged in');
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.18;
    const total = Math.max(0, subtotal + tax - coinsUsed);

    // Create order in Supabase or locally (convert to paise for storage)
    const totalInPaise = Math.round(total * 100);
    const newOrder = await createOrderInDatabase(user.id, cart, totalInPaise);

    if (newOrder) {
      // Update orders state
      const updatedOrders = [...orders, newOrder];
      setOrders(updatedOrders);

      // Immediately persist to user-specific localStorage
      const userOrdersKey = `wl_orders_${user.id}`;
      localStorage.setItem(userOrdersKey, JSON.stringify(updatedOrders));

      // Decrease stock for purchased items
      setProducts(prev => prev.map(p => {
          const cartItem = cart.find(c => c.id === p.id);
          if (cartItem) {
              return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
          }
          return p;
      }));

      // Update user coins: deduct used coins and add earned coins
      const coinsEarned = newOrder.coinsEarned || 0;
      const netCoinChange = coinsEarned - coinsUsed;
      updateUserCoins(netCoinChange);

      clearCart();
      return newOrder;
    } else {
      throw new Error('Failed to create order');
    }
  };

  return (
    <StoreContext.Provider value={{
      user, products, cart, orders, teamMembers, login, signup, logout,
      addToCart, removeFromCart, updateCartQuantity, clearCart,
      addProduct, updateProduct, deleteProduct, placeOrder, addTeamMember, removeTeamMember,
      toggleWishlist, updateUserCoins,
      searchQuery, setSearchQuery,
      shippingPolicy, setShippingPolicy,
      returnsPolicy, setReturnsPolicy,
      paymentConfig, updatePaymentConfig
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
