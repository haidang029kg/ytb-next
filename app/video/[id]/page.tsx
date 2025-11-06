'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { videoAPI } from '@/lib/api';
import VideoPlayer from '@/components/VideoPlayer';

interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  video_url?: string;
  views: number;
  likes: number;
  created_at: string;
  processing_status: string;
  user?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export default function VideoPage() {
  const params = useParams();
  const videoId = params.id as string;

  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);

  const fetchVideo = async () => {
    try {
      const response = await videoAPI.getVideo(videoId);
      setVideo(response.data);
    } catch (err: any) {
      setError('Failed to load video');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading video...</div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-red-600">{error || 'Video not found'}</div>
      </div>
    );
  }

  const formatViews = (views: number) => {
    return views.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-4">
        {video.processing_status === 'completed' && video.video_url ? (
          <VideoPlayer src={video.video_url} poster={video.thumbnail_url} />
        ) : video.processing_status === 'processing' ? (
          <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-xl text-gray-600">Processing video...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few minutes</p>
            </div>
          </div>
        ) : video.processing_status === 'failed' ? (
          <div className="aspect-video bg-red-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-red-600">
              <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-xl">Video processing failed</p>
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-600">
              <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
              <p className="text-xl">Video pending upload</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">{video.title}</h1>

        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {video.user?.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-semibold">{video.user?.full_name}</p>
              <p className="text-sm text-gray-500">{video.user?.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-gray-600">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              <span>{formatViews(video.views)} views</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              <span>{video.likes}</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">{formatDate(video.created_at)}</p>
          {video.description && (
            <p className="text-gray-700 whitespace-pre-wrap">{video.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
