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
      <div className="flex h-64 items-center justify-center">
        <div className="text-xl text-gray-600">Loading video...</div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex h-64 items-center justify-center">
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
    <div className="mx-auto max-w-6xl">
      <div className="mb-4">
        {video.processing_status === 'completed' && video.video_url ? (
          <VideoPlayer src={video.video_url} poster={video.thumbnail_url} />
        ) : video.processing_status === 'processing' ? (
          <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-200">
            <div className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-xl text-gray-600">Processing video...</p>
              <p className="mt-2 text-sm text-gray-500">
                This may take a few minutes
              </p>
            </div>
          </div>
        ) : video.processing_status === 'failed' ? (
          <div className="flex aspect-video items-center justify-center rounded-lg bg-red-100">
            <div className="text-center text-red-600">
              <svg
                className="mx-auto mb-4 h-16 w-16"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xl">Video processing failed</p>
            </div>
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-200">
            <div className="text-center text-gray-600">
              <svg
                className="mx-auto mb-4 h-16 w-16"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
              <p className="text-xl">Video pending upload</p>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <h1 className="mb-4 text-2xl font-bold">{video.title}</h1>

        <div className="mb-4 flex items-center justify-between border-b pb-4">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
              {video.user?.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-semibold">{video.user?.full_name}</p>
              <p className="text-sm text-gray-500">{video.user?.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-gray-600">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{formatViews(video.views)} views</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              <span>{video.likes}</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="mb-2 text-sm text-gray-500">
            {formatDate(video.created_at)}
          </p>
          {video.description && (
            <p className="whitespace-pre-wrap text-gray-700">
              {video.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
