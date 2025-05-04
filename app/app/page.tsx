'use client'

import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { createClient } from "@/utils/supabase/client";
import { uploadImage } from '@/app/actions/upload';

export default function AppPage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string|undefined>('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadImage(formData);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      setImageUrl(result.url);
    } catch (error) {
      console.error('Error uploading file:', error);
      // TODO: Add error toast/notification
    } finally {
      setUploading(false);
    }
  };

  const generateCaption = async () => {
    if (!imageUrl) return;
    setLoading(true);
  
    try {
      const response = await fetch(imageUrl); // Download the image file
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('file', blob, 'uploaded_image.jpg');
  
      const apiResponse = await fetch('https://g26-img-cap.titansec.in:8000/generate-caption', {
        method: 'POST',
        body: formData,
      });
  
      const data = await apiResponse.json();
      const generated = data.caption || "No caption generated";
  
      const startTime = performance.now();
      const processingTime = (performance.now() - startTime) / 1000;
  
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('generations').insert({
          user_id: user.id,
          image_url: imageUrl,
          caption: generated,
          confidence_score: 0.95,
          processing_time: processingTime,
          tokens_used: 1
        });
      }
  
      setCaption(generated);
    } catch (error) {
      console.error('Error generating caption:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-black/30 p-8 rounded-2xl backdrop-blur-xl border border-gray-800"
        >
          <h2 className="text-2xl font-semibold mb-6">Generate Image Caption</h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Enter image URL"
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-gray-700 focus:border-blue-500 focus:outline-none"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={uploading}
              />
              <div className="text-center text-gray-400">or</div>
              <div 
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`w-full px-4 py-8 rounded-lg border-2 border-dashed border-gray-700 hover:border-blue-500 transition-colors text-center ${uploading ? 'opacity-50' : 'cursor-pointer'}`}
              >
                {uploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-gray-400">Uploading image...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-400">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">PNG, JPG, JPEG up to 5MB</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  disabled={uploading}
                />
              </div>
            </div>
            
            <button 
              onClick={generateCaption}
              disabled={loading || uploading || !imageUrl}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Caption'}
            </button>
          </div>

          {caption && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-white/5 rounded-lg"
            >
              <p className="text-lg">{caption}</p>
            </motion.div>
          )}
        </motion.div>

        {imageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 rounded-lg overflow-hidden"
          >
            <img 
              src={imageUrl} 
              alt="Preview" 
              className="w-full h-auto max-h-[500px] object-contain bg-black/50"
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
