// src/app/operators/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // Hook to get dynamic route params
import Link from 'next/link';

interface IMachine {
  _id: string;
  name: string;
}

interface IProcess {
  _id: string;
  name: string;
}

interface IOperatorDetails {
  _id: string;
  operatorId: string;
  name: string;
  contactNumber?: string;
  skills: {
    machines: IMachine[];
    processes: IProcess[];
  };
  isActive: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export default function OperatorDetailsPage() {
  const params = useParams(); // Get dynamic route parameters
  const operatorId = params.id as string; // The MongoDB _id of the operator

  const [operator, setOperator] = useState<IOperatorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!operatorId) return; // Don't fetch if ID isn't available yet

    const fetchOperatorDetails = async () => {
      try {
        const response = await fetch(`/api/operators/${operatorId}`); // Our new GET single operator API
        const data = await response.json();

        if (response.ok) {
          setOperator(data);
        } else {
          setError(data.message || 'Failed to fetch operator details.');
        }
      } catch (err) {
        console.error('Error fetching operator details:', err);
        setError('An error occurred while fetching operator details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOperatorDetails();
  }, [operatorId]); // Re-run effect if operatorId changes

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading operator details...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-600">{error}</div>;
  }

  if (!operator) {
    return <div className="container mx-auto p-4 text-center text-gray-600">Operator not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Operator Details: {operator.name}</h1>

      <div className="bg-white p-8 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <div>
            <p className="font-semibold">Operator ID:</p>
            <p className="ml-2">{operator.operatorId}</p>
          </div>
          <div>
            <p className="font-semibold">Full Name:</p>
            <p className="ml-2">{operator.name}</p>
          </div>
          <div>
            <p className="font-semibold">Contact Number:</p>
            <p className="ml-2">{operator.contactNumber || 'N/A'}</p>
          </div>
          <div>
            <p className="font-semibold">Status:</p>
            <p className="ml-2">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  operator.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {operator.isActive ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>
          <div>
            <p className="font-semibold">Member Since:</p>
            <p className="ml-2">{new Date(operator.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="font-semibold">Last Updated:</p>
            <p className="ml-2">{new Date(operator.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-bold mb-3 border-b pb-2">Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Can Operate Machines:</p>
              <ul className="list-disc list-inside ml-2">
                {operator.skills.machines.length > 0 ? (
                  operator.skills.machines.map((machine) => (
                    <li key={machine._id}>{machine.name}</li>
                  ))
                ) : (
                  <li>N/A</li>
                )}
              </ul>
            </div>
            <div>
              <p className="font-semibold">Can Perform Processes:</p>
              <ul className="list-disc list-inside ml-2">
                {operator.skills.processes.length > 0 ? (
                  operator.skills.processes.map((process) => (
                    <li key={process._id}>{process.name}</li>
                  ))
                ) : (
                  <li>N/A</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder for future production report table */}
      <div className="bg-white p-8 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-bold mb-3 border-b pb-2">Production History</h2>
        <p className="text-gray-600">
          (Production report for this operator will appear here.)
        </p>
        {/* We'll add a table here in a later step */}
      </div>

      <div className="mt-6 text-center">
        <Link href="/operators/list" className="text-blue-600 hover:underline">
          &larr; Back to All Operators
        </Link>
      </div>
    </div>
  );
}