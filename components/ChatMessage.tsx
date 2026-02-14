import React, { useEffect, useState } from 'react';
import { Message } from '../types';
import BugReport from './BugReport';

interface ChatMessageProps {
  message: Message;
  isLast: boolean;
  onRestart?: () => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLast, onRestart }) => {
  const isUser = message.role === 'user';
  const [displayedContent, setDisplayedContent] = useState('');
  
  // Streaming effect
  useEffect(() => {
    if (isUser || message.type === 'bug_report') {
      setDisplayedContent(message.content);
      return;
    }

    if (isLast) {
      let index = 0;
      const speed = 15; // ms per char
      const interval = setInterval(() => {
        if (index < message.content.length) {
          setDisplayedContent((prev) => message.content.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    } else {
      setDisplayedContent(message.content);
    }
  }, [message, isUser, isLast]);

  if (message.type === 'bug_report' && message.reportData) {
    return (
      <div className="flex flex-col animate-slide-up w-full">
        <BugReport data={message.reportData} onRestart={onRestart} />
      </div>
    );
  }

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] p-4 md:p-5 rounded-2xl text-sm md:text-base leading-relaxed shadow-md ${
          isUser
            ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white rounded-tr-none'
            : 'glass text-brand-text border border-white/5 rounded-tl-none'
        }`}
      >
        <div className="whitespace-pre-wrap">{displayedContent}</div>
      </div>
    </div>
  );
};

export default ChatMessage;