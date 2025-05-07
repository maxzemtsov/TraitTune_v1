import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // Added

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isSending: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isSending }) => {
  const { t } = useTranslation(); // Added
  const [inputText, setInputText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isSending) {
      onSendMessage(inputText.trim());
      setInputText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
      <div className="flex items-center">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t("chat_input_placeholder")} // Updated
          className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSending}
        />
        <button
          type="submit"
          className={`px-4 py-2 text-white bg-blue-500 rounded-r-md ${isSending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
          disabled={isSending}
        >
          {isSending ? t("chat_input_sending") : t("chat_input_send")} // Updated
        </button>
      </div>
    </form>
  );
};

export default ChatInput;

