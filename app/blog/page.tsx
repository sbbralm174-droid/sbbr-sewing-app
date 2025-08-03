// app/blog/page.tsx
'use client'; // এটি একটি ক্লায়েন্ট কম্পোনেন্ট, তাই 'use client' নির্দেশিকা ব্যবহার করা হয়েছে

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  category?: string;
  tags?: string[];
  imageUrl?: string;
  createdAt: string;
}

// ক্যাটাগরি ইন্টারফেস (আপনার backend/models/Category.ts এর সাথে মিলিয়ে নিন)
interface ICategory {
  _id: string;
  name: string;
  // অন্যান্য প্রপার্টি থাকলে যোগ করুন
}

// ট্যাগ ইন্টারফেস (আপনার backend এর aggregation result এর সাথে মিলিয়ে নিন)
interface ITag {
  _id: string; // ট্যাগ এর নাম
  count: number; // ট্যাগ এর সংখ্যা
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true); // পোস্ট লোডিং স্টেট
  const [errorPosts, setErrorPosts] = useState<string | null>(null); // পোস্ট এরর স্টেট

  const [categories, setCategories] = useState<ICategory[]>([]); // ক্যাটাগরি স্টেট
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true); // ক্যাটাগরি লোডিং স্টেট
  const [errorCategories, setErrorCategories] = useState<string | null>(null); // ক্যাটাগরি এরর স্টেট

  const [tags, setTags] = useState<ITag[]>([]); // ট্যাগ স্টেট
  const [loadingTags, setLoadingTags] = useState<boolean>(true); // ট্যাগ লোডিং স্টেট
  const [errorTags, setErrorTags] = useState<string | null>(null); // ট্যাগ এরর স্টেট

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  // পোস্ট ফেচ করার ফাংশন
  const fetchPosts = async () => {
    setLoadingPosts(true);
    setErrorPosts(null);
    try {
      let url = '/api/posts?'; // আপনার পোস্ট API রুটের পাথ
      if (searchQuery) {
        url += `q=${encodeURIComponent(searchQuery)}&`;
      }
      if (selectedCategory) {
        url += `category=${encodeURIComponent(selectedCategory)}&`;
      }
      if (selectedTag) {
        url += `tag=${encodeURIComponent(selectedTag)}&`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data: Post[] = await res.json();
      setPosts(data);
    } catch (err) {
      setErrorPosts('পোস্ট লোড করতে ব্যর্থ হয়েছে।');
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  // ক্যাটাগরি ফেচ করার ফাংশন
  const fetchCategoriesData = async () => {
    setLoadingCategories(true);
    setErrorCategories(null);
    try {
      const res = await fetch('/api/categories'); // আপনার ক্যাটাগরি API রুটের পাথ
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data: ICategory[] = await res.json();
      setCategories(data);
    } catch (err) {
      setErrorCategories('ক্যাটাগরি লোড করতে ব্যর্থ হয়েছে।');
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // ট্যাগ ফেচ করার ফাংশন
  const fetchTagsData = async () => {
    setLoadingTags(true);
    setErrorTags(null);
    try {
      const res = await fetch('/api/tags'); // আপনার ট্যাগ API রুটের পাথ
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data: ITag[] = await res.json();
      setTags(data);
    } catch (err) {
      setErrorTags('ট্যাগ লোড করতে ব্যর্থ হয়েছে।');
      console.error('Failed to fetch tags:', err);
    } finally {
      setLoadingTags(false);
    }
  };

  // পোস্ট লোড করার জন্য useEffect
  useEffect(() => {
    fetchPosts();
  }, [searchQuery, selectedCategory, selectedTag]); // যখনই এই স্টেটগুলো পরিবর্তন হবে, পোস্টগুলো আবার লোড হবে

  // ক্যাটাগরি এবং ট্যাগ লোড করার জন্য useEffect (কম্পোনেন্ট মাউন্ট হওয়ার সময় একবার)
  useEffect(() => {
    fetchCategoriesData();
    fetchTagsData();
  }, []); // খালি ডিপেন্ডেন্সি অ্যারে মানে শুধু একবার মাউন্ট হওয়ার সময় চলবে

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTag(e.target.value);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedTag('');
  };

  return (
    <div style={{ display: 'flex', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', marginRight: '30px', borderRight: '1px solid #eee', paddingRight: '20px' }}>
        <h2>ফিল্টার</h2>

        {/* Search */}
        <div style={{ marginBottom: '20px' }}>
          <h3>সার্চ পোস্ট</h3>
          <input
            type="text"
            placeholder="সার্চ করুন..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        {/* Filter by Category */}
        <div style={{ marginBottom: '20px' }}>
          <h3>ক্যাটাগরি</h3>
          {loadingCategories && <p>ক্যাটাগরি লোড হচ্ছে...</p>}
          {errorCategories && <p style={{ color: 'red' }}>{errorCategories}</p>}
          {!loadingCategories && categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">সকল ক্যাটাগরি</option>
              {categories.map((category) => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
          {!loadingCategories && categories.length === 0 && !errorCategories && (
            <p>কোনো ক্যাটাগরি পাওয়া যায়নি।</p>
          )}
        </div>

        {/* Filter by Tag */}
        <div style={{ marginBottom: '20px' }}>
          <h3>ট্যাগ</h3>
          {loadingTags && <p>ট্যাগ লোড হচ্ছে...</p>}
          {errorTags && <p style={{ color: 'red' }}>{errorTags}</p>}
          {!loadingTags && tags.length > 0 && (
            <select
              value={selectedTag}
              onChange={handleTagChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">সকল ট্যাগ</option>
              {tags.map((tag) => (
                <option key={tag._id} value={tag._id}>
                  {tag._id} ({tag.count})
                </option>
              ))}
            </select>
          )}
          {!loadingTags && tags.length === 0 && !errorTags && (
            <p>কোনো ট্যাগ পাওয়া যায়নি।</p>
          )}
        </div>

        {/* Clear Filters */}
        <button
          onClick={handleClearFilters}
          style={{
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          ফিল্টার সাফ করুন
        </button>
      </aside>

      {/* Main Content Area */}
      <main style={{ flexGrow: 1 }}>
        <h1>আমাদের ব্লগ</h1>
        {loadingPosts && <p>পোস্ট লোড হচ্ছে...</p>}
        {errorPosts && <p style={{ color: 'red' }}>{errorPosts}</p>}
        {!loadingPosts && posts.length === 0 && !errorPosts && (
          <p>কোনো পোস্ট পাওয়া যায়নি।</p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {posts.map((post) => (
            <div key={post._id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
              )}
              <div style={{ padding: '15px' }}>
                <h2 style={{ fontSize: '1.5em', marginBottom: '10px' }}>
                  <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: '#333' }}>
                    {post.title}
                  </Link>
                </h2>
                <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
                  ক্যাটাগরি: {post.category || 'অশ্রেণীবদ্ধ'}
                </p>
                <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
                  ট্যাগ: {post.tags && post.tags.length > 0 ? post.tags.join(', ') : 'নেই'}
                </p>
                <p style={{ fontSize: '1em', lineHeight: '1.6', color: '#555' }}>
                  {post.content.substring(0, 100)}... {/* কন্টেন্টের প্রথম 100 অক্ষর দেখাচ্ছে */}
                </p>
                <Link href={`/blog/${post.slug}`} style={{ display: 'inline-block', marginTop: '15px', padding: '8px 12px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
                  আরও পড়ুন
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}