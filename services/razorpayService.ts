export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, any>;
  created_at: number;
}

export interface RazorpayPaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export const createRazorpayOrder = async (
  amount: number,
  receipt: string,
  notes?: Record<string, any>
): Promise<RazorpayOrderResponse> => {
  try {
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

    if (!keyId) {
      throw new Error('Razorpay Key ID not configured');
    }

    const response = await fetch('/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt,
        notes: notes || {}
      })
    });

    let data;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.warn('Response is not JSON:', text);
        throw new Error('Invalid server response format');
      }
    } catch (parseError) {
      const errorMsg = parseError instanceof Error ? parseError.message : 'Failed to parse response';
      throw new Error(errorMsg);
    }

    if (!response.ok) {
      const errorMessage = data.message || data.error || 'Failed to create Razorpay order';
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating Razorpay order:', errorMsg);

    const mockOrder: RazorpayOrderResponse = {
      id: `order_${Date.now()}`,
      entity: 'order',
      amount: Math.round(amount * 100),
      amount_paid: 0,
      amount_due: Math.round(amount * 100),
      currency: 'INR',
      receipt,
      status: 'created',
      attempts: 0,
      notes: notes || {},
      created_at: Math.floor(Date.now() / 1000)
    };
    return mockOrder;
  }
};

export const openRazorpayCheckout = (
  options: any
): Promise<RazorpayPaymentVerification> => {
  return new Promise((resolve, reject) => {
    const Razorpay = (window as any).Razorpay;

    if (!Razorpay) {
      reject(new Error('Razorpay SDK not loaded. Please refresh the page.'));
      return;
    }

    let timeoutId: NodeJS.Timeout | null = null;
    let isResolved = false;

    try {
      const isTestMode = options.key?.startsWith('rzp_test_');

      console.log('Initializing Razorpay checkout with:', {
        amount: options.amount,
        currency: options.currency,
        order_id: options.order_id,
        testMode: isTestMode
      });

      const checkoutOptions = {
        key: options.key,
        amount: options.amount,
        currency: options.currency,
        name: options.name,
        description: options.description,
        order_id: options.order_id,
        prefill: options.prefill,
        notes: options.notes,
        handler: function (response: RazorpayPaymentVerification) {
          if (isResolved) return; // Prevent multiple resolutions
          isResolved = true;

          if (timeoutId) clearTimeout(timeoutId);
          console.log('Payment handler callback received:', response);
          resolve(response);
        },
        modal: {
          ondismiss: () => {
            if (isResolved) return;
            isResolved = true;
            if (timeoutId) clearTimeout(timeoutId);
            console.log('User dismissed payment modal');
            reject(new Error('Payment cancelled by user'));
          }
        }
      };

      // Create instance
      const rzp = new Razorpay(checkoutOptions);

      // Attach event listeners
      if (typeof rzp.on === 'function') {
        rzp.on('payment.failed', function (response: any) {
          if (isResolved) return;
          isResolved = true;
          if (timeoutId) clearTimeout(timeoutId);
          console.error('Razorpay payment failed event:', response);
          const errorMsg = response?.error?.description || 'Payment failed';
          reject(new Error(errorMsg));
        });

        rzp.on('payment.success', function (response: any) {
          console.log('Payment success event:', response);
        });
      }

      console.log('Opening Razorpay modal...');
      rzp.open();

      // Only use timeout as a last resort (120 seconds for test mode is reasonable)
      timeoutId = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          console.warn('Razorpay checkout timed out after 120 seconds');
          reject(new Error('Payment gateway did not respond. Please close this dialog and try again.'));
        }
      }, 120000);

    } catch (error) {
      if (isResolved) return;
      isResolved = true;
      if (timeoutId) clearTimeout(timeoutId);

      const errorMsg = error instanceof Error ? error.message : 'Failed to open payment gateway';
      console.error('Razorpay initialization error:', errorMsg, error);
      reject(new Error(errorMsg));
    }
  });
};

export const verifyPayment = async (
  paymentVerification: RazorpayPaymentVerification
): Promise<boolean> => {
  try {
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentVerification)
    });

    if (!response.ok) {
      return false;
    }

    let data;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        return false;
      }
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      return false;
    }

    return data.success;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error verifying payment:', errorMsg);
    return false;
  }
};

export const getTestCards = () => {
  return {
    success: [
      {
        number: '4111 1111 1111 1111',
        cvv: '123',
        expiry: '12/25',
        description: 'Visa - All amounts will be successful'
      },
      {
        number: '5555 5555 5555 4444',
        cvv: '123',
        expiry: '12/25',
        description: 'Mastercard - All amounts will be successful'
      }
    ],
    failed: [
      {
        number: '4000 0000 0000 0002',
        cvv: '123',
        expiry: '12/25',
        description: 'Will fail with declined error'
      }
    ]
  };
};
