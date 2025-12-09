import { supabase, isSupabaseEnabled } from './supabaseService';

const BUCKET_NAME = 'toy-images';

export const uploadProductImage = async (file: File, productId: string): Promise<string | null> => {
  try {
    if (!isSupabaseEnabled) {
      console.warn('Supabase not configured, cannot upload image');
      return null;
    }

    if (!file) {
      console.error('No file provided for upload');
      return null;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (max 5MB)
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      throw new Error('Image size must be less than 5MB');
    }

    // Create unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `product-${productId}-${timestamp}-${random}.${fileExtension}`;

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError.message);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    if (!data?.path) {
      throw new Error('No file path returned from upload');
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    const publicUrl = urlData?.publicUrl;

    if (!publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }

    console.log('✅ Image uploaded successfully:', publicUrl);
    return publicUrl;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error uploading image:', errorMsg);
    throw new Error(errorMsg);
  }
};

export const deleteProductImage = async (imageUrl: string): Promise<boolean> => {
  try {
    if (!isSupabaseEnabled) {
      console.warn('Supabase not configured, cannot delete image');
      return true;
    }

    // Extract filename from URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    if (!fileName) {
      console.warn('Could not extract filename from URL');
      return true;
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);

    if (error) {
      console.error('Error deleting image:', error.message);
      return false;
    }

    console.log('✅ Image deleted successfully:', fileName);
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting image:', errorMsg);
    return false;
  }
};
