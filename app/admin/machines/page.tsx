// src/app/admin/machines/page.tsx
'use client'; // This is a Client Component

import { useState } from 'react';

export default function AddMachinesPage() {
  const [machineNames, setMachineNames] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages
    setIsSuccess(false);
    setIsLoading(true);

    if (!machineNames.trim()) {
      setMessage('Please enter at least one machine name.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/machines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ names: machineNames }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage(data.message || 'Machines added successfully!');
        setMachineNames(''); // Clear input on success
      } else {
        setIsSuccess(false);
        setMessage(data.message || 'Failed to add machines. Please try again.');
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage('An error occurred. Please check your connection.');
      console.error('Error adding machines:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Add New Machines</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="machineNames" className="block text-gray-700 text-sm font-bold mb-2">
            Machine Names (comma-separated)
          </label>
          <textarea
            id="machineNames"
            value={machineNames}
            onChange={(e) => setMachineNames(e.target.value)}
            rows={4}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., Juki DDL-8700, Brother S-7100A, Pegasus W500"
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
            {isLoading ? 'Adding...' : 'Add Machines'}
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