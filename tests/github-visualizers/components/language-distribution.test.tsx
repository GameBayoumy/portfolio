import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageDistribution } from '../../../src/components/github-visualizers/language/LanguageDistribution';
import { useLanguageStats } from '../../../src/hooks/useLanguageStats';
import type { LanguageStats } from '../../../src/types/github.types';

// Mock D3.js
vi.mock('d3', () => ({
  select: vi.fn(() => ({
    selectAll: vi.fn(() => ({
      data: vi.fn(() => ({
        enter: vi.fn(() => ({
          append: vi.fn(() => ({
            attr: vi.fn().mockReturnThis(),
            style: vi.fn().mockReturnThis(),
            text: vi.fn().mockReturnThis(),
            on: vi.fn().mockReturnThis(),
            transition: vi.fn(() => ({
              duration: vi.fn(() => ({
                attr: vi.fn().mockReturnThis(),
                attrTween: vi.fn().mockReturnThis()
              }))
            }))
          }))
        })),
        exit: vi.fn(() => ({
          remove: vi.fn()
        })),
        attr: vi.fn().mockReturnThis(),
        style: vi.fn().mockReturnThis(),
        text: vi.fn().mockReturnThis()
      }))
    })),
    append: vi.fn().mockReturnThis(),
    attr: vi.fn().mockReturnThis(),
    style: vi.fn().mockReturnThis()
  })),
  arc: vi.fn(() => ({
    innerRadius: vi.fn().mockReturnThis(),
    outerRadius: vi.fn().mockReturnThis(),
    startAngle: vi.fn().mockReturnThis(),
    endAngle: vi.fn().mockReturnThis()
  })),
  pie: vi.fn(() => ({
    value: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis()
  })),
  scaleOrdinal: vi.fn(() => ({
    domain: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis()
  })),
  interpolate: vi.fn()
}));

// Mock the custom hook
vi.mock('../../../src/hooks/useLanguageStats');
const mockUseLanguageStats = useLanguageStats as any;

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

