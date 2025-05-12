// /home/ubuntu/traittune/platform/src/components/MessageBubble.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Message } from '@/app/assessment/page'; // Assuming Message type is exported from there

interface MessageBubbleProps {
  message: Message;
}

const Typewriter: React.FC<{ text: string; speed?: number }> = ({ text, speed = 50 }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText(''); // Reset when text changes
    if (text) {
      let i = 0;
      const intervalId = setInterval(() => {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
        if (i === text.length) {
          clearInterval(intervalId);
        }
      }, speed);
      return () => clearInterval(intervalId);
    }
  }, [text, speed]);

  return <p className="text-sm md:text-base whitespace-pre-wrap">{displayedText}</p>;};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const isBot = message.sender === 'bot';
  const isSystem = message.sender === 'system';

  // Base classes
  let bubbleClasses = 'max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl mb-2 break-words shadow-md'; // Added shadow-md for depth
  let containerClasses = 'flex mb-2';

  if (isUser) {
    // User messages: solid, distinct color
    bubbleClasses += ' bg-sky-500 text-white dark:bg-sky-600';
    containerClasses += ' justify-end';
  } else if (isBot) {
    // Bot messages (Olivia): Glassmorphism effect
    // Light theme: light glass
    // Dark theme: dark glass
    bubbleClasses += ' bg-white/30 dark:bg-slate-800/30 backdrop-blur-md border border-white/20 dark:border-slate-700/50 text-slate-800 dark:text-slate-100';
    containerClasses += ' justify-start';
  } else if (isSystem) {
    bubbleClasses += ' bg-transparent text-gray-500 dark:text-gray-400 text-xs italic text-center w-full max-w-full shadow-none'; // No shadow for system messages
    containerClasses += ' justify-center';
  }

  // Avatar for bot (Olivia) - placeholder, can be improved with an actual image/icon
  const botAvatar = (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 dark:from-purple-500 dark:to-pink-600 flex items-center justify-center text-sm font-semibold mr-2 flex-shrink-0 text-white shadow-sm">
      O
    </div>
  );

  return (
    <div className={containerClasses}>
      {isBot && botAvatar}
      <div className={bubbleClasses}>
        {isBot && message.text ? (
          <Typewriter text={message.text} speed={30} />
        ) : (
          <p className={`text-sm md:text-base whitespace-pre-wrap ${isSystem ? 'text-center w-full' : ''}`}>{message.text}</p>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;

