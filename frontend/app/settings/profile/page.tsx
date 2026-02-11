// app/settings/profile/page.tsx
'use client';
export const runtime = 'edge';

import { useAuth } from '@/hooks/auth/useAuth';
import { useState, useRef } from 'react';
import { userService } from '../../../src/services/user.service';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';

const PLATFORM_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'custom', label: 'Custom' },
];

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bio, setBio] = useState('');
  useEffect(() => {
    if (user?.bio) {
      setBio(user.bio);
    }
  }, [user]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socialLinks, setSocialLinks] = useState<Array<{
    id?: string;
    platform: string;
    customPlatform: string;
    url: string;
  }>>([{ platform: '', customPlatform: '', url: '' }]);

    // Add useEffect to fetch social links
  useEffect(() => {
    const fetchSocialLinks = async () => {
      if (!user) return;
      
      try {
        const profile = await userService.getUserByUsername(user.username);
        
        const links = profile.creatorprofile?.social_links || [];
        
        if (links.length > 0) {
          const formattedLinks = links.map((link: any) => {
            const isCustom = !['instagram', 'tiktok', 'youtube'].includes(link.platform.toLowerCase());
            return {
              id: link.id,
              platform: isCustom ? 'custom' : link.platform.toLowerCase(),
              customPlatform: isCustom ? link.platform : '',
              url: link.url || link.link || ''
            };
          });
          setSocialLinks(formattedLinks);
        }
      } catch (err) {
        console.error('Failed to fetch social links:', err);
      }
    };

    fetchSocialLinks();
  }, [user]);

  if (!user) {
    return <div className="p-6" style={{ color: 'var(--color-text-primary)' }}>Please log in to edit your profile</div>;
  }

  const addSocialLink = () => {
    if (socialLinks.length >= 6) return;
    setSocialLinks([...socialLinks, { platform: '', customPlatform: '', url: '' }]);
  };

  const updateSocialLink = (index: number, field: string, value: string) => {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setSocialLinks(updated);
  };

  const removeSocialLink = (index: number) => {
    if (socialLinks.length === 1) {
      setSocialLinks([{ platform: '', customPlatform: '', url: '' }]);
    } else {
      setSocialLinks(socialLinks.filter((_, i) => i !== index));
    }
  };

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

    const validLinks = socialLinks.filter(link => {
      const platform = link.platform === 'custom' ? link.customPlatform : link.platform;
      return platform && link.url;
    }).map(link => ({
      platform: link.platform === 'custom' ? link.customPlatform : link.platform,
      url: link.url,
    }));

    console.log('Valid links:', validLinks);  // Add this

    try {
      await userService.updateProfile(user.id, bio, avatarFile, validLinks);
      router.push(`../profile/${user.username}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      setLoading(false);
    }
  };
  const firstLetter = user.username[0].toUpperCase();

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-8" style={{ color: 'var(--color-text-primary)' }}>
        Edit Profile
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Avatar
          </label>
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border-default)'
              }}
            >
              {avatarPreview ? (
                <Image src={avatarPreview} alt="Avatar" width={64} height={64} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl" style={{ color: 'var(--color-text-secondary)' }}>{firstLetter}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-1.5 rounded text-sm"
              style={{
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-text-primary)'
              }}
            >
              Change
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={150}
            rows={3}
            className="w-full px-3 py-2 rounded text-sm outline-none resize-none"
            style={{
              backgroundColor: 'var(--color-surface-primary)',
              border: '1px solid var(--color-border-default)',
              color: 'var(--color-text-primary)'
            }}
          />
          <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {bio.length}/150
          </div>
        </div>

        <div>
          <label className="block text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Social Links
          </label>
          
          {socialLinks.map((link, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <select
                value={link.platform}
                onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                className="px-3 py-2 rounded text-sm outline-none"
                style={{
                  backgroundColor: 'var(--color-surface-primary)',
                  border: '1px solid var(--color-border-default)',
                  color: 'var(--color-text-primary)',
                  width: '130px'
                }}
              >
                <option value="">Platform</option>
                {PLATFORM_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {link.platform === 'custom' && (
                <input
                  type="text"
                  placeholder="Name"
                  value={link.customPlatform}
                  onChange={(e) => updateSocialLink(index, 'customPlatform', e.target.value)}
                  className="px-3 py-2 rounded text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--color-surface-primary)',
                    border: '1px solid var(--color-border-default)',
                    color: 'var(--color-text-primary)',
                    width: '130px'
                  }}
                />
              )}

              <input
                type="text"
                placeholder="URL"
                value={link.url}
                onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                className="flex-1 px-3 py-2 rounded text-sm outline-none"
                style={{
                  backgroundColor: 'var(--color-surface-primary)',
                  border: '1px solid var(--color-border-default)',
                  color: 'var(--color-text-primary)'
                }}
              />

              {socialLinks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  className="w-8 text-lg"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  ×
                </button>
              )}
            </div>
          ))}

          {socialLinks.length < 6 && (
            <button
              type="button"
              onClick={addSocialLink}
              className="mt-1 px-3 py-1.5 rounded text-sm"
              style={{
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-text-primary)'
              }}
            >
              + Add Link
            </button>
          )}
        </div>

        {error && (
          <div className="text-sm p-3 rounded" style={{
            color: 'var(--color-danger-text)',
            backgroundColor: 'var(--color-danger-bg)',
            border: '1px solid var(--color-danger-border)'
          }}>
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded text-sm font-medium"
            style={{
              backgroundColor: loading ? 'var(--color-state-disabled)' : 'var(--color-action-primary)',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`../profile/${user.username}`)}
            className="px-4 py-2 rounded text-sm"
            style={{
              border: '1px solid var(--color-border-default)',
              color: 'var(--color-text-primary)'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}