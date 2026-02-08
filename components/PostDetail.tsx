import React, { useState } from 'react';
import { BlogPost } from '../types';
import { ArrowLeft, Download, FileCode, Clock, BookOpen, FileText, Sparkles, Share2, Check, Copy } from 'lucide-react';

interface PostDetailProps {
  post: BlogPost;
  onBack: () => void;
}

const PostDetail: React.FC<PostDetailProps> = ({ post, onBack }) => {
  const [showSrt, setShowSrt] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const downloadSrt = () => {
    const blob = new Blob([post.originalSrt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = post.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const shareData = {
      title: post.title,
      text: post.summary,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  };

  const wordCount = post.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <div className="animate-fadeIn pb-32 max-w-4xl mx-auto">
      {/* Top Navigation Row */}
      <nav className="mb-12 flex items-center justify-between px-2">
        <button 
          onClick={onBack}
          className="group inline-flex items-center gap-3 text-sm font-semibold text-slate-500 hover:text-primary transition-all"
        >
          <div className="p-2.5 rounded-full bg-white shadow-sm group-hover:bg-primary/5 transition-colors border border-slate-100">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Dashboard
        </button>
        
        <div className="flex items-center gap-3 relative">
           <button 
             onClick={handleShare}
             className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all shadow-sm font-bold text-sm
               ${isCopied 
                 ? 'bg-green-50 border-green-200 text-green-600' 
                 : 'bg-white border-slate-100 text-slate-600 hover:text-primary hover:border-primary/20 hover:bg-slate-50'
               }`}
           >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 animate-popIn" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Share Post
                </>
              )}
           </button>
        </div>
      </nav>

      {/* Article Container */}
      <article className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden ring-1 ring-slate-100/50">
        
        {/* Elegant Header Area */}
        <header className="relative pt-16 pb-12 px-8 md:px-20 text-center border-b border-slate-50">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-primary rounded-b-full shadow-[0_0_15px_rgba(37,99,235,0.3)]"></div>
          
          <div className="flex items-center justify-center gap-3 text-xs font-bold tracking-[0.2em] text-primary uppercase mb-8">
            <span className="w-8 h-[1px] bg-primary/20"></span>
            <span className="flex items-center gap-2 bg-primary/5 px-4 py-1.5 rounded-full">
               <Sparkles className="w-3.5 h-3.5" />
               AI Processed
            </span>
            <span className="w-8 h-[1px] bg-primary/20"></span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-10 font-sans leading-[1.15] tracking-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-400 mb-12">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-300" />
              {new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
            <span className="flex items-center gap-2">
               <BookOpen className="w-4 h-4 text-slate-300" />
               {readTime} min read
            </span>
          </div>

          {/* Premium Summary Card */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-primary/5 rounded-[2rem] -rotate-1 translate-y-1"></div>
            <div className="relative bg-white border border-primary/10 rounded-[2rem] p-8 md:p-10 shadow-sm text-left">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 text-white">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Executive Summary</h3>
               </div>
               <p className="text-xl md:text-2xl text-slate-600 font-serif leading-relaxed italic">
                 {post.summary}
               </p>
            </div>
          </div>
        </header>

        {/* Content Body with Enhanced Typography */}
        <div className="px-8 md:px-20 py-16">
            <div className="max-w-none prose prose-slate 
              prose-xl md:prose-2xl 
              prose-headings:font-sans prose-headings:font-black prose-headings:text-slate-900 
              prose-h2:text-3xl md:prose-h2:text-4xl prose-h2:mt-24 prose-h2:mb-10 prose-h2:tracking-tight
              prose-p:font-serif prose-p:text-slate-700 prose-p:leading-[1.8] prose-p:mb-12
              prose-strong:text-slate-900 prose-strong:font-bold
              prose-img:rounded-3xl
              ">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
            
            <div className="mt-24 pt-12 border-t border-slate-100 flex flex-col items-center">
                <div className="w-12 h-1 bg-slate-100 rounded-full mb-8"></div>
                <div className="text-slate-400 text-sm font-medium uppercase tracking-widest flex items-center gap-4">
                   <span className="w-8 h-[1px] bg-slate-100"></span>
                   Finis
                   <span className="w-8 h-[1px] bg-slate-100"></span>
                </div>
            </div>
        </div>
      </article>

      {/* Styled Footer Attachments */}
      <section className="mt-16 bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 text-slate-400 border border-slate-100">
                <FileCode className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Transcript Resource</h4>
                <p className="text-sm text-slate-400 font-medium">{post.fileName}</p>
              </div>
           </div>
           
           <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={() => setShowSrt(!showSrt)}
                className="flex-1 md:flex-none justify-center px-6 py-3.5 rounded-2xl text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                {showSrt ? 'Close Preview' : 'Preview Original'}
              </button>
              <button 
                onClick={downloadSrt}
                className="flex-1 md:flex-none justify-center px-6 py-3.5 rounded-2xl text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center gap-2 group"
              >
                <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                Download SRT
              </button>
           </div>
        </div>

        {showSrt && (
          <div className="mt-8 relative animate-fadeIn">
            <div className="absolute top-0 right-0 p-4 z-10">
               <span className="px-3 py-1 rounded-full bg-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Raw SRT Source</span>
            </div>
            <div className="bg-slate-900 rounded-3xl overflow-hidden ring-4 ring-slate-100 shadow-inner">
              <pre className="p-8 text-slate-300 font-mono text-xs overflow-auto max-h-[400px] custom-scrollbar whitespace-pre-wrap leading-relaxed">
                {post.originalSrt}
              </pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default PostDetail;