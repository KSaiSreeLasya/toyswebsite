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

    let data;
    try {
      const responseText = await response.text();

      if (!responseText) {
        return 'Could not generate description at this time.';
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          console.error('Failed to parse JSON response:', responseText);
          return 'Could not generate description at this time.';
        }
      } else {
        console.warn('Response is not JSON:', responseText);
        return 'Could not generate description at this time.';
      }
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      return 'Could not generate description at this time.';
    }

    if (!response.ok) {
      console.error('API Error:', data);
      return data?.error || 'Could not generate description at this time.';
    }

    return data?.description || '';
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

    let data;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.warn('Response is not JSON:', text);
        data = { error: 'Invalid server response format' };
      }
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      return 'I\'m having trouble thinking of a recommendation right now. Try browsing the categories!';
    }

    if (!response.ok) {
      console.error('API Error:', data);
      return data.error || 'I\'m having trouble thinking of a recommendation right now. Try browsing the categories!';
    }

    return data.recommendation || "I couldn't think of anything to say.";
  } catch (error) {
    console.error('Error getting recommendation:', error);
    return 'I\'m having trouble thinking of a recommendation right now. Try browsing the categories!';
  }
};
