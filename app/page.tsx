'use client'

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Session } from '@supabase/supabase-js';

export default function Home() {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    checkUser();
  }, [supabase]);

  const ActionButton = () => {
    if (loading) return null;
    
    if (session) {
      return (
        <Link href="/app" className="relative inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-medium text-white shadow-lg overflow-hidden transition-all duration-300 hover:shadow-blue-500/25 hover:shadow-xl">
          <span className="relative z-10">Access App</span>
          <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-100"></span>
          <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-pink-500 opacity-0 hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
          <span className="absolute -inset-1 rounded-xl opacity-0 hover:opacity-30 transition-opacity duration-300 blur bg-gradient-to-r from-blue-500 to-purple-600"></span>
        </Link>
      );
    }
    
    return (
      <Link href="/sign-up" className="relative inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-medium text-white shadow-lg overflow-hidden transition-all duration-300 hover:shadow-blue-500/25 hover:shadow-xl">
        <span className="relative z-10">Get Started</span>
        <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-100"></span>
        <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-pink-500 opacity-0 hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
        <span className="absolute -inset-1 rounded-xl opacity-0 hover:opacity-30 transition-opacity duration-300 blur bg-gradient-to-r from-blue-500 to-purple-600"></span>
      </Link>
    );
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div 
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl"
            initial={{ 
              width: Math.random() * 400 + 200, 
              height: Math.random() * 400 + 200,
              x: Math.random() * 100 - 50 + '%',
              y: Math.random() * 100 - 50 + '%',
            }}
            animate={{ 
              x: [null, `${Math.random() * 20 - 10}%`],
              y: [null, `${Math.random() * 20 - 10}%`],
            }}
            transition={{ 
              duration: Math.random() * 20 + 10, 
              repeat: Infinity, 
              repeatType: 'reverse',
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              AI-Powered Image Captioning
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Transform your images into meaningful descriptions using cutting-edge deep learning
            </p>
            <ActionButton />
          </motion.div>

          {/* Demo Section with abstract visualization instead of images */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid md:grid-cols-2 gap-8"
          >
            {[
              {
                title: "Intelligent Analysis",
                description: "Our AI analyzes visual elements, contexts, and details to generate accurate descriptions."
              },
              {
                title: "Precise Captioning",
                description: "Convert complex visuals into clear, concise, and contextually relevant text descriptions."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="p-8 bg-gradient-to-b from-gray-800/40 to-gray-900/40 rounded-2xl backdrop-blur-md border border-gray-800/50 relative overflow-hidden group hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                
                {/* Abstract visualization replacing images */}
                <div className="h-48 mb-4 relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 flex items-center justify-center border border-gray-700/50">
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: [0.6, 0.8, 0.6] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <div className="absolute w-24 h-24 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-md transform -rotate-12"></div>
                    <div className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-indigo-500/20 to-pink-500/20 blur-md transform translate-x-10"></div>
                    <div className="absolute w-20 h-20 rounded-md bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-md transform translate-y-8 translate-x-4"></div>
                    <div className="w-16 h-16 border-2 border-gray-400/30 rounded-md transform rotate-12"></div>
                  </motion.div>
                </div>
                
                <h3 className="text-xl font-semibold mb-2 text-white">{item.title}</h3>
                <p className="text-gray-300">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section - Enhanced with more modern styling */}
      <section className="relative py-20 px-4 z-10">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-12 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
          >
            Cutting-Edge Features
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Advanced AI',
                description: 'Powered by state-of-the-art PyTorch models',
                icon: (
                  <div className="w-12 h-12 mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                )
              },
              {
                title: 'Real-time Processing',
                description: 'Get instant captions for your images',
                icon: (
                  <div className="w-12 h-12 mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                )
              },
              {
                title: 'High Accuracy',
                description: 'Trained on millions of image-caption pairs',
                icon: (
                  <div className="w-12 h-12 mb-4 rounded-full bg-pink-500/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="p-6 bg-gradient-to-b from-gray-800/40 to-gray-900/40 rounded-2xl backdrop-blur-md border border-gray-800/50 relative overflow-hidden group hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                {feature.icon}
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
