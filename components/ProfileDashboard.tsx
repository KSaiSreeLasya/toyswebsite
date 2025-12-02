import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { User, Package, Wallet, LogOut } from 'lucide-react';
import EditProfile from './EditProfile';
import MyOrders from './MyOrders';
import MyWallet from './MyWallet';

type TabType = 'profile' | 'orders' | 'wallet';

const ProfileDashboard: React.FC = () => {
  const { user, logout } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  const getInitial = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-white">
                {getInitial(user.name)}
              </div>
              <div>
                <h1 className="text-3xl font-heading font-bold">Welcome back, {user.name.split(' ')[0]}!</h1>
                <p className="text-white/90 font-medium">Manage your profile, track orders, and check your magical rewards.</p>
              </div>
            </div>
            <div className="bg-white/20 rounded-2xl px-4 py-3 border border-white/30">
              <p className="text-sm font-medium text-white/80">COIN BALANCE</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-3xl font-bold">74</span>
                <span className="text-2xl">🎁</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-48">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'profile'
                  ? 'bg-pink-500 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-white'
              }`}
            >
              <User size={20} />
              My Profile
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-pink-500 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-white'
              }`}
            >
              <Package size={20} />
              My Orders
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'wallet'
                  ? 'bg-pink-500 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-white'
              }`}
            >
              <Wallet size={20} />
              My Wallet
            </button>
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-700 hover:bg-red-50 transition-all mt-4"
            >
              <LogOut size={20} />
              Logout
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && <EditProfile />}
          {activeTab === 'orders' && <MyOrders />}
          {activeTab === 'wallet' && <MyWallet />}
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
