// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
// যদি আপনি Tailwind CSS ব্যবহার করেন, তাহলে আপনার গ্লোবাল CSS ফাইলটি এখানে ইম্পোর্ট করুন।
// import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tiptap Editor App',
  description: 'A simple app using Tiptap editor.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/*
          এখানে কোনো Mantine specific script (যেমন ColorSchemeScript) থাকবে না।
          যদি আপনার Tiptap এডিটরের জন্য কোনো কাস্টম CSS থাকে যা আপনি গ্লোবালি লোড করতে চান,
          তাহলে এখানে <style> ট্যাগ বা একটি <link rel="stylesheet"> ব্যবহার করতে পারেন।
          অথবা, আপনার গ্লোবাল CSS ফাইল (যদি থাকে) ইম্পোর্ট করতে পারেন।
        */}
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}