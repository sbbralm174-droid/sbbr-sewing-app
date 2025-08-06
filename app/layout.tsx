// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sewing Line Management System',
  description: 'Manage operators, machines, processes, and production for sewing lines.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-gray-800 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-white text-2xl font-bold">
              Sewing CMS
            </Link>
            <div className="space-x-4">
              <Link href="/admin/machines" className="text-gray-300 hover:text-white">
                Add Machines
              </Link>
              <Link href="/admin/processes" className="text-gray-300 hover:text-white">
                Add Processes
              </Link>
              <Link href="/admin/operators/new" className="text-gray-300 hover:text-white">
                Add Operator
              </Link>
              <Link href="/admin/sewing-lines" className="text-gray-300 hover:text-white">
                Add Sewing Line
              </Link>
              <Link href="/supervisor/daily-plan" className="text-gray-300 hover:text-white">
                Daily Plan
              </Link>
              <Link href="/operators/list" className="text-gray-300 hover:text-white">
                All Operators
              </Link>
              <Link href="/operators/search" className="text-gray-300 hover:text-white">
                Search Operators
              </Link>
              <Link href="/supervisor/production" className="text-gray-300 hover:text-white">
                Production Entry
              </Link>
              <Link href="/admin/daily-plan/new/new1" className="text-gray-300 hover:text-white">
                daily plan
              </Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}