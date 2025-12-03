import { supabase, isSupabaseEnabled } from './supabaseService';
import { CartItem } from '../types';

export const addToCartDatabase = async (userId: string, product: CartItem): Promise<boolean> => {
  try {
    if (!isSupabaseEnabled) {
      console.log('Supabase not configured, skipping cart sync');
      return true;
    }

    const { error } = await supabase
      .from('cart_items')
      .upsert({
        user_id: userId,
        product_id: product.id,
        quantity: product.quantity
      }, { onConflict: 'user_id,product_id' });

    if (error) {
      console.error('Error adding to cart:', error?.message || String(error));
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error in addToCartDatabase:', err);
    return false;
  }
};

export const removeFromCartDatabase = async (userId: string, productId: string): Promise<boolean> => {
  try {
    if (!isSupabaseEnabled) {
      console.log('Supabase not configured, skipping cart sync');
      return true;
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error in removeFromCartDatabase:', err);
    return false;
  }
};

export const updateCartQuantityDatabase = async (userId: string, productId: string, quantity: number): Promise<boolean> => {
  try {
    if (!isSupabaseEnabled) {
      console.log('Supabase not configured, skipping cart sync');
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
      console.error('Error updating cart quantity:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error in updateCartQuantityDatabase:', err);
    return false;
  }
};

export const getCartFromDatabase = async (userId: string): Promise<CartItem[]> => {
  try {
    if (!isSupabaseEnabled) {
      console.log('Supabase not configured, returning empty cart');
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
      console.error('Error fetching cart:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      ...item.products,
      imageUrl: item.products.image_url,
      quantity: item.quantity
    }));
  } catch (err) {
    console.error('Error in getCartFromDatabase:', err);
    return [];
  }
};

export const clearCartDatabase = async (userId: string): Promise<boolean> => {
  try {
    if (!isSupabaseEnabled) {
      console.log('Supabase not configured, skipping cart sync');
      return true;
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error in clearCartDatabase:', err);
    return false;
  }
};
