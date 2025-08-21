'use client'

import { useEffect, useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Sphere, Line, Text, Html } from '@react-three/drei'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { gitHubApi } from '@/services/github-api'
import { RepositoryNode, RepositoryConnection, RepositoryNetwork as NetworkType } from '@/types/github'
import * as THREE from 'three'
import { useInView } from 'react-intersection-observer'

interface NetworkSceneProps {
  network: NetworkType
  onNodeSelect: (node: RepositoryNode) => void
  selectedNode: RepositoryNode | null
}

function NetworkNodes({ nodes, onNodeSelect, selectedNode }: {
  nodes: RepositoryNode[]
  onNodeSelect: (node: RepositoryNode) => void
  selectedNode: RepositoryNode | null
}) {
  const meshRefs = useRef<{ [key: number]: THREE.Mesh }>({})
  const { camera, raycaster, pointer } = useThree()
  const hoveredNode = useRef<RepositoryNode | null>(null)

  // Force-directed layout simulation
  useFrame((state, delta) => {
    if (!nodes.length) return

    const REPULSION_FORCE = 50
    const ATTRACTION_FORCE = 0.01
    const DAMPING = 0.95
    const TIME_STEP = 0.16

    nodes.forEach(node => {
      if (!meshRefs.current[node.id]) return

      let force = new THREE.Vector3(0, 0, 0)

      // Repulsion from other nodes
      nodes.forEach(otherNode => {
        if (node.id === otherNode.id) return

        const distance = new THREE.Vector3(
          node.position.x - otherNode.position.x,
          node.position.y - otherNode.position.y,
          node.position.z - otherNode.position.z
        )
        
        const dist = distance.length()
        if (dist > 0) {
          const repulsion = REPULSION_FORCE / (dist * dist)
          distance.normalize().multiplyScalar(repulsion)
          force.add(distance)
        }
      })

      // Attraction to connected nodes
      node.connections.forEach(connection => {
        const targetNode = nodes.find(n => n.id === connection.target)
        if (!targetNode) return

        const distance = new THREE.Vector3(
          targetNode.position.x - node.position.x,
          targetNode.position.y - node.position.y,
          targetNode.position.z - node.position.z
        )
        
        const dist = distance.length()
        if (dist > 0) {
          const attraction = ATTRACTION_FORCE * dist * connection.strength
          distance.normalize().multiplyScalar(attraction)
          force.add(distance)
        }
      })

      // Apply damping
      node.velocity.x *= DAMPING
      node.velocity.y *= DAMPING
      node.velocity.z *= DAMPING

      // Apply force
      node.velocity.x += force.x * TIME_STEP
      node.velocity.y += force.y * TIME_STEP
      node.velocity.z += force.z * TIME_STEP

      // Update position
      node.position.x += node.velocity.x * TIME_STEP
      node.position.y += node.velocity.y * TIME_STEP
      node.position.z += node.velocity.z * TIME_STEP

      // Update mesh position
      const mesh = meshRefs.current[node.id]
      if (mesh) {
        mesh.position.set(node.position.x, node.position.y, node.position.z)
      }
    })
  })

  const handlePointerMove = (event: any) => {
    raycaster.setFromCamera(pointer, camera)
    const meshes = Object.values(meshRefs.current)
    const intersects = raycaster.intersectObjects(meshes)

    if (intersects.length > 0) {
      const mesh = intersects[0].object as THREE.Mesh
      const node = nodes.find(n => meshRefs.current[n.id] === mesh)
      if (node && node !== hoveredNode.current) {
        hoveredNode.current = node
        document.body.style.cursor = 'pointer'
      }
    } else {
      hoveredNode.current = null
      document.body.style.cursor = 'default'
    }
  }

  const handleClick = (event: any) => {
    if (hoveredNode.current) {
      onNodeSelect(hoveredNode.current)
    }
  }

  return (
    <group onPointerMove={handlePointerMove} onClick={handleClick}>
      {nodes.map((node) => (
        <Sphere
          key={node.id}
          ref={(mesh) => {
            if (mesh) meshRefs.current[node.id] = mesh
          }}
          args={[node.size, 32, 32]}
          position={[node.position.x, node.position.y, node.position.z]}
        >
          <meshPhongMaterial
            color={selectedNode?.id === node.id ? '#ffffff' : node.color}
            transparent
            opacity={selectedNode?.id === node.id ? 1 : 0.8}
            emissive={selectedNode?.id === node.id ? node.color : '#000000'}
            emissiveIntensity={selectedNode?.id === node.id ? 0.2 : 0}
          />
          {selectedNode?.id === node.id && (
            <Html>
              <div className="pointer-events-none">
                <div className="glass-morphism p-3 rounded-lg max-w-xs">
                  <h4 className="text-white font-semibold text-sm">{node.name}</h4>
                  <p className="text-gray-300 text-xs">
                    ⭐ {node.data.stargazers_count} | 🍴 {node.data.forks_count}
                  </p>
                  {node.data.language && (
                    <p className="text-gray-400 text-xs">{node.data.language}</p>
                  )}
                </div>
              </div>
            </Html>
          )}
        </Sphere>
      ))}
    </group>
  )
}

