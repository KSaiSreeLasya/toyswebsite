import { supabase, isSupabaseEnabled } from './supabaseService';
import { Product } from '../types';

export const syncProductsToDatabase = async (products: Product[]): Promise<boolean> => {
  try {
    if (!isSupabaseEnabled) {
      console.log('Supabase not configured, skipping product sync');
      return true;
    }

    for (const product of products) {
      const { error } = await supabase
        .from('products')
        .upsert({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          image_url: product.imageUrl,
          rating: product.rating,
          stock: product.stock
        }, { onConflict: 'id' });

      if (error) {
        console.error(`Error syncing product ${product.id}:`, error);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error('Error syncing products:', err);
    return false;
  }
};

export const getProductsFromDatabase = async (): Promise<Product[]> => {
  try {
    if (!isSupabaseEnabled) {
      console.log('Supabase not configured, returning empty products list');
      return [];
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      imageUrl: p.image_url,
      rating: p.rating,
      stock: p.stock
    }));
  } catch (err) {
    console.error('Error getting products from database:', err);
    return [];
  }
};

export const updateProductStock = async (productId: string, newStock: number): Promise<boolean> => {
  try {
    if (!isSupabaseEnabled) {
      console.log('Supabase not configured, skipping stock update');
      return true;
    }

    const { error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId);

    if (error) {
      console.error('Error updating product stock:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error updating stock:', err);
    return false;
  }
};
