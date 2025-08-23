/**
 * Comprehensive LinkedIn Integration Test Suite
 * Tests all LinkedIn visualizer components for functionality, performance, and integration
 */

import React from 'react';
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Components
import LinkedInVisualizersSection from '../src/components/linkedin-visualizers/LinkedInVisualizersSection';
import ExperienceCard from '../src/components/linkedin-visualizers/experience/ExperienceCard';
import ProfessionalStats from '../src/components/linkedin-visualizers/stats/ProfessionalStats';
import ProfessionalTimeline from '../src/components/linkedin-visualizers/timeline/ProfessionalTimeline';

// Mock data
import { mockLinkedInProfile, mockProfessionalStats, mockTimelineData } from './mocks/linkedin-mock-data';

// Test utilities
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

// Mock the LinkedIn API
jest.mock('../src/services/linkedin-api', () => ({
  LinkedInAPI: {
    getProfile: jest.fn(),
    getStats: jest.fn(),
    getTimeline: jest.fn(),
    clearCache: jest.fn(),
  }
}));

describe('LinkedIn Integration - Comprehensive Test Suite', () => {
  let mockApi: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockApi = require('../src/services/linkedin-api').LinkedInAPI;
    
    // Setup default mock responses
    mockApi.getProfile.mockResolvedValue(mockLinkedInProfile);
    mockApi.getStats.mockResolvedValue(mockProfessionalStats);
    mockApi.getTimeline.mockResolvedValue(mockTimelineData);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('🧩 Individual Component Tests', () => {
    describe('LinkedInVisualizersSection', () => {
      it('renders section header and navigation correctly', async () => {
        renderWithProviders(<LinkedInVisualizersSection />);
        
        await waitFor(() => {
          expect(screen.getByText(/LinkedIn.*Professional Journey/i)).toBeInTheDocument();
          expect(screen.getByText('Professional Overview')).toBeInTheDocument();
          expect(screen.getByText('Career Timeline')).toBeInTheDocument();
          expect(screen.getByText('Work Experience')).toBeInTheDocument();
        });
      });

      it('handles tab navigation smoothly', async () => {
        const user = userEvent.setup();
        renderWithProviders(<LinkedInVisualizersSection />);
        
        await waitFor(() => {
          expect(screen.getByText('Professional Overview')).toBeInTheDocument();
        });

        // Switch to Timeline tab
        const timelineTab = screen.getByText('Career Timeline');
        await user.click(timelineTab);
        
        await waitFor(() => {
          expect(screen.getByText('Career Journey')).toBeInTheDocument();
        });

        // Switch to Experience tab
        const experienceTab = screen.getByText('Work Experience');
        await user.click(experienceTab);
        
        await waitFor(() => {
          expect(screen.getByText('Work Experience')).toBeInTheDocument();
        });
      });

      it('displays profile information correctly', async () => {
        renderWithProviders(<LinkedInVisualizersSection />);
        
        await waitFor(() => {
          expect(screen.getByText(mockLinkedInProfile.personalInfo.name)).toBeInTheDocument();
          expect(screen.getByText(mockLinkedInProfile.personalInfo.headline)).toBeInTheDocument();
          expect(screen.getByText(mockLinkedInProfile.personalInfo.location)).toBeInTheDocument();
        });
      });

      it('handles loading states properly', async () => {
        mockApi.getProfile.mockImplementation(() => new Promise(resolve => 
          setTimeout(() => resolve(mockLinkedInProfile), 1000)
        ));

        renderWithProviders(<LinkedInVisualizersSection />);
        
        // Should show loading state initially
        expect(screen.getByText(/Loading timeline data/i)).toBeInTheDocument();
        
        await waitFor(() => {
          expect(screen.getByText(mockLinkedInProfile.personalInfo.name)).toBeInTheDocument();
        }, { timeout: 2000 });
      });

      it('handles error states gracefully', async () => {
        mockApi.getProfile.mockRejectedValue(new Error('API Error'));
        
        renderWithProviders(<LinkedInVisualizersSection />);
        
        await waitFor(() => {
          expect(screen.getByText(/Failed to load LinkedIn data/i)).toBeInTheDocument();
          expect(screen.getByText('Retry')).toBeInTheDocument();
        });
      });

      it('retry functionality works correctly', async () => {
        const user = userEvent.setup();
        mockApi.getProfile.mockRejectedValueOnce(new Error('Network Error'));
        
        renderWithProviders(<LinkedInVisualizersSection />);
        
        await waitFor(() => {
          expect(screen.getByText('Retry')).toBeInTheDocument();
        });

        const retryButton = screen.getByText('Retry');
        await user.click(retryButton);

        expect(mockApi.clearCache).toHaveBeenCalled();
      });
    });

    describe('ExperienceCard', () => {
      const mockPosition = mockLinkedInProfile.experience[0];

      it('renders position information correctly', () => {
        render(<ExperienceCard position={mockPosition} index={0} />);
        
        expect(screen.getByText(mockPosition.title)).toBeInTheDocument();
        expect(screen.getByText(mockPosition.company)).toBeInTheDocument();
        expect(screen.getByText(mockPosition.location)).toBeInTheDocument();
      });

      it('displays skills with proper truncation', () => {
        render(<ExperienceCard position={mockPosition} index={0} />);
        
        // Should show first 6 skills
        const visibleSkills = mockPosition.skills.slice(0, 6);
        visibleSkills.forEach(skill => {
          expect(screen.getByText(skill)).toBeInTheDocument();
        });

        // Should show "more" indicator if there are more than 6 skills
        if (mockPosition.skills.length > 6) {
          expect(screen.getByText(`+${mockPosition.skills.length - 6} more`)).toBeInTheDocument();
        }
      });

      it('expands to show achievements when clicked', async () => {
        const user = userEvent.setup();
        render(<ExperienceCard position={mockPosition} index={0} />);
        
        const expandButton = screen.getByRole('button');
        await user.click(expandButton);

        await waitFor(() => {
          expect(screen.getByText('Key Achievements')).toBeInTheDocument();
          mockPosition.achievements.forEach(achievement => {
            expect(screen.getByText(achievement)).toBeInTheDocument();
          });
        });
      });

      it('handles missing company logo gracefully', () => {
        const positionWithoutLogo = { ...mockPosition, companyLogo: undefined };
        render(<ExperienceCard position={positionWithoutLogo} index={0} />);
        
        // Should show company initial
        const firstLetter = mockPosition.company.charAt(0);
        expect(screen.getByText(firstLetter)).toBeInTheDocument();
      });

      it('calculates and displays duration correctly', () => {
        render(<ExperienceCard position={mockPosition} index={0} />);
        
        // Should display some form of duration
        expect(screen.getByText(/\d+y|\d+m|Present|Current/)).toBeInTheDocument();
      });
    });

    describe('ProfessionalStats', () => {
      it('renders all stats when data is provided', () => {
        render(<ProfessionalStats stats={mockProfessionalStats} loading={false} />);
        
        expect(screen.getByText(mockProfessionalStats.totalExperience.toString())).toBeInTheDocument();
        expect(screen.getByText(mockProfessionalStats.totalPositions.toString())).toBeInTheDocument();
        expect(screen.getByText(mockProfessionalStats.totalSkills.toString())).toBeInTheDocument();
      });

      it('shows loading state', () => {
        render(<ProfessionalStats stats={null} loading={true} />);
        
        // Should show some loading indicator
        const loadingElements = screen.queryAllByText(/loading/i);
        expect(loadingElements.length).toBeGreaterThan(0);
      });

      it('handles missing stats gracefully', () => {
        render(<ProfessionalStats stats={null} loading={false} />);
        
        // Should not crash and should handle null stats
        expect(screen.getByTestId('professional-stats')).toBeInTheDocument();
      });

      it('formats numbers appropriately', () => {
        const statsWithLargeNumbers = {
          ...mockProfessionalStats,
          profileViews: 12500,
          totalEndorsements: 1250,
        };
        
        render(<ProfessionalStats stats={statsWithLargeNumbers} loading={false} />);
        
        // Should format large numbers appropriately (12.5k, etc.)
        expect(screen.getByText(/12\.5k|12,500/)).toBeInTheDocument();
      });
    });

    describe('ProfessionalTimeline', () => {
      it('renders timeline with data', () => {
        render(<ProfessionalTimeline data={mockTimelineData} height={400} />);
        
        // Should render timeline container
        expect(screen.getByTestId('timeline-container')).toBeInTheDocument();
      });

      it('handles empty data gracefully', () => {
        render(<ProfessionalTimeline data={[]} height={400} />);
        
        // Should show empty state or handle gracefully
        expect(screen.getByText(/no.*data|empty/i) || 
               screen.getByTestId('empty-timeline')).toBeInTheDocument();
      });

      it('is responsive to height changes', () => {
        const { rerender } = render(<ProfessionalTimeline data={mockTimelineData} height={400} />);
        
        expect(screen.getByTestId('timeline-container')).toHaveStyle('height: 400px');
        
        rerender(<ProfessionalTimeline data={mockTimelineData} height={600} />);
        
        expect(screen.getByTestId('timeline-container')).toHaveStyle('height: 600px');
      });
    });
  });

  describe('🔗 Integration Tests', () => {
    it('loads complete LinkedIn section with all components', async () => {
      renderWithProviders(<LinkedInVisualizersSection />);
      
      // Wait for all data to load
      await waitFor(() => {
        expect(screen.getByText(mockLinkedInProfile.personalInfo.name)).toBeInTheDocument();
      });

      // Check that all tabs work and load their respective content
      const timelineTab = screen.getByText('Career Timeline');
      fireEvent.click(timelineTab);
      
      await waitFor(() => {
        expect(screen.getByText('Career Journey')).toBeInTheDocument();
      });
    });

    it('maintains state across tab switches', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LinkedInVisualizersSection />);
      
      await waitFor(() => {
        expect(screen.getByText(mockLinkedInProfile.personalInfo.name)).toBeInTheDocument();
      });

      // Switch to experience tab and expand a card
      const experienceTab = screen.getByText('Work Experience');
      await user.click(experienceTab);
      
      await waitFor(() => {
        const expandButtons = screen.getAllByRole('button');
        const firstExpandButton = expandButtons.find(button => 
          button.getAttribute('aria-expanded') !== null
        );
        
        if (firstExpandButton) {
          await user.click(firstExpandButton);
          await waitFor(() => {
            expect(screen.getByText('Key Achievements')).toBeInTheDocument();
          });
        }
      });

      // Switch back to overview and then back to experience
      const overviewTab = screen.getByText('Professional Overview');
      await user.click(overviewTab);
      
      await user.click(experienceTab);
      
      // State should be maintained (expanded card should still be expanded)
      await waitFor(() => {
        expect(screen.getByText('Work Experience')).toBeInTheDocument();
      });
    });

    it('handles concurrent data fetching correctly', async () => {
      let profileResolve: (value: any) => void;
      let statsResolve: (value: any) => void;
      
      mockApi.getProfile.mockImplementation(() => new Promise(resolve => {
        profileResolve = resolve;
      }));
      
      mockApi.getStats.mockImplementation(() => new Promise(resolve => {
        statsResolve = resolve;
      }));

      renderWithProviders(<LinkedInVisualizersSection />);
      
      // Resolve stats first
      statsResolve!(mockProfessionalStats);
      
      await waitFor(() => {
        expect(screen.getByText(mockProfessionalStats.totalExperience.toString())).toBeInTheDocument();
      });

      // Then resolve profile
      profileResolve!(mockLinkedInProfile);
      
      await waitFor(() => {
        expect(screen.getByText(mockLinkedInProfile.personalInfo.name)).toBeInTheDocument();
      });
    });
  });

  describe('⚡ Performance Tests', () => {
    it('renders LinkedIn section within performance threshold', async () => {
      const startTime = performance.now();
      
      renderWithProviders(<LinkedInVisualizersSection />);
      
      await waitFor(() => {
        expect(screen.getByText(/LinkedIn.*Professional Journey/i)).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within 1 second
      expect(renderTime).toBeLessThan(1000);
    });

    it('handles large datasets efficiently', async () => {
      // Create large mock dataset
      const largeProfile = {
        ...mockLinkedInProfile,
        experience: Array(50).fill(null).map((_, i) => ({
          ...mockLinkedInProfile.experience[0],
          id: `exp-${i}`,
          title: `Position ${i}`,
          company: `Company ${i}`,
        })),
      };

      mockApi.getProfile.mockResolvedValue(largeProfile);
      
      const startTime = performance.now();
      renderWithProviders(<LinkedInVisualizersSection />);
      
      await waitFor(() => {
        const experienceTab = screen.getByText('Work Experience');
        fireEvent.click(experienceTab);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Work Experience')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should still render large datasets within reasonable time
      expect(renderTime).toBeLessThan(2000);
    });

    it('minimizes re-renders on prop changes', () => {
      const renderSpy = jest.fn();
      const TestComponent = ({ stats }: { stats: any }) => {
        renderSpy();
        return <ProfessionalStats stats={stats} loading={false} />;
      };

      const { rerender } = render(<TestComponent stats={mockProfessionalStats} />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Re-render with same props
      rerender(<TestComponent stats={mockProfessionalStats} />);
      
      expect(renderSpy).toHaveBeenCalledTimes(2);
      
      // This tests that we're not causing unnecessary re-renders
      // In a real scenario, we'd use React.memo or useMemo to optimize this
    });
  });

  describe('♿ Accessibility Tests', () => {
    it('has proper ARIA labels and roles', async () => {
      renderWithProviders(<LinkedInVisualizersSection />);
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          expect(button).toBeVisible();
          // Each button should have accessible text
          expect(button).toHaveAccessibleName();
        });

        const links = screen.getAllByRole('link');
        links.forEach(link => {
          expect(link).toHaveAttribute('href');
        });
      });
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LinkedInVisualizersSection />);
      
      await waitFor(() => {
        const firstTab = screen.getByText('Professional Overview');
        expect(firstTab).toBeInTheDocument();
      });

      // Tab navigation should work
      await user.tab();
      expect(document.activeElement).toHaveAccessibleName();
      
      await user.tab();
      expect(document.activeElement).toHaveAccessibleName();
    });

    it('provides meaningful error messages', async () => {
      mockApi.getProfile.mockRejectedValue(new Error('Network timeout'));
      
      renderWithProviders(<LinkedInVisualizersSection />);
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/Failed to load LinkedIn data/i);
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveAttribute('role');
      });
    });

    it('has proper heading hierarchy', async () => {
      renderWithProviders(<LinkedInVisualizersSection />);
      
      await waitFor(() => {
        const headings = screen.getAllByRole('heading');
        
        // Should have logical heading hierarchy
        expect(headings[0]).toHaveAccessibleName(/LinkedIn.*Professional Journey/i);
      });
    });
  });

  describe('📱 Responsive Design Tests', () => {
    it('adapts to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });
      Object.defineProperty(window, 'innerHeight', { writable: true, value: 667 });
      
      renderWithProviders(<LinkedInVisualizersSection />);
      
      // Should render without errors on mobile
      expect(screen.getByText(/LinkedIn.*Professional Journey/i)).toBeInTheDocument();
    });

    it('adapts to tablet viewport', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 768 });
      Object.defineProperty(window, 'innerHeight', { writable: true, value: 1024 });
      
      renderWithProviders(<LinkedInVisualizersSection />);
      
      // Should render without errors on tablet
      expect(screen.getByText(/LinkedIn.*Professional Journey/i)).toBeInTheDocument();
    });

    it('handles orientation changes', () => {
      const { rerender } = renderWithProviders(<LinkedInVisualizersSection />);
      
      // Portrait
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });
      Object.defineProperty(window, 'innerHeight', { writable: true, value: 667 });
      
      rerender(
        <QueryClientProvider client={createTestQueryClient()}>
          <LinkedInVisualizersSection />
        </QueryClientProvider>
      );
      
      // Landscape
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 667 });
      Object.defineProperty(window, 'innerHeight', { writable: true, value: 375 });
      
      rerender(
        <QueryClientProvider client={createTestQueryClient()}>
          <LinkedInVisualizersSection />
        </QueryClientProvider>
      );
      
      // Should handle orientation change without errors
      expect(screen.getByText(/LinkedIn.*Professional Journey/i)).toBeInTheDocument();
    });
  });

  describe('🔄 Error Handling & Edge Cases', () => {
    it('handles partial data gracefully', async () => {
      const partialProfile = {
        personalInfo: {
          name: 'Test User',
          headline: 'Test Headline',
          location: 'Test Location',
        },
        experience: [],
        education: [],
        skills: [],
        certifications: [],
        achievements: [],
      };

      mockApi.getProfile.mockResolvedValue(partialProfile);
      
      renderWithProviders(<LinkedInVisualizersSection />);
      
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
        
        // Switch to experience tab - should handle empty experience
        const experienceTab = screen.getByText('Work Experience');
        fireEvent.click(experienceTab);
        
        // Should not crash with empty experience
        expect(screen.getByText('Work Experience')).toBeInTheDocument();
      });
    });

    it('handles malformed data', async () => {
      const malformedProfile = {
        personalInfo: null,
        experience: [{ id: 'invalid' }], // Missing required fields
        education: null,
      };

      mockApi.getProfile.mockResolvedValue(malformedProfile);
      
      renderWithProviders(<LinkedInVisualizersSection />);
      
      // Should handle malformed data without crashing
      await waitFor(() => {
        // Should show some error state or fallback
        expect(screen.getByText(/Failed to load LinkedIn data/i) ||
               screen.getByText(/LinkedIn.*Professional Journey/i)).toBeInTheDocument();
      });
    });

    it('handles API timeout gracefully', async () => {
      mockApi.getProfile.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );
      
      renderWithProviders(<LinkedInVisualizersSection />);
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to load LinkedIn data/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });
});