// app/api/test-db-connection/route.ts
import { NextResponse } from 'next/server';
import mongoose from 'mongoose'; // Mongoose ইম্পোর্ট করুন

export async function GET() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in environment variables.');
    return NextResponse.json(
      { message: 'MONGODB_URI পরিবেশ ভেরিয়েবলে সংজ্ঞায়িত করা হয়নি।', status: 'error' },
      { status: 500 }
    );
  }

  try {
    // যদি ইতোমধ্যে সংযোগ থাকে, তাহলে নতুন করে সংযোগ করার দরকার নেই
    // Mongoose-এর সংযোগ অবস্থা পরীক্ষা করুন
    if (mongoose.connection.readyState === 1) { // 1 means connected
      console.log('Already connected to MongoDB.');
      return NextResponse.json(
        { message: 'MongoDB সংযোগ সফল (পূর্ব থেকেই সংযুক্ত)।', status: 'success' },
        { status: 200 }
      );
    }

    // নতুন করে সংযোগ স্থাপনের চেষ্টা করুন
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 সেকেন্ডের মধ্যে সার্ভার নির্বাচন করতে না পারলে টাইমআউট
      // এই অপশনগুলো Mongoose 6+ এ স্বয়ংক্রিয়, কিন্তু পুরনো ভার্সনে লাগতে পারে
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log('Successfully connected to MongoDB!');
    return NextResponse.json(
      { message: 'MongoDB সংযোগ সফল।', status: 'success' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Failed to connect to MongoDB:', error);
    return NextResponse.json(
      { message: 'MongoDB সংযোগ ব্যর্থ হয়েছে।', status: 'error', error: error.message },
      { status: 500 }
    );
  }
}