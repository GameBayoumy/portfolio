'use client';

import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  Suspense,
} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { GitHubRepository } from '@/types/github';
import NetworkNode from './NetworkNode';
import NetworkEdge from './NetworkEdge';
import NetworkControls from './NetworkControls';
import {
  Vector3,
  Color,
  ShaderMaterial,
  Points as ThreePoints,
  AdditiveBlending,
} from 'three';

const particleVertexShader = `
  attribute float scale;
  attribute vec3 color;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = scale * (280.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const particleFragmentShader = `
  varying vec3 vColor;
  void main() {
    if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.48) discard;
    gl_FragColor = vec4(vColor, 0.75);
  }
`;

interface Repository3D extends GitHubRepository {
  position: Vector3;
  renderPosition: Vector3;
  targetPosition: Vector3;
  connections: string[];
  color: Color;
  radius: number;
  velocity: Vector3;
  force: Vector3;
  mass: number;
}

interface NetworkConnection {
  source: Repository3D;
  target: Repository3D;
  type: 'fork' | 'language' | 'topic' | 'name';
  strength: number;
  opacity: number;
}

interface ForceSettings {
  attraction: number;
  repulsion: number;
  centerGravity: number;
  damping: number;
  linkDistance: number;
}

interface RepositoryNetwork3DProps {
  repositories: GitHubRepository[];
  className?: string;
}

interface NetworkSceneProps {
  repositories: Repository3D[];
  connections: NetworkConnection[];
  forceSettings: ForceSettings;
  viewMode: 'force' | 'spiral' | 'clusters';
  selectedRepositoryId: number | null;
  hoveredRepositoryId: number | null;
  onSelect: (repository: Repository3D | null) => void;
  onHover: (repository: Repository3D | null) => void;
}

const BackgroundParticles: React.FC = () => {
  const pointsRef = useRef<ThreePoints>(null);

  const { positions, colors, scales } = useMemo(() => {
    const count = 900;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    const palette = [
      new Color('#38bdf8'),
      new Color('#c084fc'),
      new Color('#22d3ee'),
      new Color('#f472b6'),
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 220;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 220;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 220;

      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      scales[i] = Math.random() * 2 + 0.4;
    }

    return { positions, colors, scales };
  }, []);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        blending: AdditiveBlending,
        depthWrite: false,
        transparent: true,
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
      }),
    [],
  );

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.08;
    pointsRef.current.rotation.x += delta * 0.02;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-scale" array={scales} itemSize={1} />
      </bufferGeometry>
      <primitive attach="material" object={material} />
    </points>
  );
};

const NetworkScene: React.FC<NetworkSceneProps> = ({
  repositories,
  connections,
  forceSettings,
  viewMode,
  selectedRepositoryId,
  hoveredRepositoryId,
  onSelect,
  onHover,
}) => {
  const direction = useMemo(() => new Vector3(), []);
  const force = useMemo(() => new Vector3(), []);
  const temp = useMemo(() => new Vector3(), []);
  const center = useMemo(() => new Vector3(0, 0, 0), []);

  useFrame((_, delta) => {
    if (repositories.length === 0) return;

    const dt = Math.min(delta, 0.12);

    repositories.forEach((repo) => repo.force.set(0, 0, 0));

    if (viewMode === 'force') {
      for (let i = 0; i < repositories.length; i++) {
        const repo = repositories[i];
        for (let j = i + 1; j < repositories.length; j++) {
          const other = repositories[j];
          direction.subVectors(repo.position, other.position);
          const distanceSq = Math.max(direction.lengthSq(), 0.35);
          const repulse = (forceSettings.repulsion * repo.mass * other.mass) / distanceSq;
          force.copy(direction).normalize().multiplyScalar(repulse);
          repo.force.add(force);
          other.force.sub(force);
        }
      }

      connections.forEach((connection) => {
        direction.subVectors(connection.target.position, connection.source.position);
        const distance = Math.sqrt(Math.max(direction.lengthSq(), 0.0001));
        const desired = forceSettings.linkDistance * (1.1 - connection.strength * 0.35);
        const spring = (distance - desired) * forceSettings.attraction * (0.6 + connection.strength);
        force.copy(direction).normalize().multiplyScalar(spring);
        connection.source.force.add(force);
        connection.target.force.sub(force);
      });

      repositories.forEach((repo) => {
        force.subVectors(center, repo.position).multiplyScalar(forceSettings.centerGravity * Math.max(repo.mass * 0.35, 0.6));
        repo.force.add(force);
        repo.velocity.add(force.copy(repo.force).multiplyScalar(dt / Math.max(repo.mass, 0.6)));
      });
    } else {
      for (let i = 0; i < repositories.length; i++) {
        const repo = repositories[i];
        for (let j = i + 1; j < repositories.length; j++) {
          const other = repositories[j];
          direction.subVectors(repo.position, other.position);
          const distanceSq = Math.max(direction.lengthSq(), 0.45);
          const repulse = (12 / distanceSq) * 0.85;
          force.copy(direction).normalize().multiplyScalar(repulse);
          repo.force.add(force);
          other.force.sub(force);
        }
      }

      repositories.forEach((repo) => {
        direction.subVectors(repo.targetPosition, repo.position).multiplyScalar(0.42);
        repo.force.add(direction);
        repo.velocity.add(force.copy(repo.force).multiplyScalar(dt * 2));
      });
    }

    repositories.forEach((repo) => {
      repo.velocity.multiplyScalar(1 - forceSettings.damping);
      const maxSpeed = viewMode === 'force' ? 22 : 14;
      const velocityLength = repo.velocity.length();
      if (velocityLength > maxSpeed) {
        repo.velocity.multiplyScalar(maxSpeed / velocityLength);
      }
      repo.position.add(temp.copy(repo.velocity).multiplyScalar(dt));
    });
  });

  const hoveredConnections = useMemo(() => {
    if (!hoveredRepositoryId) return new Set<string>();
    const hovered = repositories.find((repo) => repo.id === hoveredRepositoryId);
    return new Set(hovered?.connections ?? []);
  }, [hoveredRepositoryId, repositories, connections]);

  const selectedConnections = useMemo(() => {
    if (!selectedRepositoryId) return new Set<string>();
    const selected = repositories.find((repo) => repo.id === selectedRepositoryId);
    return new Set(selected?.connections ?? []);
  }, [selectedRepositoryId, repositories, connections]);

  return (
    <>
      <NetworkEdge
        connections={connections}
        selectedNodeId={selectedRepositoryId ?? undefined}
        hoveredNodeId={hoveredRepositoryId ?? undefined}
      />
      {repositories.map((repository) => (
        <NetworkNode
          key={repository.id}
          repository={repository}
          isSelected={selectedRepositoryId === repository.id}
          isHovered={hoveredRepositoryId === repository.id}
          isConnectedToHovered={hoveredConnections.has(String(repository.id))}
          isConnectedToSelected={selectedConnections.has(String(repository.id))}
          onClick={(repo) => onSelect(repo as Repository3D)}
          onHover={(repo) => onHover(repo as Repository3D)}
          onPointerOut={() => onHover(null)}
        />
      ))}
    </>
  );
};

export default function RepositoryNetwork3D({ repositories, className = '' }: RepositoryNetwork3DProps) {
  const [viewMode, setViewMode] = useState<'force' | 'spiral' | 'clusters'>('force');
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedRepositoryId, setSelectedRepositoryId] = useState<number | null>(null);
  const [hoveredRepositoryId, setHoveredRepositoryId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const languageColors = useRef(
    new Map<string, Color>([
      ['TypeScript', new Color('#3178c6')],
      ['JavaScript', new Color('#f7df1e')],
      ['Python', new Color('#3776ab')],
      ['Java', new Color('#ed8b00')],
      ['C++', new Color('#00599c')],
      ['C#', new Color('#239120')],
      ['Go', new Color('#00add8')],
      ['Rust', new Color('#dea584')],
      ['PHP', new Color('#777bb4')],
      ['Ruby', new Color('#cc342d')],
      ['Swift', new Color('#fa7343')],
      ['Kotlin', new Color('#7f52ff')],
      ['HTML', new Color('#e34f26')],
      ['CSS', new Color('#1572b6')],
      ['Vue', new Color('#4fc08d')],
      ['React', new Color('#61dafb')],
      ['Shell', new Color('#89e051')],
      ['Dockerfile', new Color('#384d54')],
      ['unknown', new Color('#6b7280')],
    ]),
  );

  const getLanguageColor = useCallback(
    (language?: string | null) => {
      const key = language ?? 'unknown';
      const existing = languageColors.current.get(key);
      if (existing) {
        return existing;
      }

      const hash = key
        .toLowerCase()
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const generated = new Color().setHSL(((hash % 360) / 360) * 0.9, 0.55, 0.52);
      languageColors.current.set(key, generated);
      return generated;
    },
    [],
  );

  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(timeout);
  }, [repositories, viewMode]);

  useEffect(() => {
    setHoveredRepositoryId(null);
  }, [viewMode]);

  const displayedRepositories = useMemo(() => {
    return [...repositories]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, Math.min(48, repositories.length));
  }, [repositories]);

  const repositories3D = useMemo<Repository3D[]>(() => {
    if (displayedRepositories.length === 0) {
      return [];
    }

    const languageGroups = new Map<string, GitHubRepository[]>();
    displayedRepositories.forEach((repo) => {
      const key = repo.language ?? 'unknown';
      const group = languageGroups.get(key) ?? [];
      group.push(repo);
      languageGroups.set(key, group);
    });
    const languages = Array.from(languageGroups.keys());

    return displayedRepositories.map((repo, index) => {
      let layoutPosition: Vector3;

      switch (viewMode) {
        case 'spiral': {
          const angle = index * 0.55;
          const radius = 5 + Math.sqrt(index + 1) * 1.5;
          const height = ((index % 14) - 7) * 1.2;
          layoutPosition = new Vector3(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius,
          );
          break;
        }
        case 'clusters': {
          const languageKey = repo.language ?? 'unknown';
          const langIndex = languages.indexOf(languageKey);
          const langRepos = languageGroups.get(languageKey) ?? [];
          const repoIndex = langRepos.findIndex((item) => item.id === repo.id);
          const clusterAngle = (langIndex / Math.max(languages.length, 1)) * Math.PI * 2;
          const clusterRadius = 11 + langIndex * 2.2;
          const innerAngle = (repoIndex / Math.max(langRepos.length, 1)) * Math.PI * 2;
          const innerRadius = 2 + Math.sqrt(repoIndex + 1) * 1.4;
          layoutPosition = new Vector3(
            Math.cos(clusterAngle) * clusterRadius + Math.cos(innerAngle) * innerRadius,
            (repoIndex % 6 - 3) * 1.1,
            Math.sin(clusterAngle) * clusterRadius + Math.sin(innerAngle) * innerRadius,
          );
          break;
        }
        default: {
          layoutPosition = new Vector3(
            (Math.random() - 0.5) * 32,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 32,
          );
        }
      }

      const initialPosition = viewMode === 'force'
        ? layoutPosition.clone()
        : new Vector3(
            (Math.random() - 0.5) * 34,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 34,
          );

      const color = getLanguageColor(repo.language).clone();
      const stars = Math.log(repo.stargazers_count + 1);
      const forks = Math.log(repo.forks_count + 1);
      const issues = Math.log(repo.open_issues_count + 1);
      const recency = Math.max(
        0,
        1 -
          (Date.now() - new Date(repo.pushed_at ?? repo.updated_at ?? repo.created_at).getTime()) /
            (1000 * 60 * 60 * 24 * 365),
      );

      const radius = Math.max(
        0.45,
        Math.min(
          2.2,
          0.55 + stars * 0.18 + forks * 0.12 + issues * 0.05 + recency * 0.35,
        ),
      );

      return {
        ...repo,
        position: initialPosition,
        renderPosition: initialPosition.clone(),
        targetPosition: layoutPosition.clone(),
        connections: [],
        color,
        radius,
        velocity: new Vector3(0, 0, 0),
        force: new Vector3(0, 0, 0),
        mass: radius * radius * 0.9 + 0.6,
      } as Repository3D;
    });
  }, [displayedRepositories, viewMode, getLanguageColor]);

  const connections = useMemo<NetworkConnection[]>(() => {
    if (repositories3D.length === 0) {
      return [];
    }

    repositories3D.forEach((repo) => {
      repo.connections = [];
    });

    const pairMap = new Map<string, NetworkConnection>();
    const connectionCounts = new Map<number, number>();
    const maxConnections = repositories3D.length > 36 ? 10 : 12;

    const registerConnection = (
      source: Repository3D,
      target: Repository3D,
      type: NetworkConnection['type'],
      strength: number,
    ) => {
      if (source.id === target.id) return;

      const key = source.id < target.id ? `${source.id}-${target.id}` : `${target.id}-${source.id}`;
      const existing = pairMap.get(key);

      if (existing) {
        if (strength > existing.strength) {
          existing.type = type;
          existing.strength = strength;
          existing.opacity = 0.35 + Math.min(strength, 0.8) * 0.4;
        }
        return;
      }

      const countA = connectionCounts.get(source.id) ?? 0;
      const countB = connectionCounts.get(target.id) ?? 0;
      if (countA >= maxConnections && countB >= maxConnections) {
        return;
      }

      const connection: NetworkConnection = {
        source,
        target,
        type,
        strength,
        opacity: 0.35 + Math.min(strength, 0.8) * 0.4,
      };

      pairMap.set(key, connection);
      connectionCounts.set(source.id, countA + 1);
      connectionCounts.set(target.id, countB + 1);
      source.connections.push(String(target.id));
      target.connections.push(String(source.id));
    };

    const languageGroups = new Map<string, Repository3D[]>();
    repositories3D.forEach((repo) => {
      const key = repo.language ?? 'unknown';
      const group = languageGroups.get(key) ?? [];
      group.push(repo);
      languageGroups.set(key, group);
    });

    languageGroups.forEach((group) => {
      if (group.length < 2) return;
      const sortedGroup = [...group].sort((a, b) => b.stargazers_count - a.stargazers_count);
      for (let i = 0; i < sortedGroup.length; i++) {
        const current = sortedGroup[i];
        const next = sortedGroup[(i + 1) % sortedGroup.length];
        registerConnection(current, next, 'language', 0.45 + Math.min(current.radius, next.radius) * 0.12);
      }
    });

    const tokenizeName = (value: string) =>
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .split(' ')
        .filter((token) => token.length > 2);

    for (let i = 0; i < repositories3D.length; i++) {
      for (let j = i + 1; j < repositories3D.length; j++) {
        const repoA = repositories3D[i];
        const repoB = repositories3D[j];

        const topicsA = repoA.topics ?? [];
        const topicsB = repoB.topics ?? [];
        if (topicsA.length && topicsB.length) {
          const sharedTopics = topicsA.filter((topic) => topicsB.includes(topic));
          if (sharedTopics.length > 0) {
            const strength = Math.min(0.9, 0.4 + sharedTopics.length * 0.12);
            registerConnection(repoA, repoB, 'topic', strength);
            continue;
          }
        }

        const tokensA = tokenizeName(repoA.name);
        const tokensB = tokenizeName(repoB.name);
        const sharedTokens = tokensA.filter((token) => tokensB.includes(token));
        if (sharedTokens.length > 0) {
          const strength = Math.min(0.6, 0.25 + sharedTokens.length * 0.1);
          registerConnection(repoA, repoB, 'name', strength);
        }
      }
    }

    const orderedByActivity = [...repositories3D].sort((a, b) => {
      const timeA = new Date(a.pushed_at ?? a.updated_at ?? a.created_at).getTime();
      const timeB = new Date(b.pushed_at ?? b.updated_at ?? b.created_at).getTime();
      return timeB - timeA;
    });

    for (let i = 0; i < orderedByActivity.length - 1; i++) {
      const current = orderedByActivity[i];
      const next = orderedByActivity[i + 1];
      registerConnection(current, next, 'fork', 0.3 + Math.min(current.radius, next.radius) * 0.08);
    }

    return Array.from(pairMap.values());
  }, [repositories3D]);

  const nodeCount = repositories3D.length;
  const forceSettings = useMemo<ForceSettings>(() => {
    const densityFactor = Math.min(Math.max(nodeCount / 32, 0.75), 1.55);
    if (viewMode === 'force') {
      return {
        attraction: 0.08 * densityFactor,
        repulsion: 18 * densityFactor,
        centerGravity: 1.35,
        damping: 0.1,
        linkDistance: 6.8,
      };
    }

    return {
      attraction: 0.05,
      repulsion: 8,
      centerGravity: 2.2,
      damping: 0.18,
      linkDistance: 7.4,
    };
  }, [nodeCount, viewMode]);

  const selectedRepository = useMemo(
    () => (selectedRepositoryId ? repositories3D.find((repo) => repo.id === selectedRepositoryId) ?? null : null),
    [selectedRepositoryId, repositories3D],
  );

  const hoveredRepository = useMemo(
    () => (hoveredRepositoryId ? repositories3D.find((repo) => repo.id === hoveredRepositoryId) ?? null : null),
    [hoveredRepositoryId, repositories3D],
  );

  const networkStats = useMemo(() => {
    const languages = new Set<string>();
    const topics = new Set<string>();
    let stars = 0;
    let forks = 0;

    repositories3D.forEach((repo) => {
      languages.add(repo.language ?? 'Other');
      repo.topics?.forEach((topic) => topics.add(topic));
      stars += repo.stargazers_count;
      forks += repo.forks_count;
    });

    return {
      nodes: repositories3D.length,
      connections: connections.length,
      languages: languages.size,
      topics: topics.size,
      stars,
      forks,
    };
  }, [repositories3D, connections.length]);

  const handleSelect = useCallback(
    (repo: Repository3D | null) => {
      setSelectedRepositoryId((current) => {
        if (!repo) return null;
        return current === repo.id ? null : repo.id;
      });
    },
    [],
  );

  const handleHover = useCallback((repo: Repository3D | null) => {
    setHoveredRepositoryId(repo?.id ?? null);
  }, []);

  if (repositories3D.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center space-y-4 rounded-3xl border border-white/5 bg-slate-900/40 p-10 text-center ${className}`}>
        <div className="text-3xl">🔍</div>
        <div className="text-lg font-semibold text-white">No repositories to visualise</div>
        <p className="max-w-sm text-sm text-gray-400">
          Connect your GitHub account or check back later for an interactive 3D view of your projects.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">3D Repository Network</h3>
          <p className="text-sm text-gray-400">
            Explore relationships between repositories with physics-driven layouts and interactive insights.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'force', label: 'Dynamic' },
              { id: 'spiral', label: 'Spiral' },
              { id: 'clusters', label: 'Language Clusters' },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setViewMode(id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                viewMode === id
                  ? 'bg-neon-blue/20 text-neon-blue shadow-sm shadow-neon-blue/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => setAutoRotate((current) => !current)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              autoRotate ? 'bg-neon-green/20 text-neon-green' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            {autoRotate ? 'Auto Orbit: On' : 'Auto Orbit: Off'}
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-2xl"
      >
        {isLoading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-neon-blue border-t-transparent" />
              <span>Rendering network...</span>
            </div>
          </div>
        )}

        <div className="h-[520px] w-full">
          <Canvas
            className="h-full w-full"
            camera={{ position: [26, 20, 26], fov: 55 }}
            dpr={[1, 1.8]}
            gl={{ antialias: true, alpha: false }}
            onPointerMissed={() => setSelectedRepositoryId(null)}
          >
            <Suspense fallback={null}>
              <color attach="background" args={['#020617']} />
              <fog attach="fog" args={['#020617', 40, 180]} />
              <ambientLight intensity={0.5} />
              <directionalLight position={[35, 32, 25]} intensity={0.85} color="#c8d7ff" />
              <pointLight position={[-30, -25, -20]} intensity={0.35} color="#22d3ee" />
              <BackgroundParticles />
              <NetworkScene
                repositories={repositories3D}
                connections={connections}
                forceSettings={forceSettings}
                viewMode={viewMode}
                selectedRepositoryId={selectedRepositoryId}
                hoveredRepositoryId={hoveredRepositoryId}
                onSelect={handleSelect}
                onHover={handleHover}
              />
              <NetworkControls
                autoRotate={autoRotate}
                autoRotateSpeed={0.6}
                dampingFactor={0.08}
                minDistance={12}
                maxDistance={85}
                target={[0, 0, 0]}
              />
            </Suspense>
          </Canvas>
        </div>

        <AnimatePresence>
          {selectedRepository && (
            <motion.div
              key={selectedRepository.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-auto absolute right-4 top-4 z-40 w-72 max-w-[90vw] rounded-2xl border border-white/10 bg-slate-900/90 p-4 text-sm text-gray-300 shadow-2xl backdrop-blur"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-base font-semibold text-white">{selectedRepository.name}</h4>
                  <p className="text-xs text-gray-400">{selectedRepository.full_name}</p>
                </div>
                <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] uppercase tracking-wide text-neon-blue">
                  {selectedRepository.language || 'Other'}
                </span>
              </div>
              {selectedRepository.description && (
                <p className="mt-3 text-xs leading-relaxed text-gray-400">
                  {selectedRepository.description}
                </p>
              )}
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-white/5 p-3">
                  <div className="text-lg font-semibold text-white">{selectedRepository.stargazers_count}</div>
                  <div className="text-[11px] uppercase tracking-wide text-gray-400">Stars</div>
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <div className="text-lg font-semibold text-white">{selectedRepository.forks_count}</div>
                  <div className="text-[11px] uppercase tracking-wide text-gray-400">Forks</div>
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <div className="text-lg font-semibold text-white">{selectedRepository.open_issues_count}</div>
                  <div className="text-[11px] uppercase tracking-wide text-gray-400">Open Issues</div>
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <div className="text-lg font-semibold text-white">{selectedRepository.watchers_count}</div>
                  <div className="text-[11px] uppercase tracking-wide text-gray-400">Watchers</div>
                </div>
              </div>
              {selectedRepository.topics?.length ? (
                <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-neon-blue">
                  {selectedRepository.topics.slice(0, 6).map((topic) => (
                    <span key={topic} className="rounded-full bg-neon-blue/10 px-2 py-0.5">
                      #{topic}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="mt-4 flex items-center justify-between text-[11px] text-gray-400">
                <span>Updated {new Date(selectedRepository.pushed_at ?? selectedRepository.updated_at ?? selectedRepository.created_at).toLocaleDateString()}</span>
                <a
                  href={selectedRepository.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-neon-blue/20 px-3 py-1 text-xs font-medium text-neon-blue hover:bg-neon-blue/30"
                >
                  View on GitHub
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {hoveredRepository && !selectedRepository && (
            <motion.div
              key={`hover-${hoveredRepository.id}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-none absolute left-1/2 top-6 z-30 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white shadow"
            >
              {hoveredRepository.full_name}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Repositories', value: networkStats.nodes, accent: 'text-neon-blue' },
          { label: 'Connections', value: networkStats.connections, accent: 'text-neon-pink' },
          { label: 'Languages', value: networkStats.languages, accent: 'text-neon-green' },
          { label: 'Topics', value: networkStats.topics, accent: 'text-neon-purple' },
        ].map(({ label, value, accent }) => (
          <div key={label} className="rounded-2xl border border-white/5 bg-white/5 p-4">
            <div className={`text-2xl font-semibold text-white ${accent}`}>{value}</div>
            <div className="mt-1 text-xs uppercase tracking-wide text-gray-400">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#4ecdc4]" />
          <span>Name & ecosystem affinity</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#00ff88]" />
          <span>Primary language clusters</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b6b]" />
          <span>Shared topics & features</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffd700]" />
          <span>Active collaboration timeline</span>
        </div>
      </div>
    </div>
  );
}

