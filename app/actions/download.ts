'use server'

import { createClient } from '@/utils/supabase/server';
import { data } from 'autoprefixer';

export async function getSignedDownloadUrl(imagePath: string) {
    try {
        const supabase = await createClient();

        // Extract file path from full URL
        const urlObj = new URL(imagePath);
        const filePath = urlObj.pathname.split('/').slice(6).join('/');
        console.log('File path:', filePath);

        const { data, error } = await supabase.storage
            .from('img-store')
            .createSignedUrl(filePath, 60); // 1 minute expiry
        if (error) throw error;
        if (data?.signedUrl) {
            const { signedUrl } = data;
            return { success: true, url: signedUrl };
        } else {
            return { success: false, error: 'Failed to generate download link' };
        }
    } catch (error) {
        console.error('Download error:', error);
        return { success: false, error: 'Failed to generate download link' };
    }
}
