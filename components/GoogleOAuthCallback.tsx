import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { handleGoogleOAuthCallback } from '../services/googleOAuthService';
import { Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { UserRole } from '../types';

const GoogleOAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setUserFromOAuth } = useStore();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log('🔐 Processing Google OAuth callback...');
        const result = await handleGoogleOAuthCallback();

        if (!result.success) {
          throw new Error(result.error || 'OAuth callback failed');
        }

        if (!result.user) {
          throw new Error('No user data returned from OAuth');
        }

        console.log('✅ OAuth callback successful:', result.user.email);

        // Set user in StoreContext and wait for it to load cart/orders
        await setUserFromOAuth({
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: UserRole.CUSTOMER,
          permissions: [],
          wishlist: [],
          coinBalance: 74,
          picture: result.user.picture,
          provider: 'google',
        });

        console.log('✅ User data and cart/orders loaded');

        // Show success message and redirect
        await Swal.fire({
          icon: 'success',
          title: 'Welcome!',
          text: `Logged in as ${result.user.name}`,
          confirmButtonColor: '#10b981',
          timer: 2000,
          timerProgressBar: true,
        });

        // Redirect to home
        navigate('/');
      } catch (error) {
        console.error('❌ OAuth callback error:', error);
        const errorMsg = error instanceof Error ? error.message : 'Authentication failed';

        await Swal.fire({
          icon: 'error',
          title: 'Sign In Failed',
          text: errorMsg,
          confirmButtonColor: '#7c3aed',
        });

        // Redirect back to login
        navigate('/login');
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [navigate, setUserFromOAuth]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="relative w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <Loader2 size={32} className="text-primary-600 animate-spin" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Signing You In...</h2>
        <p className="text-gray-600">Please wait while we authenticate your account.</p>
      </div>
    </div>
  );
};

export default GoogleOAuthCallback;
