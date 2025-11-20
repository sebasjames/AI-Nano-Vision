import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-2xl sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black rounded-xl shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                <line x1="16" x2="22" y1="5" y2="5"></line>
                <line x1="19" x2="19" y1="2" y2="8"></line>
                <circle cx="9" cy="9" r="2"></circle>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
              </svg>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-gray-900">
              NanoVision
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[11px] font-medium tracking-wide uppercase px-3 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
               v2.5 Flash Image
             </span>
          </div>
        </div>
      </div>
    </header>
  );
};