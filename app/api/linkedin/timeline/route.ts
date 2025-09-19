import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import type { LinkedInAPIResponse, TimelineEvent } from '@/components/linkedin-visualizers/types';

import { LINKEDIN_TOKEN_COOKIE } from '../constants';
import { buildTimelineFromProfile, loadLinkedInProfile } from '../linkedin-data';

export async function GET() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get(LINKEDIN_TOKEN_COOKIE)?.value ?? null;

  const { profile, source, message } = await loadLinkedInProfile(accessToken);
  const timeline = buildTimelineFromProfile(profile);

  const response: LinkedInAPIResponse<TimelineEvent[]> = {
    data: timeline,
    success: true,
    message,
    source,
    lastUpdated: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
