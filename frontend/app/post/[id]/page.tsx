// app/post/[id]/page.tsx
import { Metadata } from 'next';
import PostPageClient from './PostPageClient';

async function getPost(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}/`, {
    cache: 'no-store'
  });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  
  if (!post) {
    return { title: 'Post Not Found - Nisho' };
  }

  const ogImage = post.ogImageUrl || post.thumbnailUrl || '/default-og-image.jpg';
  const useOgDimensions = !!post.ogImageUrl;
  
  return {
    title: `${post.title} - Nisho`,
    description: `Video by ${post.author.name}`,
    openGraph: {
      title: post.title,
      description: `Video by ${post.author.name}`,
      images: useOgDimensions 
        ? [{ url: ogImage, width: 1200, height: 630 }]
        : [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogImage],
    },
  };
}

export default function PostPage() {
  return <PostPageClient />;
}