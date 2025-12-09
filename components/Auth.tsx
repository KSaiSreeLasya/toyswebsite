import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { UserRole } from '../types';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Shield, ArrowLeft, CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { signInWithGoogle, signInWithFacebook } from '../services/supabaseService';

const Auth: React.FC = () => {
  const { login, signup } = useStore();
  const navigate = useNavigate();
  const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  
  // UI State
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result.success) {
        Swal.fire({
          icon: 'error',
          title: 'Google Sign In Failed',
          text: result.error || 'Unable to sign in with Google. Please check your Supabase configuration.',
          confirmButtonColor: '#7c3aed',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred',
        confirmButtonColor: '#7c3aed',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setIsFacebookLoading(true);
    try {
      const result = await signInWithFacebook();
      if (!result.success) {
        Swal.fire({
          icon: 'error',
          title: 'Facebook Sign In Failed',
          text: result.error || 'Unable to sign in with Facebook. Please check your Supabase configuration.',
          confirmButtonColor: '#7c3aed',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred',
        confirmButtonColor: '#7c3aed',
      });
    } finally {
      setIsFacebookLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Email and password are required.',
        confirmButtonColor: '#7c3aed',
      });
      return;
    }

    if (view === 'signup') {
      if (password !== confirmPassword) {
        Swal.fire({
          icon: 'error',
          title: 'Passwords Do Not Match',
          text: 'Please make sure your passwords match.',
          confirmButtonColor: '#7c3aed',
        });
        return;
      }

      const result = await signup(email, password, role);
      if (!result.success) {
        Swal.fire({
          icon: 'error',
          title: 'Signup Failed',
          text: result.error || 'Signup failed. Please try again.',
          confirmButtonColor: '#7c3aed',
        });
        return;
      }

      Swal.fire({
        icon: 'success',
        title: 'Account Created!',
        text: `Welcome! Your account has been created successfully.`,
        confirmButtonColor: '#10b981',
      }).then(() => {
        if (role === UserRole.ADMIN) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      });
    } else {
      const result = await login(email, password, role);
      if (!result.success) {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: result.error || 'Invalid credentials. Please try again.',
          confirmButtonColor: '#7c3aed',
        });
        return;
      }

      Swal.fire({
        icon: 'success',
        title: 'Welcome Back!',
        text: 'You have been logged in successfully.',
        confirmButtonColor: '#10b981',
      }).then(() => {
        if (role === UserRole.ADMIN) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      });
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
        setResetSent(true);
    }, 1000);
  };

  if (view === 'forgot') {
      return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
                <button 
                    onClick={() => { setView('login'); setResetSent(false); }}
                    className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors font-bold text-sm"
                >
                    <ArrowLeft size={16} /> Back to Login
                </button>
                
                <div className="text-center">
                     <div className="mx-auto h-16 w-16 bg-accent-100 rounded-full flex items-center justify-center mb-4">
                        <Lock size={32} className="text-accent-600" />
                     </div>
                     <h2 className="text-3xl font-heading font-bold text-gray-900">Forgot Password?</h2>
                     <p className="mt-2 text-sm text-gray-600">No worries! Enter your email and we'll send you reset instructions.</p>
                </div>

                {resetSent ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-in fade-in">
                        <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
                        <h3 className="font-bold text-green-800 text-lg">Check your email!</h3>
                        <p className="text-green-700 text-sm mt-1">We've sent a magic link to <b>{email}</b>.</p>
                        <button 
                            onClick={() => setView('login')}
                            className="mt-4 w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Back to Sign In
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleForgotPassword} className="mt-8 space-y-6">
                         <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail size={18} className="text-gray-400" />
                            </div>
                            <input
                            type="email"
                            required
                            className="appearance-none rounded-xl relative block w-full pl-10 px-3 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-4 focus:ring-accent-100 focus:border-accent-400 sm:text-sm transition-all"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <button
                        type="submit"
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-accent-500 hover:bg-accent-600 focus:outline-none focus:ring-4 focus:ring-accent-200 transition-all shadow-md btn-funky border-accent-700"
                        >
                            Send Reset Link
                        </button>
                    </form>
                )}
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
             <Shield size={24} className="text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-heading font-bold text-gray-900">
            {view === 'login' ? 'Welcome Back!' : 'Join the Fun'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {view === 'login' ? 'Sign in to access your account' : 'Create an account to start shopping'}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>

          <div className="rounded-md shadow-sm space-y-4">
             {/* Role Selection for Demo Purposes */}
            <div className="flex justify-center gap-4 mb-6">
                 <button
                   type="button"
                   onClick={() => setRole(UserRole.CUSTOMER)}
                   className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border-2 ${role === UserRole.CUSTOMER ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                 >
                   Customer
                 </button>
                  <button
                   type="button"
                   onClick={() => setRole(UserRole.ADMIN)}
                   className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border-2 ${role === UserRole.ADMIN ? 'bg-secondary-50 border-secondary-500 text-secondary-700' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                 >
                   Admin
                 </button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="appearance-none rounded-xl relative block w-full pl-10 px-3 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 sm:text-sm transition-all"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none rounded-xl relative block w-full pl-10 pr-10 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 sm:text-sm transition-all"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {view === 'signup' && (
                <div className="relative animate-in slide-in-from-top-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                    </div>
                    <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="appearance-none rounded-xl relative block w-full pl-10 pr-10 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 sm:text-sm transition-all"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end">
             {view === 'login' && (
                 <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-sm font-bold text-primary-600 hover:text-primary-500 hover:underline"
                 >
                    Forgot Password?
                 </button>
             )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isFacebookLoading}
              className="w-full inline-flex justify-center items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-sm">Signing in...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="20" fontWeight="bold" fill="currentColor">
                      G
                    </text>
                  </svg>
                  <span className="text-sm">Google</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleFacebookSignIn}
              disabled={isGoogleLoading || isFacebookLoading}
              className="w-full inline-flex justify-center items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFacebookLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-sm">Signing in...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="20" fontWeight="bold" fill="currentColor">
                      f
                    </text>
                  </svg>
                  <span className="text-sm">Facebook</span>
                </>
              )}
            </button>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-200 transition-colors shadow-md btn-funky border-primary-800"
            >
              {view === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </form>
        
        <div className="text-center pt-2 border-t border-gray-100">
            <button 
                onClick={() => {
                    setView(view === 'login' ? 'signup' : 'login');
                    setError('');
                }}
                className="text-sm text-gray-500 hover:text-primary-600 font-medium transition-colors"
            >
                {view === 'login' ? (
                    <span>Don't have an account? <span className="font-bold text-primary-600">Sign up</span></span>
                ) : (
                    <span>Already have an account? <span className="font-bold text-primary-600">Sign in</span></span>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
