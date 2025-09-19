import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import type { LinkedInAPIResponse, LinkedInProfile } from '@/components/linkedin-visualizers/types';

import { LINKEDIN_TOKEN_COOKIE } from '../constants';
import { loadLinkedInProfile } from '../linkedin-data';

export async function GET() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get(LINKEDIN_TOKEN_COOKIE)?.value ?? null;

  const { profile, source, message } = await loadLinkedInProfile(accessToken);

  const response: LinkedInAPIResponse<LinkedInProfile> = {
    data: profile,
    success: true,
    message,
    source,
    lastUpdated: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
