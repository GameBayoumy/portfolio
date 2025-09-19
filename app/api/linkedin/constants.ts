export const LINKEDIN_AUTHORIZATION_URL =
  process.env.LINKEDIN_AUTHORIZATION_URL || 'https://www.linkedin.com/oauth/v2/authorization';
export const LINKEDIN_TOKEN_URL =
  process.env.LINKEDIN_TOKEN_URL || 'https://www.linkedin.com/oauth/v2/accessToken';
export const LINKEDIN_API_BASE_URL =
  process.env.LINKEDIN_API_BASE_URL || 'https://api.linkedin.com/v2';

export const LINKEDIN_STATE_COOKIE = 'linkedin_oauth_state';
export const LINKEDIN_TOKEN_COOKIE = 'linkedin_access_token';
export const LINKEDIN_REFRESH_TOKEN_COOKIE = 'linkedin_refresh_token';

export const DEFAULT_LINKEDIN_SCOPE =
  process.env.LINKEDIN_OAUTH_SCOPE || 'r_liteprofile r_emailaddress';

export const DEFAULT_TOKEN_MAX_AGE = 60 * 60 * 24; // 24 hours
