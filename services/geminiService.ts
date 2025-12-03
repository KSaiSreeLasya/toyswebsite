import { Product } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const generateProductDescription = async (productName: string, category: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-description`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productName, category }),
    });

    if (!response.ok) {
      try {
        const error = await response.json();
        console.error('API Error:', error);
        return error.error || 'Could not generate description at this time.';
      } catch {
        return 'Could not generate description at this time.';
      }
    }

    const data = await response.json();
    return data.description || '';
  } catch (error) {
    console.error('Error generating description:', error);
    return 'Could not generate description at this time.';
  }
};

export const getGiftRecommendation = async (query: string, availableProducts: Product[]): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/gift-recommendation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query, 
        availableProducts: availableProducts.map(p => ({
          name: p.name,
          price: p.price,
          category: p.category,
        })) 
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error:', error);
      return error.error || 'I\'m having trouble thinking of a recommendation right now. Try browsing the categories!';
    }

    const data = await response.json();
    return data.recommendation || "I couldn't think of anything to say.";
  } catch (error) {
    console.error('Error getting recommendation:', error);
    return 'I\'m having trouble thinking of a recommendation right now. Try browsing the categories!';
  }
};
