import { NextResponse } from 'next/server';

import { LINKEDIN_REFRESH_TOKEN_COOKIE, LINKEDIN_TOKEN_COOKIE } from '../constants';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(LINKEDIN_TOKEN_COOKIE);
  response.cookies.delete(LINKEDIN_REFRESH_TOKEN_COOKIE);
  return response;
}

export const GET = POST;
