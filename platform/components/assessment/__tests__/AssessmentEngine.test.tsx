// /home/ubuntu/traittune/platform/components/assessment/__tests__/AssessmentEngine.test.tsx
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssessmentEngine, { Question } from '../AssessmentEngine'; // Adjust path

const mockOnQuestionAnswered = jest.fn();
const mockOnDimensionComplete = jest.fn();
const mockOnAssessmentComplete = jest.fn();

const sampleQuestions: Question[] = [
  {
    id: 'q1_dim1',
    text_en: 'Dim1 Question 1 EN',
    text_ru: 'Dim1 Вопрос 1 RU',
    type: 'Likert',
    dimensionId: 'dim1',
    answerOptions: [
      { id: 'opt1', text_en: 'Opt1 EN', text_ru: 'Opt1 RU', value: 1 },
      { id: 'opt2', text_en: 'Opt2 EN', text_ru: 'Opt2 RU', value: 2 },
    ],
  },
  {
    id: 'q2_dim1',
    text_en: 'Dim1 Question 2 EN (Open)',
    text_ru: 'Dim1 Вопрос 2 RU (Открытый)',
    type: 'Open',
    dimensionId: 'dim1',
  },
  {
    id: 'q1_dim2',
    text_en: 'Dim2 Question 1 EN',
    text_ru: 'Dim2 Вопрос 1 RU',
    type: 'Likert',
    dimensionId: 'dim2',
    answerOptions: [
      { id: 'opt3', text_en: 'Opt3 EN', text_ru: 'Opt3 RU', value: 3 },
    ],
  },
];

