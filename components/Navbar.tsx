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
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-6">
            <Link href="/shorts" className="text-2xl font-bold text-blue-600">
              YTB
            </Link>

            {/* Public Section */}
            <Link
              href="/shorts"
              className="text-gray-700 hover:text-blue-600 transition font-medium"
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
                    className="text-gray-700 hover:text-blue-600 transition font-medium"
                  >
                    Studio
                  </Link>
                  <Link
                    href="/studio/upload"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Upload
                  </Link>
                </div>

                <div className="flex items-center space-x-3 border-l border-gray-300 pl-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user.full_name[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-gray-700 text-sm">{user.full_name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="text-gray-700 hover:text-red-600 transition text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
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
