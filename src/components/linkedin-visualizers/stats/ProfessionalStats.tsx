import React from 'react';
import { motion } from 'framer-motion';
import { LinkedInStats } from '../../../types/linkedin';

interface ProfessionalStatsProps {
  stats: LinkedInStats | null;
  loading: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className="relative group"
    >
      <div className="h-full bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
        {/* Background gradient effect */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"
          style={{ 
            background: `linear-gradient(135deg, ${color}20, transparent)` 
          }}
        />
        
        {/* Icon */}
        <div className="flex items-center justify-between mb-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${color}20` }}
          >
            {icon}
          </div>
          <div 
            className="w-2 h-2 rounded-full opacity-60"
            style={{ backgroundColor: color }}
          />
        </div>
        
        {/* Value */}
        <div className="mb-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: delay + 0.2 }}
            className="text-3xl font-bold"
            style={{ color }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </motion.div>
        </div>
        
        {/* Title and subtitle */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
          {subtitle && (
            <p className="text-white/60 text-sm">{subtitle}</p>
          )}
        </div>
        
        {/* Hover effect line */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 rounded-b-2xl"
          style={{ backgroundColor: color }}
          initial={{ width: '0%' }}
          whileHover={{ width: '100%' }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

const ProfessionalStats: React.FC<ProfessionalStatsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(8)].map((_, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className="h-32 bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-6 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-700 rounded-xl" />
              <div className="w-2 h-2 bg-gray-700 rounded-full" />
            </div>
            <div className="mb-2">
              <div className="h-8 bg-gray-700 rounded w-16" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded w-24" />
              <div className="h-3 bg-gray-700 rounded w-20" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Experience',
      value: `${stats.totalExperience}+`,
      subtitle: 'Years in tech',
      icon: '🎯',
      color: '#00D9FF'
    },
    {
      title: 'Positions Held',
      value: stats.totalPositions,
      subtitle: 'Professional roles',
      icon: '💼',
      color: '#9945FF'
    },
    {
      title: 'Education',
      value: stats.totalEducation,
      subtitle: 'Degrees & certifications',
      icon: '🎓',
      color: '#14F195'
    },
    {
      title: 'Core Skills',
      value: stats.totalSkills,
      subtitle: 'Technical expertise',
      icon: '⚡',
      color: '#FF6B6B'
    },
    {
      title: 'Certifications',
      value: stats.totalCertifications,
      subtitle: 'Professional certs',
      icon: '📜',
      color: '#FFD700'
    },
    {
      title: 'Connections',
      value: stats.totalConnections,
      subtitle: 'LinkedIn network',
      icon: '🤝',
      color: '#00D9FF'
    },
    {
      title: 'Profile Views',
      value: stats.profileViews,
      subtitle: 'Recent visibility',
      icon: '👁️',
      color: '#9945FF'
    },
    {
      title: 'Endorsements',
      value: stats.skillEndorsements,
      subtitle: 'Skill validations',
      icon: '⭐',
      color: '#14F195'
    }
  ];

  return (
    <div data-testid="professional-stats" className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
          color={stat.color}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
};

export default ProfessionalStats;