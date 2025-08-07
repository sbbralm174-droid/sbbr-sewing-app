// lib/mongodb.ts
import mongoose from 'mongoose';

// আপনার সমস্ত Mongoose মডেল এখানে import করুন
// এটি নিশ্চিত করবে যে মডেলগুলো Mongoose-এর সাথে রেজিস্টার করা হয়েছে
import '@/models/Operator';
import '@/models/Machine';
import '@/models/Process';
// যদি আপনার অন্য কোনো মডেল থাকে, সেগুলোও এখানে import করুন

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;