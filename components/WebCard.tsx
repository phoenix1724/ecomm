import React from 'react';
import { WebResult } from '../types';

interface WebCardProps {
  result: WebResult;
}

const WebCard: React.FC<WebCardProps> = ({ result }) => {
  // Extract domain for display and favicon
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  };

  const domain = getDomain(result.uri);
  const cleanDomain = domain.replace('www.', '');
  const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : '';

  return (
    <a 
      href={result.uri} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex flex-col w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex-shrink-0 snap-center transition-all hover:scale-[1.03] duration-300 group hover:shadow-xl hover:shadow-cyan-200/50 dark:hover:shadow-cyan-900/20 relative overflow-hidden"
    >
      {/* Card Header / Image Area */}
      <div className="h-40 bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Blur Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-slate-700 dark:to-slate-800 opacity-50"></div>
        
        {/* Logo / Icon */}
        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
          {faviconUrl ? (
            <img 
              src={faviconUrl} 
              alt={cleanDomain} 
              className="w-12 h-12 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=WEB';
                (e.target as HTMLImageElement).style.opacity = '0.5';
              }}
            />
          ) : (
            <span className="text-2xl">🌐</span>
          )}
        </div>

        {/* Badge */}
        <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-bold text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/30 shadow-sm">
          Web Result
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
          {cleanDomain}
        </span>
        
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug mb-3 line-clamp-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
          {result.title}
        </h3>
        
        <div className="mt-auto">
          <button className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-bold group-hover:bg-cyan-500 group-hover:text-white transition-all flex items-center justify-center gap-2">
            Visit Website
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </a>
  );
};

export default WebCard;