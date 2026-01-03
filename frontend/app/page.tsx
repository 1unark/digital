import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-500 to-pink-500">
      <div className="text-center text-white px-4">
        <h1 className="text-6xl font-bold mb-4">Social Video</h1>
        <p className="text-2xl mb-8">Share your moments in 15 seconds</p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/feed"
            className="px-6 py-3 bg-white text-purple-600 rounded-lg font-bold text-lg hover:bg-gray-100"
          >
            Explore Feed
          </Link>
          <Link 
            href="/register"
            className="px-6 py-3 border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}