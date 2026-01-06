import Link from 'next/link';

export default function LandingPage() {
  return (
    <div>
      <div>
        <h1>Social Video</h1>
        <p>Share your moments in 15 seconds</p>
        <div>
          <Link href="/feed/all">
            Explore Feed
          </Link>
          <Link href="/login">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
