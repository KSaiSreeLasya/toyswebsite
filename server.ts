import express, { Request, Response } from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('Warning: GEMINI_API_KEY environment variable is not set. AI features will not work until you add it.');
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = supabaseServiceKey && supabaseUrl ? createClient(supabaseUrl, supabaseServiceKey) : null;

interface GenerateDescriptionRequest {
  productName: string;
  category: string;
}

interface GiftRecommendationRequest {
  query: string;
  availableProducts: Array<{ name: string; price: number; category: string }>;
}

app.post('/api/generate-description', async (req: Request<{}, {}, GenerateDescriptionRequest>, res: Response) => {
  try {
    const { productName, category } = req.body;

    if (!ai) {
      return res.status(500).json({ error: 'API Key not configured. Please set GEMINI_API_KEY environment variable.' });
    }

    if (!productName || !category) {
      return res.status(400).json({ error: 'Missing productName or category' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Task: Write a SUPER FUN, EXCITING, and KID-FRIENDLY product description for a toy.
        Product Name: "${productName}"
        Category: "${category}"
        Style: Use emojis 🚀, exciting words, and make it sound like the coolest toy ever. Max 2 short sentences.
      `,
    });

    const description = response.text ? response.text.trim() : '';
    res.json({ description });
  } catch (error) {
    console.error('Gemini Error:', error);
    res.status(500).json({ error: 'Failed to generate description. Please check your API key.' });
  }
});

app.post('/api/gift-recommendation', async (req: Request<{}, {}, GiftRecommendationRequest>, res: Response) => {
  try {
    const { query, availableProducts } = req.body;

    if (!ai) {
      return res.status(500).json({ error: 'API Key not configured. Please set GEMINI_API_KEY environment variable.' });
    }

    if (!query || !availableProducts) {
      return res.status(400).json({ error: 'Missing query or availableProducts' });
    }

    const productContext = availableProducts
      .map(p => `${p.name} (₹${p.price}, ${p.category})`)
      .join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are "Toy Geni", the most magical and fun shopping assistant for a kids' toy store! 🧞‍♂️✨
        
        Here is our treasure chest of toys:
        ${productContext}

        Friend's Query: "${query}"

        Task: Recommend 1-2 specific toys from our list. Explain why they are AWESOME! Be super enthusiastic, use emojis, and keep it brief (under 50 words). If nothing matches perfectly, suggest the next most fun thing! Prices are in Indian Rupees (₹).
      `,
    });

    const recommendation = response.text ? response.text.trim() : '';
    res.json({ recommendation });
  } catch (error) {
    console.error('Gemini Chat Error:', error);
    res.status(500).json({ error: 'Failed to generate recommendation. Please check your API key.' });
  }
});

app.post('/api/setup-admin', async (req: Request, res: Response) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Supabase admin client not configured. Service Role Key is missing.' });
    }

    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin2024';

    // Check if admin user already exists in auth
    const { data: { users: existingAuthUsers } } = await supabaseAdmin.auth.admin.listUsers();
    const adminAuthExists = existingAuthUsers?.some(u => u.email === adminEmail);

    if (adminAuthExists) {
      // Check if admin profile exists in users table
      const { data: adminProfile } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', adminEmail)
        .eq('role', 'admin')
        .single();

      if (adminProfile) {
        return res.json({
          success: true,
          message: 'Admin user already exists.',
          email: adminEmail
        });
      }
    }

    // Create auth user if doesn't exist
    let authUserId: string;
    if (!adminAuthExists) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
      });

      if (authError || !authData.user) {
        return res.status(400).json({ error: authError?.message || 'Failed to create auth user.' });
      }
      authUserId = authData.user.id;
    } else {
      // Get existing user ID
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
      const user = users?.find(u => u.email === adminEmail);
      if (!user) {
        return res.status(400).json({ error: 'Could not find existing admin user.' });
      }
      authUserId = user.id;
    }

    // Create or update admin profile in users table
    const { error: upsertError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: authUserId,
        email: adminEmail,
        role: 'admin',
        name: 'Admin',
      }, { onConflict: 'id' });

    if (upsertError) {
      return res.status(400).json({ error: upsertError.message });
    }

    res.json({
      success: true,
      message: 'Admin user created successfully.',
      email: adminEmail,
      password: adminPassword
    });
  } catch (error) {
    console.error('Setup Admin Error:', error);
    res.status(500).json({ error: 'Failed to setup admin user.' });
  }
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    apiKeyConfigured: !!apiKey,
    supabaseConfigured: !!supabaseAdmin,
    message: supabaseAdmin ? 'API is ready with Supabase' : 'API Key or Supabase not configured'
  });
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
  console.log(`API Key configured: ${!!apiKey}`);
});
