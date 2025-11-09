'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { videoAPI } from '@/lib/api';
import ShortsPlayer from '@/components/ShortsPlayer';

interface Video {
  id: string;
  title: string;
  description?: string;
  video_url?: string;
  thumbnail_url?: string;
  views: number;
  likes: number;
  processing_status: string;
  user?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export default function ShortsPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await videoAPI.getVideos();
      // Filter only completed videos
      const completedVideos = response.data.filter(
        (video: Video) => video.processing_status === 'completed' && video.video_url
      );
      setVideos(completedVideos);
    } catch (err: any) {
      setError('Failed to load videos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const scrollTop = containerRef.current.scrollTop;
      const windowHeight = window.innerHeight;
      const newIndex = Math.round(scrollTop / windowHeight);

      if (newIndex !== currentIndex && newIndex < videos.length) {
        setCurrentIndex(newIndex);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [currentIndex, videos.length]);

  useEffect(() => {
    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && currentIndex < videos.length - 1) {
        scrollToVideo(currentIndex + 1);
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        scrollToVideo(currentIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, videos.length]);

  const scrollToVideo = (index: number) => {
    if (!containerRef.current) return;
    const windowHeight = window.innerHeight;
    containerRef.current.scrollTo({
      top: index * windowHeight,
      behavior: 'smooth',
    });
    setCurrentIndex(index);
  };

  const handleLike = async (videoId: string) => {
    // TODO: Implement like functionality
    console.log('Like video:', videoId);
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading videos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
          </svg>
          <p className="text-xl">No videos available yet</p>
          <p className="text-gray-400 mt-2">Check back later!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent p-4">
        <div className="flex items-center justify-between">
          <Link
            href="/studio"
            className="text-white font-bold text-xl hover:text-blue-400 transition"
          >
            YTB
          </Link>
          <div className="text-white text-sm opacity-75">
            Shorts
          </div>
        </div>
      </div>

      {videos.map((video, index) => (
        <ShortsPlayer
          key={video.id}
          video={video}
          isActive={index === currentIndex}
          onLike={() => handleLike(video.id)}
        />
      ))}

      {/* Navigation Hints */}
      {videos.length > 1 && (
        <>
          {currentIndex > 0 && (
            <button
              onClick={() => scrollToVideo(currentIndex - 1)}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition z-50"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          {currentIndex < videos.length - 1 && (
            <button
              onClick={() => scrollToVideo(currentIndex + 1)}
              className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition z-50"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  );
}
