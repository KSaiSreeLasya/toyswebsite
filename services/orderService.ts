import { supabase, isSupabaseEnabled } from './supabaseService';
import { CartItem, Order } from '../types';

export const createOrderInDatabase = async (userId: string, items: CartItem[], totalInPaise: number): Promise<Order | null> => {
  try {
    const orderId = `ORD-${Date.now()}`;
    const totalInRupees = totalInPaise / 100;
    const coinsEarned = Math.floor(totalInRupees / 100);
    const discount = Math.floor(totalInRupees * 0.01);

    if (!isSupabaseEnabled) {
      console.log('Supabase not configured, creating local order only');
      const order: Order = {
        id: orderId,
        userId,
        items,
        total: Math.round(totalInRupees * 100) / 100,
        date: new Date().toISOString(),
        status: 'pending',
        coinsEarned,
        discount
      };
      return order;
    }

    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        user_id: userId,
        total_amount: totalInPaise,
        status: 'pending'
      });

    if (orderError) {
      console.error('Error creating order:', orderError?.message || 'Unknown error');
      return null;
    }

    for (const item of items) {
      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: orderId,
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price
        });

      if (itemError) {
        console.error('Error creating order item:', itemError?.message || 'Unknown error');
      }
    }

    const order: Order = {
      id: orderId,
      userId,
      items,
      total: Math.round(totalInRupees * 100) / 100,
      date: new Date().toISOString(),
      status: 'pending',
      coinsEarned,
      discount
    };

    return order;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in createOrderInDatabase:', errorMsg);
    return null;
  }
};

export const getOrdersFromDatabase = async (userId: string): Promise<Order[]> => {
  try {
    if (!isSupabaseEnabled) {
      console.log('Supabase not configured, returning empty orders list');
      return [];
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        total_amount,
        status,
        created_at,
        order_items (
          product_id,
          product_name,
          quantity,
          unit_price
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error?.message || 'Unknown error');
      return [];
    }

    return (data || []).map((order: any) => {
      const totalInPaise = order.total_amount;
      const totalInRupees = totalInPaise / 100;
      const coinsEarned = Math.floor(totalInRupees / 100);
      const discount = Math.floor(totalInRupees * 0.01);

      return {
        id: order.id,
        userId: order.user_id,
        items: order.order_items.map((item: any) => ({
          id: item.product_id,
          name: item.product_name,
          quantity: item.quantity,
          price: item.unit_price,
          description: '',
          category: '',
          imageUrl: '',
          rating: 0,
          stock: 0
        })),
        total: Math.round(totalInRupees * 100) / 100,
        date: order.created_at,
        status: order.status,
        coinsEarned,
        discount
      };
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in getOrdersFromDatabase:', errorMsg);
    return [];
  }
};

export const updateOrderStatus = async (orderId: string, status: 'pending' | 'packed' | 'shipped' | 'delivered' | 'cancelled'): Promise<boolean> => {
  try {
    if (!isSupabaseEnabled) {
      console.log('Supabase not configured, skipping order status update');
      return true;
    }

    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error?.message || 'Unknown error');
      return false;
    }
    return true;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in updateOrderStatus:', errorMsg);
    return false;
  }
};
