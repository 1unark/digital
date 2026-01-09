// contexts/VideoPlaybackContext.tsx
'use client';

import { createContext, useContext, useRef, ReactNode } from 'react';

interface VideoPlaybackContextType {
  currentPlayingVideo: React.MutableRefObject<HTMLVideoElement | null>;
  globalAudioEnabled: React.MutableRefObject<boolean>;
  visibleVideos: React.MutableRefObject<Map<HTMLVideoElement, number>>;
  cleanupVideo: (video: HTMLVideoElement) => void;
}

const VideoPlaybackContext = createContext<VideoPlaybackContextType | null>(null);

export function VideoPlaybackProvider({ children }: { children: ReactNode }) {
  const currentPlayingVideo = useRef<HTMLVideoElement | null>(null);
  const globalAudioEnabled = useRef(false);
  const visibleVideos = useRef(new Map<HTMLVideoElement, number>());

  const cleanupVideo = (video: HTMLVideoElement) => {
    visibleVideos.current.delete(video);
    if (currentPlayingVideo.current === video) {
      currentPlayingVideo.current = null;
    }
  };

  return (
    <VideoPlaybackContext.Provider
      value={{
        currentPlayingVideo,
        globalAudioEnabled,
        visibleVideos,
        cleanupVideo,
      }}
    >
      {children}
    </VideoPlaybackContext.Provider>
  );
}

export function useVideoPlayback() {
  const context = useContext(VideoPlaybackContext);
  if (!context) {
    throw new Error('useVideoPlayback must be used within VideoPlaybackProvider');
  }
  return context;
}