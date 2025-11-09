'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to shorts page
    router.push('/shorts');
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-xl text-gray-600">Redirecting to Shorts...</div>
    </div>
  );
}
