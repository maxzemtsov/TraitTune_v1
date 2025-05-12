// /home/ubuntu/traittune_frontend/src/components/ChatWindow.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Message, MessageOption } from "@/app/assessment/page"; // Assuming Message type is exported
import MessageBubble from "./MessageBubble";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { useI18n } from "./providers/I18nProvider";

interface ChatWindowProps {
  messages: Message[];
  isLoading?: boolean; 
  onOptionSelect: (inputText: string, optionValue?: string | string[]) => void; 
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onOptionSelect }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  const [selectedMultiChoice, setSelectedMultiChoice] = useState<Record<string, string[]>>({}); // Store selected values for each multi-choice question

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSingleOptionClick = (option: MessageOption) => {
    onOptionSelect(option.label, option.value);
  };

  const handleMultiChoiceChange = (messageId: string, optionValue: string, checked: boolean) => {
    setSelectedMultiChoice(prev => {
      const currentSelections = prev[messageId] || [];
      if (checked) {
        return { ...prev, [messageId]: [...currentSelections, optionValue] };
      } else {
        return { ...prev, [messageId]: currentSelections.filter(val => val !== optionValue) };
      }
    });
  };

  const handleMultiChoiceSubmit = (messageId: string) => {
    const selections = selectedMultiChoice[messageId] || [];
    if (selections.length > 0) {
        // Find the original message to get option labels for display text
        const originalMessage = messages.find(m => m.id === messageId);
        let displayText = selections.join(", "); // Fallback display text
        if (originalMessage && originalMessage.options) {
            displayText = selections.map(val => originalMessage.options?.find(opt => opt.value === val)?.label || val).join(", ");
        }
        onOptionSelect(displayText, selections);
        // Clear selections for this question ID to prevent re-submission or confusion
        setSelectedMultiChoice(prev => {
            const newState = {...prev};
            delete newState[messageId];
            return newState;
        });
    }
  };

  const renderOptions = (message: Message) => {
    if (!message.options || message.sender !== "bot" || message.requiresInput === true) return null;

    const commonButtonClass = "m-1 whitespace-normal h-auto py-2 px-3 text-sm md:text-base";

    if (message.questionType === "single-choice" || message.questionType === "forced-choice" || message.questionType === "likert") {
      return (
        <div className="flex flex-col items-start ml-10 mb-2 clear-both">
          {message.options.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              className={`${commonButtonClass} border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-gray-900`}
              onClick={() => handleSingleOptionClick(option)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      );
    } else if (message.questionType === "multi-choice") {
      return (
        <div className="flex flex-col items-start ml-10 mb-2 p-3 bg-gray-50 dark:bg-gray-750 rounded-md space-y-2">
          {message.options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox 
                id={`${message.id}-${option.value}`}
                onCheckedChange={(checked) => handleMultiChoiceChange(message.id, option.value, !!checked)}
                checked={(selectedMultiChoice[message.id] || []).includes(option.value)}
              />
              <Label htmlFor={`${message.id}-${option.value}`} className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {option.label}
              </Label>
            </div>
          ))}
          {(selectedMultiChoice[message.id] && selectedMultiChoice[message.id].length > 0) && (
             <Button 
                variant="default" 
                size="sm"
                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => handleMultiChoiceSubmit(message.id)}>
                {t("assessment.submit_selection")}
             </Button>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div ref={scrollRef} className="flex-grow w-full overflow-y-auto p-4 space-y-2 bg-white dark:bg-gray-800 rounded-lg shadow-inner">
      {messages.map((msg, index) => (
        <React.Fragment key={msg.id || index}>
          <MessageBubble message={msg} />
          {renderOptions(msg)}
        </React.Fragment>
      ))}
      {isLoading && (
        <div className="flex justify-start ml-10 mb-2">
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-semibold mr-2 flex-shrink-0">
            O
          </div>
          <div className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 p-3 rounded-xl">
            <div className="flex items-center space-x-1">
              <span className="text-xs">{t("typing")}</span>
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;

