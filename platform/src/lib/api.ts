// /home/ubuntu/traittune_frontend/src/lib/api.ts
// This file will contain functions to interact with the TraitTune backend API.

import { supabase } from "./supabaseClient";
import type { Message, MessageOption } from "@/app/assessment/page"; // Assuming types are exported from page.tsx or a types file

// Define a type for the question response from the backend
export interface ApiQuestion {
  id: string; // Question ID
  text_en: string;
  text_ru: string;
  question_type: "text" | "single-choice" | "multi-choice" | "likert" | "forced-choice";
  options_en?: { value: string; label: string }[];
  options_ru?: { value: string; label: string }[];
  dimension_id?: number;
  segment_level?: number;
  is_reverse?: boolean;
  // Add any other relevant fields from the backend question structure
}

// Define a type for submitting an answer
export interface UserAnswer {
  question_id: string;
  user_id: string;
  response_value?: string | string[]; // For single/multi-choice, likert, or text input
  session_id?: string; // If sessions are managed
}

/**
 * Fetches the next assessment question from the backend.
 * @param userId - The ID of the current user.
 * @param sessionId - (Optional) The current assessment session ID.
 * @param locale - The current language locale ('en' or 'ru').
 */
export const getNextQuestion = async (userId: string, sessionId?: string, locale: string = "en"): Promise<Message | null> => {
  try {
    // TODO: Replace with actual Supabase Edge Function call or API endpoint
    // const { data, error } = await supabase.rpc('get_next_assessment_question', { user_id: userId, session_id: sessionId });
    // For now, returning a mock question
    console.log(`Fetching next question for user: ${userId}, session: ${sessionId}, locale: ${locale}`);
    
    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Example mock question (replace with actual API call)
    const mockApiQuestion: ApiQuestion = {
      id: "q_mock_123",
      text_en: "How often do you seek out new experiences?",
      text_ru: "Как часто вы ищете новые впечатления?",
      question_type: "likert",
      options_en: [
        { value: "1", label: "Never" },
        { value: "2", label: "Rarely" },
        { value: "3", label: "Sometimes" },
        { value: "4", label: "Often" },
        { value: "5", label: "Always" },
      ],
      options_ru: [
        { value: "1", label: "Никогда" },
        { value: "2", label: "Редко" },
        { value: "3", label: "Иногда" },
        { value: "4", label: "Часто" },
        { value: "5", label: "Всегда" },
      ],
    };

    if (!mockApiQuestion) {
      // This could mean the assessment is complete or an error occurred
      return null;
    }

    const questionText = locale === "ru" ? mockApiQuestion.text_ru : mockApiQuestion.text_en;
    const questionOptions = locale === "ru" ? mockApiQuestion.options_ru : mockApiQuestion.options_en;

    return {
      id: mockApiQuestion.id,
      text: questionText,
      sender: "bot",
      timestamp: new Date(),
      questionType: mockApiQuestion.question_type,
      options: questionOptions?.map(opt => ({ value: opt.value, label: opt.label })),
      requiresInput: true, // Bot questions usually require input
    };

  } catch (error) {
    console.error("Error fetching next question:", error);
    // Consider throwing a more specific error or returning a system message
    return {
        id: "error_q_fetch",
        text: locale === "ru" ? "Не удалось загрузить следующий вопрос. Пожалуйста, попробуйте еще раз." : "Failed to load the next question. Please try again.",
        sender: "system",
        timestamp: new Date(),
        requiresInput: false,
    };
  }
};

/**
 * Submits a user's answer to the backend.
 * @param answer - The UserAnswer object.
 */
export const submitAnswer = async (answer: UserAnswer): Promise<{ success: boolean; message?: string }> => {
  try {
    // TODO: Replace with actual Supabase Edge Function call or API endpoint
    // const { data, error } = await supabase.rpc('submit_assessment_answer', answer);
    console.log("Submitting answer:", answer);

    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // if (error) {
    //   throw error;
    // }

    // return { success: true, data }; // Or whatever the backend returns
    return { success: true };

  } catch (error: any) {
    console.error("Error submitting answer:", error);
    return { success: false, message: error.message || "Failed to submit answer." };
  }
};

// Add other API functions as needed (e.g., fetchResults, startSession, etc.)

