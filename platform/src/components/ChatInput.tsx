// /home/ubuntu/traittune_frontend/src/components/ChatInput.tsx
"use client";

import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { PaperPlaneIcon } from "@radix-ui/react-icons"; // Using Radix icons as placeholders
import { Mic } from "lucide-react"; // Replaced MicrophoneIcon
import { useI18n } from "./providers/I18nProvider";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  // TODO: Add props for voice input handling
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText);
      setInputText("");
      inputRef.current?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full p-2 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
      <div className="flex items-center space-x-2">
        {/* Microphone Icon - Placeholder for voice input functionality */}
        <Button type="button" variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300">
          <Mic className="h-6 w-6" />
        </Button>
        
        <Input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t("chat.type_message_placeholder")}
          className="flex-grow p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          disabled={isLoading}
          autoFocus
        />
        
        <Button 
          type="submit" 
          variant="ghost" 
          size="icon" 
          disabled={isLoading || !inputText.trim()}
          className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-200 disabled:opacity-50"
        >
          <PaperPlaneIcon className="h-6 w-6" />
        </Button>
      </div>
      {/* Placeholder for voice input UI elements like in IMG_8719.jpeg (waveform, pause, cancel) */}
      {/* This would likely be conditionally rendered when voice input is active */}
      {/* <div className="mt-2 flex items-center justify-between p-2 border rounded-lg bg-gray-50 dark:bg-gray-700">
        <MicrophoneIcon className="h-5 w-5 text-red-500" />
        <div className="w-full h-6 bg-gray-200 dark:bg-gray-600 rounded-full mx-2"> Waveform placeholder </div>
        <Button variant="ghost" size="icon"><PauseIcon className="h-5 w-5" /></Button>
        <Button variant="ghost" size="icon"><Cross2Icon className="h-5 w-5" /></Button>
      </div> */}
    </form>
  );
};

export default ChatInput;

