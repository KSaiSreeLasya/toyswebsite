import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Wallet, ShoppingBag, Gift } from 'lucide-react';

const MyWallet: React.FC = () => {
  const { cart } = useStore();
  const [coinsBalance] = useState(74);

  const coinsPerRupee = 1;
  const coinsPerDiscount = 10;
  const coinValue = 100; // 1 coin = ₹1 discount

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
          <Wallet size={20} className="text-pink-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">My Wallet</h2>
      </div>

      {/* WonderLand Rewards Card */}
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎁</div>
          <h3 className="text-2xl font-bold text-gray-800">WonderLand Rewards</h3>
          <p className="text-gray-600 text-sm mt-2">Shop more to earn more! Use coins for discounts on checkout.</p>
        </div>

        {/* Coins Balance Card */}
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl p-8 text-white shadow-lg mb-8">
          <p className="text-lg font-bold mb-2">Available Balance</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-5xl font-bold">{coinsBalance}</p>
              <p className="text-sm font-medium text-white/90 mt-1">Coins</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">1 Coin = ₹1 Discount</p>
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="border-t-2 border-gray-200 pt-8">
          <h4 className="text-lg font-bold text-gray-800 mb-6">How it works</h4>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Shop Toys */}
            <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                  <ShoppingBag size={20} className="text-blue-600" />
                </div>
                <h5 className="font-bold text-gray-800">Shop Toys</h5>
              </div>
              <p className="text-sm text-gray-600 font-medium">Earn 1 Coin for every ₹100 spent</p>
            </div>

            {/* Redeem Coins */}
            <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                  <Gift size={20} className="text-purple-600" />
                </div>
                <h5 className="font-bold text-gray-800">Redeem</h5>
              </div>
              <p className="text-sm text-gray-600 font-medium">Use coins at checkout for instant discount</p>
            </div>
          </div>
        </div>

        {/* Rewards Tier Info */}
        <div className="mt-8 p-6 bg-pink-50 rounded-xl border-2 border-pink-200">
          <h4 className="font-bold text-gray-800 mb-4">🌟 Loyalty Tiers</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">🥉</span>
                <span className="font-bold text-gray-700">Bronze</span>
              </div>
              <span className="text-gray-600">1 Coin per ₹100</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">🥈</span>
                <span className="font-bold text-gray-700">Silver (50 coins)</span>
              </div>
              <span className="text-gray-600">1.25 Coins per ₹100</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">🥇</span>
                <span className="font-bold text-gray-700">Gold (200 coins)</span>
              </div>
              <span className="text-gray-600">1.5 Coins per ₹100</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">💎</span>
                <span className="font-bold text-gray-700">Platinum (500 coins)</span>
              </div>
              <span className="text-gray-600">2 Coins per ₹100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Coin Usage Tips */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border-2 border-pink-200 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          💡 Pro Tips
        </h3>
        <ul className="space-y-2 text-sm text-gray-700 font-medium">
          <li className="flex items-start gap-2">
            <span className="text-lg">✨</span>
            <span>Each purchase earns you coins automatically - no additional action needed!</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lg">✨</span>
            <span>Higher loyalty tiers earn more coins per purchase - keep shopping!</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lg">✨</span>
            <span>Coins never expire - collect them and use whenever you want.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lg">✨</span>
            <span>Combine coin discounts with other offers for maximum savings!</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MyWallet;
