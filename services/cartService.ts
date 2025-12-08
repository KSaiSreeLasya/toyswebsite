import { CartItem } from '../types';

const isValidUUID = (id: string): boolean => {
  if (!id || typeof id !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const addToCartDatabase = async (userId: string, product: CartItem): Promise<boolean> => {
  try {
    if (!userId || !isValidUUID(userId)) {
      console.warn('Invalid user ID format, skipping cart sync:', userId);
      return true;
    }

    if (!product.id) {
      console.warn('Invalid product ID, skipping cart sync:', product.id);
      return true;
    }

    const response = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        productId: product.id,
        quantity: product.quantity
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error adding to cart:', error?.error || 'Unknown error');
      return false;
    }

    return true;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in addToCartDatabase:', errorMsg);
    return false;
  }
};

export const removeFromCartDatabase = async (userId: string, productId: string): Promise<boolean> => {
  try {
    if (!userId || !isValidUUID(userId)) {
      console.warn('Invalid user ID format, skipping cart sync:', userId);
      return true;
    }

    if (!productId) {
      console.warn('Invalid product ID, skipping cart sync:', productId);
      return true;
    }

    const response = await fetch('/api/cart/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        productId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error removing from cart:', error?.error || 'Unknown error');
      return false;
    }

    return true;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in removeFromCartDatabase:', errorMsg);
    return false;
  }
};

export const updateCartQuantityDatabase = async (userId: string, productId: string, quantity: number): Promise<boolean> => {
  try {
    if (!userId || !isValidUUID(userId)) {
      console.warn('Invalid user ID format, skipping cart sync:', userId);
      return true;
    }

    if (!productId) {
      console.warn('Invalid product ID, skipping cart sync:', productId);
      return true;
    }

    if (quantity <= 0) {
      return removeFromCartDatabase(userId, productId);
    }

    const response = await fetch('/api/cart/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        productId,
        quantity
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error updating cart quantity:', error?.error || 'Unknown error');
      return false;
    }

    return true;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in updateCartQuantityDatabase:', errorMsg);
    return false;
  }
};

export const getCartFromDatabase = async (userId: string): Promise<CartItem[]> => {
  try {
    if (!userId || !isValidUUID(userId)) {
      console.warn('Invalid user ID format, returning empty cart:', userId);
      return [];
    }

    const response = await fetch(`/api/cart/${userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error fetching cart:', error?.error || 'Unknown error');
      return [];
    }

    const data = await response.json();
    return data.items || [];
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in getCartFromDatabase:', errorMsg);
    return [];
  }
};

export const clearCartDatabase = async (userId: string): Promise<boolean> => {
  try {
    if (!userId || !isValidUUID(userId)) {
      console.warn('Invalid user ID format, skipping cart sync:', userId);
      return true;
    }

    const response = await fetch(`/api/cart/clear/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error clearing cart:', error?.error || 'Unknown error');
      return false;
    }

    return true;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in clearCartDatabase:', errorMsg);
    return false;
  }
};
