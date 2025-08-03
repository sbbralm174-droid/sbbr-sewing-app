// src/app/admin/processes/page.tsx
'use client'; // This is a Client Component

import { useState } from 'react';

export default function AddProcessesPage() {
  const [processNames, setProcessNames] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages
    setIsSuccess(false);
    setIsLoading(true);

    if (!processNames.trim()) {
      setMessage('Please enter at least one process name.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/processes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ names: processNames }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage(data.message || 'Processes added successfully!');
        setProcessNames(''); // Clear input on success
      } else {
        setIsSuccess(false);
        setMessage(data.message || 'Failed to add processes. Please try again.');
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage('An error occurred. Please check your connection.');
      console.error('Error adding processes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Add New Processes</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="processNames" className="block text-gray-700 text-sm font-bold mb-2">
            Process Names (comma-separated)
          </label>
          <textarea
            id="processNames"
            value={processNames}
            onChange={(e) => setProcessNames(e.target.value)}
            rows={4}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., Single Needle Stitching, Overlock Stitching, Button Sewing"
            required
          ></textarea>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add Processes'}
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