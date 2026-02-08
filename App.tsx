import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import UploadArea from './components/UploadArea';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import { BlogPost, ViewState } from './types';

const STORAGE_KEY = 'srt_blog_posts_v1';

const App: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

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
    <Layout onHomeClick={handleGoHome}>
      {view === ViewState.HOME && (
        <>
          <section className="mb-12 text-center">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
              Turn Subtitles into <span className="text-primary">Stories</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Upload an SRT file and let AI organize it into a beautifully formatted blog post. 
              We preserve your words while fixing typos and structuring paragraphs.
            </p>
          </section>

          <UploadArea onPostCreated={handlePostCreated} />

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              Your Library
              <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                {posts.length}
              </span>
            </h2>
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