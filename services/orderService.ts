import { CartItem, Order } from '../types';

export const createOrderInDatabase = async (userId: string, items: CartItem[], totalInPaise: number): Promise<Order | null> => {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        items,
        totalInPaise
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error creating order:', error?.error || 'Unknown error');
      return null;
    }

    const order = await response.json();
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
