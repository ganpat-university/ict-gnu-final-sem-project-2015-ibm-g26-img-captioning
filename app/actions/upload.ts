'use server'

import { createClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size too large. Maximum size is 5MB');
    }

    // Enhanced file type validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      throw new Error('Invalid file extension. Only JPG, JPEG and PNG files are allowed');
    }
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPG, JPEG and PNG files are allowed');
    }

    const supabase = await createClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Create unique filename
    const extension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${extension}`;
    const filePath = `uploads/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from('img-store')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
        duplex: 'half'
      });

    if (error) throw error;

    // Get signed URL instead of public URL
    const { data : storageData, error: signedUrlError } = await supabase.storage
      .from('img-store')
      .createSignedUrl(filePath, 60 * 60);

    if (signedUrlError) throw signedUrlError;
      if (storageData?.signedUrl){
          return { success: true, url: storageData.signedUrl };
    }else{
          return { success: false, error: 'Upload failed' };
    }
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
  }
}
