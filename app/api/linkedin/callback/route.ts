import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  DEFAULT_TOKEN_MAX_AGE,
  LINKEDIN_REFRESH_TOKEN_COOKIE,
  LINKEDIN_STATE_COOKIE,
  LINKEDIN_TOKEN_COOKIE,
  LINKEDIN_TOKEN_URL,
} from '../constants';

interface LinkedInTokenResponse {
  access_token: string;
  expires_in?: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
  const successRedirect = process.env.LINKEDIN_POST_AUTH_REDIRECT || '/';
  const errorRedirect = process.env.LINKEDIN_ERROR_REDIRECT || '/?linkedin=error';

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      {
        success: false,
        error: 'LinkedIn OAuth configuration is incomplete. Please set LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, and LINKEDIN_REDIRECT_URI.',
      },
      { status: 500 },
    );
  }

  const cookieStore = cookies();
  const storedState = cookieStore.get(LINKEDIN_STATE_COOKIE)?.value;

  if (error) {
    const response = NextResponse.redirect(new URL(errorRedirect, request.url));
    response.cookies.delete(LINKEDIN_STATE_COOKIE);
    response.cookies.delete(LINKEDIN_TOKEN_COOKIE);
    return response;
  }

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.json({ success: false, error: 'Invalid LinkedIn OAuth state.' }, { status: 400 });
  }

  try {
    const token = await exchangeAuthorizationCodeForToken({
      code,
      clientId,
      clientSecret,
      redirectUri,
    });

    const response = NextResponse.redirect(new URL(successRedirect, request.url));
    response.cookies.delete(LINKEDIN_STATE_COOKIE);
    response.cookies.set({
      name: LINKEDIN_TOKEN_COOKIE,
      value: token.access_token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: token.expires_in || DEFAULT_TOKEN_MAX_AGE,
    });

    if (token.refresh_token) {
      response.cookies.set({
        name: LINKEDIN_REFRESH_TOKEN_COOKIE,
        value: token.refresh_token,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: token.refresh_token_expires_in || DEFAULT_TOKEN_MAX_AGE * 5,
      });
    }

    return response;
  } catch (err) {
    console.error('LinkedIn token exchange failed:', err);
    const response = NextResponse.redirect(new URL(errorRedirect, request.url));
    response.cookies.delete(LINKEDIN_STATE_COOKIE);
    response.cookies.delete(LINKEDIN_TOKEN_COOKIE);
    return response;
  }
}

const exchangeAuthorizationCodeForToken = async ({
  code,
  clientId,
  clientSecret,
  redirectUri,
}: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<LinkedInTokenResponse> => {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(LINKEDIN_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LinkedIn token request failed: ${response.status} ${errorText}`);
  }

  const token = (await response.json()) as LinkedInTokenResponse;

  if (!token.access_token) {
    throw new Error('LinkedIn token response is missing an access_token.');
  }

  return token;
};
