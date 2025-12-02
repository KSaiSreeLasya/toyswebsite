import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials not found!', {
    url: supabaseUrl ? 'found' : 'MISSING',
    key: supabaseAnonKey ? 'found' : 'MISSING'
  });
} else {
  console.log('Supabase initialized with URL:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
});

export interface UserAccount {
  id?: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  name: string;
  created_at?: string;
}

export const signUp = async (email: string, password: string, role: 'CUSTOMER' | 'ADMIN'): Promise<{ success: boolean; error?: string; user?: UserAccount }> => {
  try {
    const emailLower = email.toLowerCase();
    const roleLower = role.toLowerCase();

    // Check if user already exists in users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', emailLower);

    if (checkError) {
      console.error('Check user error:', checkError);
      return { success: false, error: checkError.message };
    }

    if (existingUser && existingUser.length > 0) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    // Create auth user
    let authData: any;
    let authError: any;
    try {
      const response = await supabase.auth.signUp({
        email: emailLower,
        password,
      });
      authData = response.data;
      authError = response.error;
    } catch (e) {
      console.error('Signup auth exception:', e);
      return { success: false, error: 'Failed to create account. Please try again.' };
    }

    if (authError) {
      console.error('Signup auth error:', authError);
      return { success: false, error: authError.message || 'Signup failed.' };
    }

    if (!authData?.user) {
      return { success: false, error: 'Signup failed: No user created.' };
    }

    // Insert user record in users table
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: emailLower,
        role: roleLower,
        name: emailLower.split('@')[0],
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert user error:', insertError);
      return { success: false, error: insertError.message };
    }

    return { success: true, user: newUser };
  } catch (err) {
    console.error('Signup exception:', err);
    return { success: false, error: 'Signup failed. Please try again.' };
  }
};

export const signIn = async (email: string, password: string, role: 'CUSTOMER' | 'ADMIN'): Promise<{ success: boolean; error?: string; user?: UserAccount }> => {
  try {
    const emailLower = email.toLowerCase();
    const roleLower = role.toLowerCase();

    console.log('Attempting sign in for:', emailLower, 'with role:', roleLower);

    // Authenticate with Supabase Auth
    let authData: any = null;
    let authError: any = null;

    try {
      const response = await supabase.auth.signInWithPassword({
        email: emailLower,
        password,
      });
      authData = response.data;
      authError = response.error;
    } catch (e: any) {
      console.error('Auth exception:', e);
      // If it's a body stream error, try to extract useful info
      if (e.message?.includes('body stream')) {
        return { success: false, error: 'Authentication service temporarily unavailable. Please try again.' };
      }
      return { success: false, error: e.message || 'Authentication failed.' };
    }

    if (authError) {
      console.error('Auth error details:', authError);
      return { success: false, error: authError.message || 'Authentication failed.' };
    }

    if (!authData?.user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    console.log('Auth successful, user ID:', authData.user.id);

    // Get user record from users table
    let user: any = null;
    let selectError: any = null;

    try {
      const response = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .eq('role', roleLower)
        .single();

      user = response.data;
      selectError = response.error;
    } catch (e) {
      console.error('User select error:', e);
      selectError = e;
    }

    // If user record doesn't exist, create it
    if ((selectError || !user) && authData.user.id) {
      console.log('Creating user record for:', emailLower);
      try {
        const response = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: emailLower,
            role: roleLower,
            name: emailLower.split('@')[0],
          })
          .select()
          .single();

        if (response.error) {
          console.error('Insert error:', response.error);
          return { success: false, error: `User record creation failed: ${response.error.message}` };
        }

        user = response.data;
      } catch (insertErr) {
        console.error('Insert exception:', insertErr);
        return { success: false, error: 'Failed to create user record.' };
      }
    } else if (selectError && user === null) {
      console.error('User select error and no user:', selectError);
      return { success: false, error: 'User not found or role mismatch.' };
    }

    console.log('Sign in successful');
    return { success: true, user };
  } catch (err) {
    console.error('Unexpected sign in error:', err);
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
    console.error('Initialize Admin Error:', error);
    return { success: false, message: 'Error initializing admin user.' };
  }
};
