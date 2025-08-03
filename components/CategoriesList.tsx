// components/CategoriesList.tsx (নতুন ফাইল)
import Link from 'next/link';

interface Category {
  _id: string; // ক্যাটাগরির নাম
  count: number; // এই ক্যাটাগরির পোস্টের সংখ্যা
}

export async function CategoriesList() {
  let categories: Category[] = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/allcategories`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('ক্যাটাগরি আনতে ব্যর্থ হয়েছে।');
    categories = await res.json();
  } catch (error) {
    console.error('ক্যাটাগরি ফেচিং-এ এরর:', error);
    return <div className="text-red-500">ক্যাটাগরি লোড করা যায়নি।</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4">ক্যাটাগরি</h3>
      <ul className="space-y-2">
        {categories.map((cat) => (
          <li key={cat._id}>
            <Link href={`/blog?category=${encodeURIComponent(cat._id)}`} className="text-blue-600 hover:underline">
              {cat._id} ({cat.count})
            </Link>
          </li>
        ))}
        {categories.length === 0 && <p className="text-gray-500">কোনো ক্যাটাগরি নেই।</p>}
      </ul>
    </div>
  );
}