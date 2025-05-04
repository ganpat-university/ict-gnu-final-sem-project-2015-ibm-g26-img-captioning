'use client'

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { User } from '@/types/user';
import { UserStatistics, Generation } from '@/types/database';
import { ImageModal } from '@/components/ImageModal';

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [selectedImage, setSelectedImage] = useState<Generation | null>(null);

  useEffect(() => {
    async function getUserData() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        return router.push("/sign-in");
      }
      setUser(user as User);
      
      // Fetch user statistics and generations
      const [statsResponse, generationsResponse] = await Promise.all([
        supabase
          .from('user_statistics')
          .select('*')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('generations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);
      
      if (!statsResponse.error && statsResponse.data) {
        setStats(statsResponse.data);
      }
      
      if (!generationsResponse.error && generationsResponse.data) {
        setGenerations(generationsResponse.data);
      }
      
      setLoading(false);
    }
    getUserData();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto pt-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/30 p-8 rounded-2xl backdrop-blur-xl border border-gray-800 h-fit"
          >
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                {user.email?.[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">Profile Details</h1>
                <p className="text-gray-400">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Account Information</h2>
              <div className="grid gap-4 text-sm">
                <div className="flex justify-between p-4 rounded-lg bg-white/5">
                  <span className="text-gray-400">Email</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex justify-between p-4 rounded-lg bg-white/5">
                  <span className="text-gray-400">Account Created</span>
                  <span>{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between p-4 rounded-lg bg-white/5">
                  <span className="text-gray-400">Last Sign In</span>
                  <span>{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</span>
                </div>
              </div>

              <div className="pt-4">
                <h2 className="text-xl font-semibold mb-4">Actions</h2>
                <div className="flex gap-4">
                  <button
                    onClick={() => router.push('/profile/reset-password')} 
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    Change Password
                  </button>
                  <button 
                    onClick={handleSignOut}
                    className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-black/30 p-8 rounded-2xl backdrop-blur-xl border border-gray-800 h-fit"
          >
            <h2 className="text-2xl font-bold mb-6">Usage Statistics</h2>
            <div className="grid gap-6">
              {[
                { 
                  label: 'Images Processed', 
                  value: stats?.total_generations ?? 0, 
                  icon: '🖼️' 
                },
                { 
                  label: 'Tokens Remaining', 
                  value: stats?.tokens_remaining ?? 0, 
                  icon: '🎫' 
                },
                { 
                  label: 'Account Type', 
                  value: stats?.account_tier ?? 'Free', 
                  icon: '⭐' 
                },
              ].map((stat, index) => (
                <div key={index} className="flex items-center p-4 rounded-lg bg-white/5">
                  <span className="text-2xl mr-4">{stat.icon}</span>
                  <div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                    <div className="text-xl font-bold">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Generations History */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-black/30 p-8 rounded-2xl backdrop-blur-xl border border-gray-800"
        >
          <h2 className="text-2xl font-bold mb-6">Recent Generations</h2>
          {generations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="pb-4">Image</th>
                    <th className="pb-4">Caption</th>
                    <th className="pb-4">Confidence</th>
                    <th className="pb-4">Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {generations.map((gen) => (
                    <tr key={gen.id} className="hover:bg-white/5">
                      <td className="py-4">
                        <img 
                          src={gen.image_url} 
                          alt="Generated caption" 
                          className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80"
                          onClick={() => setSelectedImage(gen)}
                        />
                      </td>
                      <td className="py-4">
                        <p className="text-sm">{gen.caption}</p>
                      </td>
                      <td className="py-4">
                        <span className="text-blue-400">
                          {(gen.confidence_score * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-gray-400">
                          {new Date(gen.created_at).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              No generations yet. Try generating some captions!
            </div>
          )}
        </motion.div>
      </div>

      {/* Image Modal */}
      <ImageModal
        imageUrl={selectedImage?.image_url ?? ''}
        caption={selectedImage?.caption ?? ''}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}
