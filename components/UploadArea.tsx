import React, { useCallback, useState } from 'react';
import { UploadCloud, Loader2, AlertCircle, Key, RefreshCcw, ShieldAlert, FileWarning, ZapOff } from 'lucide-react';
import { parseSrtToText } from '../utils/srt';
import { generateBlogPost } from '../services/gemini';
import { BlogPost } from '../types';

interface UploadAreaProps {
  onPostCreated: (post: BlogPost) => void;
}

// Fixed: Removed conflicting 'declare global' for 'aistudio' to resolve TS 'identical modifiers' and 'subsequent property declarations' errors.
// The environment already provides these types.

interface AppError {
  title: string;
  message: string;
  type: 'key' | 'usage' | 'validation' | 'service';
  icon: React.ElementType;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onPostCreated }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const getFriendlyError = (err: any): AppError => {
    const msg = err.message || "";
    
    // Fixed: Added check for "Requested entity was not found" as per API Key Selection guidelines.
    if (msg === 'API_KEY_MISSING' || msg === 'API_KEY_INVALID' || msg.includes("API Key must be set") || msg.includes("Requested entity was not found")) {
      return {
        title: "API Key Required",
        message: "A valid API Key from a paid Google Cloud project is required to use the Gemini 3 models.",
        type: 'key',
        icon: Key
      };
    }
    
    if (msg === 'RATE_LIMIT_EXCEEDED') {
      return {
        title: "Rate Limit Exceeded",
        message: "You've sent too many requests in a short period. Please wait a minute before trying again.",
        type: 'usage',
        icon: RefreshCcw
      };
    }

    if (msg === 'SERVICE_OVERLOADED') {
      return {
        title: "Service Overloaded",
        message: "The AI service is currently experiencing high demand. Please try again in a few moments.",
        type: 'service',
        icon: ZapOff
      };
    }

    if (msg === 'CONTENT_SAFETY_FILTER') {
      return {
        title: "Content Blocked",
        message: "The AI safety filters were triggered by this content. Try a different transcript.",
        type: 'validation',
        icon: ShieldAlert
      };
    }

    if (msg === 'SRT_TOO_SHORT') {
      return {
        title: "Transcript Too Short",
        message: "This SRT file doesn't contain enough text content to generate a meaningful blog post.",
        type: 'validation',
        icon: FileWarning
      };
    }

    if (msg === 'EMPTY_FILE') {
      return {
        title: "Empty File",
        message: "The uploaded file is empty. Please check your SRT file and try again.",
        type: 'validation',
        icon: FileWarning
      };
    }

    return {
      title: "Processing Failed",
      message: msg || "An unexpected error occurred while transforming your subtitles.",
      type: 'validation',
      icon: AlertCircle
    };
  };

  const handleOpenKeySelector = async () => {
    try {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        await aistudio.openSelectKey();
        setError(null);
      }
    } catch (err) {
      console.error("Failed to open key selector", err);
    }
  };

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.srt')) {
      setError({
        title: "Invalid File Type",
        message: "Only .srt files are supported at this time.",
        type: 'validation',
        icon: FileWarning
      });
      return;
    }

    if (file.size === 0) {
      setError(getFriendlyError(new Error('EMPTY_FILE')));
      return;
    }

    setError(null);

    // Fixed: Added mandatory API key selection check before using Gemini 3 series models.
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      const hasKey = await aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await handleOpenKeySelector();
        // Fixed: Mitigate race condition by proceeding immediately after triggering openSelectKey.
      }
    }

    setIsProcessing(true);

    try {
      const textContent = await file.text();
      const parsedText = parseSrtToText(textContent);
      
      if (!parsedText || parsedText.trim().length === 0) {
        throw new Error("EMPTY_FILE");
      }
      
      if (parsedText.length < 50) {
        throw new Error("SRT_TOO_SHORT");
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
      setError(getFriendlyError(err));
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
        <div className={`mt-6 p-5 border rounded-2xl flex flex-col gap-4 animate-fadeIn ring-4 
          ${error.type === 'key' ? 'bg-amber-50 border-amber-100 ring-amber-50/50 text-amber-900' : 
            error.type === 'usage' ? 'bg-blue-50 border-blue-100 ring-blue-50/50 text-blue-900' :
            error.type === 'service' ? 'bg-purple-50 border-purple-100 ring-purple-50/50 text-purple-900' :
            'bg-red-50 border-red-100 ring-red-50/50 text-red-600'}`}>
          
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-xl ${
              error.type === 'key' ? 'bg-amber-100' : 
              error.type === 'usage' ? 'bg-blue-100' : 
              error.type === 'service' ? 'bg-purple-100' : 
              'bg-red-100'
            }`}>
              <error.icon className="w-5 h-5 flex-shrink-0" />
            </div>
            <div className="space-y-1">
               <p className="text-sm font-black uppercase tracking-tight">{error.title}</p>
               <p className="text-sm font-medium leading-relaxed opacity-80">{error.message}</p>
            </div>
          </div>
          
          {error.type === 'key' && (window as any).aistudio && (
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