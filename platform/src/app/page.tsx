"use client";

import { toast } from 'sonner';
// ... (rest of the imports)

// ... (rest of the code)

// Example of replacing useToast with sonner's toast
// Old: toast({ title: 'Error', description: 'Something went wrong' });
// New: toast.error('Something went wrong'); // Or toast('Something went wrong') for a generic message
// Or toast.success('Success!') for success messages

// Replace this line
// import { useToast } from "@/components/ui/use-toast";
// With this line (if not already present, or adjust as needed)
// import { toast } from 'sonner'; // Assuming sonner is installed and configured

// ... (rest of AssessmentPage component, ensure all `toast({...})` calls are updated)

// In useEffect for Auth State Change & Initial Anonymous Sign-in:
// Replace:
// toast({ title: t("error.title"), description: t("error.anonymous_signin_failed") + (error.message ? `: ${error.message}` : ""), variant: "destructive" });
// With (example - adjust severity/type as needed):
// toast.error(t("error.anonymous_signin_failed") + (error.message ? `: ${error.message}` : ""));

// In handleUserResponse, for submissionResult.success and submissionResult.error:
// Replace similar toast calls with sonner's equivalents, e.g.:
// if (submissionResult.success) {
//     toast.success(t("assessment.answer_acknowledged"));
// } else {
//     toast.error(t("error.answer_submission_failed") + (submissionResult.message ? `: ${submissionResult.message}` : ""));
// }

// Make sure to import `toast` from `sonner` at the top of the file if it's not already there.
// import { toast } from 'sonner';

// /home/ubuntu/traittune_frontend/src/app/assessment/page.tsx
// Integrating API calls for fetching questions and submitting answers

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient"; 
import type { Provider } from "@supabase/supabase-js";
import { getNextQuestion, submitAnswer, UserAnswer } from "@/lib/api"; // Import API functions

import ChatWindow from "@/components/ChatWindow"; 
import ChatInput from "@/components/ChatInput";
import OliviaSphere from "@/components/OliviaSphere";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SunIcon, MoonIcon, SpeakerLoudIcon, SpeakerOffIcon, ChatBubbleIcon, PersonIcon, MicrophoneIcon, CheckCircledIcon } from "@radix-ui/react-icons"; 
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

// import { toast } from 'sonner'; // Corrected import for sonner - This was duplicated, removed one.
import { useI18n } from "@/components/providers/I18nProvider";

export interface MessageOption {
  value: string;
  label: string; 
}

export interface Message {
  id: string;
  text: string; 
  sender: "user" | "bot" | "system";
  timestamp: Date;
  questionType?: "text" | "single-choice" | "multi-choice" | "likert" | "forced-choice";
  options?: MessageOption[];
  requiresInput?: boolean; 
  question_id?: string; // To store the ID of the question if it came from the backend
}

