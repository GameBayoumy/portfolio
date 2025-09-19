const DEFAULT_CONTACT_EMAIL = 'contact@sharifbayoumy.com';
const DEFAULT_GITHUB_URL = 'https://github.com/GameBayoumy';

const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ??
  process.env.CONTACT_EMAIL ??
  DEFAULT_CONTACT_EMAIL;

const githubUrl =
  process.env.NEXT_PUBLIC_GITHUB_URL ??
  process.env.GITHUB_URL ??
  DEFAULT_GITHUB_URL;

export const siteConfig = Object.freeze({
  contactEmail,
  contactMailto: `mailto:${contactEmail}`,
  githubUrl,
});

export type SiteConfig = typeof siteConfig;
