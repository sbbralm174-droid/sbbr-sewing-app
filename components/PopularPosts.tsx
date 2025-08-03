// components/PopularPosts.tsx (নতুন ফাইল)
import Link from 'next/link';
import Image from 'next/image';

interface Post {
  _id: string;
  title: string;
  slug: string;
  views: number;
  imageUrl?: string;
}

export async function PopularPosts() {
  let popularPosts: Post[] = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/popular-posts`, {
      cache: 'no-store', // বা revalidate: 3600 যদি জনপ্রিয় পোস্ট ঘন ঘন আপডেট না হয়
    });

    if (!res.ok) {
      throw new Error('জনপ্রিয় পোস্ট আনতে ব্যর্থ হয়েছে');
    }
    popularPosts = await res.json();
  } catch (error) {
    console.error('জনপ্রিয় পোস্ট ফেচিং-এ এরর:', error);
    return <div className="text-red-500">জনপ্রিয় পোস্ট লোড করা যায়নি।</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4">জনপ্রিয় পোস্ট</h3>
      <ul className="space-y-4">
        {popularPosts.map((post) => (
          <li key={post._id} className="flex items-center gap-3">
            {post.imageUrl && (
              <div className="relative w-16 h-12 flex-shrink-0 rounded-md overflow-hidden">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="64px"
                />
              </div>
            )}
            <div>
              <Link href={`/blog/${post.slug}`} className="text-lg font-semibold text-blue-600 hover:underline">
                {post.title}
              </Link>
              <p className="text-gray-500 text-sm">{post.views} বার দেখা হয়েছে</p>
            </div>
          </li>
        ))}
        {popularPosts.length === 0 && <p className="text-gray-500">কোনো জনপ্রিয় পোস্ট নেই।</p>}
      </ul>
    </div>
  );
}