// components/SearchInput.tsx (নতুন ফাইল)
'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/blog?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/blog'); // সার্চ খালি হলে সব পোস্ট দেখান
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <input
        type="text"
        placeholder="ব্লগ পোস্ট সার্চ করুন..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
      >
        সার্চ
      </button>
    </form>
  );
}