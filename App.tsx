import React, { useState } from 'react';
import { Header } from './components/Header';
import { ImageEditor } from './components/ImageEditor';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-start px-4 py-8 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
        <div className="w-full h-full flex flex-col items-center">
          <div className="text-center mb-8 max-w-2xl">
            <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 sm:text-5xl mb-4">
              Visualize the Impossible
            </h2>
            <p className="text-lg text-zinc-400">
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