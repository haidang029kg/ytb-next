import Link from 'next/link';

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

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <Link href={`/video/${video.id}`} className="group">
      <div className="overflow-hidden rounded-lg bg-white shadow-md transition hover:shadow-xl">
        <div className="relative aspect-video bg-gray-200">
          {video.thumbnail_url ? (
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <svg
                className="h-16 w-16"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="line-clamp-2 text-lg font-semibold transition group-hover:text-blue-600">
            {video.title}
          </h3>
          {video.user && (
            <p className="mt-1 text-sm text-gray-600">{video.user.full_name}</p>
          )}
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <span>{formatViews(video.views)} views</span>
            <span className="mx-1">•</span>
            <span>{formatDate(video.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
