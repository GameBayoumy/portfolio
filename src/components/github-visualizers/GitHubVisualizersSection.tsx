'use client';

import { useGitHubStats } from '@/hooks/useGitHubStats';
import { GitHubStatsGrid } from '@/components/github-visualizers/GitHubStatsGrid';
import { LanguageDistribution } from '@/components/github-visualizers/LanguageDistribution';
import { RepositoryNetwork3D } from '@/components/github-visualizers/network';
import { ContributionHeatmap } from '@/components/github-visualizers/heatmap';
import { ActivityTimeline } from '@/components/github-visualizers/timeline';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Github, Activity, TrendingUp, Code2 } from 'lucide-react';
import { useState, Suspense } from 'react';

export default function GitHubVisualizersSection() {
  const { data, loading, error, refetch } = useGitHubStats();
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  
  const [activeTab, setActiveTab] = useState<'overview' | 'network' | 'heatmap' | 'timeline'>('overview');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  if (error) {
    return (
      <section className="relative py-20 px-4 sm:px-6 lg:px-8" id="github-stats">
        <div className="max-w-7xl mx-auto text-center">
          <div className="glass-morphism p-8 rounded-xl">
            <Github className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">GitHub Data Unavailable</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-6 py-2 bg-neon-blue/20 text-neon-blue rounded-lg hover:bg-neon-blue/30 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-slate-900/10 to-transparent"
      id="github-stats"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Live GitHub Activity</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Real-time insights into my development work, programming languages, and project statistics
            from GitHub.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="space-y-12"
        >
          {/* Loading State */}
          {loading ? (
            <motion.div variants={itemVariants} className="space-y-8">
              {/* Stats Grid Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="glass-morphism p-6 rounded-xl">
                    <div className="animate-pulse">
                      <div className="w-8 h-8 bg-gray-600 rounded mb-4"></div>
                      <div className="h-8 bg-gray-600 rounded mb-2"></div>
                      <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Language Chart Skeleton */}
              <div className="glass-morphism p-8 rounded-xl">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-600 rounded w-1/3 mb-6"></div>
                  <div className="flex items-center justify-center">
                    <div className="w-64 h-64 bg-gray-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : data ? (
            <>
              {/* GitHub Stats Grid */}
              <motion.div variants={itemVariants}>
                <GitHubStatsGrid stats={data} />
              </motion.div>

              {/* Language Distribution */}
              <motion.div variants={itemVariants}>
                <LanguageDistribution languages={data.languageStats} />
              </motion.div>

              {/* Advanced Visualizations Tabs */}
              <motion.div variants={itemVariants} className="space-y-6">
                {/* Tab Navigation */}
                <div className="flex flex-wrap justify-center gap-2 p-1 bg-gray-800/50 rounded-xl">
                  {[
                    { id: 'overview', label: 'Overview', icon: Github },
                    { id: 'network', label: '3D Network', icon: Code2 },
                    { id: 'heatmap', label: 'Heatmap', icon: TrendingUp },
                    { id: 'timeline', label: 'Timeline', icon: Activity },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id as any)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeTab === id
                          ? 'bg-neon-blue/20 text-neon-blue shadow-lg shadow-neon-blue/10'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                  {activeTab === 'overview' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="grid md:grid-cols-3 gap-6"
                    >
                      <div className="glass-morphism p-6 rounded-xl text-center">
                        <Activity className="w-8 h-8 text-neon-purple mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Activity Timeline</h3>
                        <p className="text-sm text-gray-400">Interactive commit history and project timeline</p>
                        <button 
                          onClick={() => setActiveTab('timeline')}
                          className="inline-block mt-3 px-3 py-1 bg-neon-purple/20 text-neon-purple text-xs rounded-full hover:bg-neon-purple/30 transition-colors"
                        >
                          View Timeline
                        </button>
                      </div>

                      <div className="glass-morphism p-6 rounded-xl text-center">
                        <TrendingUp className="w-8 h-8 text-neon-green mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Contribution Heatmap</h3>
                        <p className="text-sm text-gray-400">GitHub-style contribution calendar with trends</p>
                        <button 
                          onClick={() => setActiveTab('heatmap')}
                          className="inline-block mt-3 px-3 py-1 bg-neon-green/20 text-neon-green text-xs rounded-full hover:bg-neon-green/30 transition-colors"
                        >
                          View Heatmap
                        </button>
                      </div>

                      <div className="glass-morphism p-6 rounded-xl text-center">
                        <Code2 className="w-8 h-8 text-neon-pink mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">3D Repository Network</h3>
                        <p className="text-sm text-gray-400">Interactive 3D visualization of repository connections</p>
                        <button 
                          onClick={() => setActiveTab('network')}
                          className="inline-block mt-3 px-3 py-1 bg-neon-pink/20 text-neon-pink text-xs rounded-full hover:bg-neon-pink/30 transition-colors"
                        >
                          View Network
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'network' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="glass-morphism p-6 rounded-xl"
                    >
                      <Suspense fallback={
                        <div className="flex items-center justify-center h-96">
                          <div className="text-gray-400">Loading 3D visualization...</div>
                        </div>
                      }>
                        <RepositoryNetwork3D repositories={data.repositories} />
                      </Suspense>
                    </motion.div>
                  )}

                  {activeTab === 'heatmap' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="glass-morphism p-6 rounded-xl"
                    >
                      <ContributionHeatmap />
                    </motion.div>
                  )}

                  {activeTab === 'timeline' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="glass-morphism p-6 rounded-xl"
                    >
                      <ActivityTimeline repositories={data.repositories} />
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Last Updated */}
              <motion.div variants={itemVariants} className="text-center">
                <p className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleString()} • Auto-refreshes every 5 minutes
                </p>
              </motion.div>
            </>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}