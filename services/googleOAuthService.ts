/**
 * Google OAuth Service
 * Handles Google OAuth authentication flow (Authorization Code flow)
 */

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface GoogleOAuthResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };
  accessToken?: string;
  idToken?: string;
  error?: string;
}

/**
 * Initiate Google OAuth login
 * Redirects user to Google's consent screen
 */
export const initiateGoogleOAuth = (): void => {
  const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/google/callback`;
  const scope = 'openid email profile';
  const responseType = 'code';

  if (!clientId) {
    throw new Error('Google OAuth Client ID not configured');
  }

  // Build Google OAuth URL
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: responseType,
    scope,
    access_type: 'offline',
    prompt: 'consent',
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  // Redirect user to Google
  window.location.href = googleAuthUrl;
};

/**
 * Handle OAuth callback
 * Extracts authorization code from URL and exchanges it for tokens
 */
export const handleGoogleOAuthCallback = async (): Promise<GoogleOAuthResponse> => {
  try {
    // Get authorization code from URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error) {
      const errorDescription = params.get('error_description') || error;
      console.error('❌ Google OAuth error:', errorDescription);
      return { success: false, error: errorDescription };
    }

    if (!code) {
      console.error('❌ No authorization code in callback');
      return { success: false, error: 'No authorization code received' };
    }

    console.log('🔐 Exchanging authorization code for tokens...');

    // Exchange code for tokens on backend
    const response = await fetch('/api/auth/google/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Token exchange failed:', error);
      return { success: false, error: error.error || 'Token exchange failed' };
    }

    const data = await response.json();

    if (!data.success) {
      console.error('❌ Authentication failed:', data.error);
      return { success: false, error: data.error };
    }

    console.log('✅ Google OAuth successful:', data.user.email);

    return {
      success: true,
      user: data.user,
      accessToken: data.accessToken,
      idToken: data.idToken,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ OAuth callback error:', errorMsg);
    return { success: false, error: errorMsg };
  }
};