function NetworkConnections({ network }: { network: NetworkType }) {
  return (
    <group>
      {network.edges.map((edge, index) => {
        const sourceNode = network.nodes.find(n => n.id === edge.source)
        const targetNode = network.nodes.find(n => n.id === edge.target)
        
        if (!sourceNode || !targetNode) return null

        const points = [
          new THREE.Vector3(sourceNode.position.x, sourceNode.position.y, sourceNode.position.z),
          new THREE.Vector3(targetNode.position.x, targetNode.position.y, targetNode.position.z)
        ]

        const color = edge.type === 'fork' ? '#22c55e' : 
                     edge.type === 'dependency' ? '#3b82f6' : '#6b7280'

        return (
          <Line
            key={index}
            points={points}
            color={color}
            transparent
            opacity={0.4}
            lineWidth={edge.strength * 2}
          />
        )
      })}
    </group>
  )
}

function NetworkScene({ network, onNodeSelect, selectedNode }: NetworkSceneProps) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} />
      
      <NetworkNodes 
        nodes={network.nodes} 
        onNodeSelect={onNodeSelect}
        selectedNode={selectedNode}
      />
      <NetworkConnections network={network} />
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={20}
        maxDistance={200}
        autoRotate={false}
      />
    </>
  )
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

export default function RepositoryNetwork() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  const { data: network, isLoading, error } = useQuery({
    queryKey: ['github', 'repository-network'],
    queryFn: () => gitHubApi.getRepositoryNetwork(),
    enabled: inView,
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2
  })

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

  if (error) {
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
        <div className="flex gap-4 mt-3 text-xs text-gray-400">
          <span>📊 {initializedNetwork.stats.totalNodes} repositories</span>
          <span>🔗 {initializedNetwork.stats.totalEdges} connections</span>
          <span>🎯 Click nodes to explore • Drag to rotate • Scroll to zoom</span>
        </div>
      </div>

      <div className="h-96 rounded-lg overflow-hidden bg-gradient-to-b from-slate-900/20 to-slate-800/20">
        <Canvas
          camera={{ position: [0, 0, 50], fov: 60 }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <NetworkScene
              network={initializedNetwork}
              onNodeSelect={handleNodeSelect}
              selectedNode={selectedNode.current}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Network Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-3 bg-glass-100 rounded-lg">
          <div className="text-lg font-semibold text-neon-blue">
            {initializedNetwork.stats.totalNodes}
          </div>
          <div className="text-xs text-gray-400">Repositories</div>
        </div>
        <div className="p-3 bg-glass-100 rounded-lg">
          <div className="text-lg font-semibold text-neon-green">
            {initializedNetwork.stats.totalEdges}
          </div>
          <div className="text-xs text-gray-400">Connections</div>
        </div>
        <div className="p-3 bg-glass-100 rounded-lg">
          <div className="text-lg font-semibold text-neon-yellow">
            {initializedNetwork.stats.clusters}
          </div>
          <div className="text-xs text-gray-400">Language Clusters</div>
        </div>
        <div className="p-3 bg-glass-100 rounded-lg">
          <div className="text-lg font-semibold text-neon-purple">
            {(initializedNetwork.stats.density * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400">Network Density</div>
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