import React, { useState } from 'react';
import { Message, MessageRole, RecommendedProduct } from '../types';
import WebCard from './WebCard';

interface ChatMessageProps {
  message: Message;
  onAddToCart?: (product: RecommendedProduct) => void;
  cartItemIds?: string[];
  children?: (product: RecommendedProduct) => React.ReactNode;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onAddToCart, cartItemIds = [], children }) => {
  const isUser = message.role === MessageRole.USER;
  const hasContent = (message.recommendations && message.recommendations.length > 0) || (message.webResults && message.webResults.length > 0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message.text);
    // Attempt to pick a pleasant voice if available, otherwise default
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.pitch = 1;
    utterance.rate = 1;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className={`flex w-full mb-8 animate-fade-in-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col max-w-[90%] md:max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Message Bubble */}
        <div 
          className={`px-6 py-4 rounded-3xl text-[15px] leading-7 shadow-sm transition-all duration-300 relative group overflow-hidden border
            ${isUser 
              ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-br-none shadow-violet-200/50 dark:shadow-none border-transparent' 
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-100 dark:border-slate-700 rounded-bl-none shadow-slate-100 dark:shadow-none'
            }`}
        >
          {/* Render User Uploaded Image */}
          {message.image && (
             <div className="mb-4 rounded-xl overflow-hidden shadow-sm border border-white/20">
                <img src={`data:image/jpeg;base64,${message.image}`} alt="User upload" className="max-w-full h-auto max-h-56 object-cover" />
             </div>
          )}

          <div className={`whitespace-pre-wrap relative z-10 ${isUser ? 'font-medium opacity-95' : 'font-normal'}`}>
            {message.text}
          </div>

          {/* Speaker Button (Only for Model) */}
          {!isUser && (
            <button 
              onClick={handleSpeak}
              className={`absolute -bottom-8 left-0 p-2 rounded-full transition-colors flex items-center gap-1 text-xs font-medium 
                ${isSpeaking 
                  ? 'text-violet-600 bg-violet-50 dark:bg-violet-900/20' 
                  : 'text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 opacity-0 group-hover:opacity-100'
                }`}
            >
              {isSpeaking ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 animate-pulse">
                    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                    <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                  </svg>
                  <span>Speaking...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" />
                  </svg>
                  <span>Read aloud</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Product Recommendations / Web Results Horizontal Scroll */}
        {hasContent && (
          <div className="mt-6 w-full overflow-x-auto pb-6 pt-2 scrollbar-hide snap-x flex gap-4 pr-4 pl-1">
            {/* 1. Show Web Results FIRST (Priority for search queries) */}
            {message.webResults?.map((result, idx) => (
              <WebCard key={`web-${idx}`} result={result} />
            ))}

            {/* 2. Then show Local Product Recommendations */}
            {message.recommendations?.map((product) => 
               children ? children(product) : null
            )}
          </div>
        )}

        {/* Timestamp / Status */}
        <span className="text-[10px] text-slate-300 dark:text-slate-600 mt-2 px-2 font-medium">
          {isUser ? 'You' : 'ShopGenie'}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;