describe('AssessmentEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially if no questions for the dimension', () => {
    render(
      <AssessmentEngine
        questions={[]}
        initialDimension="dim1"
        onQuestionAnswered={mockOnQuestionAnswered}
        onDimensionComplete={mockOnDimensionComplete}
        onAssessmentComplete={mockOnAssessmentComplete}
      />
    );
    expect(screen.getByText('Loading questions...')).toBeInTheDocument();
  });

  it('renders the first question of the initial dimension in English by default', () => {
    render(
      <AssessmentEngine
        questions={sampleQuestions}
        initialDimension="dim1"
        onQuestionAnswered={mockOnQuestionAnswered}
        onDimensionComplete={mockOnDimensionComplete}
        onAssessmentComplete={mockOnAssessmentComplete}
      />
    );
    expect(screen.getByText('Dimension: dim1')).toBeInTheDocument();
    expect(screen.getByText('Dim1 Question 1 EN')).toBeInTheDocument();
    expect(screen.getByText('Opt1 EN')).toBeInTheDocument();
  });

  it('renders the first question of the initial dimension in Russian when specified', () => {
    render(
      <AssessmentEngine
        questions={sampleQuestions}
        initialDimension="dim1"
        onQuestionAnswered={mockOnQuestionAnswered}
        onDimensionComplete={mockOnDimensionComplete}
        onAssessmentComplete={mockOnAssessmentComplete}
        language="ru"
      />
    );
    expect(screen.getByText('Вопрос по измерению: dim1')).toBeInTheDocument();
    expect(screen.getByText('Dim1 Вопрос 1 RU')).toBeInTheDocument();
    expect(screen.getByText('Opt1 RU')).toBeInTheDocument();
  });

  it('calls onQuestionAnswered and proceeds to the next question in the same dimension', () => {
    render(
      <AssessmentEngine
        questions={sampleQuestions}
        initialDimension="dim1"
        onQuestionAnswered={mockOnQuestionAnswered}
        onDimensionComplete={mockOnDimensionComplete}
        onAssessmentComplete={mockOnAssessmentComplete}
      />
    );

    fireEvent.click(screen.getByText('Opt1 EN'));
    expect(mockOnQuestionAnswered).toHaveBeenCalledWith('q1_dim1', 1, 'dim1');
    expect(screen.getByText('Dim1 Question 2 EN (Open)')).toBeInTheDocument(); // Next question
    expect(screen.getByText('Answered: 1')).toBeInTheDocument();
  });

  it('handles open-ended questions', () => {
    const questionsForOpenTest = sampleQuestions.filter(q => q.dimensionId === 'dim1');
    render(
      <AssessmentEngine
        questions={questionsForOpenTest}
        initialDimension="dim1"
        onQuestionAnswered={mockOnQuestionAnswered}
        onDimensionComplete={mockOnDimensionComplete}
        onAssessmentComplete={mockOnAssessmentComplete}
      />
    );

    fireEvent.click(screen.getByText('Opt1 EN')); 
    expect(mockOnQuestionAnswered).toHaveBeenCalledWith('q1_dim1', 1, 'dim1');
    expect(screen.getByText('Dim1 Question 2 EN (Open)')).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText('Your answer...');
    fireEvent.change(textarea, { target: { value: 'My open answer' } });
    fireEvent.blur(textarea); 

    expect(mockOnQuestionAnswered).toHaveBeenCalledWith('q2_dim1', 'My open answer', 'dim1');
    expect(screen.getByText('Answered: 2')).toBeInTheDocument();
  });

  it('calls onDimensionComplete and moves to the next dimension when all questions in a dimension are answered', () => {
    render(
      <AssessmentEngine
        questions={sampleQuestions}
        initialDimension="dim1"
        onQuestionAnswered={mockOnQuestionAnswered}
        onDimensionComplete={mockOnDimensionComplete}
        onAssessmentComplete={mockOnAssessmentComplete}
      />
    );

    fireEvent.click(screen.getByText('Opt1 EN'));
    expect(mockOnQuestionAnswered).toHaveBeenCalledWith('q1_dim1', 1, 'dim1');

    const textarea = screen.getByPlaceholderText('Your answer...');
    fireEvent.change(textarea, { target: { value: 'Open answer for dim1' } });
    fireEvent.blur(textarea);
    expect(mockOnQuestionAnswered).toHaveBeenCalledWith('q2_dim1', 'Open answer for dim1', 'dim1');

    expect(mockOnDimensionComplete).toHaveBeenCalledWith(
      'dim1',
      expect.any(Number),
      expect.any(Number) 
    );

    expect(screen.getByText('Dimension: dim2')).toBeInTheDocument();
    expect(screen.getByText('Dim2 Question 1 EN')).toBeInTheDocument();
    expect(screen.getByText('Answered: 0')).toBeInTheDocument();
  });

  it('calls onAssessmentComplete when all dimensions are completed', () => {
    render(
      <AssessmentEngine
        questions={sampleQuestions}
        initialDimension="dim1"
        onQuestionAnswered={mockOnQuestionAnswered}
        onDimensionComplete={mockOnDimensionComplete}
        onAssessmentComplete={mockOnAssessmentComplete}
      />
    );

    fireEvent.click(screen.getByText('Opt1 EN')); 
    const textarea = screen.getByPlaceholderText('Your answer...');
    fireEvent.change(textarea, { target: { value: 'Open answer' } });
    fireEvent.blur(textarea); 
    expect(mockOnDimensionComplete).toHaveBeenCalledWith('dim1', expect.any(Number), expect.any(Number));

    expect(screen.getByText('Dim2 Question 1 EN')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Opt3 EN')); 
    expect(mockOnDimensionComplete).toHaveBeenCalledWith('dim2', expect.any(Number), expect.any(Number));

    expect(mockOnAssessmentComplete).toHaveBeenCalledTimes(1);
  });

  it('completes assessment if only one dimension is provided and all its questions are answered', () => {
    const onlyDim1Questions = sampleQuestions.filter(q => q.dimensionId === 'dim1');
    render(
      <AssessmentEngine
        questions={onlyDim1Questions}
        initialDimension="dim1"
        onQuestionAnswered={mockOnQuestionAnswered}
        onDimensionComplete={mockOnDimensionComplete}
        onAssessmentComplete={mockOnAssessmentComplete}
      />
    );

    fireEvent.click(screen.getByText('Opt1 EN'));
    const textarea = screen.getByPlaceholderText('Your answer...');
    fireEvent.change(textarea, { target: { value: 'Final open answer' } });
    fireEvent.blur(textarea);

    expect(mockOnDimensionComplete).toHaveBeenCalledWith('dim1', expect.any(Number), expect.any(Number));
    expect(mockOnAssessmentComplete).toHaveBeenCalledTimes(1);
  });

});

