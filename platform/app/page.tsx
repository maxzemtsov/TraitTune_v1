"use client";

import React, { useState } from "react";
import AuthStatus from "../components/AuthStatus";
import RegistrationPrompt from "../components/RegistrationPrompt";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
    const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);
    const { user, isAnonymous } = useAuth();

    // Simulate conditions for showing the registration prompt
    // In a real scenario, this would be triggered by assessment progress
    const handleSimulateAssessmentProgress = () => {
        if (isAnonymous) {
            setShowRegistrationPrompt(true);
        }
    };

    return (
        <main style={{ padding: "20px" }}>
            <h1>Welcome to TraitTune</h1>
            <AuthStatus />
            
            {isAnonymous && (
                <button onClick={handleSimulateAssessmentProgress} style={{ marginTop: "20px" }}>
                    Simulate Assessment Progress (Show Reg Prompt if Guest)
                </button>
            )}

            {showRegistrationPrompt && user && isAnonymous && (
                <RegistrationPrompt 
                    userName={user.user_metadata?.name || "Guest"} 
                    achievedTraits={["Highly Proactive", "Moderately Optimistic"]} 
                    earnedBadges={["Proactive Trailblazer", "Optimistic Balancer"]}
                    onClose={() => setShowRegistrationPrompt(false)} 
                />
            )}

            <div style={{ marginTop: "30px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
                <h2>App Content Area</h2>
                <p>This is where the main application content will go. Authentication status above will determine what the user sees or can do here.</p>
                {user && !isAnonymous && <p>Welcome back, registered user! You have full access.</p>}
                {user && isAnonymous && <p>You are browsing as a guest. Some features might be limited until you register.</p>}
            </div>
        </main>
    );
}

