import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API Route: /api/version/api-compatibility
 * Returns API version compatibility information
 */
export async function GET(request: NextRequest) {
  try {
    const apiVersionsPath = path.join(process.cwd(), 'src/config/api-versions.json');
    
    let apiVersions;
    try {
      const apiData = fs.readFileSync(apiVersionsPath, 'utf8');
      apiVersions = JSON.parse(apiData);
    } catch (error) {
      // Fallback API versions
      apiVersions = {
        portfolio: '1.0.0',
        linkedin: 'v2',
        github: 'v4',
        vercel: 'v1',
        lastUpdated: new Date().toISOString(),
        compatibility: {
          linkedin: {
            apiVersion: 'v2',
            supportedFeatures: [
              'profile',
              'experience',
              'education',
              'skills',
              'certifications'
            ],
            deprecatedFeatures: [],
            migrations: []
          },
          github: {
            apiVersion: 'v4',
            graphql: true,
            supportedFeatures: [
              'repositories',
              'contributions',
              'languages',
              'stars',
              'followers',
              'organizations'
            ],
            rateLimits: {
              requests: 5000,
              window: '1h'
            }
          },
          vercel: {
            apiVersion: 'v1',
            supportedFeatures: [
              'deployments',
              'projects',
              'domains',
              'analytics'
            ]
          }
        }
      };
    }

    // Add runtime compatibility checks
    const compatibilityReport = {
      ...apiVersions,
      runtime: {
        lastChecked: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
      },
      health: {
        linkedin: await checkLinkedInApiHealth(),
        github: await checkGitHubApiHealth(),
        vercel: await checkVercelApiHealth(),
      },
    };

    return NextResponse.json(compatibilityReport, {
      headers: {
        'Cache-Control': 's-maxage=600, stale-while-revalidate=3600',
        'X-API-Compatibility-Version': apiVersions.portfolio,
        'X-Last-Updated': apiVersions.lastUpdated,
      },
    });
  } catch (error) {
    console.error('Failed to get API compatibility info:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to retrieve API compatibility information',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Check LinkedIn API health
 */
async function checkLinkedInApiHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'down';
  lastChecked: string;
  responseTime?: number;
}> {
  try {
    const startTime = Date.now();
    
    // This would be a real health check in production
    // For now, we'll simulate it
    const isHealthy = process.env.LINKEDIN_API_KEY ? true : false;
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: isHealthy ? 'healthy' : 'degraded',
      lastChecked: new Date().toISOString(),
      responseTime,
    };
  } catch (error) {
    return {
      status: 'down',
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Check GitHub API health
 */
async function checkGitHubApiHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'down';
  lastChecked: string;
  responseTime?: number;
  rateLimitRemaining?: number;
}> {
  try {
    const startTime = Date.now();
    
    if (process.env.GITHUB_TOKEN) {
      // Simple GitHub API health check
      const response = await fetch('https://api.github.com/rate_limit', {
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'User-Agent': 'XR-Portfolio/1.0.0',
        },
        // Short timeout for health check
        signal: AbortSignal.timeout(5000),
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        return {
          status: 'healthy',
          lastChecked: new Date().toISOString(),
          responseTime,
          rateLimitRemaining: data.rate.remaining,
        };
      } else {
        return {
          status: 'degraded',
          lastChecked: new Date().toISOString(),
          responseTime,
        };
      }
    } else {
      // No token, but API might still work with lower limits
      return {
        status: 'degraded',
        lastChecked: new Date().toISOString(),
      };
    }
  } catch (error) {
    return {
      status: 'down',
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Check Vercel API health
 */
async function checkVercelApiHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'down';
  lastChecked: string;
  responseTime?: number;
}> {
  try {
    const startTime = Date.now();
    
    // Check if we're running on Vercel
    const isVercel = !!process.env.VERCEL;
    const hasToken = !!process.env.VERCEL_TOKEN;
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: isVercel || hasToken ? 'healthy' : 'degraded',
      lastChecked: new Date().toISOString(),
      responseTime,
    };
  } catch (error) {
    return {
      status: 'down',
      lastChecked: new Date().toISOString(),
    };
  }
}