const AssessmentPage = () => {
  const router = useRouter();
  // const { toast } = useToast(); // Removed useToast hook
  const { t, setLocale, locale } = useI18n();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null); 
  const [assessmentPhase, setAssessmentPhase] = useState<"initial_greeting" | "name_prompt" | "goal_prompt" | "ice_breaker_prompt" | "metadata_prompt" | "consent_prompt" | "assessment_questions" | "registration_prompt" | "results">("initial_greeting");
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(undefined); // For managing assessment sessions

  const [currentMode, setCurrentMode] = useState<"chat" | "dialogue">("chat"); 
  const [isMuted, setIsMuted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const toggleTheme = () => setTheme(prevTheme => (prevTheme === "light" ? "dark" : "light"));
  const toggleLanguage = () => setLocale(locale === "en" ? "ru" : "en");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const addMessage = useCallback((newMessage: Omit<Message, "id" | "timestamp">) => {
    setMessages(prev => [...prev, { ...newMessage, id: Date.now().toString() + Math.random(), timestamp: new Date() }]);
  }, []);

  // Fetch next question from API
  const fetchAndDisplayNextQuestion = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    const nextQuestionMessage = await getNextQuestion(userId, currentSessionId, locale);
    if (nextQuestionMessage) {
      addMessage(nextQuestionMessage);
    } else {
      // Handle assessment completion or error
      addMessage({ text: t("assessment.no_more_questions"), sender: "system", requiresInput: false });
      setAssessmentPhase("results"); // Or a specific completion phase
      if (currentSessionId) {
        router.push(`/results?sessionId=${currentSessionId}`);
      } else {
        toast.error("Error: Session ID not found. Cannot display results.");
      }
    }
    setIsLoading(false);
  }, [userId, currentSessionId, locale, addMessage, t]);

  // Auth State Change Listener & Initial Anonymous Sign-in
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUserId(session.user.id);
        setIsAnonymous(session.user.is_anonymous || false);
        if (!session.user.is_anonymous) {
          setShowRegistrationModal(false);
          addMessage({ text: t("onboarding.welcome_back_registered", {name: session.user.email || userName || t("user")}), sender: "system", requiresInput: false });
          if ([ "registration_prompt", "initial_greeting", "name_prompt"].includes(assessmentPhase) ) {
             setAssessmentPhase("goal_prompt"); 
          }
        } else {
            if (assessmentPhase === "initial_greeting") {
                 addMessage({ text: t("onboarding.welcome_signed_in_anonymously"), sender: "system", requiresInput: false });
                 setAssessmentPhase("name_prompt");
            }
        }
      } else {
        setIsAuthenticated(false); setIsAnonymous(true); setUserId(null);
        if (assessmentPhase === "initial_greeting") {
            try {
                addMessage({ text: t("loading.text_anonymous_signin"), sender: "system", requiresInput: false });
                await supabase.auth.signInAnonymously();
            } catch (error: any) {
                toast.error(t("error.anonymous_signin_failed") + (error.message ? `: ${error.message}` : "")); // Corrected toast call
                addMessage({ text: t("error.anonymous_signin_failed_contact_support"), sender: "system", requiresInput: false });
            }
        }
      }
    });
    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && assessmentPhase === "initial_greeting") {
             try {
                addMessage({ text: t("loading.text_anonymous_signin"), sender: "system", requiresInput: false });
                await supabase.auth.signInAnonymously();
            } catch (error: any) {
                toast.error(t("error.anonymous_signin_failed") + (error.message ? `: ${error.message}` : "")); // Corrected toast call
                addMessage({ text: t("error.anonymous_signin_failed_contact_support"), sender: "system", requiresInput: false });
            }
        }
    };
    checkUser();
    return () => { authListener?.subscription.unsubscribe(); };
  }, [addMessage, router, t, assessmentPhase, userName, locale]); // Added locale to dependency array as t() depends on it

  // Onboarding Dialogue Flow & Initial Question Fetch
  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    const lastMessage = messages.length > 0 ? messages[messages.length -1] : null;
    
    if (assessmentPhase === "name_prompt" && lastMessage?.sender !== "bot") {
      addMessage({ text: t("onboarding.olivia_welcome_name_prompt"), sender: "bot", questionType: "text", requiresInput: true });
    } else if (assessmentPhase === "consent_prompt" && lastMessage?.sender === "user") { // Assuming user just gave consent
        addMessage({ text: t("assessment.starting"), sender: "system", requiresInput: false });
        setAssessmentPhase("assessment_questions");
        // TODO: Start a new session if applicable, then fetch first question
        // setCurrentSessionId(newSessionId);
        fetchAndDisplayNextQuestion(); 
    }
  }, [assessmentPhase, isAuthenticated, userId, addMessage, t, messages, fetchAndDisplayNextQuestion]);

  const handleUserResponse = useCallback(async (inputText: string, optionValue?: string | string[]) => {
    if ((!inputText.trim() && !optionValue) || isLoading || !isAuthenticated || !userId) return;
    let userResponseText = inputText;
    const lastBotMessage = messages.slice().reverse().find(m => m.sender === "bot" && m.requiresInput);
    
    if (optionValue) {
        if (Array.isArray(optionValue)) {
            userResponseText = optionValue.map(val => lastBotMessage?.options?.find(opt => opt.value === val)?.label || val).join(", ");
        } else {
            userResponseText = lastBotMessage?.options?.find(opt => opt.value === optionValue)?.label || optionValue;
        }
    }
    addMessage({ text: userResponseText, sender: "user", requiresInput: false, question_id: lastBotMessage?.question_id });
    setIsLoading(true);

    if (assessmentPhase === "name_prompt") {
      setUserName(inputText);
      addMessage({ text: t("onboarding.olivia_goal_prompt", { name: inputText }), sender: "bot", questionType: "single-choice",
        options: [ /* ... onboarding options ... */ ], requiresInput: false });
      setAssessmentPhase("goal_prompt");
    } else if (assessmentPhase === "goal_prompt") {
      // ... other onboarding phases ...
      // For now, let's assume onboarding leads to consent_prompt
      addMessage({ text: t("onboarding.consent_dialogue_text"), sender: "bot", questionType: "single-choice", 
        options: [{value: "agree", label: t("common.agree")}, {value: "disagree", label: t("common.disagree")} ],
        requiresInput: false });
      setAssessmentPhase("consent_prompt");
    } else if (assessmentPhase === "consent_prompt") {
        if (optionValue === "agree") {
            // User agreed, handled by useEffect to fetch first question
        } else {
            addMessage({ text: t("onboarding.consent_declined"), sender: "system", requiresInput: false });
            // Handle consent declined (e.g., end session or redirect)
        }
    } else if (assessmentPhase === "assessment_questions") {
      if (lastBotMessage?.question_id) {
        const submission: UserAnswer = {
            question_id: lastBotMessage.question_id,
            user_id: userId,
            response_value: optionValue || inputText,
            session_id: currentSessionId,
        };
        const submissionResult = await submitAnswer(submission);
        if (submissionResult.success) {
            toast.success(t("assessment.answer_acknowledged")); // Corrected toast call
        } else {
            toast.error(t("error.answer_submission_failed") + (submissionResult.message ? `: ${submissionResult.message}`: "")); // Corrected toast call
        }
      }
      // Trigger registration prompt after a few questions (example)
      if (messages.filter(m => m.sender === "user").length > 2 && isAnonymous) { 
        setAssessmentPhase("registration_prompt");
        setShowRegistrationModal(true);
      } else {
        fetchAndDisplayNextQuestion();
      }
    }
    setIsLoading(false);
  }, [isLoading, isAuthenticated, userId, userName, assessmentPhase, addMessage, t, messages, isAnonymous, fetchAndDisplayNextQuestion, currentSessionId, locale]); // Added locale to dependency array

  const handleOAuthSignIn = async (provider: Provider) => {
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.href } });
    // onAuthStateChange handles the rest
    setIsLoading(false);
  };

  if (!isAuthenticated && assessmentPhase === "initial_greeting" && messages.length < 2) {
    return <div className="flex items-center justify-center h-screen text-lg">{t("loading.initializing")}</div>;
  }

  return (
    <div className={`flex flex-col h-screen items-center p-4 md:p-0 ${theme === "dark" ? "dark bg-background text-foreground" : "bg-background text-foreground"}`}>
      {/* Header with Toggles */}
      <div className={`w-full max-w-2xl flex justify-between items-center py-4 px-2 border-b mb-4 border-border`}>
        <span className={`font-bold text-xl ${theme === "dark" ? "text-indigo-400" : "text-indigo-600"}`}>TraitTune</span>
        <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleLanguage} className="text-muted-foreground hover:text-foreground">{locale === "en" ? "RU" : "EN"}</Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground">{theme === "light" ? <MoonIcon /> : <SunIcon />}</Button>
            <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)} className="text-muted-foreground hover:text-foreground">{isMuted ? <SpeakerOffIcon /> : <SpeakerLoudIcon />}</Button>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMode(currentMode === "chat" ? "dialogue" : "chat")} className="text-muted-foreground hover:text-foreground">{currentMode === "chat" ? <PersonIcon /> : <ChatBubbleIcon />}</Button>
            {isAuthenticated && !isAnonymous && <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); router.push("/");}}>{t("auth.sign_out")}</Button>}
        </div>
      </div>

      {/* Chat or Dialogue Mode */}
      {currentMode === "chat" ? (
        <>
          <div className="w-full max-w-2xl flex-grow overflow-y-auto mb-4 px-2"><ChatWindow messages={messages} onOptionSelect={handleUserResponse} isLoading={isLoading} /></div>
          {messages[messages.length -1]?.requiresInput && assessmentPhase !== "registration_prompt" && <div className="w-full max-w-2xl"><ChatInput onSendMessage={handleUserResponse} isLoading={isLoading} /></div>}
        </>
      ) : (
        <div className="flex flex-col flex-grow items-center justify-center w-full max-w-2xl">
          <OliviaSphere isSpeaking={isLoading || messages.some(m=>m.sender === "bot" && m.requiresInput !== false)} />
          {messages.filter(m => m.sender ==="bot").slice(-1).map(msg => <p key={msg.id} className="mt-4 text-center text-lg px-4">{msg.text}</p>)}
          {messages.filter(m => m.sender ==="bot" && m.options && m.requiresInput === false).slice(-1).map(msg => (
            <div key={`${msg.id}-options`} className="mt-6 flex flex-wrap justify-center gap-3">
                {msg.options?.map(opt => <Button key={opt.value} variant="outline" className="dialogue-option-button" onClick={() => handleUserResponse(opt.label, opt.value)}>{opt.label}</Button>)}
            </div>
          ))}
          {messages[messages.length -1]?.requiresInput && assessmentPhase !== "registration_prompt" && <div className="mt-8"><Button variant="outline" size="lg" className="dialogue-action-button"><MicrophoneIcon className="mr-2" />{t("speak_now")}</Button></div>}
        </div>
      )}

      {/* Registration Modal */}
      <Dial
