import React, { useState } from 'react';
import { Header } from './components/Header';
import { ImageEditor } from './components/ImageEditor';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-gray-50 via-white to-white">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-start px-4 py-12 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
        <div className="w-full h-full flex flex-col items-center">
          <div className="text-center mb-12 max-w-2xl">
            <h2 className="text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl mb-6">
              Visualize the Impossible
            </h2>
            <p className="text-xl text-gray-500 font-light leading-relaxed">
              Upload an image and tell our advanced AI how to transform it. 
              From retro filters to complex object removal, just ask.
            </p>
          </div>
          
          <ImageEditor />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;