import React from 'react';
import { useStore } from '../context/StoreContext';
import { Package, MapPin, TrendingUp } from 'lucide-react';

const MyOrders: React.FC = () => {
  const { orders } = useStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'shipped':
        return 'text-blue-500';
      case 'delivered':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '📦';
      case 'shipped':
        return '🚚';
      case 'delivered':
        return '✅';
      default:
        return '❓';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Placed';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
          <Package size={20} className="text-pink-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Order History</h2>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <div className="text-5xl mb-4">🛍️</div>
          <p className="text-gray-600 text-lg font-medium">No orders yet!</p>
          <p className="text-gray-400 text-sm mt-2">Start shopping to see your orders here.</p>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl p-6 shadow-lg">
            {/* Order Header */}
            <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Order #{order.id}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <span>🕐</span>
                  {new Date(order.date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-pink-500">₹{order.total.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Order Status Timeline */}
            <div className="mb-6">
              <div className="flex justify-between items-center px-2">
                {['pending', 'shipped', 'delivered'].map((status, index) => (
                  <div key={status} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-2 ${
                        ['pending', 'shipped', 'delivered'].indexOf(order.status) >= index
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {getStatusIcon(status)}
                    </div>
                    <p className="text-xs font-bold text-gray-600 text-center">{getStatusLabel(status)}</p>
                  </div>
                ))}
              </div>

              {/* Timeline Connector */}
              <div className="flex justify-between items-center px-14 -mt-8">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 mx-1 rounded-full ${
                      ['pending', 'shipped', 'delivered'].indexOf(order.status) > i
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500">₹{item.price.toLocaleString('en-IN')} each</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coins Earned Badge */}
            <div className="mt-4 flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-2 border-yellow-200">
              <span className="text-sm font-bold text-gray-700">Coins Earned</span>
              <span className="text-lg font-bold text-yellow-600">+74 🎁</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;
