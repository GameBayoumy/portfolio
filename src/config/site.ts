const DEFAULT_CONTACT_EMAIL = 'hello@sharifbayoumy.com';
const DEFAULT_GITHUB_URL = 'https://github.com/sharifbayoumy';
const DEFAULT_LINKEDIN_URL = 'https://www.linkedin.com/in/sharifbayoumy/';

const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ??
  process.env.CONTACT_EMAIL ??
  DEFAULT_CONTACT_EMAIL;

const githubUrl =
  process.env.NEXT_PUBLIC_GITHUB_URL ??
  process.env.GITHUB_URL ??
  DEFAULT_GITHUB_URL;

const linkedinUrl =
  process.env.NEXT_PUBLIC_LINKEDIN_URL ??
  process.env.LINKEDIN_URL ??
  DEFAULT_LINKEDIN_URL;

export const siteConfig = Object.freeze({
  contactEmail,
  contactMailto: `mailto:${contactEmail}`,
  githubUrl,
  linkedinUrl,
});

export type SiteConfig = typeof siteConfig;
