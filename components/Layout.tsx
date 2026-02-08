import React from 'react';
import { BookOpen, Github } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onHomeClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onHomeClick }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onHomeClick}
          >
            <div className="bg-primary/10 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">SubScribe</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded-full text-slate-500">
                Gemini Powered
             </span>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} SubScribe. Transform your subtitles into stories.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;