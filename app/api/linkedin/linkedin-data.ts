import type {
  LinkedInProfile,
  ProfessionalStats,
  TimelineEvent,
} from '@/components/linkedin-visualizers/types';
import { mockLinkedInApiData } from '@/data/mock-linkedin-api';

import { LINKEDIN_API_BASE_URL } from './constants';

type ProfileSource = 'mock' | 'live';

export interface LinkedInProfileResult {
  profile: LinkedInProfile;
  source: ProfileSource;
  message?: string;
}

interface LinkedInLocalizedField {
  localized?: Record<string, string>;
  preferredLocale?: {
    country?: string;
    language?: string;
  };
}

interface LinkedInProfilePicture {
  'displayImage~'?: {
    elements?: Array<{
      identifiers?: Array<{
        identifier?: string;
      }>;
    }>;
  };
}

interface LinkedInMeResponse {
  id: string;
  localizedFirstName?: string;
  localizedLastName?: string;
  localizedHeadline?: string;
  headline?: string;
  firstName?: LinkedInLocalizedField;
  lastName?: LinkedInLocalizedField;
  profilePicture?: LinkedInProfilePicture;
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const shouldForceMock = () => process.env.LINKEDIN_FORCE_MOCK === 'true';

const buildFallbackProfile = (): LinkedInProfile => clone(mockLinkedInApiData.profile);
const buildFallbackStats = (): ProfessionalStats => clone(mockLinkedInApiData.stats);
const buildFallbackTimeline = (): TimelineEvent[] => clone(mockLinkedInApiData.timeline);

export const loadLinkedInProfile = async (accessToken: string | null): Promise<LinkedInProfileResult> => {
  const fallbackProfile = buildFallbackProfile();

  if (!accessToken || shouldForceMock()) {
    return {
      profile: fallbackProfile,
      source: 'mock',
      message: !accessToken
        ? 'LinkedIn access token not found; displaying cached professional profile.'
        : 'LinkedIn mock mode enabled; using enriched portfolio data.',
    };
  }

  try {
    const { profile, usedLiveData, message } = await buildProfileFromLinkedIn(accessToken, fallbackProfile);

    if (usedLiveData) {
      return {
        profile,
        source: 'live',
        message,
      };
    }

    return {
      profile,
      source: 'mock',
      message:
        message ||
        'LinkedIn API returned limited information; supplementing with cached portfolio data.',
    };
  } catch (error) {
    console.error('LinkedIn live profile fetch failed:', error);
    return {
      profile: fallbackProfile,
      source: 'mock',
      message: 'Unable to reach LinkedIn API; showing cached professional experience.',
    };
  }
};

export const buildProfessionalStatsFromProfile = (
  profile: LinkedInProfile,
): ProfessionalStats => {
  const fallbackStats = buildFallbackStats();

  const totalExperienceMonths = profile.experience.reduce((acc, role) => {
    return acc + calculateDurationInMonths(role.startDate, role.endDate);
  }, 0);

  const totalExperienceYears = totalExperienceMonths / 12;
  const totalEndorsements = profile.skills.reduce((acc, skill) => acc + (skill.endorsements || 0), 0);
  const totalCompanies = new Set(profile.experience.map(exp => exp.company)).size;

  const sortedSkills = [...profile.skills].sort((a, b) => (b.endorsements || 0) - (a.endorsements || 0));
  const topSkill = sortedSkills[0]?.endorsements || 1;
  const skillsRanking = sortedSkills.slice(0, 5).reduce<Record<string, number>>((acc, skill) => {
    const normalized = topSkill ? Math.min(100, Math.round(((skill.endorsements || 0) / topSkill) * 100)) : 0;
    acc[skill.name] = normalized;
    return acc;
  }, {});

  return {
    ...fallbackStats,
    totalExperience: totalExperienceYears > 0 ? Number(totalExperienceYears.toFixed(1)) : fallbackStats.totalExperience,
    totalPositions: profile.experience.length || fallbackStats.totalPositions,
    totalCompanies: totalCompanies || fallbackStats.totalCompanies,
    totalSkills: profile.skills.length || fallbackStats.totalSkills,
    totalEndorsements: totalEndorsements || fallbackStats.totalEndorsements,
    skillsRanking: Object.keys(skillsRanking).length ? skillsRanking : fallbackStats.skillsRanking,
    averageTenure:
      profile.experience.length > 0
        ? Math.round(totalExperienceMonths / profile.experience.length) || fallbackStats.averageTenure
        : fallbackStats.averageTenure,
  };
};

export const buildTimelineFromProfile = (profile: LinkedInProfile): TimelineEvent[] => {
  const fallbackTimeline = buildFallbackTimeline();

  const experienceEvents = profile.experience.map<TimelineEvent>(experience => ({
    id: `timeline-experience-${experience.id}`,
    type: 'experience',
    date: experience.startDate,
    title: experience.title,
    subtitle: experience.company,
    description: experience.description,
    company: experience.company,
    location: experience.location,
    skills: experience.skills,
    achievements: experience.achievements,
    duration: calculateDurationInMonths(experience.startDate, experience.endDate),
    importance: experience.isCurrent ? 'critical' : 'high',
  }));

  const educationEvents = profile.education.map<TimelineEvent>(education => ({
    id: `timeline-education-${education.id}`,
    type: 'education',
    date: education.startDate,
    title: education.degree,
    subtitle: education.institution,
    description: education.description || '',
    institution: education.institution,
    skills: education.activities || education.honors || undefined,
    duration: calculateDurationInMonths(education.startDate, education.endDate),
    importance: 'medium',
  }));

  const certificationEvents = profile.certifications.map<TimelineEvent>(certification => ({
    id: `timeline-certification-${certification.id}`,
    type: 'certification',
    date: certification.issueDate,
    title: certification.name,
    subtitle: certification.issuer,
    description: certification.credentialId || certification.credentialUrl || '',
    skills: certification.skills,
    importance: 'medium',
  }));

  const derivedTimeline = [...experienceEvents, ...educationEvents, ...certificationEvents];

  if (!derivedTimeline.length) {
    return fallbackTimeline;
  }

  const supplementalTimeline = fallbackTimeline.filter(event => event.type !== 'experience');

  return [...derivedTimeline, ...supplementalTimeline].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
};

const buildProfileFromLinkedIn = async (
  accessToken: string,
  fallbackProfile: LinkedInProfile,
): Promise<{ profile: LinkedInProfile; usedLiveData: boolean; message?: string }> => {
  const profile = clone(fallbackProfile);
  let usedLiveData = false;
  let message: string | undefined;

  let meResponse: LinkedInMeResponse | null = null;

  try {
    meResponse = await fetchLinkedInMe(accessToken);
  } catch (error) {
    console.warn('LinkedIn me endpoint failed:', error);
    message = 'Unable to fetch full LinkedIn profile details; displaying cached summary.';
  }

  if (meResponse) {
    const firstName = resolveLocalizedField(meResponse.firstName, meResponse.localizedFirstName);
    const lastName = resolveLocalizedField(meResponse.lastName, meResponse.localizedLastName);
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

    if (fullName) {
      profile.personalInfo.name = fullName;
      usedLiveData = true;
    }

    if (meResponse.localizedHeadline || meResponse.headline) {
      profile.personalInfo.headline = meResponse.localizedHeadline || meResponse.headline || profile.personalInfo.headline;
      usedLiveData = true;
    }

    const profileImage = extractProfileImageUrl(meResponse.profilePicture);
    if (profileImage) {
      profile.personalInfo.profileImageUrl = profileImage;
      usedLiveData = true;
    }
  }

  return { profile, usedLiveData, message };
};

const fetchLinkedInMe = async (accessToken: string): Promise<LinkedInMeResponse> => {
  const url = `${LINKEDIN_API_BASE_URL}/me?projection=(id,localizedFirstName,localizedLastName,localizedHeadline,headline,firstName,lastName,profilePicture(displayImage~:playableStreams))`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
    },
    next: { revalidate: 0 },
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('LinkedIn access token is not authorized.');
  }

  if (!response.ok) {
    throw new Error(`LinkedIn profile request failed with status ${response.status}`);
  }

  return (await response.json()) as LinkedInMeResponse;
};

