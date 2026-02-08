import React from 'react';
import { BlogPost } from '../types';
import { Calendar, FileText, ArrowRight, Trash2 } from 'lucide-react';

interface PostListProps {
  posts: BlogPost[];
  onSelectPost: (post: BlogPost) => void;
  onDeletePost: (e: React.MouseEvent, id: string) => void;
}

const PostList: React.FC<PostListProps> = ({ posts, onSelectPost, onDeletePost }) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
          <FileText className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">No posts yet</h3>
        <p className="text-slate-500 mt-1">Upload an SRT file above to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
      {posts.map((post) => (
        <div 
          key={post.id} 
          onClick={() => onSelectPost(post)}
          className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
        >
          <div className="p-6 flex-grow">
            <div className="flex items-start justify-between mb-2">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                <Calendar className="w-3 h-3" />
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={(e) => onDeletePost(e, post.id)}
                className="text-slate-300 hover:text-red-500 transition-colors p-1"
                title="Delete post"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
            
            <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
              {post.summary}
            </p>
          </div>
          
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium bg-white px-2 py-1 rounded border border-slate-200 truncate max-w-[150px]">
              {post.fileName}
            </span>
            <span className="text-sm font-semibold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Read <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostList;