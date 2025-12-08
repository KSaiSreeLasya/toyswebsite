import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

if (!isSupabaseConfigured) {
  console.warn('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
} else {
  console.log('Supabase initialized with URL:', supabaseUrl);
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      }
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      }
    });

export const isSupabaseEnabled = isSupabaseConfigured;

export interface UserAccount {
  id?: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  name: string;
  created_at?: string;
}

export const signUp = async (email: string, password: string, role: 'CUSTOMER' | 'ADMIN'): Promise<{ success: boolean; error?: string; user?: UserAccount }> => {
  try {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured for signup');
      return { success: false, error: 'Database not configured. Please configure Supabase.' };
    }

    const emailLower = email.toLowerCase();
    const roleLower = role.toLowerCase();

    console.log('Attempting signup for:', emailLower);

    // Call backend signup endpoint
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: emailLower,
        password,
        role: roleLower,
      })
    });

    console.log('Signup response status:', response.status);
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);

    if (!response.ok) {
      console.error('Signup response not OK, status:', response.status);
    }

    let data;
    try {
      const responseText = await response.text();
      console.log('Raw response text length:', responseText?.length || 0);
      console.log('Raw response text:', responseText);

      if (!responseText || responseText.trim().length === 0) {
        if (response.ok) {
          console.warn('⚠️ Empty response body from server, but status 200 received');
          return { success: true, user: { email: emailLower, role: roleLower, name: emailLower.split('@')[0] } };
        }
        const errorMsg = `Server error (${response.status}): Empty response`;
        console.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      data = JSON.parse(responseText);
      console.log('Parsed response data:', data);
    } catch (parseError) {
      console.error('Could not parse response:', parseError);
      return { success: false, error: 'Server returned invalid response. Please try again.' };
    }

    if (!response.ok) {
      const errorMessage = data?.error || `Request failed with status ${response.status}`;
      console.error('Signup failed:', errorMessage);
      return { success: false, error: errorMessage };
    }

    console.log('Signup successful');
    return { success: true, user: data.user || { email: emailLower, role: roleLower, name: emailLower.split('@')[0] } };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Signup exception:', errorMsg);
    return { success: false, error: 'Signup failed. Please try again.' };
  }
};

export const signIn = async (email: string, password: string, role: 'CUSTOMER' | 'ADMIN'): Promise<{ success: boolean; error?: string; user?: UserAccount }> => {
  try {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured for signin');
      return { success: false, error: 'Database not configured. Please configure Supabase.' };
    }

    const emailLower = email.toLowerCase();
    const roleLower = role.toLowerCase();

    console.log('Attempting sign in for:', emailLower, 'with role:', roleLower);

    // Call backend signin endpoint
    const response = await fetch('/api/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: emailLower,
        password,
        role: roleLower,
      })
    });

    console.log('Signin response status:', response.status);

    let data;
    try {
      const responseText = await response.text();
      console.log('Raw signin response text:', responseText);

      if (!responseText || responseText.trim().length === 0) {
        const errorMsg = response.ok ? 'Empty success response from server' : `Server error (${response.status}): Empty response`;
        console.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      data = JSON.parse(responseText);
      console.log('Parsed signin response data:', data);
    } catch (parseError) {
      console.error('Could not parse signin response:', parseError);
      return { success: false, error: 'Server returned invalid response. Please try again.' };
    }

    if (!response.ok) {
      const errorMessage = data?.error || `Request failed with status ${response.status}`;
      console.error('Signin failed:', errorMessage);
      return { success: false, error: errorMessage };
    }

    console.log('Sign in successful');
    return { success: true, user: data.user || { email: emailLower, role: roleLower, name: emailLower.split('@')[0], id: data.userId } };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Unexpected sign in error:', errorMsg);
    return { success: false, error: 'Login failed. Please try again.' };
  }
};

export const signOut = async (): Promise<void> => {
  await supabase.auth.signOut();
};

export const initializeAdminUser = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin2024';

    // Check if admin user already exists in the database
    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', adminEmail)
      .eq('role', 'admin');

    if (!checkError && existingAdmin && existingAdmin.length > 0) {
      return { success: true, message: 'Admin user already exists.' };
    }

    // Try to sign up the admin user
    const signUpResult = await signUp(adminEmail, adminPassword, 'ADMIN');

    if (signUpResult.success) {
      return { success: true, message: 'Admin user created successfully.' };
    } else {
      return { success: false, message: signUpResult.error || 'Failed to create admin user.' };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Initialize Admin Error:', errorMsg);
    return { success: false, message: 'Error initializing admin user.' };
  }
};
