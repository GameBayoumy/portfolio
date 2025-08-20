import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GitHubStatsContainer } from '../../../src/components/github-visualizers/stats/GitHubStatsContainer';
import { useGitHubStats } from '../../../src/hooks/useGitHubStats';
import type { GitHubStats } from '../../../src/types/github.types';

// Mock the custom hook
vi.mock('../../../src/hooks/useGitHubStats');
const mockUseGitHubStats = useGitHubStats as any;

// Mock React Query
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('GitHubStatsContainer', () => {
  let user: ReturnType<typeof userEvent.setup>;

  const mockStats: GitHubStats = {
    followers: 150,
    following: 89,
    publicRepos: 42,
    totalStars: 125,
    totalForks: 23,
    lastUpdate: '2024-01-01T12:00:00Z'
  };

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    mockUseGitHubStats.mockReturnValue({
      stats: null,
      isLoading: true,
      error: null,
      refetch: vi.fn()
    });

    renderWithQueryClient(<GitHubStatsContainer username="GameBayoumy" />);

    expect(screen.getByTestId('stats-loading')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading GitHub statistics')).toBeInTheDocument();
  });

  it('should render stats when data is loaded', async () => {
    mockUseGitHubStats.mockReturnValue({
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    renderWithQueryClient(<GitHubStatsContainer username="GameBayoumy" />);

    await waitFor(() => {
      expect(screen.getByTestId('stats-grid')).toBeInTheDocument();
    });

    // Check individual stat cards
    expect(screen.getByText('150')).toBeInTheDocument(); // followers
    expect(screen.getByText('89')).toBeInTheDocument(); // following
    expect(screen.getByText('42')).toBeInTheDocument(); // repositories
    expect(screen.getByText('125')).toBeInTheDocument(); // stars
    expect(screen.getByText('23')).toBeInTheDocument(); // forks

    // Check labels
    expect(screen.getByText('Followers')).toBeInTheDocument();
    expect(screen.getByText('Following')).toBeInTheDocument();
    expect(screen.getByText('Repositories')).toBeInTheDocument();
    expect(screen.getByText('Total Stars')).toBeInTheDocument();
    expect(screen.getByText('Total Forks')).toBeInTheDocument();
  });

  it('should display error state when fetch fails', async () => {
    const mockError = new Error('Failed to fetch GitHub stats');
    mockUseGitHubStats.mockReturnValue({
      stats: null,
      isLoading: false,
      error: mockError,
      refetch: vi.fn()
    });

    renderWithQueryClient(<GitHubStatsContainer username="GameBayoumy" />);

    await waitFor(() => {
      expect(screen.getByTestId('stats-error')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to load GitHub statistics')).toBeInTheDocument();
    expect(screen.getByText(mockError.message)).toBeInTheDocument();
  });

  it('should handle refresh functionality', async () => {
    const mockRefetch = vi.fn();
    mockUseGitHubStats.mockReturnValue({
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: mockRefetch
    });

    renderWithQueryClient(<GitHubStatsContainer username="GameBayoumy" />);

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    await user.click(refreshButton);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('should show loading state during refresh', async () => {
    const mockRefetch = vi.fn();
    mockUseGitHubStats.mockReturnValue({
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: mockRefetch
    });

    renderWithQueryClient(<GitHubStatsContainer username="GameBayoumy" />);

    // Simulate refresh loading state
    act(() => {
      mockUseGitHubStats.mockReturnValue({
        stats: mockStats,
        isLoading: true,
        error: null,
        refetch: mockRefetch
      });
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    expect(refreshButton).toBeDisabled();
    expect(screen.getByTestId('refresh-spinner')).toBeInTheDocument();
  });

  it('should format large numbers correctly', async () => {
    const largeStats = {
      ...mockStats,
      followers: 1500,
      totalStars: 12500,
      totalForks: 2300
    };

    mockUseGitHubStats.mockReturnValue({
      stats: largeStats,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    renderWithQueryClient(<GitHubStatsContainer username="GameBayoumy" />);

    await waitFor(() => {
      expect(screen.getByText('1.5k')).toBeInTheDocument(); // followers
      expect(screen.getByText('12.5k')).toBeInTheDocument(); // stars
      expect(screen.getByText('2.3k')).toBeInTheDocument(); // forks
    });
  });

  it('should show trends when available', async () => {
    const statsWithTrends = {
      ...mockStats,
      followersTrend: 'up',
      starsTrend: 'up',
      forksTrend: 'neutral'
    } as any;

    mockUseGitHubStats.mockReturnValue({
      stats: statsWithTrends,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    renderWithQueryClient(<GitHubStatsContainer username="GameBayoumy" />);

    await waitFor(() => {
      const trendUpIcons = screen.getAllByTestId('trend-up');
      expect(trendUpIcons).toHaveLength(2); // followers and stars
      
      const trendNeutralIcon = screen.getByTestId('trend-neutral');
      expect(trendNeutralIcon).toBeInTheDocument(); // forks
    });
  });

  it('should display last update time', async () => {
    mockUseGitHubStats.mockReturnValue({
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    renderWithQueryClient(<GitHubStatsContainer username="GameBayoumy" />);

    await waitFor(() => {
      expect(screen.getByText(/last updated/i)).toBeInTheDocument();
      expect(screen.getByText(/jan 1, 2024/i)).toBeInTheDocument();
    });
  });

  it('should be accessible', async () => {
    mockUseGitHubStats.mockReturnValue({
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    renderWithQueryClient(<GitHubStatsContainer username="GameBayoumy" />);

    await waitFor(() => {
      const statsGrid = screen.getByTestId('stats-grid');
      expect(statsGrid).toHaveAttribute('role', 'region');
      expect(statsGrid).toHaveAttribute('aria-label', 'GitHub statistics');
    });

    // Check that all stat cards have proper accessibility labels
    const statCards = screen.getAllByRole('article');
    expect(statCards).toHaveLength(5); // 5 stat cards

    statCards.forEach(card => {
      expect(card).toHaveAttribute('aria-labelledby');
      expect(card).toHaveAttribute('aria-describedby');
    });
  });

  it('should handle keyboard navigation', async () => {
    mockUseGitHubStats.mockReturnValue({
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    renderWithQueryClient(<GitHubStatsContainer username="GameBayoumy" />);

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    
    // Focus should be manageable
    refreshButton.focus();
    expect(refreshButton).toHaveFocus();

    // Enter key should trigger refresh
    await user.keyboard('{Enter}');
    expect(mockUseGitHubStats().refetch).toHaveBeenCalled();
  });

  it('should handle responsive layout', async () => {
    mockUseGitHubStats.mockReturnValue({
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    const { container } = renderWithQueryClient(
      <GitHubStatsContainer username="GameBayoumy" />
    );

    await waitFor(() => {
      const statsGrid = container.querySelector('[data-testid="stats-grid"]');
      expect(statsGrid).toHaveClass('grid');
      expect(statsGrid).toHaveClass('grid-cols-1');
      expect(statsGrid).toHaveClass('md:grid-cols-3');
      expect(statsGrid).toHaveClass('lg:grid-cols-5');
    });
  });

  it('should auto-refresh at specified interval', async () => {
    const mockRefetch = vi.fn();
    mockUseGitHubStats.mockReturnValue({
      stats: mockStats,
      isLoading: false,
      error: null,
      refetch: mockRefetch
    });

    vi.useFakeTimers();

    renderWithQueryClient(
      <GitHubStatsContainer username="GameBayoumy" refreshInterval={5000} />
    );

    // Fast-forward time by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockRefetch).toHaveBeenCalledTimes(1);

    // Fast-forward another 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockRefetch).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});