describe('LanguageDistribution', () => {
  let user: ReturnType<typeof userEvent.setup>;

  const mockLanguageStats: LanguageStats[] = [
    {
      name: 'TypeScript',
      bytes: 15000,
      percentage: 60.0,
      color: '#3178c6'
    },
    {
      name: 'JavaScript',
      bytes: 8000,
      percentage: 32.0,
      color: '#f1e05a'
    },
    {
      name: 'CSS',
      bytes: 2000,
      percentage: 8.0,
      color: '#563d7c'
    }
  ];

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    mockUseLanguageStats.mockReturnValue({
      languages: [],
      isLoading: true,
      error: null
    });

    renderWithQueryClient(<LanguageDistribution username="GameBayoumy" />);

    expect(screen.getByTestId('language-chart-loading')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading language distribution')).toBeInTheDocument();
  });

  it('should render language distribution chart when data is loaded', async () => {
    mockUseLanguageStats.mockReturnValue({
      languages: mockLanguageStats,
      isLoading: false,
      error: null
    });

    renderWithQueryClient(<LanguageDistribution username="GameBayoumy" />);

    await waitFor(() => {
      expect(screen.getByTestId('language-chart')).toBeInTheDocument();
    });

    // Check that SVG container exists
    expect(screen.getByRole('img', { name: /language distribution/i })).toBeInTheDocument();

    // Check that legend is rendered
    expect(screen.getByTestId('language-legend')).toBeInTheDocument();
  });

  it('should display language legend with correct data', async () => {
    mockUseLanguageStats.mockReturnValue({
      languages: mockLanguageStats,
      isLoading: false,
      error: null
    });

    renderWithQueryClient(<LanguageDistribution username="GameBayoumy" />);

    await waitFor(() => {
      // Check language names
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('CSS')).toBeInTheDocument();

      // Check percentages
      expect(screen.getByText('60.0%')).toBeInTheDocument();
      expect(screen.getByText('32.0%')).toBeInTheDocument();
      expect(screen.getByText('8.0%')).toBeInTheDocument();

      // Check byte counts
      expect(screen.getByText('15.0 KB')).toBeInTheDocument();
      expect(screen.getByText('8.0 KB')).toBeInTheDocument();
      expect(screen.getByText('2.0 KB')).toBeInTheDocument();
    });
  });

  it('should handle empty language data', async () => {
    mockUseLanguageStats.mockReturnValue({
      languages: [],
      isLoading: false,
      error: null
    });

    renderWithQueryClient(<LanguageDistribution username="GameBayoumy" />);

    await waitFor(() => {
      expect(screen.getByTestId('language-empty-state')).toBeInTheDocument();
      expect(screen.getByText('No language data available')).toBeInTheDocument();
    });
  });

  it('should display error state when fetch fails', async () => {
    const mockError = new Error('Failed to fetch language data');
    mockUseLanguageStats.mockReturnValue({
      languages: [],
      isLoading: false,
      error: mockError
    });

    renderWithQueryClient(<LanguageDistribution username="GameBayoumy" />);

    await waitFor(() => {
      expect(screen.getByTestId('language-chart-error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load language distribution')).toBeInTheDocument();
    });
  });

  it('should handle chart interactions', async () => {
    const mockOnLanguageSelect = vi.fn();
    mockUseLanguageStats.mockReturnValue({
      languages: mockLanguageStats,
      isLoading: false,
      error: null
    });

    renderWithQueryClient(
      <LanguageDistribution 
        username="GameBayoumy" 
        onLanguageSelect={mockOnLanguageSelect}
        interactive={true}
      />
    );

    await waitFor(() => {
      const chartContainer = screen.getByTestId('language-chart');
      expect(chartContainer).toBeInTheDocument();
    });

    // Simulate hovering over a chart segment
    const chartSegment = screen.getByTestId('chart-segment-TypeScript');
    await user.hover(chartSegment);

    expect(screen.getByTestId('language-tooltip')).toBeInTheDocument();
    expect(screen.getByText('TypeScript: 60.0%')).toBeInTheDocument();
  });

  it('should handle chart size variations', async () => {
    mockUseLanguageStats.mockReturnValue({
      languages: mockLanguageStats,
      isLoading: false,
      error: null
    });

    const { rerender } = renderWithQueryClient(
      <LanguageDistribution username="GameBayoumy" size="small" />
    );

    await waitFor(() => {
      const chart = screen.getByTestId('language-chart');
      expect(chart).toHaveAttribute('width', '200');
      expect(chart).toHaveAttribute('height', '200');
    });

    // Test medium size
    rerender(
      <QueryClientProvider client={createTestQueryClient()}>
        <LanguageDistribution username="GameBayoumy" size="medium" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      const chart = screen.getByTestId('language-chart');
      expect(chart).toHaveAttribute('width', '300');
      expect(chart).toHaveAttribute('height', '300');
    });

    // Test large size
    rerender(
      <QueryClientProvider client={createTestQueryClient()}>
        <LanguageDistribution username="GameBayoumy" size="large" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      const chart = screen.getByTestId('language-chart');
      expect(chart).toHaveAttribute('width', '400');
      expect(chart).toHaveAttribute('height', '400');
    });
  });

  it('should be accessible', async () => {
    mockUseLanguageStats.mockReturnValue({
      languages: mockLanguageStats,
      isLoading: false,
      error: null
    });

    renderWithQueryClient(<LanguageDistribution username="GameBayoumy" />);

    await waitFor(() => {
      const chart = screen.getByRole('img', { name: /language distribution/i });
      expect(chart).toHaveAttribute('aria-label', 'Language distribution pie chart');
      
      const legend = screen.getByTestId('language-legend');
      expect(legend).toHaveAttribute('role', 'list');
      expect(legend).toHaveAttribute('aria-label', 'Programming languages legend');
    });

    // Check that legend items are properly labeled
    const legendItems = screen.getAllByRole('listitem');
    expect(legendItems).toHaveLength(3);

    legendItems.forEach((item, index) => {
      const language = mockLanguageStats[index];
      expect(item).toHaveAttribute('aria-label', 
        `${language.name}: ${language.percentage}% (${(language.bytes / 1000).toFixed(1)} KB)`
      );
    });
  });

  it('should handle responsive layout', async () => {
    mockUseLanguageStats.mockReturnValue({
      languages: mockLanguageStats,
      isLoading: false,
      error: null
    });

    const { container } = renderWithQueryClient(
      <LanguageDistribution username="GameBayoumy" />
    );

    await waitFor(() => {
      const chartContainer = container.querySelector('[data-testid="language-chart-container"]');
      expect(chartContainer).toHaveClass('flex');
      expect(chartContainer).toHaveClass('flex-col');
      expect(chartContainer).toHaveClass('lg:flex-row');
    });
  });

  it('should update when username changes', async () => {
    mockUseLanguageStats.mockReturnValue({
      languages: mockLanguageStats,
      isLoading: false,
      error: null
    });

    const { rerender } = renderWithQueryClient(
      <LanguageDistribution username="GameBayoumy" />
    );

    await waitFor(() => {
      expect(screen.getByTestId('language-chart')).toBeInTheDocument();
    });

    // Change username
    mockUseLanguageStats.mockReturnValue({
      languages: [],
      isLoading: true,
      error: null
    });

    rerender(
      <QueryClientProvider client={createTestQueryClient()}>
        <LanguageDistribution username="AnotherUser" />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('language-chart-loading')).toBeInTheDocument();
  });

  it('should format byte sizes correctly', async () => {
    const largeLanguageStats: LanguageStats[] = [
      {
        name: 'TypeScript',
        bytes: 1500000, // 1.5 MB
        percentage: 75.0,
        color: '#3178c6'
      },
      {
        name: 'JavaScript',
        bytes: 500000, // 500 KB
        percentage: 25.0,
        color: '#f1e05a'
      }
    ];

    mockUseLanguageStats.mockReturnValue({
      languages: largeLanguageStats,
      isLoading: false,
      error: null
    });

    renderWithQueryClient(<LanguageDistribution username="GameBayoumy" />);

    await waitFor(() => {
      expect(screen.getByText('1.5 MB')).toBeInTheDocument();
      expect(screen.getByText('500.0 KB')).toBeInTheDocument();
    });
  });

  it('should handle animation preferences', async () => {
    mockUseLanguageStats.mockReturnValue({
      languages: mockLanguageStats,
      isLoading: false,
      error: null
    });

    // Mock reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    renderWithQueryClient(
      <LanguageDistribution username="GameBayoumy" respectMotionPreference={true} />
    );

    await waitFor(() => {
      const chart = screen.getByTestId('language-chart');
      expect(chart).toHaveAttribute('data-animation', 'reduced');
    });
  });
});