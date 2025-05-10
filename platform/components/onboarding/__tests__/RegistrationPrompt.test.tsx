// /home/ubuntu/traittune/platform/components/onboarding/__tests__/RegistrationPrompt.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
// Corrected path: RegistrationPrompt.tsx is in /components, test is in /components/onboarding/__tests__
import RegistrationPrompt from "../../RegistrationPrompt"; 

// Mock the useAuth hook
const mockSignInWithOAuth = jest.fn();
const mockUseAuth = jest.fn(() => ({
  signInWithOAuth: mockSignInWithOAuth,
  loading: false,
}));

// Corrected path to AuthContext from components/onboarding/__tests__/
// Assuming AuthContext.tsx is in /home/ubuntu/traittune/platform/context/AuthContext.tsx
jest.mock("../../../context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("RegistrationPrompt", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    mockSignInWithOAuth.mockClear();
    mockOnClose.mockClear();
    mockUseAuth.mockReturnValue({
      signInWithOAuth: mockSignInWithOAuth,
      loading: false,
    });
  });

  it("renders with default props and English text", () => {
    render(<RegistrationPrompt onClose={mockOnClose} />);
    expect(screen.getByText("Unlock Your Full Profile!")).toBeInTheDocument();
    expect(screen.getByText(/Guest, I’m getting to know you better!/i)).toBeInTheDocument();
    expect(screen.getByText(/Want to save your progress and unlock personalized insights\?/i)).toBeInTheDocument();
    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
    expect(screen.getByText("Continue with LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("Maybe Later")).toBeInTheDocument();
  });

  it("renders with a user name in English", () => {
    render(<RegistrationPrompt onClose={mockOnClose} userName="Tester" />);
    expect(screen.getByText(/Tester, I’m getting to know you better!/i)).toBeInTheDocument();
  });

  it("renders with achieved traits and badges in English", () => {
    render(
      <RegistrationPrompt 
        onClose={mockOnClose} 
        userName="Jane"
        achievedTraits={["Highly Proactive", "Moderately Optimistic"]}
        earnedBadges={["Proactive Trailblazer", "Optimistic Balancer"]}
      />
    );
    expect(screen.getByText(/Jane, I’m getting to know you better!/i)).toBeInTheDocument();
    expect(screen.getByText(/So far, you’re Highly Proactive and Moderately Optimistic./i)).toBeInTheDocument();
    expect(screen.getByText(/Awesome job earning the Proactive Trailblazer and Optimistic Balancer badges!/i)).toBeInTheDocument();
  });

  it("renders with Russian text when language prop is \"ru\"", () => {
    render(<RegistrationPrompt onClose={mockOnClose} language="ru" />);
    expect(screen.getByText("Разблокируй свой полный профиль!")).toBeInTheDocument();
    expect(screen.getByText(/Гость, я начинаю тебя лучше понимать!/i)).toBeInTheDocument();
    expect(screen.getByText(/Хочешь сохранить прогресс и получить персонализированные выводы\?/i)).toBeInTheDocument();
    expect(screen.getByText("Продолжить с Google")).toBeInTheDocument();
    expect(screen.getByText("Продолжить с LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("Может быть позже")).toBeInTheDocument();
  });

  it("renders with user name, traits, and badges in Russian", () => {
    render(
      <RegistrationPrompt 
        onClose={mockOnClose} 
        userName="Иван"
        achievedTraits={["Очень Проактивный", "Умеренно Оптимистичный"]}
        earnedBadges={["Проактивный Первопроходец", "Оптимистичный Балансировщик"]}
        language="ru"
      />
    );
    expect(screen.getByText(/Иван, я начинаю тебя лучше понимать!/i)).toBeInTheDocument();
    expect(screen.getByText(/На данный момент ты Очень Проактивный и Умеренно Оптимистичный./i)).toBeInTheDocument();
    expect(screen.getByText(/Поздравляю, ты получил значки Проактивный Первопроходец и Оптимистичный Балансировщик!/i)).toBeInTheDocument();
  });

  it("calls signInWithOAuth with \"google\" when Google button is clicked", () => {
    render(<RegistrationPrompt onClose={mockOnClose} />);
    fireEvent.click(screen.getByText("Continue with Google"));
    expect(mockSignInWithOAuth).toHaveBeenCalledWith("google");
  });

  it("calls signInWithOAuth with \"linkedin\" when LinkedIn button is clicked", () => {
    render(<RegistrationPrompt onClose={mockOnClose} />);
    fireEvent.click(screen.getByText("Continue with LinkedIn"));
    expect(mockSignInWithOAuth).toHaveBeenCalledWith("linkedin");
  });

  it("calls onClose when \"Maybe Later\" button is clicked", () => {
    render(<RegistrationPrompt onClose={mockOnClose} />);
    fireEvent.click(screen.getByText("Maybe Later"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("disables OAuth buttons and shows loading text when loading is true", () => {
    mockUseAuth.mockReturnValue({
      signInWithOAuth: mockSignInWithOAuth,
      loading: true,
    });
    render(<RegistrationPrompt onClose={mockOnClose} />);
    const googleButton = screen.getByText("Processing...");
    expect(googleButton).toBeInTheDocument();
    expect(googleButton.closest("button")).toBeDisabled();

    const linkedInButton = screen.getAllByText("Processing...")[1];
    expect(linkedInButton).toBeInTheDocument();
    expect(linkedInButton.closest("button")).toBeDisabled();
  });

  it("disables OAuth buttons and shows loading text in Russian when loading is true and language is \"ru\"", () => {
    mockUseAuth.mockReturnValue({
        signInWithOAuth: mockSignInWithOAuth,
        loading: true,
    });
    render(<RegistrationPrompt onClose={mockOnClose} language="ru" />);
    const googleButton = screen.getByText("Обработка...");
    expect(googleButton).toBeInTheDocument();
    expect(googleButton.closest("button")).toBeDisabled();

    const linkedInButton = screen.getAllByText("Обработка...")[1];
    expect(linkedInButton).toBeInTheDocument();
    expect(linkedInButton.closest("button")).toBeDisabled();
  });

});

