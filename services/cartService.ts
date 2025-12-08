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
    if (!isSupabaseEnabled) {
      console.log('Supabase not configured, skipping cart sync');
      return true;
    }

    if (!userId || !isValidUUID(userId)) {
      console.warn('Invalid user ID format, skipping cart sync:', userId);
      return true;
    }

    if (!productId) {
      console.warn('Invalid product ID, skipping cart sync:', productId);
      return true;
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      console.error('Error removing from cart:', error?.message || 'Unknown error');
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
    if (!isSupabaseEnabled) {
      console.log('Supabase not configured, skipping cart sync');
      return true;
    }

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

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      console.error('Error updating cart quantity:', error?.message || 'Unknown error');
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
    if (!isSupabaseEnabled) {
      console.log('Supabase not configured, returning empty cart');
      return [];
    }

    if (!userId || !isValidUUID(userId)) {
      console.warn('Invalid user ID format, returning empty cart:', userId);
      return [];
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        quantity,
        products:product_id (
          id,
          name,
          description,
          price,
          category,
          image_url,
          rating,
          stock
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching cart:', error?.message || 'Unknown error');
      return [];
    }

    return (data || []).map((item: any) => ({
      ...item.products,
      imageUrl: item.products.image_url,
      quantity: item.quantity
    }));
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in getCartFromDatabase:', errorMsg);
    return [];
  }
};

export const clearCartDatabase = async (userId: string): Promise<boolean> => {
  try {
    if (!isSupabaseEnabled) {
      console.log('Supabase not configured, skipping cart sync');
      return true;
    }

    if (!userId || !isValidUUID(userId)) {
      console.warn('Invalid user ID format, skipping cart sync:', userId);
      return true;
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error clearing cart:', error?.message || 'Unknown error');
      return false;
    }
    return true;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in clearCartDatabase:', errorMsg);
    return false;
  }
};
