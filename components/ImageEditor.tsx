import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { ImageState, LoadingState } from '../types';
import { editImageWithGemini, fileToRawBase64 } from '../services/geminiService';

export const ImageEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<ImageState | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file.');
        return;
      }

      setLoadingState(LoadingState.UPLOADING);
      setError(null);
      
      try {
        const base64Data = await fileToRawBase64(file);
        const previewUrl = URL.createObjectURL(file);
        
        setOriginalImage({
          file,
          previewUrl,
          base64Data,
          mimeType: file.type
        });
        setGeneratedImage(null); // Reset previous generation
        setLoadingState(LoadingState.IDLE);
      } catch (err) {
        setError('Failed to process image.');
        setLoadingState(LoadingState.ERROR);
      }
    }
  };

  const handleGenerate = async () => {
    if (!originalImage?.base64Data || !prompt.trim()) return;

    setLoadingState(LoadingState.GENERATING);
    setError(null);

    try {
      const resultUrl = await editImageWithGemini(
        originalImage.base64Data,
        originalImage.mimeType,
        prompt
      );
      setGeneratedImage(resultUrl);
      setLoadingState(LoadingState.SUCCESS);
    } catch (err: any) {
      setError(err.message || "Something went wrong during generation.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setGeneratedImage(null);
    setPrompt('');
    setError(null);
    setLoadingState(LoadingState.IDLE);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `nanovision-edit-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Render Empty State (Upload)
  if (!originalImage) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-8 p-10 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col items-center justify-center text-center h-96 group"
           onClick={() => fileInputRef.current?.click()}>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          className="hidden" 
          accept="image/*"
        />
        <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
            <circle cx="9" cy="9" r="2"></circle>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Upload an Image</h3>
        <p className="text-zinc-400 mb-6">Click to browse or drag a file here</p>
        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
          Select File
        </Button>
      </div>
    );
  }

  // Render Editor
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
      
      {/* Prompt Bar */}
      <div className="sticky top-20 z-40 bg-zinc-900/80 backdrop-blur-md p-4 rounded-xl border border-zinc-800 shadow-2xl flex flex-col sm:flex-row gap-4 items-center transition-all">
        <div className="relative flex-grow w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your edit (e.g., 'Make it look like a cyberpunk city', 'Add a cat')"
            className="block w-full pl-10 pr-3 py-3 border border-zinc-700 rounded-lg leading-5 bg-zinc-950 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button 
            onClick={handleGenerate} 
            disabled={!prompt.trim() || loadingState === LoadingState.GENERATING}
            isLoading={loadingState === LoadingState.GENERATING}
            className="flex-1 sm:flex-none w-full sm:w-auto"
          >
            Generate
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleReset}
            className="w-auto"
            title="Upload new image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          {error}
        </div>
      )}

      {/* Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
        
        {/* Original Image Card */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col h-full">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
            <span className="text-sm font-medium text-zinc-400">Original</span>
          </div>
          <div className="flex-grow relative bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-zinc-950 flex items-center justify-center p-4">
            <img 
              src={originalImage.previewUrl || ''} 
              alt="Original" 
              className="max-w-full max-h-[600px] rounded shadow-2xl object-contain"
            />
          </div>
        </div>

        {/* Generated Image Card */}
        <div className={`bg-zinc-900 rounded-2xl border ${generatedImage ? 'border-indigo-500/30' : 'border-zinc-800'} overflow-hidden flex flex-col h-full relative`}>
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
            <span className="text-sm font-medium text-indigo-400">
              {loadingState === LoadingState.GENERATING ? 'Generating...' : generatedImage ? 'Result' : 'Preview Area'}
            </span>
            {generatedImage && (
              <Button variant="ghost" size="sm" onClick={handleDownload} className="h-8 px-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Download
              </Button>
            )}
          </div>
          <div className="flex-grow relative bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-zinc-950 flex items-center justify-center p-4">
            {loadingState === LoadingState.GENERATING ? (
              <div className="flex flex-col items-center">
                 <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500/30 rounded-full animate-ping"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500 rounded-full animate-spin border-t-transparent"></div>
                 </div>
                 <p className="mt-6 text-indigo-400 animate-pulse text-sm uppercase tracking-widest font-semibold">Processing with Gemini</p>
              </div>
            ) : generatedImage ? (
               <img 
                src={generatedImage} 
                alt="Generated" 
                className="max-w-full max-h-[600px] rounded shadow-2xl object-contain animate-in fade-in duration-500"
              />
            ) : (
              <div className="text-zinc-700 flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                <p className="mt-4 text-sm">Your masterpiece will appear here</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};