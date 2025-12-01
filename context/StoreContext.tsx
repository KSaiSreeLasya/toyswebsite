import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, User, UserRole, Order, AdminPermission, PaymentConfig } from '../types';
import { INITIAL_PRODUCTS } from '../constants';

interface StoreContextType {
  user: User | null;
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  teamMembers: User[];
  shippingPolicy: string;
  returnsPolicy: string;
  paymentConfig: PaymentConfig;
  login: (email: string, password: string, role: UserRole) => { success: boolean; error?: string };
  signup: (email: string, password: string, role: UserRole) => { success: boolean; error?: string };
  logout: () => void;
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

  // Persist data in localStorage (simple simulation)
  useEffect(() => {
    const storedUser = localStorage.getItem('wl_user');
    const storedCart = localStorage.getItem('wl_cart');
    const storedOrders = localStorage.getItem('wl_orders');
    const storedProducts = localStorage.getItem('wl_products');
    const storedShipping = localStorage.getItem('wl_shipping');
    const storedReturns = localStorage.getItem('wl_returns');
    const storedTeam = localStorage.getItem('wl_team');
    const storedPayment = localStorage.getItem('wl_payment_config');
    const storedAccounts = localStorage.getItem('wl_accounts');

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedCart) setCart(JSON.parse(storedCart));
    if (storedOrders) setOrders(JSON.parse(storedOrders));
    if (storedProducts) setProducts(JSON.parse(storedProducts));
    if (storedShipping) setShippingPolicy(storedShipping);
    if (storedReturns) setReturnsPolicy(storedReturns);
    if (storedTeam) setTeamMembers(JSON.parse(storedTeam));
    if (storedPayment) setPaymentConfig(JSON.parse(storedPayment));
    if (storedAccounts) setUserAccounts(JSON.parse(storedAccounts));
  }, []);

  useEffect(() => {
    localStorage.setItem('wl_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('wl_orders', JSON.stringify(orders));
  }, [orders]);

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

  const login = (email: string, password: string, role: UserRole) => {
    // Find account with matching email and password
    const account = userAccounts.find(
      acc => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password && acc.role === role
    );

    if (!account) {
      return { success: false, error: 'Invalid email, password, or role. Please check your credentials.' };
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

    // Try to recover a customer's previous session (mock db lookup)
    const storedUserStr = localStorage.getItem('wl_user');
    let previousWishlist: string[] = [];
    if (storedUserStr) {
        const stored = JSON.parse(storedUserStr);
        if (stored.email === email) {
            previousWishlist = stored.wishlist || [];
        }
    }

    const newUser: User = existingTeamMember || {
      id: Date.now().toString(),
      name: email.split('@')[0],
      email,
      role,
      permissions,
      wishlist: previousWishlist
    };

    setUser(newUser);
    return { success: true };
  };

  const signup = (email: string, password: string, role: UserRole) => {
    // Validate inputs
    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    // Check if account already exists
    const existingAccount = userAccounts.find(
      acc => acc.email.toLowerCase() === email.toLowerCase()
    );

    if (existingAccount) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    // Create new account
    const newAccount = { email: email.toLowerCase(), password, role };
    setUserAccounts(prev => [...prev, newAccount]);

    // Automatically log in after signup
    return login(email, password, role);
  };

  const logout = () => {
    setUser(null);
    setCart([]); 
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return; // Prevent adding out of stock
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
  };

  const clearCart = () => setCart([]);

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

  const updatePaymentConfig = (config: PaymentConfig) => {
    setPaymentConfig(config);
  };

  const placeOrder = () => {
    if (!user) return;
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      userId: user.id,
      items: [...cart],
      total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      date: new Date().toISOString(),
      status: 'pending'
    };
    setOrders(prev => [...prev, newOrder]);
    
    // Decrease stock for purchased items
    setProducts(prev => prev.map(p => {
        const cartItem = cart.find(c => c.id === p.id);
        if (cartItem) {
            return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
    }));

    clearCart();
  };

  return (
    <StoreContext.Provider value={{
      user, products, cart, orders, teamMembers, login, signup, logout,
      addToCart, removeFromCart, updateCartQuantity, clearCart,
      addProduct, updateProduct, deleteProduct, placeOrder, addTeamMember, removeTeamMember,
      toggleWishlist,
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
