import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API Route: /api/version
 * Returns current version information
 */
export async function GET(request: NextRequest) {
  try {
    // Read version info from config
    const versionPath = path.join(process.cwd(), 'src/config/version.json');
    
    let versionInfo;
    try {
      const versionData = fs.readFileSync(versionPath, 'utf8');
      versionInfo = JSON.parse(versionData);
    } catch (error) {
      // Fallback to package.json if version.json doesn't exist
      const packagePath = path.join(process.cwd(), 'package.json');
      const packageData = fs.readFileSync(packagePath, 'utf8');
      const packageJson = JSON.parse(packageData);
      
      versionInfo = {
        version: packageJson.version,
        buildDate: new Date().toISOString(),
        commitHash: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'unknown',
        features: {
          linkedin: true,
          github: true,
          threejs: true,
          xr: true,
          d3: true,
          performance: true,
        },
        apiVersions: {
          linkedin: 'v2',
          github: 'v4',
          vercel: 'v1',
        },
        buildInfo: {
          node: process.version,
          next: packageJson.dependencies.next || 'unknown',
          typescript: packageJson.devDependencies.typescript || 'unknown',
        },
      };
    }

    // Add runtime information
    const runtimeInfo = {
      ...versionInfo,
      runtime: {
        environment: process.env.NODE_ENV || 'development',
        platform: process.platform,
        nodeVersion: process.version,
        uptime: process.uptime(),
      },
      deployment: {
        vercelEnv: process.env.VERCEL_ENV || 'development',
        vercelRegion: process.env.VERCEL_REGION || 'local',
        vercelUrl: process.env.VERCEL_URL || 'localhost',
      },
    };

    return NextResponse.json(runtimeInfo, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=86400',
        'X-Portfolio-Version': versionInfo.version,
        'X-Build-Date': versionInfo.buildDate,
        'X-Commit-Hash': versionInfo.commitHash,
      },
    });
  } catch (error) {
    console.error('Failed to get version info:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to retrieve version information',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * API Route: /api/version (HEAD)
 * Returns version headers without body
 */
export async function HEAD(request: NextRequest) {
  try {
    const versionPath = path.join(process.cwd(), 'src/config/version.json');
    const versionData = fs.readFileSync(versionPath, 'utf8');
    const versionInfo = JSON.parse(versionData);

    return new NextResponse(null, {
      headers: {
        'X-Portfolio-Version': versionInfo.version,
        'X-Build-Date': versionInfo.buildDate,
        'X-Commit-Hash': versionInfo.commitHash,
        'X-Features': Object.entries(versionInfo.features)
          .filter(([_, enabled]) => enabled)
          .map(([feature, _]) => feature)
          .join(','),
      },
    });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}