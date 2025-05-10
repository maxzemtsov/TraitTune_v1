// /home/ubuntu/traittune/platform/components/assessment/__tests__/ResultsTransition.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResultsTransition from '../ResultsTransition'; // Adjust path

const mockOnViewResults = jest.fn();

describe('ResultsTransition', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state in English when isLoadingResults is true', () => {
    render(
      <ResultsTransition
        onViewResults={mockOnViewResults}
        isLoadingResults={true}
      />
    );
    expect(screen.getByText('Loading results...')).toBeInTheDocument();
    expect(screen.queryByText('Assessment Complete!')).not.toBeInTheDocument();
    expect(screen.queryByText('View Results')).not.toBeInTheDocument();
  });

  it('renders loading state in Russian when isLoadingResults is true and language is "ru"', () => {
    render(
      <ResultsTransition
        onViewResults={mockOnViewResults}
        isLoadingResults={true}
        language="ru"
      />
    );
    expect(screen.getByText('Загрузка результатов...')).toBeInTheDocument();
    expect(screen.queryByText('Оценка Завершена!')).not.toBeInTheDocument();
    expect(screen.queryByText('Посмотреть Результаты')).not.toBeInTheDocument();
  });

  it('renders completed state with English text by default when isLoadingResults is false', () => {
    render(
      <ResultsTransition
        onViewResults={mockOnViewResults}
        isLoadingResults={false}
      />
    );
    expect(screen.getByText('Assessment Complete!')).toBeInTheDocument();
    expect(screen.getByText('Your results are ready to be viewed.')).toBeInTheDocument();
    expect(screen.getByText('View Results')).toBeInTheDocument();
    expect(screen.queryByText('Loading results...')).not.toBeInTheDocument();
  });

  it('renders completed state with Russian text when isLoadingResults is false and language is "ru"', () => {
    render(
      <ResultsTransition
        onViewResults={mockOnViewResults}
        isLoadingResults={false}
        language="ru"
      />
    );
    expect(screen.getByText('Оценка Завершена!')).toBeInTheDocument();
    expect(screen.getByText('Ваши результаты готовы к просмотру.')).toBeInTheDocument();
    expect(screen.getByText('Посмотреть Результаты')).toBeInTheDocument();
    expect(screen.queryByText('Загрузка результатов...')).not.toBeInTheDocument();
  });

  it('calls onViewResults when "View Results" button is clicked', () => {
    render(
      <ResultsTransition
        onViewResults={mockOnViewResults}
        isLoadingResults={false}
      />
    );
    fireEvent.click(screen.getByText('View Results'));
    expect(mockOnViewResults).toHaveBeenCalledTimes(1);
  });

  it('calls onViewResults when "Посмотреть Результаты" button is clicked (Russian)', () => {
    render(
      <ResultsTransition
        onViewResults={mockOnViewResults}
        isLoadingResults={false}
        language="ru"
      />
    );
    fireEvent.click(screen.getByText('Посмотреть Результаты'));
    expect(mockOnViewResults).toHaveBeenCalledTimes(1);
  });
});

