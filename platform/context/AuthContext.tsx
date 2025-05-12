"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of your authentication context
interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  signInWithOAuth: (provider: string) => Promise<void>;
  loading: boolean;
  user: any; // Replace 'any' with a more specific user type if available
  isAnonymous: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null); // Replace 'any' with a more specific user type
  const [isAnonymous, setIsAnonymous] = useState(true);

  const login = () => {
    // Placeholder login logic
    setIsAuthenticated(true);
    setIsAnonymous(false); // Assuming login makes user non-anonymous
    setUser({ name: "Test User", email: "test@example.com" }); // Example user
    console.log("User logged in (placeholder)");
  };

  const logout = () => {
    // Placeholder logout logic
    setIsAuthenticated(false);
    setUser(null);
    setIsAnonymous(true); // Reset to anonymous on logout
    console.log("User logged out (placeholder)");
  };

  const signInWithOAuth = async (provider: string) => {
    setLoading(true);
    console.log(`Attempting to sign in with ${provider} (placeholder)`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Simulate a successful OAuth login
    setIsAuthenticated(true);
    setIsAnonymous(false);
    setUser({ name: `${provider} User`, email: `${provider.toLowerCase()}@example.com`, provider });
    setLoading(false);
    console.log(`Signed in with ${provider} (placeholder)`);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, signInWithOAuth, loading, user, isAnonymous }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

