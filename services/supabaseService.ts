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
    console.log('Signup response headers:', response.headers);

    let data;
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);

    if (!contentType || !contentType.includes('application/json')) {
      try {
        const responseText = await response.text();
        console.error('Non-JSON response:', responseText);
        return { success: false, error: responseText || 'Invalid server response. Please try again.' };
      } catch (textError) {
        console.error('Could not read response text:', textError);
        return { success: false, error: 'Server response was invalid. Please try again.' };
      }
    }

    try {
      data = await response.json();
      console.log('Parsed response data:', data);
    } catch (parseError) {
      console.error('Could not parse JSON response:', parseError);
      return { success: false, error: 'Server returned invalid response. Please try again.' };
    }

    if (!response.ok) {
      const errorMessage = data?.error || 'Signup failed.';
      console.error('Signup failed with status', response.status, ':', errorMessage);
      return { success: false, error: errorMessage };
    }

    console.log('Signup successful');
    return { success: true, user: { email: emailLower, role: roleLower, name: emailLower.split('@')[0] } };
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

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: emailLower,
      password,
    });

    if (authError) {
      console.error('Auth error details:', authError?.message || 'Unknown auth error');
      return { success: false, error: authError.message || 'Authentication failed.' };
    }

    if (!authData?.user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const authUserId = authData.user.id;
    console.log('Auth successful, user ID:', authUserId);

    // Get user record from users table
    const { data: user, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUserId)
      .single();

    // If user record doesn't exist, create it
    if (selectError && !user) {
      console.log('Creating user record for:', emailLower);
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUserId,
          email: emailLower,
          role: roleLower,
          name: emailLower.split('@')[0],
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError?.message || 'Unknown insert error');
        return { success: false, error: 'Failed to create user record.' };
      }

      console.log('Sign in successful');
      return { success: true, user: { ...newUser, id: authUserId } };
    }

    if (selectError && user === null) {
      console.error('User select error:', selectError?.message || 'Unknown select error');
      return { success: false, error: 'User not found.' };
    }

    console.log('Sign in successful');
    return { success: true, user: { ...user, id: authUserId } };
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
