// components/upload/VideoUploadForm.tsx
'use client';

import { useRef, useState } from 'react';
import { CategorySelect } from './CategorySelect';
import { EditingSoftwareSelect } from './EditingSoftwareSelect';
import { ThumbnailSelector } from './ThumbnailSelector';
import { Category } from '@/types/index';

interface VideoUploadFormProps {
  file: File | null;
  setFile: (file: File | null) => void;
  caption: string;
  setCaption: (caption: string) => void;
  category: Category | null;
  setCategory: (category: Category | null) => void;
  editingSoftware: string;
  setEditingSoftware: (software: string) => void;
  customSoftware: string;
  setCustomSoftware: (software: string) => void;
  thumbnailBlob: Blob | null;
  setThumbnailBlob: (blob: Blob | null) => void;
  isUploading: boolean;
  onUpload: () => void;
  error: string | null;
}

export function VideoUploadForm({
  file,
  setFile,
  caption,
  setCaption,
  category,
  setCategory,
  editingSoftware,
  setEditingSoftware,
  customSoftware,
  setCustomSoftware,
  thumbnailBlob,
  setThumbnailBlob,
  isUploading,
  onUpload,
  error
}: VideoUploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSetFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('video/')) {
      alert('Please upload a video file');
      return false;
    }
    
    const maxSize = 12 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      alert('Video file must be 12MB or smaller');
      return false;
    }
    
    setFile(selectedFile);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!validateAndSetFile(selectedFile)) {
        e.target.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isUploading) return;

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  return (
    <div 
      className="space-y-4"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div 
            className="px-8 py-6 rounded-lg text-lg font-medium"
            style={{
              backgroundColor: 'var(--color-surface-primary)',
              color: 'var(--color-text-primary)',
              border: '2px dashed var(--color-action-primary)'
            }}
          >
            Drop video file here
          </div>
        </div>
      )}

      <CategorySelect
        value={category}
        onChange={setCategory}
        disabled={isUploading}
      />

      <EditingSoftwareSelect
        value={editingSoftware}
        onChange={setEditingSoftware}
        customValue={customSoftware}
        onCustomChange={setCustomSoftware}
        disabled={isUploading}
      />

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

      {file && (
        <ThumbnailSelector
          file={file}
          onThumbnailChange={setThumbnailBlob}
          isUploading={isUploading}
        />
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
        onClick={onUpload}
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
  );
}