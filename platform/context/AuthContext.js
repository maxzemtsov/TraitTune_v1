"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAnonymous, setIsAnonymous] = useState(false);

    useEffect(() => {
        const getInitialSession = async () => {
            try {
                setLoading(true);
                const { data: { session: currentSession }, error } = await supabase.auth.getSession();
                if (error) throw error;

                if (currentSession) {
                    setSession(currentSession);
                    setUser(currentSession.user);
                    setIsAnonymous(currentSession.user?.is_anonymous === true || currentSession.user?.aud === "anon");
                } else {
                    // No active session, attempt anonymous sign-in as per TraitTune Onboarding Spec
                    await signInAnonymously();
                }
            } catch (error) {
                console.error("Error getting initial session or signing in anonymously:", error);
                // Handle error appropriately, maybe set an error state
            } finally {
                setLoading(false);
            }
        };

        getInitialSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, newSession) => {
                setLoading(true);
                setSession(newSession);
                setUser(newSession?.user ?? null);
                setIsAnonymous(newSession?.user?.is_anonymous === true || newSession?.user?.aud === "anon");
                setLoading(false);
            }
        );

        return () => {
            authListener?.unsubscribe();
        };
    }, []);

    const signInAnonymously = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.auth.signInAnonymously();
            if (error) throw error;
            if (data.session) {
                setSession(data.session);
                setUser(data.user);
                setIsAnonymous(true);
                console.log("Signed in anonymously:", data.user);
            }
        } catch (error) {
            console.error("Error signing in anonymously:", error);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        session,
        user,
        isAnonymous,
        loading,
        signInWithOAuth: async (provider) => {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({ provider });
            if (error) console.error(`Error signing in with ${provider}:`, error);
            // setLoading(false) will be handled by onAuthStateChange
        },
        signOut: async () => {
            setLoading(true);
            const { error } = await supabase.auth.signOut();
            if (error) console.error("Error signing out:", error);
            // setLoading(false) and user/session reset will be handled by onAuthStateChange
            // After sign out, we might want to sign in anonymously again if that's the desired flow
            await signInAnonymously(); 
        },
        // Add other auth methods like signUpWithEmail, signInWithPassword, linkIdentity as needed
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

