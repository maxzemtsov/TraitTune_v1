"use client";

import { toast } from 'sonner';
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient"; 
import type { Provider } from "@supabase/supabase-js";
import { getNextQuestion, submitAnswer, UserAnswer } from "@/lib/api";

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
  question_id?: string;
}

const AssessmentPage = () => {
  const router = useRouter();
  const { t, setLocale, locale } = useI18n();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null); 
  const [assessmentPhase, setAssessmentPhase] = useState<"initial_greeting" | "name_prompt" | "goal_prompt" | "ice_breaker_prompt" | "metadata_prompt" | "consent_prompt" | "assessment_questions" | "registration_prompt" | "results">("initial_greeting");
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(undefined);

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

  const fetchAndDisplayNextQuestion = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    const nextQuestionMessage = await getNextQuestion(userId, currentSessionId, locale);
    if (nextQuestionMessage) {
      addMessage(nextQuestionMessage);
    } else {
      addMessage({ text: t("assessment.no_more_questions"), sender: "system", requiresInput: false });
      setAssessmentPhase("results");
      if (currentSessionId) {
        router.push(`/results?sessionId=${currentSessionId}`);
      } else {
        toast.error("Error: Session ID not found. Cannot display results.");
      }
    }
    setIsLoading(false);
  }, [userId, currentSessionId, locale, addMessage, t, router]);

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
                toast.error(t("error.anonymous_signin_failed") + (error.message ? `: ${error.message}` : ""));
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
                toast.error(t("error.anonymous_signin_failed") + (error.message ? `: ${error.message}` : ""));
                addMessage({ text: t("error.anonymous_signin_failed_contact_support"), sender: "system", requiresInput: false });
            }
        }
    };
    checkUser();
    return () => { authListener?.subscription.unsubscribe(); };
  }, [addMessage, router, t, assessmentPhase, userName, locale]);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    const lastMessage = messages.length > 0 ? messages[messages.length -1] : null;
    
    if (assessmentPhase === "name_prompt" && lastMessage?.sender !== "bot") {
      addMessage({ text: t("onboarding.olivia_welcome_name_prompt"), sender: "bot", questionType: "text", requiresInput: true });
    } else if (assessmentPhase === "consent_prompt" && lastMessage?.sender === "user") {
        addMessage({ text: t("assessment.starting"), sender: "system", requiresInput: false });
        setAssessmentPhase("assessment_questions");
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
        options: [
            { value: "purpose", label: t("onboarding.goal_options.purpose") },
            { value: "career_path", label: t("onboarding.goal_options.career_path") },
            { value: "strengths_growth", label: t("onboarding.goal_options.strengths_growth") },
            { value: "hidden_potential", label: t("onboarding.goal_options.hidden_potential") },
            { value: "match_others", label: t("onboarding.goal_options.match_others") },
        ], requiresInput: true });
      setAssessmentPhase("goal_prompt");
    } else if (assessmentPhase === "goal_prompt") {
      addMessage({ text: t("onboarding.ice_breaker_prompt_text"), sender: "bot", questionType: "text", requiresInput: true });
      setAssessmentPhase("ice_breaker_prompt");
    } else if (assessmentPhase === "ice_breaker_prompt") {
      addMessage({ text: t("onboarding.metadata_prompt_text"), sender: "bot", questionType: "text", requiresInput: true });
      setAssessmentPhase("metadata_prompt");
    } else if (assessmentPhase === "metadata_prompt") {
      addMessage({ text: t("onboarding.consent_dialogue_text"), sender: "bot", questionType: "single-choice", 
        options: [{value: "agree", label: t("common.agree")}, {value: "disagree", label: t("common.disagree")} ],
        requiresInput: true });
      setAssessmentPhase("consent_prompt");
    } else if (assessmentPhase === "consent_prompt") {
        if (optionValue === "agree") {
            addMessage({ text: t("assessment.starting"), sender: "system", requiresInput: false });
            setAssessmentPhase("assessment_questions");
            fetchAndDisplayNextQuestion();
        } else {
            addMessage({ text: t("onboarding.consent_declined"), sender: "system", requiresInput: false });
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
            toast.success(t("assessment.answer_acknowledged"));
        } else {
            toast.error(t("error.answer_submission_failed") + (submissionResult.message ? `: ${submissionResult.message}`: ""));
        }
      }
      if (messages.filter(m => m.sender === "user").length > 2 && isAnonymous) { 
        setAssessmentPhase("registration_prompt");
        setShowRegistrationModal(true);
      } else {
        fetchAndDisplayNextQuestion();
      }
    }
    setIsLoading(false);
  }, [isLoading, isAuthenticated, userId, userName, assessmentPhase, addMessage, t, messages, isAnonymous, fetchAndDisplayNextQuestion, currentSessionId, locale, router]);

  const handleOAuthSignIn = async (provider: Provider) => {
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.href } });
    setIsLoading(false);
  };

  if (!isAuthenticated && assessmentPhase === "initial_greeting" && messages.length < 2) {
    return <div className="flex items-center justify-center h-screen text-lg bg-gradient-to-br from-slate-900 to-slate-800 text-slate-200">{t("loading.initializing")}</div>;
  }

  return (
    <div className={`flex flex-col h-screen items-center justify-center p-4 md:p-0 ${theme === "dark" ? "dark bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100" : "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800"}`}>
      {/* Header with Toggles - Glassmorphism */}
      <div className={`w-full max-w-4xl flex justify-between items-center py-4 px-6 mb-8 rounded-xl shadow-lg ${theme === "dark" ? "bg-slate-800/30 backdrop-blur-md border border-slate-700/50" : "bg-white/30 backdrop-blur-md border border-slate-300/50"}`}>
        <span className={`font-bold text-2xl ${theme === "dark" ? "text-sky-400" : "text-sky-600"}`}>TraitTune</span>
        <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={toggleLanguage} className={`rounded-full ${theme === "dark" ? "text-slate-300 hover:text-sky-400 hover:bg-slate-700/50" : "text-slate-600 hover:text-sky-600 hover:bg-slate-200/50"}`}>{locale === "en" ? "RU" : "EN"}</Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className={`rounded-full ${theme === "dark" ? "text-slate-300 hover:text-yellow-400 hover:bg-slate-700/50" : "text-slate-600 hover:text-yellow-600 hover:bg-slate-200/50"}`}>{theme === "light" ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}</Button>
            <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)} className={`rounded-full ${theme === "dark" ? "text-slate-300 hover:text-green-400 hover:bg-slate-700/50" : "text-slate-600 hover:text-green-600 hover:bg-slate-200/50"}`}>{isMuted ? <SpeakerOffIcon className="w-5 h-5" /> : <SpeakerLoudIcon className="w-5 h-5" />}</Button>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMode(currentMode === "chat" ? "dialogue" : "chat")} className={`rounded-full ${theme === "dark" ? "text-slate-300 hover:text-purple-400 hover:bg-slate-700/50" : "text-slate-600 hover:text-purple-600 hover:bg-slate-200/50"}`}>{currentMode === "chat" ? <PersonIcon className="w-5 h-5" /> : <ChatBubbleIcon className="w-5 h-5" />}</Button>
            {isAuthenticated && !isAnonymous && <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); router.push("/");}} className={`rounded-lg ${theme === "dark" ? "border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500" : "border-slate-400 text-slate-700 hover:bg-slate-200 hover:border-slate-500"}`}>{t("auth.sign_out")}</Button>}
        </div>
      </div>

      {/* Main Content Area - Centered with OliviaSphere and Chat/Dialogue */}
      <div className={`flex flex-col items-center justify-center flex-grow w-full max-w-4xl p-6 rounded-xl shadow-xl ${theme === "dark" ? "bg-slate-800/50 backdrop-blur-lg border border-slate-700/60" : "bg-white/50 backdrop-blur-lg border border-slate-300/60"}`}>
        {currentMode === "dialogue" && (
          <div className="mb-8">
            <OliviaSphere isSpeaking={isLoading || messages.some(m=>m.sender === "bot" && m.requiresInput !== false)} />
          </div>
        )}

        {currentMode === "chat" ? (
          <>
            <div className="w-full h-[calc(100%-80px)] flex-grow overflow-y-auto mb-4 px-2"><ChatWindow messages={messages} onOptionSelect={handleUserResponse} isLoading={isLoading} /></div>
            {messages[messages.length -1]?.requiresInput && assessmentPhase !== "registration_prompt" && <div className="w-full"><ChatInput onSendMessage={handleUserResponse} isLoading={isLoading} /></div>}
          </>
        ) : (
          <div className="flex flex-col flex-grow items-center justify-center w-full">
            {messages.filter(m => m.sender ==="bot").slice(-1).map(msg => <p key={msg.id} className={`mt-4 text-center text-xl px-4 ${theme === "dark" ? "text-slate-200" : "text-slate-700"}`}>{msg.text}</p>)}
            {messages.filter(m => m.sender ==="bot" && m.options && m.requiresInput === false).slice(-1).map(msg => (
              <div key={`${msg.id}-options`} className="mt-6 flex flex-wrap justify-center gap-3">
                  {msg.options?.map(opt => <Button key={opt.value} variant="outline" className={`dialogue-option-button rounded-lg px-6 py-3 text-lg ${theme === "dark" ? "border-slate-600 text-slate-200 hover:bg-slate-700 hover:border-sky-500" : "border-slate-400 text-slate-700 hover:bg-slate-200 hover:border-sky-500"}`} onClick={() => handleUserResponse(opt.label, opt.value)}>{opt.label}</Button>)}
              </div>
            ))}
            {messages[messages.length -1]?.requiresInput && assessmentPhase !== "registration_prompt" && <div className="mt-8"><Button variant="outline" size="lg" className={`dialogue-action-button rounded-full p-4 ${theme === "dark" ? "border-sky-500 text-sky-400 hover:bg-sky-700/30" : "border-sky-600 text-sky-600 hover:bg-sky-200/30"}`}><MicrophoneIcon className="w-8 h-8" /></Button></div>}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      <Dialog open={showRegistrationModal} onOpenChange={setShowRegistrationModal}>
        <DialogContent className={`rounded-lg shadow-2xl ${theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-300 text-slate-800"}`}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">{t("auth.register_to_save")}</DialogTitle>
            <DialogDescription className={`mt-2 ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
              {t("auth.registration_prompt_benefits")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button onClick={() => handleOAuthSignIn("google")} className={`w-full py-3 text-lg rounded-md ${theme === "dark" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}>{t("auth.continue_with_google")}</Button>
            <Button onClick={() => handleOAuthSignIn("linkedin")} className={`w-full py-3 text-lg rounded-md ${theme === "dark" ? "bg-sky-600 hover:bg-sky-700 text-white" : "bg-sky-500 hover:bg-sky-600 text-white"}`}>{t("auth.continue_with_linkedin")}</Button>
            {/* Add more providers as needed */}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowRegistrationModal(false)} className={`rounded-md ${theme === "dark" ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-800"}`}>{t("common.later")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssessmentPage;

