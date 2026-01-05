// components/upload/VideoUploader.tsx
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UploadProgress } from './UploadProgress';
import { useCreatePost } from '@/hooks/posts/useCreatePost';

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

export function VideoUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [editingSoftware, setEditingSoftware] = useState('');
  const [customSoftware, setCustomSoftware] = useState('');
  const [status, setStatus] = useState<'uploading' | 'processing' | 'complete' | 'error'>('uploading');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isProcessingRef = useRef(false);
  const router = useRouter();
  
  const { createPost, isUploading, progress, error } = useCreatePost();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('video/')) {
        setStatus('error');
        return;
      }
      setFile(selectedFile);
      setStatus('uploading');
    }
  };

  const handleUpload = async () => {
    if (!file || isUploading || isProcessingRef.current) return;

    isProcessingRef.current = true;
    setStatus('uploading');

    const formData = new FormData();
    formData.append('video', file);
    formData.append('caption', caption);
    
    const finalSoftware = editingSoftware === 'Other' ? customSoftware : editingSoftware;
    if (finalSoftware) {
      formData.append('editing_software', finalSoftware);
    }

    try {
      await createPost(formData);
      setStatus('complete');
      
      setTimeout(() => {
        router.push('/feed');
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