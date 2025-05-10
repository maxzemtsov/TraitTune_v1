"use client";

import React from "react";
import { useAuth } from "../context/AuthContext";

const AuthStatus = () => {
    const { user, session, isAnonymous, loading, signInWithOAuth, signOut } = useAuth();

    if (loading) {
        return <p>Loading auth status...</p>;
    }

    return (
        <div>
            <h2>Auth Status</h2>
            {user ? (
                <>
                    <p>User ID: {user.id}</p>
                    <p>Email: {user.email || "N/A"}</p>
                    <p>Role: {user.role}</p>
                    <p>Is Anonymous: {isAnonymous ? "Yes" : "No"}</p>
                    {session && <p>Session Expires: {new Date(session.expires_at * 1000).toLocaleString()}</p>}
                    <button onClick={() => signOut()}>Sign Out</button>
                    {isAnonymous && (
                        <>
                            <p>You are currently browsing as a guest.</p>
                            <button onClick={() => signInWithOAuth("google")}>Sign in with Google to save progress</button>
                            <button onClick={() => signInWithOAuth("linkedin")}>Sign in with LinkedIn to save progress</button>
                            {/* Add other OAuth providers as needed */}
                        </>
                    )}
                </>
            ) : (
                <>
                    <p>You are not signed in.</p>
                    {/* signInAnonymously is called automatically by AuthContext if no session */}
                    <button onClick={() => signInWithOAuth("google")}>Sign in with Google</button>
                    <button onClick={() => signInWithOAuth("linkedin")}>Sign in with LinkedIn</button>
                </>
            )}
        </div>
    );
};

export default AuthStatus;

