/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Search, Video, Loader2, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { searchYouTubeVideos, type YouTubeVideo } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const results = await searchYouTubeVideos(query);
      setVideos(results);
      if (results.length > 0) {
        // Automatically play the first video as requested
        setSelectedVideo(results[0]);
      } else {
        setError("No videos found. Try a different search term.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch videos. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setVideos([]);
    setSelectedVideo(null);
    setError(null);
    searchInputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans selection:bg-red-500/30">
      {/* Header / Search Bar */}
      <header className="sticky top-0 z-50 bg-[#0f0f0f]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
              <Video className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">
              Tube<span className="text-red-600">Play</span>
            </h1>
          </div>

          <form 
            onSubmit={handleSearch}
            className="relative flex-1 w-full max-w-2xl group"
          >
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search YouTube..."
              className="w-full bg-zinc-900/50 border border-white/10 rounded-full py-3 pl-12 pr-24 focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600/50 transition-all placeholder:text-zinc-600"
            />
            <div className="absolute inset-y-0 right-2 flex items-center gap-2">
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="p-2 text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </button>
            </div>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Video Player Area */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {selectedVideo ? (
                <motion.div
                  key={selectedVideo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-4"
                >
                  <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/5 ring-1 ring-white/10">
                    <iframe
                      src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&mute=1&rel=0`}
                      width="100%"
                      height="100%"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="border-0"
                    />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold leading-tight">
                      {selectedVideo.title}
                    </h2>
                    <div className="flex items-center gap-4 text-zinc-400 text-sm">
                      <span className="flex items-center gap-1">
                        <Video className="w-4 h-4" />
                        YouTube
                      </span>
                      <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                      <span>Now Playing</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="aspect-video w-full bg-zinc-900/30 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center p-8"
                >
                  <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <Video className="w-8 h-8 text-zinc-600" />
                  </div>
                  <h3 className="text-xl font-medium text-zinc-400">Ready to watch?</h3>
                  <p className="text-zinc-500 max-w-xs mt-2">
                    Search for your favorite videos and they'll appear here automatically.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar / Results List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-400 uppercase tracking-wider text-xs">
                {isLoading ? 'Searching...' : videos.length > 0 ? 'Search Results' : 'Up Next'}
              </h3>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                  <p className="text-zinc-500 text-sm">Finding the best videos...</p>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              ) : videos.length > 0 ? (
                videos.map((video, index) => (
                  <motion.button
                    key={video.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedVideo(video)}
                    className={cn(
                      "w-full flex gap-3 p-2 rounded-xl transition-all text-left group",
                      selectedVideo?.id === video.id 
                        ? "bg-white/10 ring-1 ring-white/20" 
                        : "hover:bg-white/5"
                    )}
                  >
                    <div className="relative shrink-0 w-32 aspect-video rounded-lg overflow-hidden bg-zinc-800">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <h4 className="text-sm font-medium line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                        {video.title}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                        YouTube <ChevronRight className="w-3 h-3" />
                      </p>
                    </div>
                  </motion.button>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-zinc-600 text-sm italic">No results yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-12 border-t border-white/5 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-500 text-sm">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            <span>Powered by Gemini AI & Google Search</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Feedback</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
