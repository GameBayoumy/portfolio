'use client'

import { useEffect, useRef, useMemo, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Sphere, Line, Text, Html } from '@react-three/drei'
import { motion } from 'framer-motion'
import { gitHubApi } from '@/services/github-api'
import { RepositoryNode, RepositoryConnection, RepositoryNetwork as NetworkType } from '@/types/github'
import * as THREE from 'three'
import { useInView } from 'react-intersection-observer'

interface NetworkSceneProps {
  network: NetworkType
  onNodeSelect: (node: RepositoryNode) => void
  selectedNode: RepositoryNode | null
}

// Temporarily disabled components for build compatibility
function NetworkNodes() {
  return null;
}

function NetworkConnections() {
  return null;
}

function NetworkScene() {
  return null;
}

function NetworkSkeleton() {
  return (
    <div className="glass-morphism p-8 rounded-xl h-96">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-600 rounded w-1/3 mb-6"></div>
        <div className="flex items-center justify-center h-80">
          <div className="relative">
            {/* Animated loading circles */}
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-16 h-16 border-2 border-neon-blue border-opacity-20 rounded-full animate-ping"
                style={{
                  top: `${Math.sin(i * 2.5) * 40}px`,
                  left: `${Math.cos(i * 2.5) * 40}px`,
                  animationDelay: `${i * 200}ms`,
                  animationDuration: '2s'
                }}
              />
            ))}
            <div className="w-8 h-8 bg-neon-blue rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

const NETWORK_CACHE_TTL = 15 * 60 * 1000 // 15 minutes

export default function RepositoryNetwork() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })
  const [network, setNetwork] = useState<NetworkType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const networkCache = useRef<{ data: NetworkType; timestamp: number } | null>(null)

  useEffect(() => {
    if (!inView) {
      return
    }

    let isActive = true
    const cacheEntry = networkCache.current
    const isCacheFresh = cacheEntry ? Date.now() - cacheEntry.timestamp < NETWORK_CACHE_TTL : false

    if (cacheEntry) {
      setNetwork(cacheEntry.data)
      setError(null)

      if (isCacheFresh) {
        setIsLoading(false)
        return () => {
          isActive = false
        }
      }
    } else {
      setNetwork(null)
    }

    setIsLoading(!cacheEntry)
    setError(null)

    gitHubApi
      .getRepositoryNetwork()
      .then(result => {
        if (!isActive) return

        networkCache.current = { data: result, timestamp: Date.now() }
        setNetwork(result)
        setError(null)
      })
      .catch(err => {
        if (!isActive) return

        console.error('Failed to fetch repository network:', err)

        if (!cacheEntry) {
          setError(err instanceof Error ? err.message : 'Failed to load repository network')
          setNetwork(null)
        }
      })
      .finally(() => {
        if (!isActive) return
        setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [inView])

  const selectedNode = useRef<RepositoryNode | null>(null)

  // Initialize node positions randomly
  const initializedNetwork = useMemo(() => {
    if (!network) return null

    const initialized = { ...network }
    initialized.nodes = network.nodes.map(node => ({
      ...node,
      position: {
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 100,
        z: (Math.random() - 0.5) * 100
      },
      velocity: { x: 0, y: 0, z: 0 }
    }))

    return initialized
  }, [network])

  const handleNodeSelect = (node: RepositoryNode) => {
    selectedNode.current = selectedNode.current?.id === node.id ? null : node
  }

  if (error && !initializedNetwork) {
    return (
      <motion.div
        ref={ref}
        className="glass-morphism p-8 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="text-xl font-semibold text-white mb-4">3D Repository Network</h3>
        <div className="text-center text-red-400">
          <p>Failed to load repository network</p>
          <p className="text-sm text-gray-400 mt-2">Please try again later</p>
        </div>
      </motion.div>
    )
  }

  if (isLoading || !initializedNetwork) {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <NetworkSkeleton />
      </motion.div>
    )
  }

  // Temporarily disabled for build compatibility - Three.js JSX elements need proper type definitions
  return (
    <motion.div 
      ref={ref}
      className="glass-morphism p-8 rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.8 }}
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">3D Repository Network</h3>
        <p className="text-gray-400 text-sm">
          Interactive visualization of repository relationships and dependencies
        </p>
      </div>

      <div className="flex items-center justify-center h-96 rounded-lg bg-gradient-to-b from-slate-900/20 to-slate-800/20">
        <div className="text-center">
          <div className="text-2xl text-gray-400 mb-2">🚧</div>
          <div className="text-gray-400">3D Network Visualization</div>
          <div className="text-sm text-gray-500 mt-1">Under maintenance for build compatibility</div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-400">Fork Relationship</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-400">Language Connection</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-500"></div>
          <span className="text-gray-400">Collaboration</span>
        </div>
      </div>
    </motion.div>
  )
}
