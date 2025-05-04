'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSignedDownloadUrl } from '@/app/actions/download';

interface ImageModalProps {
  imageUrl: string;
  caption: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageModal({ imageUrl, caption, isOpen, onClose }: ImageModalProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const result = await getSignedDownloadUrl(imageUrl);
      if (result.success && result.url) {
        const response = await fetch(result.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `image-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="relative max-w-4xl w-full bg-gray-900 rounded-lg p-4"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={imageUrl}
              alt={caption}
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-300">{caption}</p>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {downloading ? 'Downloading...' : 'Download'}
              </button>
            </div>
            <button
              onClick={onClose}
              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
