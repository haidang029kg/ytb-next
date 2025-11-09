'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { videoAPI } from '@/lib/api';
import axios from 'axios';

export default function UploadPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState<
    'form' | 'uploading' | 'processing'
  >('form');

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    router.push('/login');
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Please select a video file');
        return;
      }
      setVideoFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      setError('Please select a video file');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    setUploading(true);
    setError('');
    setCurrentStep('uploading');

    try {
      // Step 1: Create video metadata
      const createResponse = await videoAPI.createVideo({
        title: title.trim(),
        description: description.trim() || undefined,
        thumbnail_url: thumbnailUrl.trim() || undefined,
      });

      const videoId = createResponse.data.id;

      // Step 2: Get presigned upload URL
      const presignedResponse = await videoAPI.getPresignedUploadUrl(
        videoFile.name,
        videoFile.type
      );

      const { upload_url, video_url } = presignedResponse.data;

      // Step 3: Upload video to S3
      await axios.put(upload_url, videoFile, {
        headers: {
          'Content-Type': videoFile.type,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(percentCompleted);
        },
      });

      // Step 4: Mark upload as complete and trigger processing
      await videoAPI.markUploadComplete(videoId, video_url);

      setCurrentStep('processing');

      // Redirect to studio after a short delay
      setTimeout(() => {
        router.push('/studio');
      }, 2000);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || 'Failed to upload video');
      setCurrentStep('form');
    } finally {
      setUploading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (currentStep === 'uploading') {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-6 text-center text-2xl font-bold">
            Uploading Video
          </h2>
          <div className="mb-4">
            <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="mt-2 text-center text-gray-600">{uploadProgress}%</p>
          </div>
          <p className="text-center text-gray-500">
            Please don't close this page while uploading...
          </p>
        </div>
      </div>
    );
  }

  if (currentStep === 'processing') {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg bg-white p-8 text-center shadow-md">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <h2 className="mb-2 text-2xl font-bold">
            Video Uploaded Successfully!
          </h2>
          <p className="mb-4 text-gray-600">
            Your video is now being processed. This may take a few minutes.
          </p>
          <p className="text-sm text-gray-500">Redirecting to studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold">Upload Video</h1>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-lg bg-white p-8 shadow-md"
      >
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Video File *
          </label>
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition hover:border-blue-500">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
              id="video-file"
              disabled={uploading}
            />
            <label htmlFor="video-file" className="cursor-pointer">
              {videoFile ? (
                <div>
                  <svg
                    className="mx-auto mb-2 h-12 w-12 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  <p className="font-medium text-blue-600">{videoFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="mt-2 text-sm text-blue-600">Click to change</p>
                </div>
              ) : (
                <div>
                  <svg
                    className="mx-auto mb-2 h-12 w-12 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                  </svg>
                  <p className="text-gray-600">Click to select video file</p>
                  <p className="mt-1 text-sm text-gray-500">
                    MP4, MOV, AVI, or other video formats
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="mb-6">
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
            disabled={uploading}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            placeholder="Enter video title"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            disabled={uploading}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            placeholder="Tell viewers about your video"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="thumbnail"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Thumbnail URL
          </label>
          <input
            id="thumbnail"
            type="url"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            disabled={uploading}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/thumbnail.jpg"
          />
          <p className="mt-1 text-sm text-gray-500">
            Optional: Provide a URL to your video thumbnail
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={uploading || !videoFile}
            className="flex-1 rounded-lg bg-blue-600 py-3 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Video'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/studio')}
            disabled={uploading}
            className="rounded-lg border border-gray-300 px-6 py-3 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
