'use client'
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/30 p-8 rounded-2xl backdrop-blur-xl border border-gray-800"
        >
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            About Vision Caption AI
          </h1>
          
          <div className="space-y-6 text-gray-300">
            <p className="text-lg">
              Vision Caption AI is an advanced image captioning system that combines 
              state-of-the-art deep learning models with intuitive user experience.
            </p>

            <div className="grid gap-6 md:grid-cols-2 mt-8">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">Our Mission</h3>
                <p>To make visual content more accessible and understandable through AI-powered descriptions.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">Technology</h3>
                <p>Built using PyTorch, Next.js, and Supabase, delivering reliable and accurate results.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
