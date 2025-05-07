import React from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
        <p className="text-sm">{message.text}</p>
        <p className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-500'} text-right`}>
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;

