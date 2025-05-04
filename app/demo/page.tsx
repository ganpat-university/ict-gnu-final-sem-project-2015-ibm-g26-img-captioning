'use client'
import { motion } from 'framer-motion';

export default function DemoPage() {
  const demoExamples = [
    {
      image: '/demo-1.png',
      caption: 'A scenic mountain landscape with snow-capped peaks',
      accuracy: '98%'
    },
    {
      image: '/demo-2.png',
      caption: 'A busy city street at night with neon signs',
      accuracy: '96%'
    },
    // Add more examples as needed
  ];

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/30 p-8 rounded-2xl backdrop-blur-xl border border-gray-800"
        >
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            See It In Action
          </h1>

          <div className="grid md:grid-cols-2 gap-8">
            {demoExamples.map((example, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.2 }}
                className="space-y-4"
              >
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={example.image} 
                    alt="Demo" 
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/placeholder-image.png';
                    }}
                  />
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-lg mb-2">{example.caption}</p>
                  <p className="text-sm text-blue-400">Accuracy: {example.accuracy}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
