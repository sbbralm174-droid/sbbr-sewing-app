// src/app/admin/sewing-lines/page.tsx
'use client';

import { useState } from 'react';

export default function AddSewingLinePage() {
  const [name, setName] = useState('');
  const [floor, setfloor] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);
    setIsLoading(true);

    if (!name.trim()) {
      setMessage('Sewing line name is required.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/sewing-lines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, floor: floor || undefined }), // Send undefined if floor is empty
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage(data.message || 'Sewing line added successfully!');
        setName(''); // Clear input on success
        setfloor('');
      } else {
        setIsSuccess(false);
        setMessage(data.message || 'Failed to add sewing line. Please try again.');
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage('An error occurred. Please check your connection.');
      console.error('Error adding sewing line:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Add New Sewing Line</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
            Line Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., Line 1, Finishing Line A"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="floor" className="block text-gray-700 text-sm font-bold mb-2">
            floor (Optional)
          </label>
          <input
            type="text"
            id="floor"
            value={floor}
            onChange={(e) => setfloor(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., Floor A, Building 2"
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className={`bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Adding Line...' : 'Add Sewing Line'}
          </button>
        </div>
        {message && (
          <p className={`mt-4 text-center ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}