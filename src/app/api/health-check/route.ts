import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  environment: string;
  region: string;
  checks: {
    database: boolean;
    apis: {
      github: boolean;
      linkedin: boolean;
    };
    services: {
      sentry: boolean;
    };
    performance: {
      responseTime: number;
      memoryUsage?: number;
    };
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<HealthStatus>> {
  const startTime = Date.now();
  
  try {
    // Basic health checks
    const checks = await performHealthChecks();
    const responseTime = Date.now() - startTime;
    
    const healthStatus: HealthStatus = {
      status: determineOverallStatus(checks),
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      uptime: process.uptime ? process.uptime() : 0,
      environment: process.env.VERCEL_ENV || 'development',
      region: process.env.VERCEL_REGION || 'unknown',
      checks: {
        database: true, // No database in this project
        apis: {
          github: checks.github,
          linkedin: checks.linkedin,
        },
        services: {
          sentry: checks.sentry,
        },
        performance: {
          responseTime,
          memoryUsage: process.memoryUsage ? process.memoryUsage().heapUsed : undefined,
        },
      },
    };

    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    
    return NextResponse.json(healthStatus, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
        'X-Health-Check': 'true',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorStatus: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      uptime: process.uptime ? process.uptime() : 0,
      environment: process.env.VERCEL_ENV || 'development',
      region: process.env.VERCEL_REGION || 'unknown',
      checks: {
        database: false,
        apis: {
          github: false,
          linkedin: false,
        },
        services: {
          sentry: false,
        },
        performance: {
          responseTime: Date.now() - startTime,
        },
      },
    };

    return NextResponse.json(errorStatus, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
        'X-Health-Check': 'true',
      },
    });
  }
}

async function performHealthChecks() {
  const checks = {
    github: false,
    linkedin: false,
    sentry: false,
  };

  // Check GitHub API connectivity
  try {
    const githubResponse = await fetch('https://api.github.com/rate_limit', {
      headers: {
        'User-Agent': 'Portfolio-Health-Check',
        ...(process.env.NEXT_PUBLIC_GITHUB_TOKEN && {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
        }),
      },
      signal: AbortSignal.timeout(5000),
    });
    checks.github = githubResponse.ok;
  } catch (error) {
    console.warn('GitHub API health check failed:', error);
  }

  // Check LinkedIn API (mock check since we don't have direct API access)
  try {
    // This is a placeholder - in a real scenario you'd check your LinkedIn proxy/service
    checks.linkedin = true;
  } catch (error) {
    console.warn('LinkedIn API health check failed:', error);
  }

  // Check Sentry connectivity
  try {
    if (process.env.SENTRY_DSN) {
      // Simple check to see if Sentry is configured
      checks.sentry = true;
    }
  } catch (error) {
    console.warn('Sentry health check failed:', error);
  }

  return checks;
}

function determineOverallStatus(checks: { github: boolean; linkedin: boolean; sentry: boolean }): 'healthy' | 'degraded' | 'unhealthy' {
  const healthyCount = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.keys(checks).length;
  
  if (healthyCount === totalChecks) return 'healthy';
  if (healthyCount >= totalChecks / 2) return 'degraded';
  return 'unhealthy';
}