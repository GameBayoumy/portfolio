import { useState, useEffect } from 'react';

interface VersionInfo {
  version: string;
  buildDate: string;
  commitHash: string;
  features: {
    linkedin: boolean;
    github: boolean;
    threejs: boolean;
    xr: boolean;
    d3: boolean;
    performance: boolean;
  };
  apiVersions: {
    linkedin: string;
    github: string;
    vercel: string;
  };
  buildInfo: {
    node: string;
    next: string;
    typescript: string;
  };
}

interface ApiVersions {
  portfolio: string;
  linkedin: string;
  github: string;
  vercel: string;
  lastUpdated: string;
  compatibility: {
    linkedin: {
      apiVersion: string;
      supportedFeatures: string[];
      deprecatedFeatures: string[];
      migrations: string[];
    };
    github: {
      apiVersion: string;
      graphql: boolean;
      supportedFeatures: string[];
      rateLimits: {
        requests: number;
        window: string;
      };
    };
    vercel: {
      apiVersion: string;
      supportedFeatures: string[];
    };
  };
}

/**
 * Hook to get version information and API compatibility details
 */
export const useVersionInfo = () => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [apiVersions, setApiVersions] = useState<ApiVersions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVersionInfo = async () => {
      try {
        setIsLoading(true);
        
        // Load version info
        const versionResponse = await fetch('/api/version');
        if (!versionResponse.ok) {
          throw new Error('Failed to load version info');
        }
        const versionData = await versionResponse.json();
        setVersionInfo(versionData);

        // Load API versions
        const apiResponse = await fetch('/api/version/api-compatibility');
        if (!apiResponse.ok) {
          throw new Error('Failed to load API versions');
        }
        const apiData = await apiResponse.json();
        setApiVersions(apiData);

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Failed to load version info:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadVersionInfo();
  }, []);

  /**
   * Check if a feature is available in the current version
   */
  const isFeatureAvailable = (feature: keyof VersionInfo['features']): boolean => {
    return versionInfo?.features[feature] ?? false;
  };

  /**
   * Get API version for a specific service
   */
  const getApiVersion = (service: keyof ApiVersions['compatibility']): string => {
    return apiVersions?.compatibility[service]?.apiVersion ?? 'unknown';
  };

  type CompatibilityService = ApiVersions['compatibility'][keyof ApiVersions['compatibility']];

  const hasSupportedFeatures = (
    config: CompatibilityService
  ): config is CompatibilityService & { supportedFeatures: string[] } => {
    return Array.isArray((config as { supportedFeatures?: unknown }).supportedFeatures);
  };

  const hasDeprecatedFeatures = (
    config: CompatibilityService
  ): config is CompatibilityService & { deprecatedFeatures: string[] } => {
    return Array.isArray((config as { deprecatedFeatures?: unknown }).deprecatedFeatures);
  };

  /**
   * Check if an API feature is supported
   */
  const isApiFeatureSupported = (
    service: keyof ApiVersions['compatibility'],
    feature: string
  ): boolean => {
    const serviceConfig = apiVersions?.compatibility[service];
    if (!serviceConfig || !hasSupportedFeatures(serviceConfig)) return false;

    return serviceConfig.supportedFeatures.includes(feature);
  };

  /**
   * Check if an API feature is deprecated
   */
  const isApiFeatureDeprecated = (
    service: keyof ApiVersions['compatibility'],
    feature: string
  ): boolean => {
    const serviceConfig = apiVersions?.compatibility[service];
    if (!serviceConfig || !hasDeprecatedFeatures(serviceConfig)) return false;

    return serviceConfig.deprecatedFeatures.includes(feature);
  };

  /**
   * Get formatted version string
   */
  const getFormattedVersion = (): string => {
    if (!versionInfo) return 'Loading...';
    
    const { version, commitHash, buildDate } = versionInfo;
    const date = new Date(buildDate).toLocaleDateString();
    
    return `v${version} (${commitHash}) - ${date}`;
  };

  /**
   * Get build environment information
   */
  const getBuildInfo = () => {
    if (!versionInfo) return null;
    
    return {
      ...versionInfo.buildInfo,
      buildDate: versionInfo.buildDate,
      commitHash: versionInfo.commitHash,
    };
  };

  /**
   * Check for version mismatches or compatibility issues
   */
  const getCompatibilityWarnings = (): string[] => {
    const warnings: string[] = [];
    
    if (!versionInfo || !apiVersions) return warnings;

    // Check for deprecated features
    Object.entries(apiVersions.compatibility).forEach(([service, config]) => {
      if (hasDeprecatedFeatures(config) && config.deprecatedFeatures.length > 0) {
        warnings.push(
          `${service} has deprecated features: ${config.deprecatedFeatures.join(', ')}`
        );
      }
    });

    // Check for version mismatches
    if (versionInfo.version !== apiVersions.portfolio) {
      warnings.push(
        `Version mismatch: Portfolio v${versionInfo.version} vs API v${apiVersions.portfolio}`
      );
    }

    return warnings;
  };

  return {
    // Data
    versionInfo,
    apiVersions,
    isLoading,
    error,
    
    // Utility functions
    isFeatureAvailable,
    getApiVersion,
    isApiFeatureSupported,
    isApiFeatureDeprecated,
    getFormattedVersion,
    getBuildInfo,
    getCompatibilityWarnings,
  };
};

export default useVersionInfo;