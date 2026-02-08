import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, Loader2, AlertCircle } from 'lucide-react';
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
      setError(err.message || "Failed to process the file. Please try again.");
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
    <div className="w-full mb-12">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ease-in-out
          ${isProcessing ? 'bg-slate-50 border-slate-300 cursor-not-allowed' : 
            isDragOver ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-slate-300 hover:border-primary/50 hover:bg-slate-50'}
        `}
      >
        <input
          type="file"
          accept=".srt"
          onChange={handleFileInput}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          {isProcessing ? (
            <>
              <div className="animate-spin text-primary">
                <Loader2 className="w-12 h-12" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Processing Subtitles...</h3>
                <p className="text-slate-500">Reading SRT, analyzing semantics, and writing your post.</p>
              </div>
            </>
          ) : (
            <>
              <div className={`p-4 rounded-full ${isDragOver ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}`}>
                <UploadCloud className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-900">
                  Upload .srt file
                </h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Drag and drop your subtitle file here, or click to browse. We'll convert it into a readable blog post instantly.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default UploadArea;