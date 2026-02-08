
import React, { useCallback, useState, useEffect } from 'react';
import { UploadCloud, Loader2, AlertCircle, Key } from 'lucide-react';
import { parseSrtToText } from '../utils/srt';
import { generateBlogPost } from '../services/gemini';
import { BlogPost } from '../types';

interface UploadAreaProps {
  onPostCreated: (post: BlogPost) => void;
}

declare global {
  interface Window {
    // Use the existing global AIStudio type to avoid conflicts and resolve modifier errors
    aistudio: AIStudio;
  }
}

const UploadArea: React.FC<UploadAreaProps> = ({ onPostCreated }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<{ message: string; type?: 'key' } | null>(null);

  const handleOpenKeySelector = async () => {
    try {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        setError(null);
        // Assuming success after triggering the dialog to proceed smoothly as per guidelines
      }
    } catch (err) {
      console.error("Failed to open key selector", err);
    }
  };

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.srt')) {
      setError({ message: "Please upload a valid .srt file." });
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const textContent = await file.text();
      const parsedText = parseSrtToText(textContent);
      
      if (parsedText.length < 50) {
        throw new Error("SRT content is too short to generate a blog post.");
      }

      const generated = await generateBlogPost(parsedText);

      const newPost: BlogPost = {
        id: Date.now().toString(),
        title: generated.title,
        summary: generated.summary,
        content: generated.content,
        originalSrt: textContent,
        fileName: file.name,
        createdAt: Date.now(),
      };

      onPostCreated(newPost);
    } catch (err: any) {
      console.error("Processing error:", err);
      // Catch key-related errors from SDK or our own service logic
      if (err.message === 'API_KEY_MISSING' || err.message === 'API_KEY_INVALID' || err.message?.includes("API Key must be set")) {
        setError({ 
          message: "API Key is missing or invalid in the browser environment. Please select a valid key from a paid project.", 
          type: 'key' 
        });
      } else {
        setError({ message: err.message || "Failed to process the file." });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ease-in-out
          ${isProcessing ? 'bg-slate-50 border-slate-200 cursor-not-allowed' : 
            isDragOver ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-slate-200 hover:border-primary/40 hover:bg-slate-50/50'}
        `}
      >
        <input
          type="file"
          accept=".srt"
          onChange={handleFileInput}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="flex flex-col items-center justify-center space-y-6">
          {isProcessing ? (
            <>
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                <Loader2 className="w-16 h-16 text-primary animate-spin relative" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">Processing Transcript...</h3>
                <p className="text-slate-500 font-medium">Analyzing your content and formatting the blog post.</p>
              </div>
            </>
          ) : (
            <>
              <div className={`p-6 rounded-3xl transition-colors duration-300 ${isDragOver ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'bg-slate-100 text-slate-400'}`}>
                <UploadCloud className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">
                  Drop your SRT file
                </h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto font-medium">
                  We'll instantly transform your subtitles into a high-quality blog post.
                </p>
              </div>
              <div className="pt-4">
                <span className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                  Click to Browse
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className={`mt-6 p-5 border rounded-2xl flex flex-col gap-4 animate-fadeIn ring-4 ${error.type === 'key' ? 'bg-amber-50 border-amber-100 ring-amber-50/50 text-amber-900' : 'bg-red-50 border-red-100 ring-red-50/50 text-red-600'}`}>
          <div className="flex items-start gap-4">
            {error.type === 'key' ? <Key className="w-6 h-6 flex-shrink-0" /> : <AlertCircle className="w-6 h-6 flex-shrink-0" />}
            <div className="space-y-1">
               <p className="text-sm font-black uppercase tracking-tight">{error.type === 'key' ? 'Configuration Required' : 'Processing Error'}</p>
               <p className="text-sm font-medium leading-relaxed opacity-80">{error.message}</p>
            </div>
          </div>
          
          {error.type === 'key' && window.aistudio && (
            <button
              onClick={handleOpenKeySelector}
              className="w-full py-3 bg-amber-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-200 hover:bg-amber-700 transition-all flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              Set API Key via Google AI Studio
            </button>
          )}
          
          {error.type === 'key' && (
            <div className="text-[10px] font-bold text-amber-600/60 uppercase tracking-widest text-center px-4">
              A paid project is mandatory for Gemini 3 preview models. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline">Billing Info</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadArea;
