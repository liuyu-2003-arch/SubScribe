import React, { useCallback, useState } from 'react';
import { UploadCloud, Loader2, AlertCircle } from 'lucide-react';
import { parseSrtToText } from '../utils/srt';
import { generateBlogPost } from '../services/gemini';
import { BlogPost } from '../types';

interface UploadAreaProps {
  onPostCreated: (post: BlogPost) => void;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onPostCreated }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.srt')) {
      setError("Please upload a valid .srt file.");
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
      console.error(err);
      setError(err.message || "Failed to process the file. Please check your API Key in Vercel settings.");
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
                <h3 className="text-xl font-black text-slate-900">Magical things are happening...</h3>
                <p className="text-slate-500 font-medium">Analyzing your video transcript and structuring paragraphs.</p>
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
        <div className="mt-6 p-5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4 text-red-600 animate-fadeIn ring-4 ring-red-50/50">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <div className="space-y-1">
             <p className="text-sm font-black uppercase tracking-tight">Processing Error</p>
             <p className="text-sm font-medium leading-relaxed opacity-80">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadArea;