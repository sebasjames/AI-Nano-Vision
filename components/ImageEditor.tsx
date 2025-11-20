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
  const [progress, setProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (loadingState === LoadingState.GENERATING) {
      setProgress(0);
      // Simulate progress up to 90%
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          // Slow down as we get closer to 90
          const increment = Math.max(0.5, (90 - prev) / 20);
          return prev + increment;
        });
      }, 100);
    } else if (loadingState === LoadingState.SUCCESS) {
      setProgress(100);
    }

    return () => clearInterval(interval);
  }, [loadingState]);

  const getLoadingMessage = (p: number) => {
    if (p < 25) return "Analyzing image...";
    if (p < 50) return "Understanding your request...";
    if (p < 75) return "Applying AI edits...";
    if (p < 90) return "Enhancing details...";
    return "Final touches...";
  };

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
    setProgress(0);
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
      <div className="w-full max-w-3xl mx-auto mt-8 p-12 border border-dashed border-gray-300 rounded-3xl bg-gray-50/50 hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer flex flex-col items-center justify-center text-center h-96 group"
           onClick={() => fileInputRef.current?.click()}>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          className="hidden" 
          accept="image/*"
        />
        <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-gray-900 transition-colors">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
            <circle cx="9" cy="9" r="2"></circle>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">Upload an Image</h3>
        <p className="text-gray-500 mb-8">Click to browse or drag a file here</p>
        <Button variant="primary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
          Select File
        </Button>
      </div>
    );
  }

  // Render Editor
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">
      
      {/* Prompt Bar */}
      <div className="sticky top-24 z-40 bg-white/90 backdrop-blur-xl p-2 rounded-full border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col sm:flex-row gap-2 items-center transition-all max-w-3xl mx-auto w-full">
        <div className="relative flex-grow w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask to edit... (e.g., 'Add a vintage filter')"
            className="block w-full pl-12 pr-4 py-3 rounded-full leading-5 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none sm:text-base transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto pr-1">
          <Button 
            onClick={handleGenerate} 
            disabled={!prompt.trim() || loadingState === LoadingState.GENERATING}
            isLoading={loadingState === LoadingState.GENERATING}
            className="flex-1 sm:flex-none w-full sm:w-auto"
          >
            Generate
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleReset}
            className="w-10 h-10 p-0 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50"
            title="Start Over"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-3xl mx-auto w-full bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          {error}
        </div>
      )}

      {/* Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px]">
        
        {/* Original Image Card */}
        <div className="group bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col h-full hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-shadow duration-500">
          <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-white">
            <span className="text-xs font-semibold tracking-wider uppercase text-gray-400">Original</span>
          </div>
          <div className="flex-grow relative bg-gray-50/50 flex items-center justify-center p-8">
            <img 
              src={originalImage.previewUrl || ''} 
              alt="Original" 
              className="max-w-full max-h-[600px] w-auto h-auto rounded-lg shadow-sm object-contain"
            />
          </div>
        </div>

        {/* Generated Image Card */}
        <div className={`group bg-white rounded-3xl border ${generatedImage ? 'border-blue-100 shadow-blue-100/50' : 'border-gray-100'} shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col h-full relative transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)]`}>
          <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-white">
            <span className={`text-xs font-semibold tracking-wider uppercase ${loadingState === LoadingState.GENERATING ? 'text-black' : 'text-gray-400'}`}>
              {loadingState === LoadingState.GENERATING ? 'Generating...' : 'Result'}
            </span>
            {generatedImage && (
              <Button variant="secondary" size="sm" onClick={handleDownload} className="h-8 px-3 text-xs bg-gray-50 border-gray-200 hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Save
              </Button>
            )}
          </div>
          <div className="flex-grow relative bg-gray-50/50 flex items-center justify-center p-8">
            {loadingState === LoadingState.GENERATING ? (
               <div className="flex flex-col items-center justify-center w-full max-w-xs">
                 <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-4 relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-black rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                 </div>
                 
                 <div className="flex flex-col items-center text-gray-500 gap-2">
                    <p className="text-sm font-medium animate-pulse text-black transition-all duration-500 text-center">
                      {getLoadingMessage(progress)}
                    </p>
                    <p className="text-xs text-gray-400">{Math.round(progress)}%</p>
                 </div>
              </div>
            ) : generatedImage ? (
               <img 
                src={generatedImage} 
                alt="Generated" 
                className="max-w-full max-h-[600px] w-auto h-auto rounded-lg shadow-lg object-contain animate-in fade-in duration-700"
              />
            ) : (
              <div className="text-gray-300 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm mb-4">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </div>
                <p className="text-sm font-medium text-gray-400">Your masterpiece will appear here</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};