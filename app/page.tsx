'use client';

import { useEffect, useState } from 'react';
import { videoAPI } from '@/lib/api';
import VideoCard from '@/components/VideoCard';

interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  views: number;
  created_at: string;
  user?: {
    full_name: string;
  };
}

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await videoAPI.getVideos();
      setVideos(response.data);
    } catch (err: any) {
      setError('Failed to load videos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading videos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <svg className="w-24 h-24 text-gray-300 mb-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
        </svg>
        <div className="text-xl text-gray-600">No videos available yet</div>
        <p className="text-gray-500 mt-2">Be the first to upload!</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Discover Videos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
