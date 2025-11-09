'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Don't show navbar on shorts page for full immersive experience
  if (pathname === '/shorts') {
    return null;
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/shorts" className="text-2xl font-bold text-blue-600">
              YTB
            </Link>

            {/* Public Section */}
            <Link
              href="/shorts"
              className="font-medium text-gray-700 transition hover:text-blue-600"
            >
              Shorts
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Admin Section - Only visible when logged in */}
                <div className="flex items-center space-x-4 border-l border-gray-300 pl-4">
                  <Link
                    href="/studio"
                    className="font-medium text-gray-700 transition hover:text-blue-600"
                  >
                    Studio
                  </Link>
                  <Link
                    href="/studio/upload"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                  >
                    Upload
                  </Link>
                </div>

                <div className="flex items-center space-x-3 border-l border-gray-300 pl-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      {user.full_name[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm text-gray-700">
                      {user.full_name}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-700 transition hover:text-red-600"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 transition hover:text-blue-600"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
