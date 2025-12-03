import React from 'react';
import { useStore } from '../context/StoreContext';
import { Package } from 'lucide-react';

const MyOrders: React.FC = () => {
  const { orders } = useStore();

  const getStatusIndex = (status: string): number => {
    const statusMap: Record<string, number> = {
      'pending': 0,
      'packed': 1,
      'shipped': 2,
      'delivered': 3
    };
    return statusMap[status] || 0;
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': 'Placed',
      'packed': 'Packed',
      'shipped': 'Shipped',
      'delivered': 'Delivered'
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status: string): string => {
    const iconMap: Record<string, string> = {
      'pending': '🎁',
      'packed': '📦',
      'shipped': '🚚',
      'delivered': '✓'
    };
    return iconMap[status] || '?';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="status-icon-container">
          <Package size={20} className="text-pink-500" />
        </div>
        <h2 className="order-history-title">Order History</h2>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders-card">
          <div className="empty-emoji">🛍️</div>
          <p className="empty-title">No orders yet!</p>
          <p className="empty-subtitle">Start shopping to see your orders here.</p>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="order-card">
            {/* Order Header */}
            <div className="order-header">
              <div>
                <h3 className="order-number">Order #{order.id}</h3>
                <p className="order-date">
                  🕐 {new Date(order.date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} PM
                </p>
              </div>
              <div className="order-total">₹{order.total.toLocaleString('en-IN')}</div>
            </div>

            {/* Order Status Timeline */}
            <div className="order-status-section">
              <div className="status-steps">
                {['pending', 'packed', 'shipped', 'delivered'].map((status, index) => {
                  const currentStatusIndex = getStatusIndex(order.status);
                  const isCompleted = currentStatusIndex >= index;
                  
                  return (
                    <div key={status} className="status-step">
                      <div className={`status-circle ${isCompleted ? 'status-completed' : 'status-pending'}`}>
                        {isCompleted ? getStatusIcon(status) : ''}
                      </div>
                      <p className="status-label">{getStatusLabel(status)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Timeline Connector */}
              <div className="status-connector">
                {[0, 1, 2].map((i) => {
                  const currentStatusIndex = getStatusIndex(order.status);
                  const isCompleted = currentStatusIndex > i;
                  
                  return (
                    <div
                      key={i}
                      className={`connector-line ${isCompleted ? 'connector-completed' : 'connector-pending'}`}
                    ></div>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            <div className="order-items-container">
              {order.items.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="item-image-container">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="item-image"
                    />
                  </div>
                  <div className="item-details">
                    <p className="item-name">{item.name}</p>
                    <p className="item-quantity">Qty: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    <p className="item-total-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coins and Discount Section */}
            <div className="rewards-section">
              <div className="reward-item coins-earned">
                <span className="reward-label">Coins Earned:</span>
                <span className="reward-value coins-value">+{order.coinsEarned || 74}</span>
              </div>
              <div className="reward-item discount-applied">
                <span className="reward-label">Discount Applied:</span>
                <span className="reward-value discount-value">-{order.discount || 74}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;
