'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { videoAPI } from '@/lib/api';
import axios from 'axios';

export default function UploadPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState<'form' | 'uploading' | 'processing'>('form');

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

    if (!user) {
      router.push('/login');
      return;
    }

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

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Please login to upload videos</div>
      </div>
    );
  }

  if (currentStep === 'uploading') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Uploading Video</h2>
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-center mt-2 text-gray-600">{uploadProgress}%</p>
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
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Video Uploaded Successfully!</h2>
          <p className="text-gray-600 mb-4">
            Your video is now being processed. This may take a few minutes.
          </p>
          <p className="text-sm text-gray-500">Redirecting to studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Upload Video</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video File *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
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
                  <svg className="w-12 h-12 text-blue-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  <p className="text-blue-600 font-medium">{videoFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-sm text-blue-600 mt-2">Click to change</p>
                </div>
              ) : (
                <div>
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                  </svg>
                  <p className="text-gray-600">Click to select video file</p>
                  <p className="text-sm text-gray-500 mt-1">
                    MP4, MOV, AVI, or other video formats
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter video title"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            disabled={uploading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tell viewers about your video"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-2">
            Thumbnail URL
          </label>
          <input
            id="thumbnail"
            type="url"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            disabled={uploading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/thumbnail.jpg"
          />
          <p className="text-sm text-gray-500 mt-1">
            Optional: Provide a URL to your video thumbnail
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={uploading || !videoFile}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload Video'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/studio')}
            disabled={uploading}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
