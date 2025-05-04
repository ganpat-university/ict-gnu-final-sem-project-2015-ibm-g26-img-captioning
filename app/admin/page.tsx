'use client'

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line, Pie, PolarArea, Radar } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';
import WordCloud from '@/components/WordCloud';

// Register additional ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  RadialLinearScale,
  Filler
);

interface AdminStats {
  total_users: number;
  total_generations: number;
  total_tokens_used: number;
  premium_users: number;
  free_users: number;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  raw_user_meta_data: any;
  account_tier: string;
  total_generations: number;
  tokens_remaining: number;
  tokens_used: number;
}

interface Generation {
  id: string;
  user_id: string;
  image_url: string;
  caption: string;
  confidence_score: number;
  processing_time: number;
  tokens_used: number;
  created_at: string;
  user: {
    email: string;
  };
}

interface Demographics {
  occupations: Record<string, number>;
  countries: Record<string, number>;
  dailySignups: Record<string, number>;
  ageGroups: Record<string, number>;
  interests: Record<string, number>;
  genders: Record<string, number>;
  usagePurposes: Record<string, number>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'generations'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  const [demographics, setDemographics] = useState<Demographics>({
    occupations: {},
    countries: {},
    dailySignups: {},
    ageGroups: {},
    interests: {},
    genders: {},
    usagePurposes: {}
  });
  
