/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
eslint: {
    // 👉 এই লাইনটি যুক্ত করুন
    ignoreDuringBuilds: true,
  },

  // Other Next.js configurations can go here
};

module.exports = nextConfig;
