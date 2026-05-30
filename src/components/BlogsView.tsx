import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Eye, Calendar, MessageSquare, ArrowLeft, Search, Tag, Send, AlertCircle, BookOpen, Clock } from 'lucide-react';
import { User, BlogPost, BlogComment } from '../types.js';

interface BlogsViewProps {
  user: User | null;
  token: string | null;
  setCurrentTab: (tab: string) => void;
  openLoginModal: () => void;
}

export default function BlogsView({ user, token, setCurrentTab, openLoginModal }: BlogsViewProps) {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Comment state
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // Fetch blogs
  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/blogs');
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please try again later.');
      }
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch blogs');
      }
      
      setBlogs(data.blogs || []);
    } catch (err: any) {
      console.error('Error loading blogs:', err);
      setError(err.message || 'Unable to connect to the server to fetch blogs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Fetch specific blog by slug or ID to register a view increment and fetch fresh comments
  const handleSelectBlog = async (blog: BlogPost) => {
    try {
      setSelectedBlog(blog);
      // Increment views on server
      const res = await fetch(`/api/blogs/${blog.slug}`);
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.blog) {
          setSelectedBlog(data.blog);
          
          // Update in local state list so visual stats are updated too
          setBlogs(prev => prev.map(b => b.id === data.blog.id ? data.blog : b));
        }
      }
    } catch (err) {
      console.warn('Silent failure incrementing blog views detail:', err);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token || !selectedBlog) {
      openLoginModal();
      return;
    }

    if (!newComment.trim()) {
      setCommentError('Comment cannot be blank');
      return;
    }

    try {
      setCommentSubmitting(true);
      setCommentError(null);

      const res = await fetch(`/api/blogs/${selectedBlog.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment.trim() })
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON comment response.');
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to post comment');
      }

      // Update current selected blog with the returned comments
      setSelectedBlog(data.blog);
      setBlogs(prev => prev.map(b => b.id === data.blog.id ? data.blog : b));
      setNewComment('');
    } catch (err: any) {
      setCommentError(err.message || 'Failed to publish comment. Please try again.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Get all unique tags
  const allTags = Array.from(
    new Set(blogs.flatMap(blog => blog.tags || []))
  );

  // Filtered blogs (excluding selected blog if reading details)
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          blog.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || (blog.tags && blog.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  // Simple clean markdown-to-html custom parser
  const renderRichMarkdown = (content: string) => {
    if (!content) return null;
    const blocks = content.split('\n\n');
    
    return blocks.map((block, index) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      // Unordered list items parsing
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const items = trimmed.split(/\n[\*\-]\s/);
        return (
          <ul key={index} className="list-disc list-inside space-y-2.5 my-4 text-slate-300 leading-relaxed font-sans pl-2">
            {items.map((item, id) => {
              const cleanItem = item.replace(/^[\*\-]\s/, '');
              return (
                <li key={id} className="text-slate-300">
                  {parseInlineFormatting(cleanItem)}
                </li>
              );
            })}
          </ul>
        );
      }

      // Headers handling
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={index} className="text-lg font-display font-bold text-slate-100 tracking-wide mt-6 mb-3 border-l-2 border-cyan-400 pl-3">
            {parseInlineFormatting(trimmed.substring(4))}
          </h4>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={index} className="text-xl font-display font-extrabold text-slate-50 tracking-wide mt-8 mb-4 border-l-3 border-cyan-500 pl-4">
            {parseInlineFormatting(trimmed.substring(3))}
          </h3>
        );
      }
      if (trimmed.startsWith('# ')) {
        return (
          <h2 key={index} className="text-2xl font-display font-black text-white tracking-wider mt-10 mb-5 pl-1">
            {parseInlineFormatting(trimmed.substring(2))}
          </h2>
        );
      }

      // Fallback Paragraph with bold/italic parsing
      return (
        <p key={index} className="text-slate-300 leading-relaxed font-sans mb-4.5 text-[15px]">
          {parseInlineFormatting(trimmed)}
        </p>
      );
    });
  };

  // Helper parser for **bold** inline styles
  const parseInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="text-cyan-400 font-bold">
            {part.substring(2, part.length - 2)}
          </strong>
        );
      }
      return part;
    });
  };

  const featuredBlog = blogs.find(b => b.isFeatured);

  return (
    <div id="blog-root" className="min-h-screen bg-slate-950 text-slate-100 pt-8 pb-16 px-4 sm:px-6 relative">
      {/* Background Soft Gradients */}
      <div className="absolute top-12 left-10 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-[350px] h-[350px] bg-yellow-500/3 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        
        {/* ==========================================
            1. DETAIL VIEW BLOCK
           ========================================== */}
        {selectedBlog ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-10"
          >
            {/* Main content body (col-span-2) */}
            <div className="lg:col-span-2 space-y-6">
              <button
                onClick={() => setSelectedBlog(null)}
                className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors font-semibold group cursor-pointer"
              >
                <ArrowLeft className="h-4.5 w-4.5 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Blogs</span>
              </button>

              <div className="rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-2xl p-6 sm:p-8 space-y-6">
                
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/40 text-cyan-400">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Learning Article</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(selectedBlog.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    <span>{selectedBlog.views || 0} views</span>
                  </div>
                </div>

                <h1 className="font-display font-black text-2xl sm:text-3.5xl text-slate-100 tracking-tight leading-tight">
                  {selectedBlog.title}
                </h1>

                {/* Author card banner */}
                <div className="flex items-center space-x-3.5 py-3 border-t border-b border-slate-800 text-sm">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-400 to-yellow-500 p-[1.5px]">
                    <div className="h-full w-full rounded-full bg-slate-900 border border-slate-800 flex items-center justify-between font-mono font-bold text-xs text-slate-300 justify-center">
                      {selectedBlog.author.substring(0,2).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200">Written by {selectedBlog.author}</p>
                    <p className="text-xs text-slate-400 font-mono">Let's Success Certified Coach</p>
                  </div>
                </div>

                {/* Big article cover thumbnail */}
                <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-slate-800 shadow-lg">
                  <img 
                    src={selectedBlog.thumbnailUrl} 
                    alt={selectedBlog.title} 
                    referrerPolicy="no-referrer"
                    className="object-cover w-full h-full scale-[1.01]" 
                  />
                </div>

                {/* Main Content Parser */}
                <div className="article-body">
                  {renderRichMarkdown(selectedBlog.content)}
                </div>

                {/* Blog tags */}
                <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-800">
                  {selectedBlog.tags && selectedBlog.tags.map(t => (
                    <span 
                      key={t}
                      className="inline-flex items-center space-x-1 text-xs font-mono bg-cyan-950/40 text-cyan-400 px-3 py-1.5 rounded-full border border-cyan-800/30"
                    >
                      <Tag className="h-3 w-3" />
                      <span>{t}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* ======================= COMMENT REGISTRATION ======================= */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 space-y-6">
                <h3 className="font-display font-bold text-lg text-slate-100 flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-yellow-500" />
                  <span>Discussion ({selectedBlog.comments ? selectedBlog.comments.length : 0})</span>
                </h3>

                {/* List Comments */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {!selectedBlog.comments || selectedBlog.comments.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No comments published yet. Start the discussion!</p>
                  ) : (
                    selectedBlog.comments.map((comm) => (
                      <div key={comm.id} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-sm space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200 capitalize">{comm.userName}</span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {new Date(comm.createdAt).toLocaleDateString() === new Date().toLocaleDateString() ? 'Today' : new Date(comm.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-400 break-words leading-relaxed">{comm.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Leave comment */}
                <form onSubmit={handleSubmitComment} className="mt-6 border-t border-slate-800/60 pt-6 space-y-3">
                  <p className="text-xs text-slate-400">Signed in as <span className="text-cyan-400 font-mono">{user ? user.name : 'Guest Reader'}</span></p>
                  
                  {commentError && (
                    <div className="p-3 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2 animate-shake">
                      <AlertCircle className="h-4 w-4" />
                      <span>{commentError}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={user ? "Share your thoughts, ask a question..." : "Please sign in to write an answer..."}
                      disabled={commentSubmitting}
                      className="grow bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/60 transition-colors"
                    />
                    
                    {user ? (
                      <button
                        type="submit"
                        disabled={commentSubmitting}
                        className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 font-bold text-slate-950 transition-all shadow-md cursor-pointer disabled:opacity-50"
                      >
                        {commentSubmitting ? (
                          <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent animate-spin rounded-full"></div>
                        ) : (
                          <>
                            <span>Comment</span>
                            <Send className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={openLoginModal}
                        className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all cursor-pointer"
                      >
                        Sign In
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar with related/recent blogs */}
            <div className="space-y-6">
              <h3 className="font-display font-extrabold text-base text-slate-200 uppercase tracking-widest border-b border-slate-800 pb-2">
                Recent Articles
              </h3>
              <div className="space-y-4">
                {blogs
                  .filter(b => b.id !== selectedBlog.id)
                  .slice(0, 4)
                  .map(b => (
                    <div 
                      key={b.id}
                      onClick={() => handleSelectBlog(b)}
                      className="group flex gap-4 cursor-pointer p-2.5 rounded-xl border border-transparent hover:border-slate-800 hover:bg-slate-900/30 transition-all duration-200"
                    >
                      <img 
                        src={b.thumbnailUrl} 
                        alt={b.title} 
                        referrerPolicy="no-referrer"
                        className="h-14 w-20 object-cover rounded-md border border-slate-800/80 scale-[1]"
                      />
                      <div className="flex flex-col justify-center">
                        <span className="text-xs text-cyan-400 font-mono mb-0.5">
                          {b.tags && b.tags[0]}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-300 group-hover:text-cyan-300 line-clamp-1 transition-colors">
                          {b.title}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-500 mt-0.5">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
              
              <div className="p-6 rounded-2xl bg-gradient-to-tr from-cyan-950/20 to-slate-900 border border-cyan-500/10 text-center space-y-4 shadow-xl">
                <h4 className="font-display font-extrabold text-slate-200 text-base">
                  Earn Direct Commissions!
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed px-1">
                  Master digital skills like Affiliate Marketing, YouTube channels, and Stocks trading. Earn direct 80% rewards by inviting teammates!
                </p>
                <button
                  onClick={() => setCurrentTab('packages')}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-600 font-bold text-xs text-slate-950 hover:from-yellow-400 transition-colors shadow shadow-yellow-500/20 cursor-pointer"
                >
                  Explore Packages
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          
          /* ==========================================
              2. LISTS & FILTERS SHOWCASE
             ========================================== */
          <div className="space-y-10 animate-fade-in">
            <div className="text-center space-y-3.5 max-w-2xl mx-auto pt-4">
              <span className="font-mono text-xs text-cyan-400 font-bold uppercase tracking-widest px-3 py-1 bg-cyan-950/40 border border-cyan-800/30 rounded-full">
                Knowledge Core
              </span>
              <h1 className="font-display font-black text-3.5xl sm:text-5xl tracking-tight text-white leading-tight">
                Let's Success <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-yellow-500">Learning Blog</span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed px-4">
                Unlock expert insights, strategies, and growth-proven systems to command digital tools and master high-yielding passive income models.
              </p>
            </div>

            {/* Filter and search bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-t border-b border-slate-800/80 py-5">
              
              {/* Tags select flow */}
              <div className="flex flex-wrap items-center gap-1.5 order-2 md:order-1 justify-center md:justify-start w-full md:w-auto">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-semibold cursor-pointer border transition-all ${
                    selectedTag === null
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow shadow-cyan-500/5'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  All Tags
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-semibold cursor-pointer border transition-all ${
                      selectedTag === tag
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow shadow-cyan-500/5'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>

              {/* Search text filter */}
              <div className="relative w-full md:w-72 order-1 md:order-2">
                <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Query posts..."
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2 px-10 text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-all font-mono"
                />
              </div>
            </div>

            {/* ERROR INDICATOR */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm max-w-xl mx-auto flex items-center space-x-3.5">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Unable to Feed Blogs</p>
                  <p className="text-xs text-rose-400/80">{error}</p>
                </div>
              </div>
            )}

            {/* LOADING PLACEHOLDERS */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6.5">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="rounded-2xl border border-slate-800 bg-slate-900/30 h-96 animate-pulse p-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="bg-slate-800 h-44 rounded-xl"></div>
                      <div className="bg-slate-800 h-6 w-3/4 rounded"></div>
                      <div className="bg-slate-800 h-4 w-1/2 rounded"></div>
                    </div>
                    <div className="bg-slate-800 h-8 w-1/3 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* ======================= HERO FEATURED SPOTLIGHT ======================= */}
                {featuredBlog && !selectedTag && !searchQuery && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group rounded-2xl overflow-hidden border border-slate-800/80 bg-gradient-to-r from-slate-900 to-slate-950 shadow-xl cursor-bypass p-1.5"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-5">
                      <div className="lg:col-span-7 relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto h-full min-h-[250px] sm:min-h-[300px] rounded-xl overflow-hidden border border-slate-800">
                        <img 
                          src={featuredBlog.thumbnailUrl} 
                          alt={featuredBlog.title} 
                          referrerPolicy="no-referrer"
                          className="object-cover w-full h-full group-hover:scale-[1.02] transition-transform duration-500" 
                        />
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 text-[10px] font-mono font-black py-1 px-2.5 rounded shadow">
                          ★ SPOTLIGHT FEATURED
                        </div>
                      </div>
                      
                      <div className="lg:col-span-5 flex flex-col justify-between py-2 sm:px-3 space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-1.5 text-xs text-cyan-400 font-mono">
                            <span>#{featuredBlog.tags && featuredBlog.tags[0]}</span>
                            <span>•</span>
                            <span>{new Date(featuredBlog.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          <h2 className="font-display font-black text-xl sm:text-2.5xl text-slate-100 leading-tight group-hover:text-cyan-300 transition-colors">
                            {featuredBlog.title}
                          </h2>
                          
                          <p className="text-sm text-slate-400 leading-relaxed line-clamp-4">
                            {featuredBlog.summary}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                          <div className="flex items-center space-x-5 text-xs font-mono text-slate-500">
                            <span className="flex items-center space-x-1">
                              <Eye className="h-3.5 w-3.5" />
                              <span>{featuredBlog.views || 0}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span>{featuredBlog.comments ? featuredBlog.comments.length : 0}</span>
                            </span>
                          </div>

                          <button
                            onClick={() => handleSelectBlog(featuredBlog)}
                            className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-cyan-500 text-slate-200 hover:text-slate-950 font-bold text-xs transition-all cursor-pointer"
                          >
                            Read Article
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ======================= MAIN GRID CARD SECTION ======================= */}
                {filteredBlogs.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <BookOpen className="h-10 w-10 text-slate-600 mx-auto" />
                    <p className="text-sm text-slate-400 italic">No articles found matching the filter query.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                    {filteredBlogs.map((blog) => (
                      <motion.div
                        layout
                        key={blog.id}
                        className="group flex flex-col justify-between rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/60 transition-all duration-300 hover:scale-[1.01] hover:border-cyan-500/20 shadow-lg p-4"
                      >
                        <div className="space-y-4">
                          {/* Thumbnail */}
                          <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-slate-800/60 bg-slate-950">
                            <img 
                              src={blog.thumbnailUrl} 
                              alt={blog.title} 
                              referrerPolicy="no-referrer"
                              className="object-cover w-full h-full group-hover:scale-[1.02] transition-transform duration-300"
                            />
                            {blog.isFeatured && (
                              <div className="absolute top-2.5 left-2.5 bg-yellow-500 text-slate-950 text-[9px] font-mono font-black py-0.5 px-2 rounded">
                                FEATURED
                              </div>
                            )}
                          </div>

                          {/* Metadata */}
                          <div className="flex items-center space-x-2.5 text-xs text-slate-500 font-mono">
                            <span className="text-cyan-400">#{blog.tags && blog.tags[0]}</span>
                            <span>•</span>
                            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                          </div>

                          {/* Title & summary */}
                          <div className="space-y-2">
                            <h3 className="font-display font-bold text-base sm:text-lg text-slate-100 group-hover:text-cyan-300 line-clamp-2 transition-colors">
                              {blog.title}
                            </h3>
                            <p className="text-slate-400 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                              {blog.summary}
                            </p>
                          </div>
                        </div>

                        {/* Actions and stats footprint */}
                        <div className="flex items-center justify-between border-t border-slate-800 mt-5 pt-4">
                          <div className="flex items-center space-x-4 text-xs font-mono text-slate-500">
                            <span className="flex items-center space-x-1">
                              <Eye className="h-3.5 w-3.5" />
                              <span>{blog.views || 0}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span>{blog.comments ? blog.comments.length : 0}</span>
                            </span>
                          </div>

                          <button
                            onClick={() => handleSelectBlog(blog)}
                            className="bg-slate-950 hover:bg-cyan-500 text-slate-300 hover:text-slate-950 px-4 py-2 rounded-lg font-bold text-xs transition-all border border-slate-800/80 hover:border-transparent cursor-pointer"
                          >
                            Read More
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
