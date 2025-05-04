'use client'
import { motion } from 'framer-motion';

export default function TeamPage() {
  const teamMembers = [
    {
      name: 'Dhyey Kathiriya',
      role: 'Full Stack Developer',
      image: '/member-1.png', // Fixed image path with hyphen
      github: 'https://github.com/dk3775'
    },{
      name: 'Khush Nadpara',
      role: 'Cyber Security Expert',
      image: '/member-2.png', // Fixed image path with hyphen
      github: 'https://github.com/'
    },{
      name: 'Riya Mehta',
      role: 'AI ML Developer',
      image: '/member-3.png', // Fixed image path with hyphen
      github: 'https://github.com/'
    }
    // Add more team members
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
            Our Team
          </h1>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 p-6 rounded-xl text-center"
              >
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                <p className="text-gray-400 mb-4">{member.role}</p>
                <a 
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  GitHub Profile
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
