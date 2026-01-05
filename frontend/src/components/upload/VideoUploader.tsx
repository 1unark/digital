// components/upload/VideoUploader.tsx
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UploadProgress } from './UploadProgress';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export function VideoUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'uploading' | 'processing' | 'complete' | 'error'>('uploading');
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('video/')) {
        setError('Please select a video file');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setStatus('uploading');
    setError(null);

    const formData = new FormData();
    formData.append('video', file);
    formData.append('caption', caption);

    try {
      const token = localStorage.getItem('access_token');
      
      await axios.post(`${API_URL}/posts/create/`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setProgress(percentCompleted);
        },
      });

      setStatus('complete');
      setProgress(100);
      
      setTimeout(() => {
        router.push('/feed');
      }, 1000);

    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Upload failed');
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
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
            disabled={!file || isUploading}
            className="w-full py-2 px-4 rounded text-sm font-medium transition-colors"
            style={{
              backgroundColor: (!file || isUploading) 
                ? 'var(--color-state-disabled)' 
                : 'var(--color-action-primary)',
              color: 'var(--color-surface-primary)',
              cursor: (!file || isUploading) ? 'not-allowed' : 'pointer',
              opacity: (!file || isUploading) ? '0.6' : '1'
            }}
            onMouseEnter={(e) => {
              if (file && !isUploading) {
                e.currentTarget.style.backgroundColor = 'var(--color-action-primary-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (file && !isUploading) {
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