// app/settings/profile/page.tsx
'use client';

import { useAuth } from '@/hooks/auth/useAuth';
import { useState, useRef } from 'react';
import { userService } from '../../../src/services/user.service';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div 
        className="p-6"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Please log in to edit your profile
      </div>
    );
  }

  const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          const maxSize = 720;
          let width = img.width;
          let height = img.height;

          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, 'image/jpeg', 0.9);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    try {
      const resizedFile = await resizeImage(file);
      setAvatarFile(resizedFile);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(resizedFile);
      setError(null);
    } catch (err) {
      setError('Failed to process image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await userService.updateProfile(user.id, bio, avatarFile);
      router.push(`../profile/${user.username}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      setLoading(false);
    }
  };

  const firstLetter = user.username[0].toUpperCase();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 
        className="text-2xl font-semibold mb-6"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Edit Profile
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label 
            className="block text-sm font-medium mb-3"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Avatar
          </label>
          <div className="flex items-center gap-4">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border-default)'
              }}
            >
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Avatar preview"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span 
                  className="text-2xl font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {firstLetter}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded text-sm transition-colors"
              style={{
                backgroundColor: 'var(--color-action-secondary)',
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-text-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-action-secondary-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-action-secondary)';
              }}
            >
              Change Avatar
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>

        <div>
          <label 
            htmlFor="bio" 
            className="block text-sm font-medium mb-3"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={150}
            rows={4}
            className="w-full px-3 py-2 rounded text-sm transition-all outline-none resize-none"
            placeholder="Tell us about yourself"
            style={{
              backgroundColor: 'var(--color-surface-primary)',
              border: '1px solid var(--color-border-default)',
              color: 'var(--color-text-primary)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-border-nav)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-border-default)';
            }}
          />
          <div 
            className="text-sm mt-2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {bio.length}/150 characters
          </div>
        </div>

        {error && (
          <div 
            className="text-sm p-3 rounded"
            style={{
              color: 'var(--color-danger-text)',
              backgroundColor: 'var(--color-danger-bg)',
              border: '1px solid var(--color-danger-border)'
            }}
          >
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded text-sm font-medium transition-all"
            style={{
              backgroundColor: loading ? 'var(--color-state-disabled)' : 'var(--color-action-primary)',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = 'var(--color-action-primary-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = 'var(--color-action-primary)';
              }
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`../profile/${user.username}`)}
            className="px-4 py-2 rounded text-sm transition-colors"
            style={{
              backgroundColor: 'var(--color-action-secondary)',
              border: '1px solid var(--color-border-default)',
              color: 'var(--color-text-primary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-action-secondary-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-action-secondary)';
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}