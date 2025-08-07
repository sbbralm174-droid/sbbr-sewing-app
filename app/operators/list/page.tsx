// src/app/operators/list/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Re-use interfaces from DailyPlanPage or define them globally if preferred
interface IMachine {
  _id: string;
  name: string;
}

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
    machines: IMachine[];
    processes: IProcess[];
  };
  isActive: boolean;
}

export default function OperatorsListPage() {
  const [operators, setOperators] = useState<IOperator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const response = await fetch('/api/operators'); // Our existing GET all operators API
        const data = await response.json();

        if (response.ok) {
          setOperators(data);
        } else {
          setError(data.message || 'Failed to fetch operators.');
        }
      } catch (err) {
        console.error('Error fetching operators:', err);
        setError('An error occurred while fetching operators.');
      } finally {
        setLoading(false);
      }
    };

    fetchOperators();
  }, []);

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading operators...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">All Operators</h1>
      {operators.length === 0 ? (
        <p className="text-center text-gray-600">No operators found. Please add some operators.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
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
                  Machines Skilled In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Processes Skilled In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {operators.map((operator) => (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        operator.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {operator.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/operators/${operator._id}`} className="text-blue-600 hover:text-blue-900">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}