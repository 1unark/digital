// components/upload/VideoUploader.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UploadProgress } from './UploadProgress';
import { useCreatePost } from '@/hooks/posts/useCreatePost';
import { postsService } from '../../services/posts.service';
import { Category } from '@/types/index';

const EDITING_SOFTWARE_OPTIONS = [
  'Adobe After Effects',
  'Adobe Premiere Pro',
  'Final Cut Pro',
  'DaVinci Resolve',
  'CapCut',
  'Alight Motion',
  'Filmora',
  'Vegas Pro',
  'Other'
];

let cachedCategories: Category[] | null = null;

export function VideoUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>(cachedCategories || []);
  const [editingSoftware, setEditingSoftware] = useState('');
  const [customSoftware, setCustomSoftware] = useState('');
  const [status, setStatus] = useState<'uploading' | 'processing' | 'complete' | 'error'>('uploading');
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isProcessingRef = useRef(false);
  const router = useRouter();
  
  const { createPost, isUploading, progress, error } = useCreatePost();

  useEffect(() => {
    if (cachedCategories) {
      return;
    }

    const loadCategories = async () => {
      try {
        const data = await postsService.getCategories();
        const categoryList = Array.isArray(data) ? data : [];
        cachedCategories = categoryList;
        setCategories(categoryList);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [videoPreviewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('video/')) {
        setStatus('error');
        return;
      }
      setFile(selectedFile);
      setStatus('uploading');
      
      // Create preview URL
      const url = URL.createObjectURL(selectedFile);
      setVideoPreviewUrl(url);
    }
  };

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      setCurrentTime(0);
      captureFrame(0);
    }
  };

  const drawFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!video || !canvas || !ctx) return;

    // Calculate dimensions to center crop to 720x720
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
          setThumbnailBlob(blob);
        }
      }, 'image/jpeg', 0.9);
    };
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
        setThumbnailBlob(blob);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleUpload = async () => {
    if (!file || !category || isUploading || isProcessingRef.current || !thumbnailBlob) return;

    isProcessingRef.current = true;
    setStatus('uploading');

    const formData = new FormData();
    formData.append('video', file);
    formData.append('caption', caption);
    formData.append('categoryId', category.id.toString());
    formData.append('thumbnail', thumbnailBlob, 'thumbnail.jpg');

    const finalSoftware = editingSoftware === 'Other' ? customSoftware : editingSoftware;
    if (finalSoftware) {
      formData.append('editing_software', finalSoftware);
    }

    try {
      await createPost(formData);
      setStatus('complete');
      
      setTimeout(() => {
        router.push('/feed/all');
      }, 1000);
    } catch (err) {
      setStatus('error');
      isProcessingRef.current = false;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6 mt-20">
      <div 
        className="rounded-lg border p-5"
        style={{
          backgroundColor: 'var(--color-surface-primary)',
          borderColor: 'var(--color-border-muted)'
        }}
      >
        <h2 
          className="text-xl font-semibold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Upload Video
        </h2>
        
        <div className="space-y-4">
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Category *
            </label>
            <select
              value={category?.slug || ""} 
              onChange={(e) => {
                const selectedSlug = e.target.value;
                const selectedObj = categories.find(cat => cat.slug === selectedSlug);
                setCategory(selectedObj || null);
              }}
              disabled={isUploading}
              className="w-full px-3 py-2 border rounded text-sm transition-colors"
              style={{
                backgroundColor: 'var(--color-surface-primary)',
                borderColor: 'var(--color-border-default)',
                color: 'var(--color-text-primary)',
                opacity: isUploading ? '0.5' : '1'
              }}
            >
              <option value="">Select a category</option>
              {categories.filter(cat => cat.slug !== 'all').map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.label}
                </option>
              ))}
              <option value="other">Other</option>
            </select>
            <p 
              className="text-xs mt-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Have a category suggestion? Email lxn4766@gmail.com
            </p>
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Editing Software
            </label>
            <select
              value={editingSoftware}
              onChange={(e) => {
                setEditingSoftware(e.target.value);
                if (e.target.value !== 'Other') {
                  setCustomSoftware('');
                }
              }}
              disabled={isUploading}
              className="w-full px-3 py-2 border rounded text-sm transition-colors"
              style={{
                backgroundColor: 'var(--color-surface-primary)',
                borderColor: 'var(--color-border-default)',
                color: 'var(--color-text-primary)',
                opacity: isUploading ? '0.5' : '1'
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = 'none';
                e.currentTarget.style.borderColor = 'var(--color-focus-ring)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-default)';
              }}
            >
              <option value="">Select editing software</option>
              {EDITING_SOFTWARE_OPTIONS.map((software) => (
                <option key={software} value={software}>
                  {software}
                </option>
              ))}
            </select>
          </div>

          {editingSoftware === 'Other' && (
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Specify Software
              </label>
              <input
                type="text"
                value={customSoftware}
                onChange={(e) => setCustomSoftware(e.target.value)}
                disabled={isUploading}
                placeholder="Enter software name..."
                className="w-full px-3 py-2 border rounded text-sm transition-colors"
                style={{
                  backgroundColor: 'var(--color-surface-primary)',
                  borderColor: 'var(--color-border-default)',
                  color: 'var(--color-text-primary)',
                  opacity: isUploading ? '0.5' : '1'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = 'none';
                  e.currentTarget.style.borderColor = 'var(--color-focus-ring)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-default)';
                }}
              />
            </div>
          )}

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Video File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="block w-full text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded file:border file:text-sm file:font-medium transition-colors"
              style={{
                color: 'var(--color-text-secondary)',
                opacity: isUploading ? '0.5' : '1'
              }}
            />
          </div>

          {videoPreviewUrl && (
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
                src={videoPreviewUrl}
                onLoadedMetadata={handleVideoLoaded}
                style={{ display: 'none' }}
              />
            </div>
          )}

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={isUploading}
              placeholder="Add a caption..."
              rows={3}
              className="w-full px-3 py-2 border rounded text-sm transition-colors"
              style={{
                backgroundColor: 'var(--color-surface-primary)',
                borderColor: 'var(--color-border-default)',
                color: 'var(--color-text-primary)',
                opacity: isUploading ? '0.5' : '1'
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = 'none';
                e.currentTarget.style.borderColor = 'var(--color-focus-ring)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-default)';
              }}
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || !category || !thumbnailBlob || isUploading}
            className="w-full py-2 px-4 rounded text-sm font-medium transition-colors"
            style={{
              backgroundColor: (!file || !category || !thumbnailBlob || isUploading) 
                ? 'var(--color-state-disabled)' 
                : 'var(--color-action-primary)',
              color: 'var(--color-surface-primary)',
              cursor: (!file || !category || !thumbnailBlob || isUploading) ? 'not-allowed' : 'pointer',
              opacity: (!file || !category || !thumbnailBlob || isUploading) ? '0.6' : '1'
            }}
            onMouseEnter={(e) => {
              if (file && category && thumbnailBlob && !isUploading) {
                e.currentTarget.style.backgroundColor = 'var(--color-action-primary-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (file && category && thumbnailBlob && !isUploading) {
                e.currentTarget.style.backgroundColor = 'var(--color-action-primary)';
              }
            }}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        {error && (
          <div 
            className="mt-4 p-2 rounded text-sm"
            style={{
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger-text)',
              border: '1px solid var(--color-danger-border)'
            }}
          >
            {error}
          </div>
        )}
      </div>

      {isUploading && file && (
        <UploadProgress
          progress={progress}
          fileName={file.name}
          status={status}
          error={error || undefined}
        />
      )}
    </div>
  );
}