import { useState, useEffect } from 'react';
import { LinkedInProfile, TimelineEvent, ProfessionalStats as LinkedInStats } from '../components/linkedin-visualizers/types';
import { LinkedInAPI } from '../services/linkedin-api';

interface UseLinkedInProfileReturn {
  profile: LinkedInProfile | null;
  stats: LinkedInStats | null;
  timeline: TimelineEvent[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  searchProfile: (query: string) => Promise<{
    positions: any[];
    skills: any[];
    achievements: any[];
  }>;
}

export const useLinkedInProfile = (): UseLinkedInProfileReturn => {
  const [profile, setProfile] = useState<LinkedInProfile | null>(null);
  const [stats, setStats] = useState<LinkedInStats | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [profileData, statsData, timelineData] = await Promise.all([
        LinkedInAPI.getProfile(),
        LinkedInAPI.getStats(),
        LinkedInAPI.getTimeline()
      ]);

      setProfile(profileData);
      setStats(statsData);
      setTimeline(timelineData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch LinkedIn profile';
      setError(errorMessage);
      console.error('Error fetching LinkedIn profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    LinkedInAPI.clearCache();
    await fetchData();
  };

  const searchProfile = async (query: string) => {
    return await LinkedInAPI.searchProfile(query);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    profile,
    stats,
    timeline,
    loading,
    error,
    refetch,
    searchProfile
  };
};

// Hook for getting skills by category
export const useLinkedInSkills = () => {
  const [skillsByCategory, setSkillsByCategory] = useState<Record<string, any[]> | null>(null);
  const [topSkills, setTopSkills] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        setError(null);

        const [skillsData, topSkillsData] = await Promise.all([
          LinkedInAPI.getSkillsByCategory(),
          LinkedInAPI.getTopSkills(10)
        ]);

        setSkillsByCategory(skillsData);
        setTopSkills(topSkillsData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch skills data';
        setError(errorMessage);
        console.error('Error fetching skills:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  return {
    skillsByCategory,
    topSkills,
    loading,
    error
  };
};

// Hook for timeline data with filtering
export const useLinkedInTimeline = () => {
  const [timeline, setTimeline] = useState<TimelineEvent[] | null>(null);
  const [filteredTimeline, setFilteredTimeline] = useState<TimelineEvent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterByType = (type: 'experience' | 'education' | 'certification' | 'achievement' | 'project' | 'volunteer' | 'all') => {
    if (!timeline) return;
    
    if (type === 'all') {
      setFilteredTimeline(timeline);
    } else {
      setFilteredTimeline(timeline.filter(event => event.type === type));
    }
  };

  const filterByDateRange = (startDate: string, endDate: string) => {
    if (!timeline) return;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    setFilteredTimeline(
      timeline.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= start && eventDate <= end;
      })
    );
  };

  const searchTimeline = (query: string) => {
    if (!timeline) return;
    
    const lowercaseQuery = query.toLowerCase();
    setFilteredTimeline(
      timeline.filter(event =>
        event.title.toLowerCase().includes(lowercaseQuery) ||
        event.subtitle.toLowerCase().includes(lowercaseQuery) ||
        event.description.toLowerCase().includes(lowercaseQuery) ||
        event.company?.toLowerCase().includes(lowercaseQuery) ||
        event.skills?.some(skill => skill.toLowerCase().includes(lowercaseQuery))
      )
    );
  };

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        setError(null);

        const timelineData = await LinkedInAPI.getTimeline();
        setTimeline(timelineData);
        setFilteredTimeline(timelineData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch timeline data';
        setError(errorMessage);
        console.error('Error fetching timeline:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, []);

  return {
    timeline,
    filteredTimeline,
    loading,
    error,
    filterByType,
    filterByDateRange,
    searchTimeline,
    resetFilters: () => setFilteredTimeline(timeline)
  };
};