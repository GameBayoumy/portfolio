import crypto from 'node:crypto';

import { NextResponse } from 'next/server';

import {
  DEFAULT_LINKEDIN_SCOPE,
  LINKEDIN_AUTHORIZATION_URL,
  LINKEDIN_STATE_COOKIE,
} from '../constants';

export async function GET() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      {
        success: false,
        error: 'LinkedIn OAuth is not configured. Please set LINKEDIN_CLIENT_ID and LINKEDIN_REDIRECT_URI.',
      },
      { status: 500 },
    );
  }

  const state = crypto.randomBytes(16).toString('hex');
  const scope = DEFAULT_LINKEDIN_SCOPE;

  const authorizationUrl = new URL(LINKEDIN_AUTHORIZATION_URL);
  authorizationUrl.search = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    state,
  }).toString();

  const response = NextResponse.json({
    success: true,
    url: authorizationUrl.toString(),
    state,
  });

  response.cookies.set({
    name: LINKEDIN_STATE_COOKIE,
    value: state,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 10 * 60,
  });

  return response;
}
