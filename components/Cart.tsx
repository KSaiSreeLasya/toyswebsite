import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Trash2, Plus, Minus, CreditCard, CheckCircle, ArrowRight, Loader2, MapPin, Phone, Copy } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createRazorpayOrder, openRazorpayCheckout, verifyPayment, getTestCards } from '../services/razorpayService';
import Swal from 'sweetalert2';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateCartQuantity, placeOrder, user } = useStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [useCoins, setUseCoins] = useState(false);
  const [coinsUsed, setCoinsUsed] = useState(0);
  const [showTestCards, setShowTestCards] = useState(false);
  const [shippingData, setShippingData] = useState({
    fullName: '',
    address: '',
    city: '',
    zipCode: '',
    phone: ''
  });
  const navigate = useNavigate();

  const availableCoins = user?.coinBalance || 74;
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18;
  const coinDiscount = useCoins ? coinsUsed : 0;
  const total = Math.max(0, subtotal + tax - coinDiscount);

  const handleRazorpayPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shippingData.fullName || !shippingData.address || !shippingData.city || !shippingData.zipCode || !shippingData.phone) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Information',
        text: 'Please fill in all shipping details before proceeding',
        confirmButtonColor: '#7c3aed'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!keyId) {
        const errorMsg = '⚠️ Razorpay Key ID is not configured. Please contact support to enable payments.';
        console.error(errorMsg);
        setIsProcessing(false);
        Swal.fire({
          icon: 'error',
          title: 'Payment Configuration Missing',
          html: `<p style="text-align: left;">${errorMsg}</p><p style="text-align: left; font-size: 0.85em; color: #666; margin-top: 10px;"><strong>Debug Info:</strong><br>VITE_RAZORPAY_KEY_ID is not set</p>`,
          confirmButtonColor: '#7c3aed'
        });
        return;
      }

      // Validate shipping phone number format
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(shippingData.phone.replace(/\D/g, ''))) {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Phone',
          text: 'Please enter a valid 10-digit phone number',
          confirmButtonColor: '#7c3aed'
        });
        setIsProcessing(false);
        return;
      }

      console.log('📦 Creating Razorpay order...');
      const order = await createRazorpayOrder(
        total,
        `ORD-${Date.now()}`,
        {
          userId: user?.id,
          items: cart.length,
          shippingAddress: shippingData
        }
      );

      if (!order || !order.id) {
        throw new Error('Failed to create order on server');
      }

      console.log('✅ Order created:', order.id);

      const options = {
        key: keyId,
        amount: Math.round(total * 100),
        currency: 'INR',
        name: 'WonderLand Toys',
        description: `Order for ${cart.length} items`,
        order_id: order.id,
        prefill: {
          name: shippingData.fullName,
          contact: shippingData.phone,
          email: user?.email || ''
        },
        notes: {
          shippingAddress: shippingData.address,
          city: shippingData.city,
          zipCode: shippingData.zipCode,
          coinsUsed: useCoins ? coinsUsed : 0
        }
      };

      console.log('🔐 Opening Razorpay payment modal...');
      let razorpayResponse;
      try {
        razorpayResponse = await openRazorpayCheckout(options);
      } catch (rzpError: any) {
        const errorMsg = rzpError?.message || 'Failed to open payment gateway';
        console.error('❌ Razorpay checkout error:', errorMsg);

        // Check if it's an SDK loading issue
        const winAny = window as any;
        if (!winAny.Razorpay && !winAny.__razorpayReady) {
          throw new Error('Payment SDK is not available. Please refresh the page and ensure you have a stable internet connection.');
        }

        throw new Error(`Payment gateway error: ${errorMsg}`);
      }

      if (!razorpayResponse) {
        throw new Error('No payment response received from Razorpay');
      }

      console.log('✅ Payment completed, verifying with backend...');

      // Verify the payment with backend
      const isVerified = await verifyPayment({
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature
      });

      if (!isVerified) {
        throw new Error('Payment verification failed. Please contact support with your order ID.');
      }

      console.log('✅ Payment verified, creating order...');
      // Only create order after payment is verified
      await placeOrder(useCoins ? coinsUsed : 0);

      setIsProcessing(false);
      setOrderComplete(true);
    } catch (error: any) {
      const errorMessage = error?.message || (typeof error === 'string' ? error : 'Payment failed. Please try again.');
      console.error('❌ Payment error:', errorMessage, error);
      setIsProcessing(false);

      // Provide helpful error messages based on the issue
      let userMessage = errorMessage;
      let title = 'Payment Failed';

      if (errorMessage.includes('timeout')) {
        userMessage = 'Payment gateway took too long to respond. Please try again.';
        title = 'Connection Timeout';
      } else if (errorMessage.includes('cancelled')) {
        userMessage = 'Payment was cancelled. You can try again when ready.';
        title = 'Payment Cancelled';
      } else if (errorMessage.includes('not loaded') || errorMessage.includes('SDK')) {
        userMessage = 'Payment gateway is loading. Please refresh the page and try again. If the problem persists, please check your internet connection.';
        title = 'Payment Gateway Unavailable';
      } else if (errorMessage.includes('iframe')) {
        userMessage = 'Payments cannot be processed in this view. Please try a different browser or close any browser extensions.';
        title = 'Payment View Issue';
      } else if (errorMessage.includes('Missing required') || errorMessage.includes('Invalid')) {
        userMessage = 'Payment configuration issue. Please refresh the page and try again.';
        title = 'Configuration Error';
      }

      Swal.fire({
        icon: 'error',
        title,
        text: userMessage,
        confirmButtonColor: '#7c3aed',
        confirmButtonText: 'Try Again',
        didOpen: () => {
          // Log error for debugging
          const errorEl = document.querySelector('.swal2-text');
          if (errorEl) {
            const debugDiv = document.createElement('div');
            debugDiv.style.cssText = 'font-size: 0.75em; color: #999; margin-top: 10px; text-align: left; font-family: monospace;';
            debugDiv.textContent = `Debug: ${errorMessage.substring(0, 100)}`;
            errorEl.parentElement?.appendChild(debugDiv);
          }
        }
      });
    }
  };

  if (orderComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-500">
        <div className="bg-green-100 p-6 rounded-full text-green-600 mb-6 animate-bounce-slow">
          <CheckCircle size={64} />
        </div>
        <h2 className="text-3xl font-heading font-bold text-gray-800 mb-2">Order Confirmed!</h2>
        <p className="text-gray-600 mb-8 text-center max-w-md">
          Thank you for shopping at WonderLand! Your magical toys are being prepared for shipment.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="bg-primary-600 text-white px-8 py-3 rounded-full font-bold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl btn-funky"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-gray-100 p-6 rounded-full text-gray-400 mb-4">
          <CreditCard size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't found any treasures yet.</p>
        <Link to="/" className="bg-primary-500 text-white px-6 py-2 rounded-full font-bold hover:bg-primary-600 shadow-md btn-funky">Start Exploring</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-2xl font-bold font-heading mb-6">Shopping Cart</h2>
        {cart.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center card-pop">
            <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-lg bg-gray-50 border border-gray-100" />
            <div className="flex-1">
              <h3 className="font-bold text-gray-800">{item.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{item.category}</p>
              <div className="flex items-center gap-2">
                 <p className="font-bold text-primary-600">₹{item.price.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                <button 
                  onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                  className="p-1 hover:bg-white rounded shadow-sm transition-all text-gray-600"
                >
                  <Minus size={14} />
                </button>
                <span className="font-bold w-6 text-center text-sm">{item.quantity}</span>
                 <button 
                  onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                  className="p-1 hover:bg-white rounded shadow-sm transition-all text-gray-600"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button 
                onClick={() => removeFromCart(item.id)}
                className="text-gray-400 hover:text-red-500 transition-colors text-sm flex items-center gap-1"
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Section */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-primary-100 sticky top-24">
          <h3 className="text-xl font-bold font-heading mb-6">Order Summary</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-600 font-medium">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 font-medium">
              <span>GST (18%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
             <div className="flex justify-between text-gray-600 font-medium">
              <span>Shipping</span>
              <span className="text-green-600 font-bold">Free</span>
            </div>

            {/* Coin Usage Section */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCoins}
                  onChange={(e) => {
                    setUseCoins(e.target.checked);
                    if (e.target.checked) {
                      setCoinsUsed(Math.min(availableCoins, Math.floor(subtotal + tax)));
                    } else {
                      setCoinsUsed(0);
                    }
                  }}
                  className="w-5 h-5 accent-yellow-600 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">Use {coinsUsed > 0 ? coinsUsed : availableCoins} Coins</span>
                    <span className="text-lg">🎁</span>
                  </div>
                  <p className="text-xs text-gray-600">Available balance: {availableCoins}</p>
                </div>
              </label>

              {useCoins && (
                <div className="mt-3 pt-3 border-t border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs font-bold text-gray-700">Coins to use:</label>
                    <div className="flex items-center gap-1 bg-white rounded-lg border border-yellow-300 flex-1">
                      <button
                        onClick={() => setCoinsUsed(Math.max(0, coinsUsed - 1))}
                        className="px-2 py-1 text-gray-600 hover:bg-yellow-100 transition-colors"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={coinsUsed}
                        onChange={(e) => {
                          const val = Math.min(availableCoins, Math.max(0, parseInt(e.target.value) || 0));
                          setCoinsUsed(Math.min(val, Math.floor(subtotal + tax)));
                        }}
                        max={Math.min(availableCoins, Math.floor(subtotal + tax))}
                        min="0"
                        className="flex-1 text-center text-sm font-bold bg-transparent border-none outline-none text-gray-800"
                      />
                      <button
                        onClick={() => setCoinsUsed(Math.min(availableCoins, coinsUsed + 1, Math.floor(subtotal + tax)))}
                        className="px-2 py-1 text-gray-600 hover:bg-yellow-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">Discount: ₹{coinDiscount.toFixed(2)}</p>
                </div>
              )}
            </div>

            <div className="border-t-2 border-dashed border-gray-200 pt-3 flex justify-between font-black text-xl text-gray-800">
              <span>Total</span>
              <div className="text-right">
                {coinDiscount > 0 && (
                  <div className="text-sm font-medium text-green-600 line-through text-gray-400">₹{(subtotal + tax).toFixed(2)}</div>
                )}
                <span className={coinDiscount > 0 ? 'text-green-600' : ''}>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {!isCheckingOut ? (
            <button
              onClick={() => {
                if (!user) {
                  navigate('/login');
                } else {
                  setIsCheckingOut(true);
                }
              }}
              className="w-full bg-secondary-600 hover:bg-secondary-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2 btn-funky border-secondary-800"
            >
              Checkout <ArrowRight size={18} />
            </button>
          ) : (
            <form onSubmit={handleRazorpayPayment} className="space-y-4 animate-in slide-in-from-bottom-4">
              
              {/* Shipping Details Section */}
              <div className="border-t-2 border-gray-100 pt-4 mt-4">
                <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <MapPin size={18} className="text-secondary-500" /> Shipping Details
                </h4>
                <div className="space-y-3">
                  <input
                    required
                    placeholder="Full Name"
                    value={shippingData.fullName}
                    onChange={(e) => setShippingData({...shippingData, fullName: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-4 focus:ring-secondary-100 focus:border-secondary-400 outline-none transition-all"
                  />
                  <input
                    required
                    placeholder="Address Line 1"
                    value={shippingData.address}
                    onChange={(e) => setShippingData({...shippingData, address: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-4 focus:ring-secondary-100 focus:border-secondary-400 outline-none transition-all"
                  />
                  <div className="grid grid-cols-2 gap-3">
                     <input
                       required
                       placeholder="City"
                       value={shippingData.city}
                       onChange={(e) => setShippingData({...shippingData, city: e.target.value})}
                       className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-4 focus:ring-secondary-100 focus:border-secondary-400 outline-none transition-all"
                     />
                     <input
                       required
                       placeholder="ZIP Code"
                       value={shippingData.zipCode}
                       onChange={(e) => setShippingData({...shippingData, zipCode: e.target.value})}
                       className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-4 focus:ring-secondary-100 focus:border-secondary-400 outline-none transition-all"
                     />
                  </div>
                  <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone size={14} className="text-gray-400" />
                      </div>
                      <input
                        required
                        type="tel"
                        placeholder="Phone Number"
                        value={shippingData.phone}
                        onChange={(e) => setShippingData({...shippingData, phone: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-xl pl-9 px-4 py-2 text-sm focus:ring-4 focus:ring-secondary-100 focus:border-secondary-400 outline-none transition-all"
                      />
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="border-t-2 border-gray-100 pt-4 mt-4">
                <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <CreditCard size={18} className="text-secondary-500" /> Payment Method
                </h4>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 mb-3">
                  <p className="text-sm text-gray-700 font-medium mb-2">✅ Razorpay Payment Gateway (Test Mode)</p>
                  <p className="text-xs text-gray-600 mb-3">Click "Pay" below to open the Razorpay payment modal. Use test cards to complete payment.</p>

                  <button
                    type="button"
                    onClick={() => setShowTestCards(!showTestCards)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-2"
                  >
                    {showTestCards ? '▼' : '▶'} Show Test Cards
                  </button>

                  {showTestCards && (
                    <div className="space-y-2 mt-2 bg-white p-2 rounded-lg">
                      <p className="text-xs font-bold text-gray-700 mb-2">Success Test Cards:</p>
                      {getTestCards().success.map((card, idx) => (
                        <div key={idx} className="bg-gray-50 p-2 rounded text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="font-mono font-bold">{card.number}</p>
                              <p className="text-gray-600">{card.description}</p>
                              <p className="text-gray-500">Exp: {card.expiry} | CVV: {card.cvv}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(card.number.replace(/\s/g, ''));
                                alert('Card number copied!');
                              }}
                              className="p-1 hover:bg-gray-200 rounded"
                              title="Copy card number"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                 <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  disabled={isProcessing}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-2 rounded-xl hover:bg-gray-200 transition-colors border-2 border-transparent hover:border-gray-300 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 bg-green-500 text-white font-bold py-2 rounded-xl hover:bg-green-600 transition-all disabled:opacity-80 disabled:cursor-wait btn-funky border-green-700 flex justify-center items-center flex-col"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      <span>Opening Razorpay...</span>
                    </div>
                  ) : (
                    <>
                      <span>Pay ₹{total.toFixed(2)} with Razorpay</span>
                      {coinDiscount > 0 && <span className="text-xs text-green-100">You saved ₹{coinDiscount.toFixed(2)} with coins!</span>}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
