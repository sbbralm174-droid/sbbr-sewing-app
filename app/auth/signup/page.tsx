'use client';

import { useState } from 'react';
import { signUp } from '@/lib/authFunctions';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = async () => {
    try {
      await signUp(email, password);
      router.push('/');
    } catch (error) {
      alert('Signup failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <input
        className="border p-2 w-full mb-2"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 w-full mb-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSignup} className="bg-blue-600 text-white px-4 py-2 w-full rounded">
        Sign Up
      </button>
    </div>
  );
}
