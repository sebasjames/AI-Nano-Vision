import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-zinc-900 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-zinc-500 text-sm">
        <p>© {new Date().getFullYear()} NanoVision AI.</p>
        <p className="mt-2 md:mt-0 flex items-center gap-2">
          Powered by Gemini API
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
        </p>
      </div>
    </footer>
  );
};