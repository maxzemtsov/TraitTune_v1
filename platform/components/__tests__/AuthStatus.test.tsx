// /home/ubuntu/traittune/platform/components/__tests__/AuthStatus.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AuthStatus from "../AuthStatus"; // Path to AuthStatus.tsx from components/__tests__/

// Mock the useAuth hook
const mockSignInWithOAuth = jest.fn();
const mockSignOut = jest.fn();
let mockUseAuthData = {};

const mockUseAuth = jest.fn(() => mockUseAuthData);

// Corrected path to AuthContext from components/__tests__/
// Assuming AuthContext.tsx is in /home/ubuntu/traittune/platform/context/AuthContext.tsx
jest.mock("../../context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("AuthStatus", () => {
  beforeEach(() => {
    // Reset mocks and mock data before each test
    mockSignInWithOAuth.mockClear();
    mockSignOut.mockClear();
    mockUseAuthData = {
      user: null,
      session: null,
      isAnonymous: false,
      loading: false,
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
    };
    mockUseAuth.mockReturnValue(mockUseAuthData); // Ensure the mock function returns the updated data
  });

  it("renders loading state", () => {
    mockUseAuthData.loading = true;
    mockUseAuth.mockReturnValue(mockUseAuthData);
    render(<AuthStatus />);
    expect(screen.getByText("Loading auth status...")).toBeInTheDocument();
  });

  it("renders not signed in state and allows sign-in", () => {
    render(<AuthStatus />);
    expect(screen.getByText("You are not signed in.")).toBeInTheDocument();
    const googleButton = screen.getByText("Sign in with Google");
    fireEvent.click(googleButton);
    expect(mockSignInWithOAuth).toHaveBeenCalledWith("google");

    const linkedInButton = screen.getByText("Sign in with LinkedIn");
    fireEvent.click(linkedInButton);
    expect(mockSignInWithOAuth).toHaveBeenCalledWith("linkedin");
  });

  it("renders anonymous user state correctly", () => {
    mockUseAuthData.user = { id: "anon-123", email: null, role: "anon" };
    mockUseAuthData.isAnonymous = true;
    mockUseAuthData.session = { expires_at: Date.now() / 1000 + 3600 };
    mockUseAuth.mockReturnValue(mockUseAuthData);

    render(<AuthStatus />);
    expect(screen.getByText("User ID: anon-123")).toBeInTheDocument();
    expect(screen.getByText("Email: N/A")).toBeInTheDocument();
    expect(screen.getByText("Role: anon")).toBeInTheDocument();
    expect(screen.getByText("Is Anonymous: Yes")).toBeInTheDocument();
    expect(screen.getByText(/Session Expires:/i)).toBeInTheDocument();
    expect(screen.getByText("You are currently browsing as a guest.")).toBeInTheDocument();

    const googleButton = screen.getByText("Sign in with Google to save progress");
    fireEvent.click(googleButton);
    expect(mockSignInWithOAuth).toHaveBeenCalledWith("google");

    const linkedInButton = screen.getByText("Sign in with LinkedIn to save progress");
    fireEvent.click(linkedInButton);
    expect(mockSignInWithOAuth).toHaveBeenCalledWith("linkedin");

    const signOutButton = screen.getByText("Sign Out");
    fireEvent.click(signOutButton);
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("renders registered user state correctly", () => {
    mockUseAuthData.user = { id: "user-456", email: "test@example.com", role: "authenticated" };
    mockUseAuthData.isAnonymous = false;
    mockUseAuthData.session = { expires_at: Date.now() / 1000 + 7200 };
    mockUseAuth.mockReturnValue(mockUseAuthData);

    render(<AuthStatus />);
    expect(screen.getByText("User ID: user-456")).toBeInTheDocument();
    expect(screen.getByText("Email: test@example.com")).toBeInTheDocument();
    expect(screen.getByText("Role: authenticated")).toBeInTheDocument();
    expect(screen.getByText("Is Anonymous: No")).toBeInTheDocument();
    expect(screen.getByText(/Session Expires:/i)).toBeInTheDocument();

    expect(screen.queryByText("You are currently browsing as a guest.")).not.toBeInTheDocument();
    expect(screen.queryByText("Sign in with Google to save progress")).not.toBeInTheDocument();

    const signOutButton = screen.getByText("Sign Out");
    fireEvent.click(signOutButton);
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("does not show session expiry if session is null", () => {
    mockUseAuthData.user = { id: "user-789", email: "another@example.com", role: "authenticated" };
    mockUseAuthData.isAnonymous = false;
    mockUseAuthData.session = null;
    mockUseAuth.mockReturnValue(mockUseAuthData);

    render(<AuthStatus />);
    expect(screen.getByText("User ID: user-789")).toBeInTheDocument();
    expect(screen.queryByText(/Session Expires:/i)).not.toBeInTheDocument();
  });
});

