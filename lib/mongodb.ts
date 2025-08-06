// lib/mongodb.ts
import mongoose from 'mongoose';

// 1. পরিবেশ ভেরিয়েবল থেকে MongoDB URI নিন
//const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_URI = 'mongodb+srv://sewing:Sa01785220401@cluster0.nfzi1fi.mongodb.net/sewing_db?retryWrites=true&w=majority';

// 2. নিশ্চিত করুন URI ডিফাইন করা আছে, অন্যথায় একটি এরর থ্রো করুন
if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// 3. গ্লোবাল ক্যাশ ভেরিয়েবল ডিফাইন করুন
// এটি ডেভেলপমেন্টের সময় Next.js Hot Module Reloading (HMR) এর কারণে
// বারবার ডেটাবেস কানেকশন হওয়া থেকে বাঁচায়।
let cached = (global as any).mongoose;

// যদি ক্যাশ না থাকে, তাহলে একটি নতুন ক্যাশ অবজেক্ট তৈরি করুন
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

// 4. ডেটাবেস কানেকশন ফাংশন
async function dbConnect() {
  // যদি একটি ক্যাশড কানেকশন থাকে, সেটি ব্যবহার করুন
  if (cached.conn) {
    console.log('Using cached MongoDB connection.');
    return cached.conn;
  }

  // যদি কোনো কানেকশন প্রমিস না থাকে, একটি নতুন কানেকশন প্রমিস তৈরি করুন
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // MongoDB ড্রাইভারকে কমান্ড বাফার না করতে বলুন
      // অন্যান্য অপশন যেমন useNewUrlParser, useUnifiedTopology এখন অপ্রচলিত এবং স্বয়ংক্রিয়ভাবে হ্যান্ডেল হয় Mongoose 6+ এ।
      // useFindAndModify: false, // যদি findOneAndUpdate/remove ব্যবহার করেন
      // useCreateIndex: true, // যদি ensureIndex ব্যবহার করেন
    };

    // Mongoose দিয়ে MongoDB এর সাথে কানেক্ট করুন
    cached.promise = mongoose.connect(MONGODB_URI!, opts)
      .then((mongooseInstance) => {
        // কানেকশন সফল হলে কনসোলে লগ করুন
        console.log('✅ MongoDB Connected successfully!');
        return mongooseInstance;
      })
      .catch((error) => {
        // কানেকশন ব্যর্থ হলে এরর লগ করুন এবং প্রমিস রিজেক্ট করুন
        console.error('❌ MongoDB Connection Failed:', error);
        throw error; // এররটি রি-থ্রো করুন যাতে কলার হ্যান্ডেল করতে পারে
      });
  }

  // প্রমিসের রেজাল্ট পাওয়ার জন্য অপেক্ষা করুন এবং কানেকশন অবজেক্ট ক্যাশ করুন
  cached.conn = await cached.promise;
  return cached.conn;
}

// ফাংশনটি এক্সপোর্ট করুন
export default dbConnect;