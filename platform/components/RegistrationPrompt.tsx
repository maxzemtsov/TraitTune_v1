"use client";

import React from "react";
import { useAuth } from "../context/AuthContext"; // Assuming AuthContext is in ../context/

interface RegistrationPromptProps {
    userName?: string;
    achievedTraits?: string[]; // e.g., ["Highly Proactive", "Moderately Optimistic"]
    earnedBadges?: string[]; // e.g., ["Proactive Trailblazer", "Optimistic Balancer"]
    onClose: () => void; // Function to close or hide the prompt
    language?: "en" | "ru"; // To handle bilingual messages
}

const RegistrationPrompt: React.FC<RegistrationPromptProps> = ({ 
    userName,
    achievedTraits = [], 
    earnedBadges = [],
    onClose,
    language = "en" // Default to English
}) => {
    const { signInWithOAuth, loading } = useAuth();

    const handleOAuthSignIn = async (provider: "google" | "linkedin" | "github" | "apple" | "facebook") => {
        try {
            await signInWithOAuth(provider);
            // onClose(); // Optionally close after initiating
        } catch (error) {
            console.error(`Error during ${provider} sign-in:`, error);
        }
    };

    const defaultName = language === "ru" ? "Гость" : "Guest";
    const currentName = userName || defaultName;

    let messageIntro = language === "ru" 
        ? `${currentName}, я начинаю тебя лучше понимать!` 
        : `${currentName}, I’m getting to know you better!`;
    
    let traitsSummary = "";
    if (achievedTraits.length > 0) {
        const traitsString = achievedTraits.join(language === "ru" ? " и " : " and ");
        traitsSummary = language === "ru"
            ? ` На данный момент ты ${traitsString}.`
            : ` So far, you’re ${traitsString}.`;
    }
    
    let badgesSummary = "";
    if (earnedBadges.length > 0) {
        const badgesString = earnedBadges.join(language === "ru" ? " и " : " and ");
        badgesSummary = language === "ru"
            ? ` Поздравляю, ты получил значки ${badgesString}!`
            : ` Awesome job earning the ${badgesString} badges!`;
    }

    const callToAction = language === "ru"
        ? " Хочешь сохранить прогресс и получить персонализированные выводы? Зарегистрируйся через email или подключи один из вариантов ниже — это всего 10 секунд, и мы продолжим с того же места!"
        : " Want to save your progress and unlock personalized insights? Sign up with email or connect via an option below—it’s just 10 seconds, and we’ll pick up right here!";

    const fullMessage = `${messageIntro}${traitsSummary}${badgesSummary}${callToAction}`;

    return (
        <div style={{ border: "1px solid #ccc", padding: "20px", margin: "20px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
            <h3>{language === "ru" ? "Разблокируй свой полный профиль!" : "Unlock Your Full Profile!"}</h3>
            <p>{fullMessage}</p>
            <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <button onClick={() => handleOAuthSignIn("google")} disabled={loading} style={{padding: "10px", cursor: loading ? "not-allowed" : "pointer"}}>
                    {loading ? (language === "ru" ? "Обработка..." : "Processing...") : (language === "ru" ? "Продолжить с Google" : "Continue with Google")}
                </button>
                <button onClick={() => handleOAuthSignIn("linkedin")} disabled={loading} style={{padding: "10px", cursor: loading ? "not-allowed" : "pointer"}}>
                    {loading ? (language === "ru" ? "Обработка..." : "Processing...") : (language === "ru" ? "Продолжить с LinkedIn" : "Continue with LinkedIn")}
                </button>
            </div>
            <button onClick={onClose} style={{ marginTop: "20px", padding: "10px", cursor: "pointer" }}>
                {language === "ru" ? "Может быть позже" : "Maybe Later"}
            </button>
        </div>
    );
};

export default RegistrationPrompt;

