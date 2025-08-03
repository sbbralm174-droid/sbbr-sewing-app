// components/TagCloud.tsx (নতুন ফাইল)
import Link from 'next/link';

interface Tag {
  _id: string; // ট্যাগের নাম
  count: number; // এই ট্যাগের পোস্টের সংখ্যা
}

export async function TagCloud() {
  let tags: Tag[] = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tags`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('ট্যাগ আনতে ব্যর্থ হয়েছে।');
    tags = await res.json();
  } catch (error) {
    console.error('ট্যাগ ফেচিং-এ এরর:', error);
    return <div className="text-red-500">ট্যাগ লোড করা যায়নি।</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4">ট্যাগ ক্লাউড</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag._id}
            href={`/blog?tag=${encodeURIComponent(tag._id)}`}
            className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-300 transition-colors duration-200"
          >
            {tag._id} ({tag.count})
          </Link>
        ))}
        {tags.length === 0 && <p className="text-gray-500">কোনো ট্যাগ নেই।</p>}
      </div>
    </div>
  );
}