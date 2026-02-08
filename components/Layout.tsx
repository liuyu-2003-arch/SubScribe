import React from 'react';
import { BookOpen, Plus } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onHomeClick: () => void;
  onUploadClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onHomeClick, onUploadClick }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onHomeClick}
          >
            <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/20">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="font-black text-2xl tracking-tighter text-slate-900">SubScribe</span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">SRT to Blog</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={onUploadClick}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-full font-bold text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              New Post
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 opacity-30 mb-4">
             <BookOpen className="w-5 h-5" />
             <span className="font-black tracking-tighter">SubScribe</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">© {new Date().getFullYear()} SubScribe. Transform your subtitles into stories.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;