  const supabase = createClient();

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchGenerations();
    }
  }, [activeTab, page, searchTerm]);

  async function fetchAdminData() {
    try {
      // Get stats from the admin_statistics view
      const { data: statsData } = await supabase
        .from('admin_statistics')
        .select('*')
        .single();

      if (statsData) {
        setStats(statsData);
      }

      await fetchUsers();
      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setLoading(false);
    }
  }

  async function fetchUsers() {
    try {
      let query = supabase
        .from('users')  // Using the public.users view
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('email', `%${searchTerm}%`);
      }

      const { data, count } = await query
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

      if (data) {
        setUsers(data as User[]);
        setTotalCount(count || 0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  async function fetchGenerations() {
    try {
      let query = supabase
        .from('generations')
        .select(`
          id,
          user_id,
          image_url,
          caption,
          confidence_score,
          processing_time,
          tokens_used,
          created_at,
          user:users!inner (
            email
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('caption', `%${searchTerm}%`);
      }

      const { data, count } = await query
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

      if (data) {
        // Transform the data to match the Generation interface
        const transformedData = data.map(item => ({
          ...item,
          user: {
            email: item.user[0]?.email || ''
          }
        })) as Generation[];

        setGenerations(transformedData);
        setTotalCount(count || 0);
      }
    } catch (error) {
      console.error('Error fetching generations:', error);
    }
  }

  useEffect(() => {
    fetchDemographics();
  }, []);

  async function fetchDemographics() {
    try {
      const [
        occupationData,
        countryData,
        signupData,
        ageData,
        interestData,
        genderData,
        purposeData
      ] = await Promise.all([
        supabase.rpc('get_occupation_distribution'),
        supabase.rpc('get_country_distribution'),
        supabase.rpc('get_daily_signups', { days_back: 30 }),
        supabase.rpc('get_age_distribution'),
        supabase.rpc('get_interest_distribution'),
        supabase.rpc('get_gender_distribution'),
        supabase.rpc('get_usage_purpose_distribution')
      ]);

      if (occupationData.error) throw occupationData.error;
      if (countryData.error) throw countryData.error;
      if (signupData.error) throw signupData.error;
      if (ageData.error) throw ageData.error;
      if (interestData.error) throw interestData.error;
      if (genderData.error) throw genderData.error;
      if (purposeData.error) throw purposeData.error;

      // Process all data
      const occupations = processDistributionData(occupationData.data);
      const countries = processDistributionData(countryData.data);
      const ageGroups = processDistributionData(ageData.data);
      const interests = processDistributionData(interestData.data);
      const genders = processDistributionData(genderData.data);
      const usagePurposes = processDistributionData(purposeData.data);

      // Process signup data
      const dailySignups = signupData.data.reduce((acc: Record<string, number>, curr: any) => {
        const date = format(new Date(curr.signup_date), 'MMM dd');
        acc[date] = Number(curr.count);
        return acc;
      }, {});

      setDemographics({
        occupations,
        countries,
        dailySignups,
        ageGroups,
        interests,
        genders,
        usagePurposes
      });
    } catch (error) {
      console.error('Error fetching demographics:', error);
    }
  }

  // Helper function to process distribution data
  function processDistributionData(data: any[]): Record<string, number> {
    return data.reduce((acc: Record<string, number>, curr: any) => {
      const key = Object.values(curr)[0] as string;
      const value = Number(Object.values(curr)[1]);
      // Only add non-null values
      if (key && !isNaN(value) && value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {});
  }

  // Chart configurations
  const chartColors = {
    primary: [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)',
      'rgba(255, 159, 64, 0.8)',
      'rgba(255, 99, 132, 0.8)',
      'rgba(201, 203, 207, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(255, 153, 204, 0.8)'
    ],
    borders: [
      'rgb(255, 99, 132)',
      'rgb(54, 162, 235)',
      'rgb(255, 206, 86)',
      'rgb(75, 192, 192)',
      'rgb(153, 102, 255)',
      'rgb(255, 159, 64)',
      'rgb(255, 99, 132)',
      'rgb(201, 203, 207)',
      'rgb(75, 192, 192)',
      'rgb(255, 153, 204)'
    ],
  };

  const occupationChartData = {
    labels: Object.keys(demographics.occupations).filter(key => demographics.occupations[key] > 0),
    datasets: [{
      label: 'Number of Users',
      data: Object.entries(demographics.occupations)
        .filter(([_, value]) => value > 0)
        .map(([_, value]) => value),
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(54, 162, 235, 1)',
    }]
  };

  const countryChartData = {
    labels: Object.keys(demographics.countries).filter(key => demographics.countries[key] > 0),
    datasets: [{
      label: 'Users by Country',
      data: Object.entries(demographics.countries)
        .filter(([_, value]) => value > 0)
        .map(([_, value]) => value),
      backgroundColor: (context: any) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return null;
        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0, 'rgba(54, 162, 235, 0.2)');
        gradient.addColorStop(1, 'rgba(54, 162, 235, 0.8)');
        return gradient;
      },
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }]
  };

  const signupChartData = {
    labels: Object.keys(demographics.dailySignups).filter(key => demographics.dailySignups[key] > 0),
    datasets: [{
      label: 'Daily Sign-ups',
      data: Object.entries(demographics.dailySignups)
        .filter(([_, value]) => value > 0)
        .map(([_, value]) => value),
      fill: true,
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1,
    }]
  };

  const ageGroupChartData = {
    labels: Object.keys(demographics.ageGroups).filter(key => demographics.ageGroups[key] > 0),
    datasets: [{
      label: 'Users by Age Group',
      data: Object.entries(demographics.ageGroups)
        .filter(([_, value]) => value > 0)
        .map(([_, value]) => value),
      backgroundColor: chartColors.primary,
      borderColor: chartColors.borders,
      borderWidth: 1,
    }]
  };

  const interestChartData = {
    labels: Object.keys(demographics.interests).filter(key => demographics.interests[key] > 0),
    datasets: [{
      data: Object.entries(demographics.interests)
        .filter(([_, value]) => value > 0)
        .map(([_, value]) => value),
      backgroundColor: chartColors.primary,
      borderWidth: 1,
    }]
  };

  const genderChartData = {
    labels: Object.keys(demographics.genders).filter(key => demographics.genders[key] > 0),
    datasets: [{
      data: Object.entries(demographics.genders)
        .filter(([_, value]) => value > 0)
        .map(([_, value]) => value),
      backgroundColor: chartColors.primary.slice(0, 4),
      borderColor: chartColors.borders.slice(0, 4),
      borderWidth: 1,
    }]
  };

  const usagePurposeChartData = {
    labels: Object.keys(demographics.usagePurposes).filter(key => demographics.usagePurposes[key] > 0),
    datasets: [{
      label: 'Usage Purposes',
      data: Object.entries(demographics.usagePurposes)
        .filter(([_, value]) => value > 0)
        .map(([_, value]) => value),
      backgroundColor: chartColors.primary,
      borderColor: chartColors.borders,
      borderWidth: 1,
    }]
  };

  // Common chart options
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(156, 163, 175)',
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      }
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      }
    }
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        pointLabels: {
          color: 'rgb(156, 163, 175)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          backdropColor: 'transparent'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  const horizontalBarOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      }
    }
  };

  const polarAreaOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          backdropColor: 'transparent'
        }
      }
    },
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: 'rgb(156, 163, 175)'
        }
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen pt-20 text-center">Loading...</div>;
  }

  // Transform usage purposes data for word cloud
  const usagePurposeWords = Object.entries(demographics.usagePurposes)
    .filter(([text, value]) => value > 0)
    .flatMap(([text, value]) => 
      text.split(/[\s,]+/)
        .filter(word => word.length > 2)
        .map(word => ({
          text: word,
          value: value
        }))
    );

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-5 gap-6"
        >
          {[
            { label: 'Total Users', value: stats?.total_users ?? 0 },
            { label: 'Premium Users', value: stats?.premium_users ?? 0 },
            { label: 'Free Users', value: stats?.free_users ?? 0 },
            { label: 'Total Generations', value: stats?.total_generations ?? 0 },
            { label: 'Tokens Used', value: stats?.total_tokens_used ?? 0 },
          ].map((stat, index) => (
            <div key={index} className="bg-black/30 p-6 rounded-xl backdrop-blur-xl border border-gray-800">
              <h3 className="text-gray-400 text-sm">{stat.label}</h3>
              <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
            </div>
          ))}
        </motion.div>

        {/* Demographics Charts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
        >
          {/* Occupation Distribution */}
          <div className="bg-black/30 p-6 rounded-xl backdrop-blur-xl border border-gray-800">
            <h3 className="text-xl font-bold mb-4">User Occupations</h3>
            <div className="h-[300px] flex items-center justify-center">
              <Radar data={occupationChartData} options={radarOptions} />
            </div>
          </div>

          {/* Age Groups */}
          <div className="bg-black/30 p-6 rounded-xl backdrop-blur-xl border border-gray-800">
            <h3 className="text-xl font-bold mb-4">Age Distribution</h3>
            <div className="h-[300px]">
              <Bar data={ageGroupChartData} options={horizontalBarOptions} />
            </div>
          </div>

          {/* Gender Distribution */}
          <div className="bg-black/30 p-6 rounded-xl backdrop-blur-xl border border-gray-800">
            <h3 className="text-xl font-bold mb-4">Gender Distribution</h3>
            <div className="h-[300px] flex items-center justify-center">
              <Pie data={genderChartData} options={doughnutOptions} />
            </div>
          </div>

          {/* Interests */}
          <div className="bg-black/30 p-6 rounded-xl backdrop-blur-xl border border-gray-800">
            <h3 className="text-xl font-bold mb-4">User Interests</h3>
            <div className="h-[300px] flex items-center justify-center">
              <PolarArea data={interestChartData} options={polarAreaOptions} />
            </div>
          </div>

          {/* Usage Purposes */}
          <div className="bg-black/30 p-6 rounded-xl backdrop-blur-xl border border-gray-800">
            <h3 className="text-xl font-bold mb-4">Usage Purposes</h3>
            <div className="h-[300px] flex items-center justify-center">
              <WordCloud 
                words={usagePurposeWords}
                width={300}
                height={300}
              />
            </div>
          </div>

          {/* Country Distribution */}
          <div className="bg-black/30 p-6 rounded-xl backdrop-blur-xl border border-gray-800">
            <h3 className="text-xl font-bold mb-4">Top Countries</h3>
            <div className="h-[300px]">
              <Bar data={countryChartData} options={barOptions} />
            </div>
          </div>

          {/* User Growth - Full Width */}
          <div className="md:col-span-2 lg:col-span-3 bg-black/30 p-6 rounded-xl backdrop-blur-xl border border-gray-800">
            <h3 className="text-xl font-bold mb-4">User Growth (Last 30 Days)</h3>
            <div className="h-[300px]">
              <Line 
                data={{
                  ...signupChartData,
                  datasets: [{
                    ...signupChartData.datasets[0],
                    fill: true,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  }]
                }} 
                options={lineOptions} 
              />
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-black/30 p-6 rounded-xl backdrop-blur-xl border border-gray-800"
        >
          {/* Tabs */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setActiveTab('users');
                  setPage(1);
                  setSearchTerm('');
                }}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'users'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => {
                  setActiveTab('generations');
                  setPage(1);
                  setSearchTerm('');
                }}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'generations'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Generations
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-10 pr-4 py-2 bg-black/30 border border-gray-800 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Tables */}
          <div className="overflow-x-auto">
            {activeTab === 'users' ? (
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-800">
                    <th className="p-4">Email</th>
                    <th className="p-4">Account Tier</th>
                    <th className="p-4">Total Generations</th>
                    <th className="p-4">Tokens Used</th>
                    <th className="p-4">Tokens Remaining</th>
                    <th className="p-4">Last Sign In</th>
                    <th className="p-4">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-800">
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.account_tier === 'premium'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {user.account_tier || 'free'}
                        </span>
                      </td>
                      <td className="p-4">{user.total_generations}</td>
                      <td className="p-4">{user.tokens_used}</td>
                      <td className="p-4">{user.tokens_remaining}</td>
                      <td className="p-4 text-gray-400">
                        {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="p-4 text-gray-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-800">
                    <th className="p-4">Image</th>
                    <th className="p-4">Caption</th>
                    <th className="p-4">User</th>
                    <th className="p-4">Confidence</th>
                    <th className="p-4">Processing Time</th>
                    <th className="p-4">Tokens</th>
                    <th className="p-4">Generated</th>
                  </tr>
                </thead>
                <tbody>
                  {generations.map((gen) => (
                    <tr key={gen.id} className="border-b border-gray-800">
                      <td className="p-4">
                        <img
                          src={gen.image_url}
                          alt="Generated"
                          className="w-16 h-16 object-cover rounded"
                        />
                      </td>
                      <td className="p-4">
                        <p className="line-clamp-2">{gen.caption}</p>
                      </td>
                      <td className="p-4">{gen.user?.email}</td>
                      <td className="p-4">
                        {(gen.confidence_score * 100).toFixed(1)}%
                      </td>
                      <td className="p-4">
                        {gen.processing_time.toFixed(2)}s
                      </td>
                      <td className="p-4">{gen.tokens_used}</td>
                      <td className="p-4 text-gray-400">
                        {new Date(gen.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm bg-gray-800 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-400">
              Page {page} of {Math.ceil(totalCount / itemsPerPage)}
              {' '}({totalCount} total)
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(totalCount / itemsPerPage)}
              className="px-4 py-2 text-sm bg-gray-800 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

