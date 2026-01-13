import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { VideoPlaybackProvider } from '@/context/VideoPlaybackContext';
import { Navbar } from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nisho',
  description: 'The Platform for Editors',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
return (
    <html lang="en">
      <body className={`${inter.className} bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)]`}>
        <AuthProvider>
          <VideoPlaybackProvider> 
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
          </VideoPlaybackProvider>
        </AuthProvider>
      </body>
    </html>
  );
}