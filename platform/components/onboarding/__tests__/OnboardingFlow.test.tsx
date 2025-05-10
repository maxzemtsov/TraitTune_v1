// /home/ubuntu/traittune/platform/components/onboarding/__tests__/OnboardingFlow.test.tsx
import React, { useState, useEffect } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import AuthStatus from "../../AuthStatus";
import RegistrationPrompt from "../../RegistrationPrompt"; // Corrected path

const mockSignInAnonymously = jest.fn(() => Promise.resolve({ user: { id: "anon-test-user", email: null, role: "anon" }, session: { expires_at: Date.now() / 1000 + 3600 } }));
const mockSignInWithOAuth = jest.fn(() => Promise.resolve());
const mockSignOut = jest.fn(() => Promise.resolve());

let mockAuthContextState = {
  user: null,
  session: null,
  isAnonymous: false,
  loading: true,
  signInAnonymously: mockSignInAnonymously,
  signInWithOAuth: mockSignInWithOAuth,
  signOut: mockSignOut,
  error: null,
};

// Mock supabaseClient to prevent environment variable errors
jest.mock("../../../lib/supabaseClient", () => ({
  supabase: {
    auth: {
      signInAnonymously: mockSignInAnonymously,
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    // Add other Supabase services if they are accessed by AuthContext directly
  },
}));

// Custom hook mock that we can control
jest.mock("../../../context/AuthContext", () => {
  // const originalModule = jest.requireActual("../../../context/AuthContext"); // Avoid requireActual if it pulls in supabaseClient
  return {
    // ...originalModule, // Avoid spreading original module if it initializes supabase
    useAuth: () => mockAuthContextState,
    AuthProvider: ({ children }) => <div>{children}</div>, // Mock AuthProvider if needed by OnboardingJourney structure
  };
});


// A mock parent component to simulate the onboarding flow
const OnboardingJourney = () => {
  const { user, isAnonymous, loading } = jest.requireMock("../../../context/AuthContext").useAuth();
  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);

  useEffect(() => {
    if (isAnonymous && user && !loading) {
      const timer = setTimeout(() => {
        setShowRegistrationPrompt(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, isAnonymous, loading]);

  const handleClosePrompt = () => {
    setShowRegistrationPrompt(false);
  };

  if (loading && !user) {
    return <p>Initializing Onboarding...</p>;
  }

  return (
    <div>
      <h1>Onboarding Flow</h1>
      <AuthStatus />
      {isAnonymous && showRegistrationPrompt && (
        <RegistrationPrompt 
          userName={user?.id === "anon-test-user" ? "Guest" : user?.email || "User"}
          achievedTraits={["Trait A", "Trait B"]}
          earnedBadges={["Badge X", "Badge Y"]}
          onClose={handleClosePrompt} 
        />
      )}
      {!isAnonymous && user && <p>Welcome, registered user: {user.email}!</p>}
    </div>
  );
};

describe("Overall Onboarding Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthContextState = {
      user: null,
      session: null,
      isAnonymous: false,
      loading: true,
      signInAnonymously: mockSignInAnonymously,
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
      error: null,
    };
  });

  test("starts with loading, then shows anonymous user status and eventually registration prompt", async () => {
    render(<OnboardingJourney />); 
    expect(screen.getByText("Initializing Onboarding...")).toBeInTheDocument();

    await act(async () => {
      mockAuthContextState.loading = false;
      mockAuthContextState.user = { id: "anon-test-user", email: null, role: "anon" };
      mockAuthContextState.isAnonymous = true;
      mockAuthContextState.session = { expires_at: Date.now() / 1000 + 3600 };
    });
    
    render(<OnboardingJourney />);

    expect(screen.getByText("User ID: anon-test-user")).toBeInTheDocument();
    expect(screen.getByText("Is Anonymous: Yes")).toBeInTheDocument();

    await screen.findByText("Unlock Your Full Profile!");
    expect(screen.getByText(/Guest, I’m getting to know you better!/i)).toBeInTheDocument();
    expect(screen.getByText(/So far, you’re Trait A and Trait B./i)).toBeInTheDocument();
    expect(screen.getByText(/Awesome job earning the Badge X and Badge Y badges!/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Continue with Google"));
    expect(mockSignInWithOAuth).toHaveBeenCalledWith("google");
  });

  test("registration prompt is not shown if user is already registered", async () => {
    await act(async () => {
      mockAuthContextState.loading = false;
      mockAuthContextState.user = { id: "reg-user-123", email: "test@example.com", role: "authenticated" };
      mockAuthContextState.isAnonymous = false;
      mockAuthContextState.session = { expires_at: Date.now() / 1000 + 3600 };
    });
    
    render(<OnboardingJourney />);

    expect(screen.getByText("User ID: reg-user-123")).toBeInTheDocument();
    expect(screen.getByText("Is Anonymous: No")).toBeInTheDocument();
    expect(screen.getByText("Welcome, registered user: test@example.com!")).toBeInTheDocument();
    expect(screen.queryByText("Unlock Your Full Profile!")).not.toBeInTheDocument();
  });

  test("registration prompt can be closed", async () => {
    await act(async () => {
      mockAuthContextState.loading = false;
      mockAuthContextState.user = { id: "anon-test-user-2", email: null, role: "anon" };
      mockAuthContextState.isAnonymous = true;
      mockAuthContextState.session = { expires_at: Date.now() / 1000 + 3600 };
    });

    render(<OnboardingJourney />);
    await screen.findByText("Unlock Your Full Profile!");

    fireEvent.click(screen.getByText("Maybe Later"));
    expect(screen.queryByText("Unlock Your Full Profile!")).not.toBeInTheDocument();
  });

});

