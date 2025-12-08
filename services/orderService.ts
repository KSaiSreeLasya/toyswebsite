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
    const response = await fetch(`/api/orders/${userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error fetching orders:', error?.error || 'Unknown error');
      return [];
    }

    const data = await response.json();
    return data.orders || [];
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in getOrdersFromDatabase:', errorMsg);
    return [];
  }
};
