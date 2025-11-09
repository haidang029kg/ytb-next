'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { videoAPI } from '@/lib/api';

interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  views: number;
  likes: number;
  processing_status: string;
  created_at: string;
}

export default function StudioPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchMyVideos();
    }
  }, [user, authLoading, router]);

  const fetchMyVideos = async () => {
    try {
      const response = await videoAPI.getMyVideos();
      setVideos(response.data);
    } catch (err: any) {
      setError('Failed to load videos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      await videoAPI.deleteVideo(id);
      setVideos(videos.filter((v) => v.id !== id));
    } catch (err: any) {
      alert('Failed to delete video');
      console.error(err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', text: 'Processing' },
      completed: { color: 'bg-green-100 text-green-800', text: 'Published' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Failed' },
    };

    const badge = badges[status] || badges.pending;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Studio</h1>
          <p className="text-gray-600 mt-2">Manage your video content</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/studio/upload"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Video
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {videos.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No videos yet</h2>
          <p className="text-gray-500 mb-6">Create your first video to get started</p>
          <Link
            href="/studio/upload"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Video
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Table header with stats and action */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-gray-500">Total Videos</p>
                <p className="text-2xl font-bold text-gray-900">{videos.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Published</p>
                <p className="text-2xl font-bold text-green-600">
                  {videos.filter(v => v.processing_status === 'completed').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Processing</p>
                <p className="text-2xl font-bold text-blue-600">
                  {videos.filter(v => v.processing_status === 'processing').length}
                </p>
              </div>
            </div>
            <Link
              href="/studio/upload"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Video
            </Link>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Video
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Likes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {videos.map((video) => (
                <tr key={video.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-24 bg-gray-200 rounded overflow-hidden">
                        {video.thumbnail_url ? (
                          <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{video.title}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(video.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(video.processing_status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {video.views.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {video.likes}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium space-x-3">
                    <Link
                      href={`/video/${video.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                    <Link
                      href={`/studio/videos/${video.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
