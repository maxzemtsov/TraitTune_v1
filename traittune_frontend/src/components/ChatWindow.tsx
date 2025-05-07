import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import apiClient from '../lib/apiClient'; // Import the API client
import { useTranslation } from 'react-i18next'; // Added

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatWindowProps {
  userId: string; // To associate messages with a user
  sessionId: string; // To maintain session context with the backend
}

const ChatWindow: React.FC<ChatWindowProps> = ({ userId, sessionId }) => {
  const { t } = useTranslation(); // Added
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Placeholder for initial message loading or AI greeting from backend
  useEffect(() => {
    const fetchInitialMessage = async () => {
      try {
        // Example: Fetch initial greeting or session start message from backend
        // const initialAiMessage = await apiClient<Message>(`/chat/initiate`, { 
        //   method: "POST", 
        //   body: { userId, sessionId }
        // });
        // if (initialAiMessage) setMessages([initialAiMessage]);
        // For now, using a static greeting:
        setMessages([
          {
            id: 'initial-ai-greeting',
            text: t("chat_window_initial_greeting"), // Updated
            sender: 'ai',
            timestamp: new Date(),
          },
        ]);
      } catch (error) {
        console.error("Error fetching initial message:", error);
        setMessages([
          {
            id: 'error-initial-greeting',
            text: t("chat_window_initial_greeting_error"), // Updated
            sender: 'ai',
            timestamp: new Date(),
          },
        ]);
      }
    };
    fetchInitialMessage();
  }, [userId, sessionId, t]); // Added t to dependency array

  const handleSendMessage = async (text: string) => {
    setIsSending(true);
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      // Actual API call to the backend
      const aiResponse = await apiClient<Omit<Message, 'id' | 'timestamp'>>(`/chat/message`, { // Endpoint to be defined in backend
        method: "POST",
        body: { 
          userId,
          sessionId, 
          message: text,
          // Potentially include current assessment state, dimensionId etc. from frontend state
          language: i18n.language // Send current language to backend
        },
      });

      const newAiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: aiResponse.text, // Assuming backend handles localization for its dynamic responses based on 'language' param
        sender: 'ai',
        timestamp: new Date(), // Or use timestamp from backend if provided
      };
      setMessages((prevMessages) => [...prevMessages, newAiMessage]);

    } catch (error) {
      console.error("Error sending message or receiving AI response:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorResponseMessage: Message = {
        id: `ai-error-${Date.now()}`,
        text: `${t("chat_window_message_processing_error")} (${errorMessage})`, // Updated
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorResponseMessage]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-gray-50 shadow-xl">
      <div className="flex-grow p-4 overflow-y-auto">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSendMessage={handleSendMessage} isSending={isSending} />
    </div>
  );
};

export default ChatWindow;

