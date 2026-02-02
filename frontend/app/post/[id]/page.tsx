// app/post/[id]/page.tsx
import { Metadata } from 'next';
import PostPageClient from './PostPageClient';

// Fetch without auth for metadata (public endpoint)
async function getPost(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}/`, {
    cache: 'no-store'
  });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const post = await getPost(params.id);
  
  if (!post) {
    return { title: 'Post Not Found - Nisho' };
  }

  const ogImage = post.thumbnailUrl || '/default-og-image.jpg';
  
  return {
    title: `${post.title}`,
    description: `Video by ${post.author.name}`,
    openGraph: {
      title: post.title,
      description: `Video by ${post.author.name}`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: 'video.other',
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogImage],
    },
  };
}

export default function PostPage({ params }: { params: { id: string } }) {
  return <PostPageClient />; // NO PROP
}