import { Document } from 'mongoose';

// Define the interface for the Post document
export interface IPost extends Document {
  title: string;
  content: string;
  author?: string; // Optional
  tags?: string[]; // Optional array of strings
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  _id: string; // অথবা id: string;
  title: string;
  slug: string; // যদি স্লাগ ব্যবহার করেন
  content: string; // অথবা body: string;
  excerpt?: string; // ঐচ্ছিক, যদি পোস্টের সারাংশ থাকে
  imageUrl?: string; // ঐচ্ছিক, যদি পোস্টের ফিচার ইমেজ থাকে
  category: string; // ক্যাটাগরি আইডি বা নাম
  tags: string[]; // ট্যাগগুলোর অ্যারে
  authorId: string; // অথর আইডি
  createdAt: string; // তারিখ স্ট্রিং ফরম্যাটে
  updatedAt: string; // তারিখ স্ট্রিং ফরম্যাটে
  views?: number; // ঐচ্ছিক, যদি ভিউ কাউন্ট থাকে
  // আপনার পোস্ট মডেল অনুযায়ী অন্যান্য প্রপার্টি যোগ করুন
}