import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-gray-100 py-10 mt-auto bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm font-medium">
        <p>© {new Date().getFullYear()} NanoVision AI.</p>
        <p className="mt-2 md:mt-0 flex items-center gap-2">
          Powered by Gemini API
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
        </p>
      </div>
    </footer>
  );
};