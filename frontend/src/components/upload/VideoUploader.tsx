// components/upload/VideoUploader.tsx
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UploadProgress } from './UploadProgress';
import { VideoUploadForm } from './VideoUploadForm';
import { useCreatePost } from '@/hooks/posts/useCreatePost';
import { Category } from '@/types/index';

export function VideoUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [editingSoftware, setEditingSoftware] = useState('');
  const [customSoftware, setCustomSoftware] = useState('');
  const [status, setStatus] = useState<'uploading' | 'processing' | 'complete' | 'error'>('uploading');
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null);
  
  const isProcessingRef = useRef(false);
  const router = useRouter();
  
  const { createPost, isUploading, progress, error } = useCreatePost();

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
        
        <VideoUploadForm
          file={file}
          setFile={setFile}
          caption={caption}
          setCaption={setCaption}
          category={category}
          setCategory={setCategory}
          editingSoftware={editingSoftware}
          setEditingSoftware={setEditingSoftware}
          customSoftware={customSoftware}
          setCustomSoftware={setCustomSoftware}
          thumbnailBlob={thumbnailBlob}
          setThumbnailBlob={setThumbnailBlob}
          isUploading={isUploading}
          onUpload={handleUpload}
          error={error}
        />
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