const resolveLocalizedField = (
  field: LinkedInLocalizedField | undefined,
  fallback?: string,
): string | undefined => {
  if (!field?.localized) {
    return fallback;
  }

  const { language, country } = field.preferredLocale || {};

  if (language && country) {
    const localeKey = `${language}_${country}`;
    if (field.localized[localeKey]) {
      return field.localized[localeKey];
    }
  }

  const [firstValue] = Object.values(field.localized);
  return firstValue || fallback;
};

const extractProfileImageUrl = (profilePicture?: LinkedInProfilePicture): string | undefined => {
  const elements = profilePicture?.['displayImage~']?.elements;
  if (!elements?.length) {
    return undefined;
  }

  for (let index = elements.length - 1; index >= 0; index -= 1) {
    const identifier = elements[index]?.identifiers?.[0]?.identifier;
    if (identifier) {
      return identifier;
    }
  }

  return undefined;
};

const calculateDurationInMonths = (startDate?: string, endDate?: string): number => {
  const start = parseDateString(startDate);
  const end = parseDateString(endDate) || new Date();

  if (!start) {
    return 0;
  }

  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(0, months);
};

const parseDateString = (value?: string): Date | null => {
  if (!value) {
    return null;
  }

  const parts = value.split('-').map(part => Number.parseInt(part, 10));
  if (!parts.length || Number.isNaN(parts[0])) {
    return null;
  }

  const [year, month = 1, day = 1] = parts;
  return new Date(year, Math.max(0, month - 1), day);
};
