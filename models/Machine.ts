// models/Machine.ts
import mongoose from 'mongoose';


export interface IMachine extends Document {
  name: string;
  description?: string;
  machineType?: string; // e.g., "Sewing", "Cutting", "Finishing"
  createdAt: Date;
  updatedAt: Date;
}


// 1. Machine স্কিমা সংজ্ঞায়িত করুন
const MachineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Machine name is required'], // নাম আবশ্যক
    unique: true, // প্রতিটি নাম অনন্য হতে হবে
    trim: true, // নামের আগে বা পরের স্পেস মুছে ফেলুন
    maxlength: [50, 'Name cannot be more than 50 characters'], // সর্বোচ্চ ৫০ অক্ষর
  },
  createdAt: {
    type: Date,
    default: Date.now, // কখন তৈরি হয়েছে তা স্বয়ংক্রিয়ভাবে যোগ হবে
  },
});

// 2. মডেল তৈরি করুন বা বিদ্যমান মডেল ব্যবহার করুন
// যদি মডেলটি ইতিমধ্যে তৈরি হয়ে থাকে, তাহলে সেটি ব্যবহার করুন, অন্যথায় নতুন করে তৈরি করুন।
const Machine = mongoose.models.Machine || mongoose.model('Machine', MachineSchema);

export default Machine;