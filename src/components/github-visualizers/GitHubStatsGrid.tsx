'use client';

import { GitHubStats } from '@/types/github';
import { motion } from 'framer-motion';
import { Github, Star, GitFork, BookOpen, Users, Calendar, MapPin, Building2 } from 'lucide-react';

interface GitHubStatsGridProps {
  stats: GitHubStats;
}

export function GitHubStatsGrid({ stats }: GitHubStatsGridProps) {
  const { user, repositories, totalStars, totalForks } = stats;

  const statsData = [
    {
      icon: BookOpen,
      label: 'Public Repositories',
      value: user.public_repos.toLocaleString(),
      color: 'text-neon-blue',
      bgColor: 'bg-neon-blue/20',
    },
    {
      icon: Star,
      label: 'Total Stars',
      value: totalStars.toLocaleString(),
      color: 'text-neon-yellow',
      bgColor: 'bg-neon-yellow/20',
    },
    {
      icon: GitFork,
      label: 'Total Forks',
      value: totalForks.toLocaleString(),
      color: 'text-neon-green',
      bgColor: 'bg-neon-green/20',
    },
    {
      icon: Users,
      label: 'Followers',
      value: user.followers.toLocaleString(),
      color: 'text-neon-purple',
      bgColor: 'bg-neon-purple/20',
    },
  ];

  const profileData = [
    {
      icon: Github,
      label: 'GitHub Profile',
      value: `@${user.login}`,
      link: user.html_url,
    },
    ...(user.company ? [{
      icon: Building2,
      label: 'Company',
      value: user.company,
      link: null,
    }] : []),
    ...(user.location ? [{
      icon: MapPin,
      label: 'Location',
      value: user.location,
      link: null,
    }] : []),
    {
      icon: Calendar,
      label: 'Member Since',
      value: new Date(user.created_at).getFullYear().toString(),
      link: null,
    },
  ];

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <motion.div 
        className="glass-morphism p-6 rounded-xl"
        variants={itemVariants}
      >
        <div className="flex items-center gap-6 flex-wrap">
          <img
            src={user.avatar_url}
            alt={`${user.name || user.login} avatar`}
            className="w-16 h-16 rounded-full ring-2 ring-neon-blue/50"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold text-white">
              {user.name || user.login}
            </h3>
            {user.bio && (
              <p className="text-gray-300 mt-1">{user.bio}</p>
            )}
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {profileData.map((item, index) => {
            const IconComponent = item.icon;
            const valueClasses =
              'block text-sm text-white font-medium leading-snug break-words';
            const valueContent = item.link ? (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`${valueClasses} hover:text-neon-blue transition-colors`}
              >
                {item.value}
              </a>
            ) : (
              <span className={valueClasses}>{item.value}</span>
            );

            return (
              <div key={index} className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800/60 text-gray-300">
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="min-w-0 space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    {item.label}
                  </span>
                  {valueContent}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => {
          const IconComponent = stat.icon;
          
          return (
            <motion.div
              key={stat.label}
              className="glass-morphism p-6 rounded-xl hover:bg-glass-200 transition-all duration-300 group"
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <IconComponent className={`w-6 h-6 ${stat.color}`} />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-2xl font-bold text-white">
                  {stat.value}
                </h4>
                <p className="text-sm text-gray-400">
                  {stat.label}
                </p>
              </div>

              {/* Hover effect background */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neon-blue/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}