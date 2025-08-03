// components/RecentPosts.tsx (নতুন ফাইল)
import Link from 'next/link';

interface Post {
  _id: string;
  title: string;
  slug: string;
  createdAt: string;
}

export async function RecentPosts() {
  let recentPosts: Post[] = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/recent-posts`, {
      cache: 'no-store', // বা revalidate: 60
    });

    if (!res.ok) {
      throw new Error('সাম্প্রতিক পোস্ট আনতে ব্যর্থ হয়েছে');
    }
    recentPosts = await res.json();
  } catch (error) {
    console.error('সাম্প্রতিক পোস্ট ফেচিং-এ এরর:', error);
    return <div className="text-red-500">সাম্প্রতিক পোস্ট লোড করা যায়নি।</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4">সাম্প্রতিক পোস্ট</h3>
      <ul className="space-y-3">
        {recentPosts.map((post) => (
          <li key={post._id}>
            <Link href={`/blog/${post.slug}`} className="text-lg font-semibold text-blue-600 hover:underline">
              {post.title}
            </Link>
            <p className="text-gray-500 text-sm">{new Date(post.createdAt).toLocaleDateString()}</p>
          </li>
        ))}
        {recentPosts.length === 0 && <p className="text-gray-500">কোনো সাম্প্রতিক পোস্ট নেই।</p>}
      </ul>
    </div>
  );
}