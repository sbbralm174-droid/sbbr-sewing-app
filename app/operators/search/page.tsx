// src/app/operators/search/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface IProcess {
  _id: string;
  name: string;
}

interface IOperator {
  _id: string;
  operatorId: string;
  name: string;
  contactNumber?: string;
  skills: {
    machines: { _id: string; name: string }[];
    processes: { _id: string; name: string }[];
  };
  isActive: boolean;
}

export default function OperatorSearchPage() {
  const [availableProcesses, setAvailableProcesses] = useState<IProcess[]>([]);
  const [selectedProcessIds, setSelectedProcessIds] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<IOperator[]>([]);
  const [loadingProcesses, setLoadingProcesses] = useState(true);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch all available processes on component mount
  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const response = await fetch('/api/processes');
        const data = await response.json();
        if (response.ok) {
          setAvailableProcesses(data);
        } else {
          setMessage('Failed to load processes for search.');
        }
      } catch (err) {
        console.error('Error fetching processes:', err);
        setMessage('An error occurred while loading processes.');
      } finally {
        setLoadingProcesses(false);
      }
    };
    fetchProcesses();
  }, []);

  const handleProcessSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.options);
    const selected = options.filter(option => option.selected).map(option => option.value);
    setSelectedProcessIds(selected);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setMessage('');
    setSearchResults([]);

    if (selectedProcessIds.length === 0) {
      setMessage('Please select at least one process to search.');
      setSearching(false);
      return;
    }

    try {
      // Construct query parameters for selected processes
      const queryParams = new URLSearchParams();
      selectedProcessIds.forEach(id => queryParams.append('processIds', id));

      const response = await fetch(`/api/operators/search?${queryParams.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setSearchResults(data);
        if (data.length === 0) {
          setMessage('No operators found who can perform all selected processes.');
        } else {
          setMessage(`Found ${data.length} operator(s).`);
        }
      } else {
        setMessage(data.message || 'Failed to perform search.');
      }
    } catch (err) {
      console.error('Error during search:', err);
      setMessage('An error occurred during search.');
    } finally {
      setSearching(false);
    }
  };

  if (loadingProcesses) {
    return <div className="container mx-auto p-4 text-center">Loading processes for search...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Find Substitute Operator</h1>

      <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="mb-4">
          <label htmlFor="processes" className="block text-gray-700 text-sm font-bold mb-2">
            Search by Processes (select multiple):
          </label>
          <select
            multiple
            id="processes"
            value={selectedProcessIds}
            onChange={handleProcessSelect}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-48"
          >
            {availableProcesses.map((process) => (
              <option key={process._id} value={process._id}>
                {process.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple processes.</p>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className={`bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              searching ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={searching}
          >
            {searching ? 'Searching...' : 'Search Operators'}
          </button>
        </div>
        {message && (
          <p className={`mt-4 text-center ${searchResults.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </form>

      {searchResults.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
          <h2 className="text-2xl font-bold px-6 py-4 border-b">Search Results</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operator ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skilled Processes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchResults.map((operator) => (
                  <tr key={operator._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {operator.operatorId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {operator.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {operator.contactNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {operator.skills.processes.map((p) => p.name).join(', ') || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/operators/${operator._id}`} className="text-blue-600 hover:text-blue-900">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}