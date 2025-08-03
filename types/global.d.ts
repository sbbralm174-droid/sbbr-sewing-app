// types/global.d.ts
import { Mongoose } from 'mongoose';

declare global {
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  }
}

// এই ফাইলটি আপনার tsconfig.json-এ অন্তর্ভুক্ত করা নিশ্চিত করুন।
// যেমন: "include": ["./**/*.ts", "./**/*.tsx", "./types/**/*.d.ts"]