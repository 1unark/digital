// components/upload/ThumbnailSelector.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

interface ThumbnailSelectorProps {
  file: File;
  onThumbnailChange: (blob: Blob | null) => void;
  isUploading: boolean;
}

export function ThumbnailSelector({ file, onThumbnailChange, isUploading }: ThumbnailSelectorProps) {
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const drawFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!video || !canvas || !ctx) return;

    const videoAspect = video.videoWidth / video.videoHeight;
    let sourceWidth, sourceHeight, sourceX, sourceY;

    if (videoAspect > 1) {
      sourceHeight = video.videoHeight;
      sourceWidth = video.videoHeight;
      sourceX = (video.videoWidth - sourceWidth) / 2;
      sourceY = 0;
    } else {
      sourceWidth = video.videoWidth;
      sourceHeight = video.videoWidth;
      sourceX = 0;
      sourceY = (video.videoHeight - sourceHeight) / 2;
    }

    ctx.drawImage(
      video,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, 720, 720
    );
  };

  const captureFrame = (time: number) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;

    video.currentTime = time;
    
    video.onseeked = () => {
      drawFrame();
      
      canvas.toBlob((blob) => {
        if (blob) {
          onThumbnailChange(blob);
        }
      }, 'image/jpeg', 0.9);
    };
  };

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      setCurrentTime(0);
      captureFrame(0);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      drawFrame();
    }
  };

  const handleSliderRelease = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        onThumbnailChange(blob);
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <div>
      <label 
        className="block text-sm font-medium mb-2"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Select Thumbnail
      </label>
      <div className="space-y-3">
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={720}
            height={720}
            className="rounded border"
            style={{
              maxWidth: '300px',
              maxHeight: '300px',
              borderColor: 'var(--color-border-default)'
            }}
          />
        </div>
        <input
          type="range"
          min="0"
          max={videoDuration}
          step="0.033"
          value={currentTime}
          onChange={handleSliderChange}
          onMouseUp={handleSliderRelease}
          onTouchEnd={handleSliderRelease}
          disabled={isUploading}
          className="w-full range-slider"
          style={{
            opacity: isUploading ? '0.5' : '1',
            accentColor: 'transparent',
            background: 'var(--color-border-default)',
            height: '4px',
            borderRadius: '2px',
            appearance: 'none',
            WebkitAppearance: 'none'
          }}
        />
        <style jsx>{`
          .range-slider::-webkit-slider-thumb {
            appearance: none;
            width: 12px;
            height: 20px;
            background: #6b7280;
            cursor: pointer;
            border-radius: 2px;
          }
          .range-slider::-moz-range-thumb {
            width: 12px;
            height: 20px;
            background: #6b7280;
            cursor: pointer;
            border: none;
            border-radius: 2px;
          }
        `}</style>
        <p 
          className="text-xs text-center"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {currentTime.toFixed(1)}s / {videoDuration.toFixed(1)}s
        </p>
      </div>
      <video
        ref={videoRef}
        src={videoPreviewUrl || undefined}
        onLoadedMetadata={handleVideoLoaded}
        style={{ display: 'none' }}
      />
    </div>
  );
}