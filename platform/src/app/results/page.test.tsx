// /home/ubuntu/traittune/platform/app/results/page.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResultsPage from './page'; // Adjust path as necessary
import { useSearchParams } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

// Mock TraitRadarChart component
jest.mock('../components/TraitRadarChart', () => {
  return jest.fn(() => <div data-testid="mock-radar-chart">Mock Radar Chart</div>);
});

// Mock fetch
global.fetch = jest.fn();

const mockEnglishData = {
  userName: "Test User",
  assessmentDate: "May 10, 2025",
  scoreBadgeAvatarUrl: "/placeholder-avatar.png",
  scoreBadgeName: "Test Badge Name EN",
  overallSummary: "Test Summary EN",
  traits: [
    { id: "1", name: "Trait 1 EN", score: 80, segment: "Segment A EN", interpretation: "Interpretation 1 EN", potential: false, detailedInterpretation: "Detailed 1 EN" },
    { id: "2", name: "Trait 2 EN", score: 60, segment: "Segment B EN", interpretation: "Interpretation 2 EN", potential: true, detailedInterpretation: "Detailed 2 EN" },
  ],
  growthTips: ["Tip 1 EN", "Tip 2 EN"],
  lowConfidenceRetake: false,
};

const mockRussianData = {
  userName: "Test User", // userName is not localized in mock
  assessmentDate: "May 10, 2025", // assessmentDate is not localized in mock
  scoreBadgeAvatarUrl: "/placeholder-avatar.png",
  scoreBadgeName: "Тестовое Имя Значка РУ",
  overallSummary: "Тестовое Описание РУ",
  traits: [
    { id: "1", name: "Черта 1 РУ", score: 80, segment: "Сегмент A РУ", interpretation: "Интерпретация 1 РУ", potential: false, detailedInterpretation: "Детально 1 РУ" },
    { id: "2", name: "Черта 2 РУ", score: 60, segment: "Сегмент B РУ", interpretation: "Интерпретация 2 РУ", potential: true, detailedInterpretation: "Детально 2 РУ" },
  ],
  growthTips: ["Совет 1 РУ", "Совет 2 РУ"],
  lowConfidenceRetake: false,
};

describe('ResultsPage', () => {
  beforeEach(() => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue('mock-session-id'), // Provide a mock session ID
    });
    (fetch as jest.Mock).mockClear();
  });

  test('renders loading state initially', () => {
    (fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {})); // Never resolves
    render(<ResultsPage />);
    expect(screen.getByText(/Loading Your Insights...|Загружаем ваши результаты.../i)).toBeInTheDocument();
  });

  test('renders error state if fetch fails', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));
    render(<ResultsPage />);
    expect(await screen.findByText(/Oops! Something Went Wrong|Ой! Что-то пошло не так/i)).toBeInTheDocument();
    expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument();
  });

  test('renders results page with English data successfully', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockEnglishData,
    });
    render(<ResultsPage />);
    expect(await screen.findByText("Test User's TraitTune Insights")).toBeInTheDocument();
    expect(screen.getByText('Test Badge Name EN')).toBeInTheDocument();
    expect(screen.getByText('Test Summary EN')).toBeInTheDocument();
    expect(screen.getByText('Trait 1 EN')).toBeInTheDocument();
    expect(screen.getByTestId('mock-radar-chart')).toBeInTheDocument(); // Check if radar chart is rendered
  });

  test('switches language from English to Russian and displays Russian data', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockEnglishData, // Initial fetch is English
    }).mockResolvedValueOnce({
        ok: true, // This mock won't be used for language switch as it uses local mock data for now
        json: async () => mockRussianData,
    });

    render(<ResultsPage />);
    await screen.findByText("Test User's TraitTune Insights"); // Wait for English to load

    const languageToggle = screen.getByRole('switch', { name: /Switch to Russian language/i });
    fireEvent.click(languageToggle);

    // After language switch, the component re-renders with localized mock data
    // We need to wait for the Russian text to appear
    await waitFor(() => {
        expect(screen.getByText(`Результаты TraitTune для Test User`)).toBeInTheDocument();
    });
    expect(screen.getByText('Тестовое Имя Значка РУ')).toBeInTheDocument();
    expect(screen.getByText('Тестовое Описание РУ')).toBeInTheDocument();
    expect(screen.getByText('Черта 1 РУ')).toBeInTheDocument();
  });

  test('displays "Learn More" and expands trait details', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockEnglishData,
    });
    render(<ResultsPage />);
    await screen.findByText('Trait 1 EN');

    const learnMoreButton = screen.getAllByText(/Learn More/i)[0];
    fireEvent.click(learnMoreButton);
    expect(await screen.findByText('Detailed 1 EN')).toBeInTheDocument();

    fireEvent.click(learnMoreButton); // Click again to hide
    await waitFor(() => {
      expect(screen.queryByText('Detailed 1 EN')).not.toBeInTheDocument();
    });
  });

  test('handles share snapshot button click', async () => {
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } });
    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEnglishData,
      });
    render(<ResultsPage />);
    await screen.findByText("Test User's TraitTune Insights");
    const shareButton = screen.getByRole('button', { name: /Share Public Snapshot/i });
    fireEvent.click(shareButton);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('/results/snapshot/mock-session-id'));
    expect(await screen.findByText(/Link copied to clipboard!/i)).toBeInTheDocument();
  });

  test('handles download PDF button click', async () => {
    window.alert = jest.fn();
    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEnglishData,
      });
    render(<ResultsPage />);
    await screen.findByText("Test User's TraitTune Insights");
    const downloadButton = screen.getByRole('button', { name: /Download Full Report \(PDF\)/i });
    fireEvent.click(downloadButton);
    expect(window.alert).toHaveBeenCalledWith('PDF download functionality is not yet implemented.');
  });

  test('renders with mock data if sessionId is not present in URL', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue(null), // No session ID
      });
    render(<ResultsPage />);    
    // Check for English mock data by default
    expect(await screen.findByText("John Doe's TraitTune Insights")).toBeInTheDocument();
    expect(screen.getByText('Visionary Innovator')).toBeInTheDocument();
    expect(screen.getByText(/Expressive vs. Reserved/i)).toBeInTheDocument();
  });

});

