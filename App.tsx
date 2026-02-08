import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import UploadArea from './components/UploadArea';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import { BlogPost, ViewState } from './types';
import { X } from 'lucide-react';

const STORAGE_KEY = 'srt_blog_posts_v1';

const App: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Load posts from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPosts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load posts", e);
      }
    }
  }, []);

  // Save posts whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  const handlePostCreated = (newPost: BlogPost) => {
    setPosts(prev => [newPost, ...prev]);
    setActivePost(newPost);
    setView(ViewState.POST);
    setIsUploadModalOpen(false);
    window.scrollTo(0, 0);
  };

  const handleSelectPost = (post: BlogPost) => {
    setActivePost(post);
    setView(ViewState.POST);
    window.scrollTo(0, 0);
  };

  const handleDeletePost = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this post?")) {
      setPosts(prev => prev.filter(p => p.id !== id));
      if (activePost?.id === id) {
        setView(ViewState.HOME);
        setActivePost(null);
      }
    }
  };

  const handleGoHome = () => {
    setView(ViewState.HOME);
    setActivePost(null);
    window.scrollTo(0, 0);
  };

  return (
    <Layout 
      onHomeClick={handleGoHome} 
      onUploadClick={() => setIsUploadModalOpen(true)}
    >
      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fadeIn"
            onClick={() => setIsUploadModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-popIn">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Create New Blog Post</h3>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8">
              <UploadArea onPostCreated={handlePostCreated} />
            </div>
          </div>
        </div>
      )}

      {view === ViewState.HOME && (
        <>
          <section className="mb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
                  Your <span className="text-primary">Library</span>
                </h1>
                <p className="text-slate-500 mt-2 font-medium">
                  Manage and view your AI-generated articles.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                Total Articles: 
                <span className="text-primary">{posts.length}</span>
              </div>
            </div>
            
            <PostList 
              posts={posts} 
              onSelectPost={handleSelectPost}
              onDeletePost={handleDeletePost}
            />
          </section>
        </>
      )}

      {view === ViewState.POST && activePost && (
        <PostDetail 
          post={activePost} 
          onBack={handleGoHome} 
        />
      )}
    </Layout>
  );
};

export default App;